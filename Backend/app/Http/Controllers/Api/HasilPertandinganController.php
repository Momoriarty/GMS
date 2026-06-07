<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\HasilPertandingan;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

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
     * Get single hasil
     */
    public function show(int $id)
    {
        $hasil = HasilPertandingan::with(['jadwal', 'timPemenang'])->find($id);
        
        if (!$hasil) {
            return response()->json([
                'success' => false,
                'message' => 'Hasil tidak ditemukan'
            ], Response::HTTP_NOT_FOUND);
        }

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

        return response()->json([
            'success' => true,
            'message' => 'Hasil pertandingan berhasil disimpan',
            'data' => $hasil
        ], Response::HTTP_CREATED);
    }

    /**
     * Update hasil
     */
    public function update(Request $request, int $id)
    {
        $hasil = HasilPertandingan::find($id);
        
        if (!$hasil) {
            return response()->json([
                'success' => false,
                'message' => 'Hasil tidak ditemukan'
            ], Response::HTTP_NOT_FOUND);
        }

        $validated = $request->validate([
            'skor_tim_1' => 'integer|min:0',
            'skor_tim_2' => 'integer|min:0',
            'tim_pemenang_id' => 'nullable|exists:tim,id',
        ]);

        $hasil->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Hasil pertandingan berhasil diperbarui',
            'data' => $hasil
        ]);
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

        $hasil->delete();

        return response()->json([
            'success' => true,
            'message' => 'Hasil berhasil dihapus'
        ]);
    }
}