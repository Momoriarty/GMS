<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Schema;
use Illuminate\Validation\Rule;

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

        $user->delete();

        return response()->json([
            'success' => true,
            'message' => 'User berhasil dihapus',
        ]);
    }
}