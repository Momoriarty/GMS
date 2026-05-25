<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Admin utama
        User::create([
            'name' => 'ARIFIN ARIFIN',
            'email' => 'arifin24ti@mahasiswa.pcr.ac.id',
            'username' => 'arifin24ti',
            'phone_number' => null,
            'email_verified_at' => null,

            'password' => Hash::make('123456789'),

            'role' => 'admin',
            'status' => 'active',
            'avatar' => null,
            'remember_token' => null,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        // 20 akun dummy
        $users = [];

        for ($i = 1; $i <= 20; $i++) {
            $users[] = [
                'name' => 'User ' . $i,
                'email' => 'user' . $i . '@gmail.com',
                'username' => 'user' . $i,
                'phone_number' => '0812345678' . str_pad($i, 2, '0', STR_PAD_LEFT),
                'email_verified_at' => now(),

                // password: password123
                'password' => Hash::make('password123'),

                'role' => 'peserta',
                'status' => 'active',
                'avatar' => null,
                'remember_token' => null,

                'created_at' => now(),
                'updated_at' => now(),
            ];
        }

        User::insert($users);
    }
}