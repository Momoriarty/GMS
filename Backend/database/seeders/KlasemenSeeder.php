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

        // Dihitung berdasarkan hasil_pertandingan yang sudah di-seed
        // tim[0]: main 1, menang 1, seri 0, kalah 0, poin 3, gol_masuk 3, gol_kemasukan 1
        // tim[1]: main 1, menang 0, seri 0, kalah 1, poin 0, gol_masuk 1, gol_kemasukan 3
        // tim[2]: main 1, menang 0, seri 1, kalah 0, poin 1, gol_masuk 2, gol_kemasukan 2
        // tim[3]: main 1, menang 0, seri 1, kalah 0, poin 1, gol_masuk 2, gol_kemasukan 2

        $klasemen = [
            ['tim_id' => $tim[0], 'main' => 1, 'menang' => 1, 'seri' => 0, 'kalah' => 0, 'poin' => 3, 'gol_masuk' => 3, 'gol_kemasukan' => 1],
            ['tim_id' => $tim[1], 'main' => 1, 'menang' => 0, 'seri' => 0, 'kalah' => 1, 'poin' => 0, 'gol_masuk' => 1, 'gol_kemasukan' => 3],
            ['tim_id' => $tim[2], 'main' => 1, 'menang' => 0, 'seri' => 1, 'kalah' => 0, 'poin' => 1, 'gol_masuk' => 2, 'gol_kemasukan' => 2],
            ['tim_id' => $tim[3], 'main' => 1, 'menang' => 0, 'seri' => 1, 'kalah' => 0, 'poin' => 1, 'gol_masuk' => 2, 'gol_kemasukan' => 2],
        ];

        foreach ($klasemen as $item) {
            DB::table('klasemen')->insert([

                'event_id' => $event,
                ...$item,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
    }
}
