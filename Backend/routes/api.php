<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\EventController;
use App\Http\Controllers\Api\JadwalPertandinganController;
use App\Http\Controllers\Api\HasilPertandinganController;
use App\Http\Controllers\Api\PendaftaranController;
use App\Http\Controllers\Api\KlasemenController;
use App\Http\Controllers\Api\NotifikasiController;
use App\Http\Controllers\Api\AuditLogController;
use App\Http\Controllers\JadwalPertandinganRandomController;

// Publik
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login',    [AuthController::class, 'login']);

// Terproteksi
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);

    Route::get('/user', fn(Request $request) => $request->user());

    // Users — wajib login
    Route::get('/users',         [UserController::class, 'index']);
    Route::put('/users/{id}',    [UserController::class, 'update']);
    Route::delete('/users/{id}', [UserController::class, 'destroy']);

    // Events
    Route::get('/events',           [EventController::class, 'index']);
    Route::get('/events/{id}',      [EventController::class, 'show']);
    Route::post('/events',          [EventController::class, 'store']);
    Route::put('/events/{id}',      [EventController::class, 'update']);
    Route::delete('/events/{id}',   [EventController::class, 'destroy']);

    // Jadwal Pertandingan
    Route::get('/jadwal-pertandingan',           [JadwalPertandinganController::class, 'index']);
    Route::get('/jadwal-pertandingan/{id}',      [JadwalPertandinganController::class, 'show']);
    Route::post('/jadwal-pertandingan',          [JadwalPertandinganController::class, 'store']);
    Route::post('/jadwal-pertandingan/bulk-save', [JadwalPertandinganController::class, 'bulkSave']);
    Route::put('/jadwal-pertandingan/{id}',      [JadwalPertandinganController::class, 'update']);
    Route::delete('/jadwal-pertandingan/{id}',   [JadwalPertandinganController::class, 'destroy']);

    // Jadwal Pertandingan Random
    Route::post('/events/{eventId}/generate-jadwal-random', [JadwalPertandinganRandomController::class, 'generate']);
    Route::get('/events/{eventId}/jadwal-pertandingan-random', [JadwalPertandinganRandomController::class, 'getSchedule']);
    Route::get('/events/{eventId}/jadwal-pending', [JadwalPertandinganRandomController::class, 'getPendingSchedule']);
    Route::post('/events/{eventId}/confirm-jadwal', [JadwalPertandinganRandomController::class, 'confirmSchedule']);
    Route::post('/events/{eventId}/cancel-jadwal', [JadwalPertandinganRandomController::class, 'cancelSchedule']);
    Route::delete('/events/{eventId}/jadwal-pertandingan-random', [JadwalPertandinganRandomController::class, 'clearSchedule']);
    Route::get('/events/{eventId}/jadwal-stats', [JadwalPertandinganRandomController::class, 'getStats']);

    // Hasil Pertandingan
    Route::get('/hasil-pertandingan',           [HasilPertandinganController::class, 'index']);
    Route::get('/hasil-pertandingan/{id}',      [HasilPertandinganController::class, 'show']);
    Route::post('/hasil-pertandingan',          [HasilPertandinganController::class, 'store']);
    Route::put('/hasil-pertandingan/{id}',      [HasilPertandinganController::class, 'update']);
    Route::delete('/hasil-pertandingan/{id}',   [HasilPertandinganController::class, 'destroy']);

    // Pendaftaran
    Route::get('/pendaftaran',           [PendaftaranController::class, 'index']);
    Route::get('/pendaftaran/{id}',      [PendaftaranController::class, 'show']);
    Route::post('/pendaftaran',          [PendaftaranController::class, 'store']);
    Route::post('/pendaftaran/{id}/verify', [PendaftaranController::class, 'verify']);
    Route::delete('/pendaftaran/{id}',   [PendaftaranController::class, 'destroy']);

    // Klasemen
    Route::get('/klasemen',     [KlasemenController::class, 'index']);
    Route::get('/klasemen/{id}', [KlasemenController::class, 'show']);
    Route::post('/klasemen',    [KlasemenController::class, 'store']);
    Route::put('/klasemen/{id}', [KlasemenController::class, 'update']);

    // Notifikasi
    Route::get('/notifikasi',           [NotifikasiController::class, 'index']);
    Route::get('/notifikasi/{id}',      [NotifikasiController::class, 'show']);
    Route::post('/notifikasi',          [NotifikasiController::class, 'store']);
    Route::post('/notifikasi/{id}/read', [NotifikasiController::class, 'markAsRead']);
    Route::delete('/notifikasi/{id}',   [NotifikasiController::class, 'destroy']);

    // Audit Log
    Route::get('/audit-log',     [AuditLogController::class, 'index']);
    Route::get('/audit-log/{id}', [AuditLogController::class, 'show']);
    Route::post('/audit-log',    [AuditLogController::class, 'store']);
});
