<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call([
            UserSeeder::class, // uncomment jika kamu punya UserSeeder
            // TimSeeder::class,
            EventsSeeder::class,
            // PendaftaranSeeder::class,
            // JadwalPertandinganSeeder::class,
            // HasilPertandinganSeeder::class,
            // KlasemenSeeder::class,
            // NotifikasiSeeder::class,
            // AuditLogSeeder::class,
        ]);
    }
}
