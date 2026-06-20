<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class KlasemenSeeder extends Seeder
{
    public function run(): void
    {
        $event = DB::table('events')->where('status', 'aktif')->value('id');
        $tim   = DB::table('tim')->pluck('id');

        foreach ($tim as $timId) {
            DB::table('klasemen')->insert([
                'event_id' => $event,
                'tim_id' => $timId,
                'main' => 0,
                'menang' => 0,
                'seri' => 0,
                'kalah' => 0,
                'poin' => 0,
                'gol_masuk' => 0,
                'gol_kemasukan' => 0,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
    }
}