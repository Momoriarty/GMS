<?php

namespace App\Http\Controllers\Api;
use App\Models\AuditLog;
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
        $user = Auth::user();

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthenticated'
            ], 401);
        }

        $query = Notifikasi::where('user_id', $user->id)
            ->orderBy('created_at', 'desc');

        if ($request->has('is_read')) {
            $query->where('is_read', $request->is_read);
        }

        $notifikasi = $query->get();
        $unreadCount = Notifikasi::where('user_id', $user->id)->where('is_read', false)->count();

        return response()->json([
            'success' => true,
            'data' => $notifikasi,
            'unread_count' => $unreadCount,
        ]);
    }

    /**
     * Get single notifikasi
     */
    public function show(int $id)
    {
        $user = Auth::user();

        $notifikasi = Notifikasi::find($id);

        if (!$notifikasi || $notifikasi->user_id !== $user?->id) {
            return response()->json([
                'success' => false,
                'message' => 'Notifikasi tidak ditemukan'
            ], Response::HTTP_NOT_FOUND);
        }

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
            'tipe' => 'required|in:pendaftaran,jadwal,hasil,umum',
        ]);

        $notifikasi = Notifikasi::create([
            'user_id' => $validated['user_id'],
            'judul' => $validated['judul'],
            'pesan' => $validated['pesan'],
            'tipe' => $validated['tipe'],
            'is_read' => false,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Notifikasi berhasil dikirim',
            'data' => $notifikasi
        ]);
    }


    public function markAsRead(int $id)
    {
        $user = Auth::user();

        $notifikasi = Notifikasi::find($id);

        if (!$notifikasi || $notifikasi->user_id !== $user?->id) {
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



    public function destroy(int $id)
    {
        $user = Auth::user();

        $notifikasi = Notifikasi::find($id);

        if (!$notifikasi || $notifikasi->user_id !== $user?->id) {
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
    private function logActivity($aksi, $tabel, $deskripsi = null)
{
    AuditLog::create([
        'user_id' => Auth::id(),
        'aksi' => $aksi,
        'tabel' => $tabel,
        'deskripsi' => $deskripsi,
    ]);
}
}
