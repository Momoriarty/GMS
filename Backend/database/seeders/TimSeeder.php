<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class TimSeeder extends Seeder
{
    public function run(): void
    {
        $users = DB::table('users')
            ->where('role', 'peserta')
            ->pluck('id')
            ->toArray();

        $tim = [
            // Kelompok U13 - 4 tim
            ['nama_tim' => 'Garuda FC',       'logo_tim' => null, 'kelompok_umur' => 'U13'],
            ['nama_tim' => 'Elang Muda',      'logo_tim' => null, 'kelompok_umur' => 'U13'],
            ['nama_tim' => 'Rajawali United', 'logo_tim' => null, 'kelompok_umur' => 'U13'],
            ['nama_tim' => 'Singa Merah',     'logo_tim' => null, 'kelompok_umur' => 'U13'],

            // Kelompok U16 - 4 tim
            ['nama_tim' => 'Macan Putih',     'logo_tim' => null, 'kelompok_umur' => 'U16'],
            ['nama_tim' => 'Harimau FC',      'logo_tim' => null, 'kelompok_umur' => 'U16'],
            ['nama_tim' => 'Bintang Timur',   'logo_tim' => null, 'kelompok_umur' => 'U16'],
            ['nama_tim' => 'Nusantara FC',    'logo_tim' => null, 'kelompok_umur' => 'U16'],

            // Kelompok U19 - 4 tim
            ['nama_tim' => 'Petir United',    'logo_tim' => null, 'kelompok_umur' => 'U19'],
            ['nama_tim' => 'Samudra FC',      'logo_tim' => null, 'kelompok_umur' => 'U19'],
            ['nama_tim' => 'Cakra Muda',      'logo_tim' => null, 'kelompok_umur' => 'U19'],
            ['nama_tim' => 'Panglima FC',     'logo_tim' => null, 'kelompok_umur' => 'U19'],

            // Kelompok U22 - 4 tim
            ['nama_tim' => 'Borneo Stars',    'logo_tim' => null, 'kelompok_umur' => 'U22'],
            ['nama_tim' => 'Merpati FC',      'logo_tim' => null, 'kelompok_umur' => 'U22'],
            ['nama_tim' => 'Laskar Hitam',    'logo_tim' => null, 'kelompok_umur' => 'U22'],
            ['nama_tim' => 'Phoenix United',  'logo_tim' => null, 'kelompok_umur' => 'U22'],
        ];

        foreach ($tim as $index => $data) {
            DB::table('tim')->insert([
                'user_id' => $users[$index % count($users)],
                'nama_tim' => $data['nama_tim'],
                'logo_tim' => $data['logo_tim'],
                'kelompok_umur' => $data['kelompok_umur'],
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
    }
}
