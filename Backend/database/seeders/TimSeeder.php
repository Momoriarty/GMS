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
            ['nama_tim' => 'Garuda FC', 'logo_tim' => null],
            ['nama_tim' => 'Elang Muda', 'logo_tim' => null],
            ['nama_tim' => 'Rajawali United', 'logo_tim' => null],
            ['nama_tim' => 'Singa Merah', 'logo_tim' => null],
        ];

        foreach ($tim as $index => $data) {
            DB::table('tim')->insert([
                'user_id'    => $users[$index % count($users)],
                'nama_tim'   => $data['nama_tim'],
                'logo_tim'   => $data['logo_tim'],
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
    }
}