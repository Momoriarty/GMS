<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Tim;
use Illuminate\Support\Facades\Auth;

class TimController extends Controller
{
    /**
     * Mengembalikan semua tim milik user yang sedang login.
     * Digunakan oleh frontend untuk menampilkan pilihan tim yang sudah pernah dibuat.
     */
    public function myTeams()
    {
        $teams = Tim::where('user_id', Auth::id())
            ->orderByDesc('created_at')
            ->get(['id', 'nama_tim', 'kelompok_umur', 'logo_tim']);

        return response()->json([
            'success' => true,
            'data'    => $teams,
        ]);
    }
}
