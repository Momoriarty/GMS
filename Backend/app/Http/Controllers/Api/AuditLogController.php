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
        $query = AuditLog::with('user');

        if ($request->search) {
            $search = strtolower($request->search);
            $query->where(function ($q) use ($search) {
                $q->whereRaw('LOWER(tabel) LIKE ?', ["%{$search}%"])
                    ->orWhereRaw('LOWER(aksi) LIKE ?', ["%{$search}%"])
                    ->orWhereRaw('LOWER(deskripsi) LIKE ?', ["%{$search}%"])
                    ->orWhereHas('user', function ($qUser) use ($search) {
                        $qUser->whereRaw('LOWER(name) LIKE ?', ["%{$search}%"]);
                    });
            });
        }

        if ($request->tabel && $request->tabel !== 'all') {
            $query->where('tabel', $request->tabel);
        }

        if ($request->aksi && $request->aksi !== 'all') {
            $query->where('aksi', $request->aksi);
        }

        if ($request->sort_by) {
            $dir = $request->sort_dir === 'desc' ? 'desc' : 'asc';
            if ($request->sort_by === 'user_name') {
                $query->join('users', 'audit_logs.user_id', '=', 'users.id')
                    ->select('audit_logs.*')
                    ->orderBy('users.name', $dir);
            } else {
                $query->orderBy($request->sort_by, $dir);
            }
        } else {
            $query->orderBy('created_at', 'desc');
        }

        $perPage = $request->per_page ?? 10;
        $logs = $query->paginate($perPage);

        $formatted = $logs->map(function ($log) {
            return [
                'id' => $log->id,
                'created_at' => $log->created_at,
                'user_name' => $log->user->name ?? '-',
                'tabel' => $log->tabel,
                'aksi' => $log->aksi,
                'deskripsi' => $log->deskripsi,
            ];
        });

        return response()->json([
            'success' => true,
            'data' => $formatted,
            'pagination' => [
                'total' => $logs->total(),
                'per_page' => $logs->perPage(),
                'current_page' => $logs->currentPage(),
                'last_page' => $logs->lastPage(),
            ],
        ]);
    }

    /**
     * Get single audit log
     */
    public function show(int $id)
    {
        $log = AuditLog::with('user')->find($id);

        if (! $log) {
            return response()->json([
                'success' => false,
                'message' => 'Log audit tidak ditemukan',
            ], Response::HTTP_NOT_FOUND);
        }

        return response()->json([
            'success' => true,
            'data' => $log,
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
            'data' => $log,
        ], Response::HTTP_CREATED);
    }
}
