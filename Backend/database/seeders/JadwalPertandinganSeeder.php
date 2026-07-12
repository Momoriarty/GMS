<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class JadwalPertandinganSeeder extends Seeder
{
    public function run(): void
    {
        $event = DB::table('events')->where('status', 'aktif')->value('id');
        $tim = DB::table('tim')->pluck('id');

        $jadwal = [
            [
                'tim_1_id' => $tim[0],
                'tim_2_id' => $tim[1],
                'waktu_pertandingan' => '2025-07-01 09:00:00',
                'lokasi_lapangan' => 'Lapangan A',
                'status' => 'selesai',
            ],
            [
                'tim_1_id' => $tim[2],
                'tim_2_id' => $tim[3],
                'waktu_pertandingan' => '2025-07-01 11:00:00',
                'lokasi_lapangan' => 'Lapangan A',
                'status' => 'selesai',
            ],
            [
                'tim_1_id' => $tim[0],
                'tim_2_id' => $tim[2],
                'waktu_pertandingan' => '2025-07-03 09:00:00',
                'lokasi_lapangan' => 'Lapangan A',
                'status' => 'terjadwal',
            ],
            [
                'tim_1_id' => $tim[1],
                'tim_2_id' => $tim[3],
                'waktu_pertandingan' => '2025-07-03 11:00:00',
                'lokasi_lapangan' => 'Lapangan A',
                'status' => 'terjadwal',
            ],
        ];

        foreach ($jadwal as $item) {
            DB::table('jadwal_pertandingan')->insert([

                'event_id' => $event,
                ...$item,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
    }
}
