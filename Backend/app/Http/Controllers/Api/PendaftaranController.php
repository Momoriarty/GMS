<?php

namespace App\Http\Controllers\Api;

use App\Models\Pendaftaran;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class PendaftaranController extends Controller
{
    /**
     * Get all pendaftaran
     */
    public function index(Request $request)
    {
        $query = Pendaftaran::with(['user', 'event', 'verifiedBy']);

        if ($request->event_id) {
            $query->where('event_id', $request->event_id);
        }

        if ($request->status) {
            $query->where('status', $request->status);
        }

        if ($request->user_id) {
            $query->where('user_id', $request->user_id);
        }

        $pendaftaran = $query->get();

        return response()->json([
            'success' => true,
            'data' => $pendaftaran
        ]);
    }

    /**
     * Get single pendaftaran
     */
    public function show($id)
    {
        $pendaftaran = Pendaftaran::with(['user', 'event', 'verifiedBy'])->find($id);
        
        if (!$pendaftaran) {
            return response()->json([
                'success' => false,
                'message' => 'Pendaftaran tidak ditemukan'
            ], Response::HTTP_NOT_FOUND);
        }

        return response()->json([
            'success' => true,
            'data' => $pendaftaran
        ]);
    }

    /**
     * Create new pendaftaran
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'user_id' => 'required|exists:users,id',
            'event_id' => 'required|exists:events,id',
            'dokumen_pendukung' => 'nullable|string',
            'status' => 'required|in:menunggu,diterima,ditolak',
        ]);

        $validated['tanggal_daftar'] = now();
        $pendaftaran = Pendaftaran::create($validated);

        return response()->json([
            'success' => true,
            'message' => 'Pendaftaran berhasil dibuat',
            'data' => $pendaftaran
        ], Response::HTTP_CREATED);
    }

    /**
     * Verify pendaftaran (terima/tolak)
     */
    public function verify(Request $request, $id)
    {
        $pendaftaran = Pendaftaran::find($id);
        
        if (!$pendaftaran) {
            return response()->json([
                'success' => false,
                'message' => 'Pendaftaran tidak ditemukan'
            ], Response::HTTP_NOT_FOUND);
        }

        $validated = $request->validate([
            'status' => 'required|in:diterima,ditolak',
        ]);

        $pendaftaran->status = $validated['status'];
        $pendaftaran->verified_by = auth()->id();
        $pendaftaran->save();

        return response()->json([
            'success' => true,
            'message' => 'Pendaftaran berhasil diverifikasi',
            'data' => $pendaftaran
        ]);
    }

    /**
     * Delete pendaftaran
     */
    public function destroy($id)
    {
        $pendaftaran = Pendaftaran::find($id);
        
        if (!$pendaftaran) {
            return response()->json([
                'success' => false,
                'message' => 'Pendaftaran tidak ditemukan'
            ], Response::HTTP_NOT_FOUND);
        }

        $pendaftaran->delete();

        return response()->json([
            'success' => true,
            'message' => 'Pendaftaran berhasil dihapus'
        ]);
    }
}
