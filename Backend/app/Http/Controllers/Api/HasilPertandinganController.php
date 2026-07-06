<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\HasilPertandingan;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;
use App\Models\JadwalPertandingan;
use App\Models\Klasemen;
use Illuminate\Support\Facades\DB;
use App\Models\AuditLog;

class HasilPertandinganController extends Controller
{
    /**
     * Get all hasil
     */
    public function index(Request $request)
    {
        $query = HasilPertandingan::with(['jadwal', 'timPemenang']);

        if ($request->jadwal_id) {
            $query->where('jadwal_id', $request->jadwal_id);
        }

        $hasil = $query->get();

        return response()->json([
            'success' => true,
            'data' => $hasil
        ]);
    }

    /**
     * Create new hasil
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'jadwal_id' => 'required|exists:jadwal_pertandingan,id',
            'skor_tim_1' => 'required|integer|min:0',
            'skor_tim_2' => 'required|integer|min:0',
            'tim_pemenang_id' => 'nullable|exists:tim,id',
        ]);

        $validated['input_by'] = Auth::id();

        $hasil = HasilPertandingan::create($validated);

        if (Auth::check()) {
            AuditLog::create([
                'user_id' => Auth::id(),
                'tabel' => 'hasil_pertandingan',
                'aksi' => 'create',
                'deskripsi' => 'Hasil pertandingan ditambahkan untuk jadwal ID: ' . $hasil->jadwal_id,
            ]);
        }

        return response()->json([
            'success' => true,
            'message' => 'Hasil pertandingan berhasil disimpan',
            'data' => $hasil
        ], Response::HTTP_CREATED);
    }

    public function update(Request $request, int $id)
    {
        // 1. Cari Jadwal Pertandingan beserta data hasil lamanya (jika ada)
        $jadwal = JadwalPertandingan::with('hasil')->find($id);

        if (!$jadwal) {
            return response()->json([
                'success' => false,
                'message' => 'Jadwal pertandingan tidak ditemukan'
            ], Response::HTTP_NOT_FOUND);
        }

        // 2. Validasi input dari frontend
        $validated = $request->validate([
            'skor_tim_1' => 'required|integer|min:0',
            'skor_tim_2' => 'required|integer|min:0',
            'status' => 'required|in:terjadwal,selesai,dibatalkan'
        ]);

        $skor1Baru = (int) $validated['skor_tim_1'];
        $skor2Baru = (int) $validated['skor_tim_2'];
        $statusBaru = $validated['status'];
        $statusLama = $jadwal->status;

        // Ambil data skor lama jika sebelumnya sudah pernah diinput selesai
        $skor1Lama = $jadwal->hasil ? (int) $jadwal->hasil->skor_tim_1 : 0;
        $skor2Lama = $jadwal->hasil ? (int) $jadwal->hasil->skor_tim_2 : 0;

        // 3. Tentukan ID pemenang untuk data BARU
        $timPemenangIdBaru = null;
        if ($statusBaru === 'selesai') {
            if ($skor1Baru > $skor2Baru) {
                $timPemenangIdBaru = $jadwal->tim_1_id;
            } else if ($skor2Baru > $skor1Baru) {
                $timPemenangIdBaru = $jadwal->tim_2_id;
            }
        }

        // Tentukan ID pemenang dari data LAMA
        $timPemenangIdLama = $jadwal->hasil ? $jadwal->hasil->tim_pemenang_id : null;

        try {
            $hasilPertandingan = null;

            DB::transaction(function () use ($jadwal, $skor1Baru, $skor2Baru, $statusBaru, $statusLama, $skor1Lama, $skor2Lama, $timPemenangIdBaru, $timPemenangIdLama, &$hasilPertandingan) {
                // A. Update atau buat data hasil_pertandingan
                $hasilPertandingan = HasilPertandingan::updateOrCreate(
                    ['jadwal_id' => $jadwal->id],
                    [
                        'skor_tim_1' => $skor1Baru,
                        'skor_tim_2' => $skor2Baru,
                        'tim_pemenang_id' => $timPemenangIdBaru,
                        'input_by' => auth()->id()
                    ]
                );

                // B. Update status utama pada jadwal
                $jadwal->update(['status' => $statusBaru]);

                // C. LOGIKA UPDATE KLASEMEN (Disesuaikan berdasarkan perubahan data)

                // KONDISI 1: Hanya kalkulasi jika status baru diset 'selesai'
                if ($statusBaru === 'selesai') {
                    $klasemenTim1 = Klasemen::firstOrNew(['event_id' => $jadwal->event_id, 'tim_id' => $jadwal->tim_1_id]);
                    $klasemenTim2 = Klasemen::firstOrNew(['event_id' => $jadwal->event_id, 'tim_id' => $jadwal->tim_2_id]);

                    // Inisialisasi awal nilai jika tim belum pernah punya record klasemen
                    $klasemenTim1->main = $klasemenTim1->main ?? 0;
                    $klasemenTim1->menang = $klasemenTim1->menang ?? 0;
                    $klasemenTim1->seri = $klasemenTim1->seri ?? 0;
                    $klasemenTim1->kalah = $klasemenTim1->kalah ?? 0;
                    $klasemenTim1->gol_masuk = $klasemenTim1->gol_masuk ?? 0;
                    $klasemenTim1->gol_kemasukan = $klasemenTim1->gol_kemasukan ?? 0;

                    $klasemenTim2->main = $klasemenTim2->main ?? 0;
                    $klasemenTim2->menang = $klasemenTim2->menang ?? 0;
                    $klasemenTim2->seri = $klasemenTim2->seri ?? 0;
                    $klasemenTim2->kalah = $klasemenTim2->kalah ?? 0;
                    $klasemenTim2->gol_masuk = $klasemenTim2->gol_masuk ?? 0;
                    $klasemenTim2->gol_kemasukan = $klasemenTim2->gol_kemasukan ?? 0;

                    if ($statusLama === 'selesai') {
                        // 🔄 JIKA STATUS LAMA SUDAH SELESAI (EDIT DATA SEBELUMNYA)
                        // Kurangi data lama terlebih dahulu agar kembali netral sebelum disuntik skor baru

                        // Netralkan Status Menang/Seri/Kalah Lama Tim 1
                        if ($timPemenangIdLama === $jadwal->tim_1_id)
                            $klasemenTim1->menang -= 1;
                        elseif ($timPemenangIdLama === $jadwal->tim_2_id)
                            $klasemenTim1->kalah -= 1;
                        else
                            $klasemenTim1->seri -= 1;

                        // Netralkan Status Menang/Seri/Kalah Lama Tim 2
                        if ($timPemenangIdLama === $jadwal->tim_2_id)
                            $klasemenTim2->menang -= 1;
                        elseif ($timPemenangIdLama === $jadwal->tim_1_id)
                            $klasemenTim2->kalah -= 1;
                        else
                            $klasemenTim2->seri -= 1;

                        // Sesuaikan selisih gol (Skor Baru dikurangi Skor Lama)
                        $klasemenTim1->gol_masuk += ($skor1Baru - $skor1Lama);
                        $klasemenTim1->gol_kemasukan += ($skor2Baru - $skor2Lama);

                        $klasemenTim2->gol_masuk += ($skor2Baru - $skor2Lama);
                        $klasemenTim2->gol_kemasukan += ($skor1Baru - $skor1Lama);
                    } else {
                        // 🆕 JIKA STATUS LAMA BUKAN SELESAI (BARU PERTAMA KALI INPUT SELESAI)
                        $klasemenTim1->main += 1;
                        $klasemenTim2->main += 1;

                        $klasemenTim1->gol_masuk += $skor1Baru;
                        $klasemenTim1->gol_kemasukan += $skor2Baru;

                        $klasemenTim2->gol_masuk += $skor2Baru;
                        $klasemenTim2->gol_kemasukan += $skor1Baru;
                    }

                    // Tambahkan Hasil Status Pertandingan yang Baru (Untuk Opsi Baru maupun Opsi Edit)
                    if ($timPemenangIdBaru === $jadwal->tim_1_id) {
                        $klasemenTim1->menang += 1;
                        $klasemenTim2->kalah += 1;
                    } elseif ($timPemenangIdBaru === $jadwal->tim_2_id) {
                        $klasemenTim2->menang += 1;
                        $klasemenTim1->kalah += 1;
                    } else {
                        $klasemenTim1->seri += 1;
                        $klasemenTim2->seri += 1;
                    }

                    $klasemenTim1->save();
                    $klasemenTim2->save();
                }

                // KONDISI 2: Jika diubah dari 'selesai' mundur ke 'terjadwal' atau 'dibatalkan'
                if ($statusLama === 'selesai' && $statusBaru !== 'selesai') {
                    $klasemenTim1 = Klasemen::where('event_id', $jadwal->event_id)->where('tim_id', $jadwal->tim_1_id)->first();
                    $klasemenTim2 = Klasemen::where('event_id', $jadwal->event_id)->where('tim_id', $jadwal->tim_2_id)->first();

                    if ($klasemenTim1 && $klasemenTim2) {
                        // Kurangi jumlah main karena laga tidak jadi selesai
                        $klasemenTim1->main = max(0, $klasemenTim1->main - 1);
                        $klasemenTim2->main = max(0, $klasemenTim2->main - 1);

                        // Hapus data menang/kalah/seri yang pernah diberikan sebelumnya
                        if ($timPemenangIdLama === $jadwal->tim_1_id) {
                            $klasemenTim1->menang = max(0, $klasemenTim1->menang - 1);
                            $klasemenTim2->kalah = max(0, $klasemenTim2->kalah - 1);
                        } elseif ($timPemenangIdLama === $jadwal->tim_2_id) {
                            $klasemenTim2->menang = max(0, $klasemenTim2->menang - 1);
                            $klasemenTim1->kalah = max(0, $klasemenTim1->kalah - 1);
                        } else {
                            $klasemenTim1->seri = max(0, $klasemenTim1->seri - 1);
                            $klasemenTim2->seri = max(0, $klasemenTim2->seri - 1);
                        }

                        // Tarik kembali jumlah gol lama dari klasemen
                        $klasemenTim1->gol_masuk = max(0, $klasemenTim1->gol_masuk - $skor1Lama);
                        $klasemenTim1->gol_kemasukan = max(0, $klasemenTim1->gol_kemasukan - $skor2Lama);

                        $klasemenTim2->gol_masuk = max(0, $klasemenTim2->gol_masuk - $skor2Lama);
                        $klasemenTim2->gol_kemasukan = max(0, $klasemenTim2->gol_kemasukan - $skor1Lama);

                        $klasemenTim1->save();
                        $klasemenTim2->save();
                    }
                }
            });

            if (Auth::check()) {
                AuditLog::create([
                    'user_id' => Auth::id(),
                    'tabel' => 'hasil_pertandingan',
                    'aksi' => 'update',
                    'deskripsi' => 'Hasil pertandingan diperbarui untuk jadwal ID: ' . $jadwal->id,
                ]);
            }

            return response()->json([
                'success' => true,
                'message' => 'Data pertandingan berhasil diperbarui.',
                'data' => $hasilPertandingan
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal memperbarui data: ' . $e->getMessage()
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Delete hasil
     */
    public function destroy(int $id)
    {
        $hasil = HasilPertandingan::find($id);

        if (!$hasil) {
            return response()->json([
                'success' => false,
                'message' => 'Hasil tidak ditemukan'
            ], Response::HTTP_NOT_FOUND);
        }

        $hasilId = $hasil->id;
        $hasil->delete();

        if (Auth::check()) {
            AuditLog::create([
                'user_id' => Auth::id(),
                'tabel' => 'hasil_pertandingan',
                'aksi' => 'delete',
                'deskripsi' => 'Hasil pertandingan dihapus (ID: ' . $hasilId . ')',
            ]);
        }

        return response()->json([
            'success' => true,
            'message' => 'Hasil berhasil dihapus'
        ]);
    }
}
