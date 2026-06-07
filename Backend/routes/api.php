<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\UserController;

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
});
