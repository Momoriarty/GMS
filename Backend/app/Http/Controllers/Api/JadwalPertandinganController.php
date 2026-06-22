<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\JadwalPertandingan;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class JadwalPertandinganController extends Controller
{
    /**
     * Get all jadwal
     */
    public function index(Request $request)
    {
        // 💡 Ganti 'hasilPertandingan' menjadi 'hasil' sesuai nama fungsi di Model kamu
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

                // 💡 Ambil skor melalui relasi '$item->hasil'
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
     * Get single jadwal
     */
    public function show(int $id)
    {
        $jadwal = JadwalPertandingan::with(['tim1', 'tim2'])->find($id);

        if (!$jadwal) {
            return response()->json([
                'success' => false,
                'message' => 'Jadwal tidak ditemukan'
            ], Response::HTTP_NOT_FOUND);
        }

        return response()->json([
            'success' => true,
            'data' => [
                'id' => $jadwal->id,
                'event_id' => $jadwal->event_id,
                'tim_1_id' => $jadwal->tim_1_id,
                'tim_2_id' => $jadwal->tim_2_id,
                'tim_1_nama' => $jadwal->tim1->nama_tim ?? '-',
                'tim_2_nama' => $jadwal->tim2->nama_tim ?? '-',
                'waktu_pertandingan' => $jadwal->waktu_pertandingan,
                'lokasi_lapangan' => $jadwal->lokasi_lapangan,
                'status' => $jadwal->status,
            ]
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
     * @param Request $request - berisi jadwal_list array
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
                    // Validasi tambahan: tim tidak boleh sama
                    if ($jadwalData['tim_1_id'] === $jadwalData['tim_2_id']) {
                        $errors[] = "Index {$index}: Tim 1 dan Tim 2 tidak boleh sama";
                        continue;
                    }

                    // Parse waktu dari format ISO 8601 atau format biasa
                    $waktuStr = $jadwalData['waktu_pertandingan'];
                    if (strpos($waktuStr, 'T') !== false) {
                        // Format ISO 8601: 2026-07-01T08:00:00.000Z
                        $waktu = \Carbon\Carbon::parse($waktuStr);
                    } else {
                        // Format biasa: 2026-07-01 08:00:00
                        try {
                            $waktu = \Carbon\Carbon::createFromFormat('Y-m-d H:i:s', $waktuStr);
                        } catch (\Exception $e) {
                            // Jika gagal, coba parse otomatis
                            $waktu = \Carbon\Carbon::parse($waktuStr);
                        }
                    }

                    $jadwal = JadwalPertandingan::create([
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
