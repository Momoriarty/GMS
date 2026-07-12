<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Admin 1
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
        ]);

        User::create([
            'name' => 'Admin',
            'email' => 'Admin@gmail.com',
            'username' => 'admin',
            'phone_number' => null,
            'email_verified_at' => null,
            'password' => Hash::make('admin'),
            'role' => 'admin',
            'status' => 'active',
            'avatar' => null,
            'remember_token' => null,
        ]);

        // Admin 2
        User::create([
            'name' => 'FARHAN GUSRI FADHLAH',
            'email' => 'gusri24ti@mahasiswa.pcr.ac.id',
            'username' => 'gusri24ti',
            'phone_number' => null,
            'email_verified_at' => null,
            'password' => Hash::make('123456789'),
            'role' => 'admin',
            'status' => 'active',
            'avatar' => null,
            'remember_token' => null,
        ]);
        User::create([
            'name' => 'M DZAKI FAADHILAH',
            'email' => 'dzaki24ti@mahasiswa.pcr.ac.id',
            'username' => 'dzaki24ti',
            'phone_number' => null,
            'email_verified_at' => null,
            'password' => Hash::make('123456789'),
            'role' => 'admin',
            'status' => 'active',
            'avatar' => null,
            'remember_token' => null,
        ]);

        // Dummy peserta
        $users = [];

        for ($i = 1; $i <= 20; $i++) {
            $users[] = [
                'name' => "User $i",
                'email' => "user{$i}@gmail.com",
                'username' => "user{$i}",
                'phone_number' => '0812345678'.str_pad($i, 2, '0', STR_PAD_LEFT),
                'email_verified_at' => now(),
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
