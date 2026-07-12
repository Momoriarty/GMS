<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Mail\OtpMail;
use App\Models\AuditLog;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Validator;

class AuthController extends Controller
{
    public function register(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8',
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 422);
        }

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
        ]);

        return response()->json([
            'message' => 'Registrasi berhasil!',
            'user' => $user,
        ], 201);
    }

    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        $user = User::where('email', $request->email)->first();

        if (! $user || ! Hash::check($request->password, $user->password)) {
            return response()->json([
                'message' => 'Email atau password salah.',
            ], 401);
        }

        $token = $user->createToken('auth_token')->plainTextToken;

        // Audit Log Login
        AuditLog::create([
            'user_id' => $user->id,
            'tabel' => 'users',
            'aksi' => 'login',
            'deskripsi' => 'User login ke sistem',
        ]);

        return response()->json([
            'message' => 'Login berhasil!',
            'access_token' => $token,
            'token_type' => 'Bearer',
            'user' => $user,
        ]);
    }

    public function logout(Request $request)
    {
        $user = $request->user();

        if ($user) {

            // Audit Log Logout
            AuditLog::create([
                'user_id' => $user->id,
                'tabel' => 'users',
                'aksi' => 'logout',
                'deskripsi' => 'User logout dari sistem',
            ]);

            // Hapus token
            $user->currentAccessToken()?->delete();
        }

        return response()->json([
            'message' => 'Logout berhasil',
        ]);
    }

    public function forgotPassword(Request $request)
    {
        $request->validate(['email' => 'required|email']);

        $user = User::where('email', $request->email)->first();

        if (! $user) {
            return response()->json(['message' => 'Email tidak terdaftar di sistem kami.'], 404);
        }

        // Buat OTP 6 digit
        $otp = sprintf('%06d', mt_rand(1, 999999));

        // Simpan ke password_resets (menggunakan Eloquent model DB facade)
        DB::table('password_reset_tokens')->updateOrInsert(
            ['email' => $user->email],
            [
                'token' => $otp,
                'created_at' => now(),
            ]
        );

        // Kirim Email
        Mail::to($user->email)->send(new OtpMail($otp));

        return response()->json([
            'message' => 'Kode OTP telah dikirim ke email Anda.',
        ]);
    }

    public function verifyOtp(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'otp' => 'required|digits:6',
        ]);

        $record = DB::table('password_reset_tokens')
            ->where('email', $request->email)
            ->where('token', $request->otp)
            ->first();

        if (! $record) {
            return response()->json(['message' => 'Kode OTP tidak valid.'], 400);
        }

        // Cek kedaluwarsa (misal 15 menit)
        if (now()->diffInMinutes(Carbon::parse($record->created_at)) > 15) {
            return response()->json(['message' => 'Kode OTP sudah kedaluwarsa. Silakan minta ulang.'], 400);
        }

        return response()->json([
            'message' => 'Kode OTP valid.',
        ]);
    }

    public function resetPassword(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'otp' => 'required|digits:6',
            'password' => 'required|min:8',
        ]);

        $record = DB::table('password_reset_tokens')
            ->where('email', $request->email)
            ->where('token', $request->otp)
            ->first();

        if (! $record) {
            return response()->json(['message' => 'Kode OTP tidak valid.'], 400);
        }

        if (now()->diffInMinutes(Carbon::parse($record->created_at)) > 15) {
            return response()->json(['message' => 'Kode OTP sudah kedaluwarsa.'], 400);
        }

        $user = User::where('email', $request->email)->first();
        if (! $user) {
            return response()->json(['message' => 'User tidak ditemukan.'], 404);
        }

        // Update password
        $user->password = Hash::make($request->password);
        $user->save();

        // Hapus token
        DB::table('password_reset_tokens')->where('email', $request->email)->delete();

        // Catat di Audit Log
        AuditLog::create([
            'user_id' => $user->id,
            'tabel' => 'users',
            'aksi' => 'update',
            'deskripsi' => 'User mereset password via OTP',
        ]);

        return response()->json([
            'message' => 'Password berhasil diubah. Silakan login kembali.',
        ]);
    }
}
