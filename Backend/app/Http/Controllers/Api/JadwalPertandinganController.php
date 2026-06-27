<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\JadwalPertandingan;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use Carbon\Carbon;
use App\Models\Event;

class JadwalPertandinganController extends Controller
{
    /**
     * Get all jadwal
     */
    public function index(Request $request)
    {
        $query = JadwalPertandingan::with(['tim1', 'tim2', 'hasil']);

        // 1. FILTER EVENT
        if ($request->event_id) {
            $query->where('event_id', $request->event_id);
        }

        // 2. FILTER TIM
        if ($request->tim_id) {
            $query->where(function ($q) use ($request) {
                $q->where('tim_1_id', $request->tim_id)
                    ->orWhere('tim_2_id', $request->tim_id);
            });
        }

        $jadwal = $query->get();

        $formatted = $jadwal->map(function ($item) {
            return [
                'id' => $item->id,
                'event_id' => $item->event_id,
                'tim_1_id' => $item->tim_1_id,
                'tim_2_id' => $item->tim_2_id,
                'tim_1_nama' => $item->tim1->nama_tim ?? '-',
                'tim_2_nama' => $item->tim2->nama_tim ?? '-',
                'waktu_pertandingan' => $item->waktu_pertandingan,
                'lokasi_lapangan' => $item->lokasi_lapangan,
                'status' => $item->status,
                'skor_tim_1' => $item->hasil->skor_tim_1 ?? null,
                'skor_tim_2' => $item->hasil->skor_tim_2 ?? null,
            ];
        });

        return response()->json([
            'success' => true,
            'data' => $formatted
        ]);
    }

    /**
     * Ambil pertandingan yang sedang live (Real-time & Timezone Safe)
     */
    public function liveMatch()
    {
        $now = Carbon::now();

        // Ambil event yang sedang berlangsung
        $event = Event::where('status', 'aktif')->first();

        if (!$event) {
            return response()->json([
                'success' => true,
                'data' => null,
                'message' => 'Tidak ada event aktif.'
            ]);
        }

        // Cari jadwal pertandingan dalam jendela waktu 2 jam ke belakang
        $duaJamLalu = Carbon::now()->subHours(2);

        $match = JadwalPertandingan::with(['tim1', 'tim2', 'hasil'])
            ->where('event_id', $event->id)
            ->where('waktu_pertandingan', '<=', $now)
            ->where('waktu_pertandingan', '>=', $duaJamLalu)
            ->orderBy('waktu_pertandingan', 'desc') // Ambil yang paling baru dimulai
            ->first();

        if (!$match) {
            return response()->json([
                'success' => true,
                'data' => null,
                'message' => 'Tidak ada live match saat ini.'
            ]);
        }

        // Respons JSON disesuaikan langsung dengan properti di komponen React kamu
        return response()->json([
            'success' => true,
            'data' => [
                'id' => $match->id,
                'event_id' => $match->event_id,
                'tim_1_nama' => $match->tim1->nama_tim ?? 'Tim A',
                'tim_2_nama' => $match->tim2->nama_tim ?? 'Tim B',
                'skor_tim_1' => $match->hasil->skor_tim_1 ?? 0,
                'skor_tim_2' => $match->hasil->skor_tim_2 ?? 0,
                'waktu_pertandingan' => $match->waktu_pertandingan,
                'lokasi_lapangan' => $match->lokasi_lapangan ?? 'Lapangan Utama',
            ]
        ]);
    }

    /**
     * Ambil pertandingan yang akan datang (Upcoming Matches)
     */
    public function upcomingMatches()
    {
        $now = Carbon::now();

        // 1. Ambil event yang sedang aktif terlebih dahulu
        $event = Event::where('status', 'aktif')->first();

        if (!$event) {
            return response()->json([
                'success' => true,
                'data' => [],
                'message' => 'Tidak ada event aktif.'
            ]);
        }

        // 2. Ambil pertandingan yang waktunya LEBIH BESAR dari waktu sekarang
        $upcoming = JadwalPertandingan::with(['tim1', 'tim2'])
            ->where('event_id', $event->id)
            ->where('waktu_pertandingan', '>', $now)
            ->orderBy('waktu_pertandingan', 'asc') // Urutkan dari yang paling dekat dulu
            ->take(4) // Batasi ambil 4 pertandingan saja untuk komponen beranda
            ->get();

        // 3. Format datanya agar langsung pas dengan properti array upcomingMatches di React
        $formatted = $upcoming->map(function ($match) {
            return [
                'id' => $match->id,
                'waktu' => Carbon::parse($match->waktu_pertandingan)->translatedFormat('d M Y - H:i'),
                'tim_1_nama' => $match->tim1->nama_tim ?? 'Tim A',
                'tim_2_nama' => $match->tim2->nama_tim ?? 'Tim B',
            ];
        });

        return response()->json([
            'success' => true,
            'data' => $formatted
        ]);
    }

    /**
     * Create new jadwal
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'event_id' => 'required|exists:events,id',
            'tim_1_id' => 'required|exists:tim,id',
            'tim_2_id' => 'required|exists:tim,id|different:tim_1_id',
            'waktu_pertandingan' => 'required|date_format:Y-m-d H:i:s',
            'lokasi_lapangan' => 'required|string|max:255',
            'status' => 'required|in:terjadwal,berlangsung,selesai',
        ]);

        $jadwal = JadwalPertandingan::create($validated);

        return response()->json([
            'success' => true,
            'message' => 'Jadwal berhasil dibuat',
            'data' => $jadwal
        ], Response::HTTP_CREATED);
    }

    /**
     * Update jadwal
     */
    public function update(Request $request, int $id)
    {
        $jadwal = JadwalPertandingan::find($id);

        if (!$jadwal) {
            return response()->json([
                'success' => false,
                'message' => 'Jadwal tidak ditemukan'
            ], Response::HTTP_NOT_FOUND);
        }

        $validated = $request->validate([
            'tim_1_id' => 'exists:tim,id',
            'tim_2_id' => 'exists:tim,id',
            'waktu_pertandingan' => 'date_format:Y-m-d H:i:s',
            'lokasi_lapangan' => 'string|max:255',
            'status' => 'in:terjadwal,berlangsung,selesai',
        ]);

        $jadwal->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Jadwal berhasil diperbarui',
            'data' => $jadwal
        ]);
    }

    /**
     * Delete jadwal
     */
    public function destroy(int $id)
    {
        $jadwal = JadwalPertandingan::find($id);

        if (!$jadwal) {
            return response()->json([
                'success' => false,
                'message' => 'Jadwal tidak ditemukan'
            ], Response::HTTP_NOT_FOUND);
        }

        $jadwal->delete();

        return response()->json([
            'success' => true,
            'message' => 'Jadwal berhasil dihapus'
        ]);
    }

    /**
     * Bulk save jadwal yang sudah di-generate di frontend
     */
    public function bulkSave(Request $request)
    {
        try {
            $validated = $request->validate([
                'jadwal_list' => 'required|array|min:1',
                'jadwal_list.*.event_id' => 'required|exists:events,id',
                'jadwal_list.*.tim_1_id' => 'required|exists:tim,id',
                'jadwal_list.*.tim_2_id' => 'required|exists:tim,id',
                'jadwal_list.*.waktu_pertandingan' => 'required|string',
                'jadwal_list.*.lokasi_lapangan' => 'required|string|max:255',
                'jadwal_list.*.status' => 'in:terjadwal,berlangsung,selesai,pending',
            ]);

            $savedCount = 0;
            $errors = [];

            foreach ($validated['jadwal_list'] as $index => $jadwalData) {
                try {
                    if ($jadwalData['tim_1_id'] === $jadwalData['tim_2_id']) {
                        $errors[] = "Index {$index}: Tim 1 dan Tim 2 tidak boleh sama";
                        continue;
                    }

                    $waktuStr = $jadwalData['waktu_pertandingan'];
                    if (strpos($waktuStr, 'T') !== false) {
                        $waktu = \Carbon\Carbon::parse($waktuStr);
                    } else {
                        try {
                            $waktu = \Carbon\Carbon::createFromFormat('Y-m-d H:i:s', $waktuStr);
                        } catch (\Exception $e) {
                            $waktu = \Carbon\Carbon::parse($waktuStr);
                        }
                    }

                    JadwalPertandingan::create([
                        'event_id' => $jadwalData['event_id'],
                        'tim_1_id' => $jadwalData['tim_1_id'],
                        'tim_2_id' => $jadwalData['tim_2_id'],
                        'waktu_pertandingan' => $waktu,
                        'lokasi_lapangan' => $jadwalData['lokasi_lapangan'],
                        'status' => $jadwalData['status'] ?? 'terjadwal',
                    ]);

                    $savedCount++;
                } catch (\Exception $e) {
                    $errors[] = "Index {$index}: " . $e->getMessage();
                }
            }

            $message = "Jadwal berhasil disimpan ({$savedCount} dari " . count($validated['jadwal_list']) . " jadwal)";
            if (!empty($errors)) {
                $message .= ". Errors: " . implode("; ", $errors);
            }

            return response()->json([
                'success' => $savedCount > 0,
                'message' => $message,
                'data' => [
                    'saved_count' => $savedCount,
                    'total_count' => count($validated['jadwal_list']),
                    'errors' => $errors
                ]
            ], $savedCount > 0 ? Response::HTTP_CREATED : Response::HTTP_BAD_REQUEST);
        } catch (\Exception $e) {
            \Log::error('Error bulk save jadwal: ' . $e->getMessage() . ' ' . $e->getTraceAsString());

            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan saat menyimpan jadwal: ' . $e->getMessage(),
                'data' => []
            ], Response::HTTP_BAD_REQUEST);
        }
    }
}
