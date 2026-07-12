<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Exception;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Laravel\Socialite\Facades\Socialite;
use Illuminate\Support\Str;

class GoogleController extends Controller
{
    /**
     * Redirect ke halaman login Google.
     */
    public function redirectToGoogle()
    {
        return Socialite::driver('google')->redirect();
    }

    /**
     * Handle callback dari Google.
     */
    public function handleGoogleCallback()
    {
        try {
            // Stateless is important for API/SPA authentication to prevent session mismatch errors
            $googleUser = Socialite::driver('google')->stateless()->user();
            
            // Cari user berdasarkan google_id, atau email
            $user = User::where('google_id', $googleUser->id)
                ->orWhere('email', $googleUser->email)
                ->first();

            if ($user) {
                // Update google_id jika belum diset
                if (!$user->google_id) {
                    $user->update(['google_id' => $googleUser->id]);
                }
            } else {
                // Buat user baru
                $user = User::create([
                    'name' => $googleUser->name,
                    'email' => $googleUser->email,
                    'google_id' => $googleUser->id,
                    'role' => 'user',
                    'password' => null,
                ]);
            }

            // Generate token Sanctum
            $token = $user->createToken('auth_token')->plainTextToken;

            // Redirect kembali ke frontend dengan token dan info user
            $frontendUrl = env('FRONTEND_URL', 'http://localhost:5173');
            
            $userData = json_encode([
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role,
            ]);

            return redirect()->away($frontendUrl . '/auth/google/callback?token=' . $token . '&user=' . urlencode($userData));

        } catch (Exception $e) {
            Log::error('Google Login Error: ' . $e->getMessage());
            
            $frontendUrl = env('FRONTEND_URL', 'http://localhost:5173');
            return redirect()->away($frontendUrl . '/login?error=google_login_failed');
        }
    }
}
