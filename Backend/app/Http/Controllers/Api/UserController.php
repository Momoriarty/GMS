<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Schema;
use Illuminate\Validation\Rule;
use App\Models\AuditLog;
use Illuminate\Support\Facades\Auth;

class UserController extends Controller
{
    public function index()
    {
        $users = User::all();

        return response()->json([
            'success' => true,
            'message' => 'Data users berhasil diambil',
            'data'    => $users
        ]);
    }

    public function update(Request $request)
    {
        $user = $request->user(); // Otomatis mengambil user yang sedang login dari token

        if (!$user) {
            return response()->json(['success' => false, 'message' => 'User tidak ditemukan'], 404);
        }

        $validated = $request->validate([
            'full_name'    => 'sometimes|string|max:255',
            'phone_number' => 'sometimes|string|max:20',
            'location'     => 'nullable|string|max:255',
            'interest'     => 'nullable|string|max:255',
            'email'        => ['sometimes', 'email', Rule::unique('users', 'email')->ignore($user->id)],
            'username'     => ['sometimes', 'string', 'max:255', Rule::unique('users', 'username')->ignore($user->id)],
        ]);

        $user->update($validated);

        if (Auth::check()) {
            AuditLog::create([
                'user_id' => Auth::id(),
                'tabel' => 'users',
                'aksi' => 'update',
                'deskripsi' => 'Pengguna memperbarui profil: ' . $user->name,
            ]);
        }

        return response()->json([
            'success' => true,
            'message' => 'Profil berhasil diperbarui',
            'user'    => $user
        ]);
    }

    public function destroy($id)
    {
        $user = User::find($id);

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'User tidak ditemukan',
            ], 404);
        }

        $userName = $user->name;
        $user->delete();

        if (Auth::check()) {
            AuditLog::create([
                'user_id' => Auth::id(),
                'tabel' => 'users',
                'aksi' => 'delete',
                'deskripsi' => 'Pengguna dihapus: ' . $userName,
            ]);
        }

        return response()->json([
            'success' => true,
            'message' => 'User berhasil dihapus',
        ]);
    }
}