<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Pendaftaran;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class PendaftaranController extends Controller
{
    /**
     * Get all pendaftaran
     */
    public function index(Request $request)
    {
        $query = Pendaftaran::with(['user', 'event', 'verifiedBy', 'user.tim']);

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

        // Format response untuk include tim details
        $formatted = $pendaftaran->map(function ($item) {
            return [
                'id' => $item->id,
                'user_id' => $item->user_id,
                'event_id' => $item->event_id,
                'status' => $item->status,
                'tanggal_daftar' => $item->tanggal_daftar,
                'user' => $item->user ? [
                    'id' => $item->user->id,
                    'name' => $item->user->name,
                    'email' => $item->user->email,
                    'tim' => $item->user->tim ? [
                        'id' => $item->user->tim->id,
                        'nama_tim' => $item->user->tim->nama_tim,
                        'kelompok_umur' => $item->user->tim->kelompok_umur,
                        'user_id' => $item->user->tim->user_id,
                    ] : null
                ] : null,
                'event' => $item->event,
                'verified_by' => $item->verifiedBy,
            ];
        });

        return response()->json([
            'success' => true,
            'data' => $formatted
        ]);
    }

    /**
     * Get single pendaftaran
     */
    public function show(int $id)
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
    public function verify(Request $request, int $id)
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
        $pendaftaran->verified_by = Auth::id();
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
    public function destroy(int $id)
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