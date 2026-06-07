<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Notifikasi;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class NotifikasiController extends Controller
{
    /**
     * Get notifikasi untuk user yang sedang login
     */
    public function index(Request $request)
    {
        $userId = Auth::id();

        $query = Notifikasi::where('user_id', $userId)
            ->orderBy('created_at', 'desc');

        if ($request->is_read !== null) {
            $query->where('is_read', $request->is_read);
        }

        $notifikasi = $query->get();

        return response()->json([
            'success' => true,
            'data' => $notifikasi
        ]);
    }

    /**
     * Get single notifikasi
     */
    public function show(int $id)
    {
        $notifikasi = Notifikasi::find($id);
        
        if (!$notifikasi || $notifikasi->user_id !== Auth::id()) {
            return response()->json([
                'success' => false,
                'message' => 'Notifikasi tidak ditemukan'
            ], Response::HTTP_NOT_FOUND);
        }

        // Mark as read
        $notifikasi->is_read = true;
        $notifikasi->save();

        return response()->json([
            'success' => true,
            'data' => $notifikasi
        ]);
    }

    /**
     * Create notifikasi (admin only)
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'user_id' => 'required|exists:users,id',
            'judul' => 'required|string|max:255',
            'pesan' => 'required|string',
            'tipe' => 'required|in:umum,pendaftaran,jadwal,hasil',
        ]);

        $validated['is_read'] = false;

        $notifikasi = Notifikasi::create($validated);

        return response()->json([
            'success' => true,
            'message' => 'Notifikasi berhasil dikirim',
            'data' => $notifikasi
        ], Response::HTTP_CREATED);
    }

    /**
     * Mark notifikasi as read
     */
    public function markAsRead(int $id)
    {
        $notifikasi = Notifikasi::find($id);
        
        if (!$notifikasi || $notifikasi->user_id !== Auth::id()) {
            return response()->json([
                'success' => false,
                'message' => 'Notifikasi tidak ditemukan'
            ], Response::HTTP_NOT_FOUND);
        }

        $notifikasi->is_read = true;
        $notifikasi->save();

        return response()->json([
            'success' => true,
            'message' => 'Notifikasi berhasil ditandai sudah dibaca',
            'data' => $notifikasi
        ]);
    }

    /**
     * Delete notifikasi
     */
    public function destroy(int $id)
    {
        $notifikasi = Notifikasi::find($id);
        
        if (!$notifikasi) {
            return response()->json([
                'success' => false,
                'message' => 'Notifikasi tidak ditemukan'
            ], Response::HTTP_NOT_FOUND);
        }

        $notifikasi->delete();

        return response()->json([
            'success' => true,
            'message' => 'Notifikasi berhasil dihapus'
        ]);
    }
}