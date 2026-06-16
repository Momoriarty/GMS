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
        $query = JadwalPertandingan::with(['tim1', 'tim2']);

        // 1. FILTER EVENT
        if ($request->event_id) {
            $query->where('event_id', $request->event_id);
        }

        // 2. FILTER TIM (PENTING INI)
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
        $jadwal = JadwalPertandingan::with(['event', 'tim1', 'tim2'])->find($id);

        if (!$jadwal) {
            return response()->json([
                'success' => false,
                'message' => 'Jadwal tidak ditemukan'
            ], Response::HTTP_NOT_FOUND);
        }

        return response()->json([
            'success' => true,
            'data' => $jadwal
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
}
