<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class AuditLogController extends Controller
{
    /**
     * Get audit logs
     */
    public function index(Request $request)
    {
        $query = AuditLog::with('user')
            ->orderBy('created_at', 'desc');

        if ($request->user_id) {
            $query->where('user_id', $request->user_id);
        }

        if ($request->tabel) {
            $query->where('tabel', $request->tabel);
        }

        if ($request->aksi) {
            $query->where('aksi', $request->aksi);
        }

        $perPage = $request->per_page ?? 50;
        $logs = $query->paginate($perPage);

        return response()->json([
            'success' => true,
            'data' => $logs->items(),
            'pagination' => [
                'total' => $logs->total(),
                'per_page' => $logs->perPage(),
                'current_page' => $logs->currentPage(),
                'last_page' => $logs->lastPage(),
            ]
        ]);
    }

    /**
     * Get single audit log
     */
    public function show(int $id)
    {
        $log = AuditLog::with('user')->find($id);

        if (!$log) {
            return response()->json([
                'success' => false,
                'message' => 'Log audit tidak ditemukan'
            ], Response::HTTP_NOT_FOUND);
        }

        return response()->json([
            'success' => true,
            'data' => $log
        ]);
    }

    /**
     * Create audit log
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'user_id' => 'required|exists:users,id',
            'tabel' => 'required|string|max:255',
            'aksi' => 'required|in:create,update,delete,login,logout',
            'deskripsi' => 'nullable|string',
        ]);

        $log = AuditLog::create($validated);

        return response()->json([
            'success' => true,
            'message' => 'Log audit berhasil dibuat',
            'data' => $log
        ], Response::HTTP_CREATED);
    }
}
