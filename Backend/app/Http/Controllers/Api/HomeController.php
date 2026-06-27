<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Event;
use App\Models\JadwalPertandingan;
use App\Models\Pendaftaran;
use App\Models\Tim;

class HomeController extends Controller
{
    public function stats()
    {
        return response()->json([
            'success' => true,
            'data' => [
                'teams'   => Tim::count(),
                'events'  => Event::where('status', 'aktif')->count(),
                'matches' => JadwalPertandingan::where('status', 'selesai')->count(),
            ]
        ]);
    }
    public function liveMatch()
    {
        $now = now();

        // Anggap pertandingan berlangsung selama 90 menit sejak waktu_pertandingan
        $match = JadwalPertandingan::with(['tim1', 'tim2', 'hasil', 'event'])
            ->where('status', 'terjadwal')
            ->where('waktu_pertandingan', '<=', $now)
            ->where('waktu_pertandingan', '>=', $now->copy()->subMinutes(90))
            ->latest('waktu_pertandingan')
            ->first();

        if (!$match) {
            return response()->json(['success' => true, 'data' => null]);
        }

        return response()->json([
            'success' => true,
            'data' => [
                'id'              => $match->id,
                'event_nama'      => $match->event?->nama_event,
                'tim_1_nama'      => $match->tim1?->nama_tim,
                'tim_2_nama'      => $match->tim2?->nama_tim,
                'skor_tim_1'      => $match->hasil?->skor_tim_1 ?? 0,
                'skor_tim_2'      => $match->hasil?->skor_tim_2 ?? 0,
                'lokasi_lapangan' => $match->lokasi_lapangan,
            ]
        ]);
    }
    public function upcomingMatches()
    {
        $matches = JadwalPertandingan::with(['tim1', 'tim2', 'event'])
            ->where('status', 'terjadwal')
            ->where('waktu_pertandingan', '>', now())
            ->orderBy('waktu_pertandingan')
            ->limit(4) // ← dikurangi
            ->get()
            ->map(fn($m) => [
                'id'         => $m->id,
                'event_nama' => $m->event?->nama_event,
                'tim_1_nama' => $m->tim1?->nama_tim,
                'tim_2_nama' => $m->tim2?->nama_tim,
                'waktu'      => $m->waktu_pertandingan?->format('d M Y, H:i'),
                'lokasi'     => $m->lokasi_lapangan,
            ]);

        return response()->json(['success' => true, 'data' => $matches]);
    }

    public function recentResults()
    {
        $results = JadwalPertandingan::with(['tim1', 'tim2', 'hasil', 'event'])
            ->where('status', 'selesai')
            ->orderByDesc('waktu_pertandingan')
            ->limit(4)
            ->get()
            ->map(fn($m) => [
                'id'         => $m->id,
                'event_nama' => $m->event?->nama_event,
                'tim_1_nama' => $m->tim1?->nama_tim,
                'tim_2_nama' => $m->tim2?->nama_tim,
                'skor_tim_1' => $m->hasil?->skor_tim_1 ?? 0,
                'skor_tim_2' => $m->hasil?->skor_tim_2 ?? 0,
                'waktu'      => $m->waktu_pertandingan?->format('d M Y, H:i'),
                'lokasi'     => $m->lokasi_lapangan,
            ]);

        return response()->json(['success' => true, 'data' => $results]);
    }

    public function events()
    {
        $events = Event::withCount('pendaftaran')
            ->where('status', 'aktif')
            ->orderBy('tanggal_mulai')
            ->get();

        return response()->json(['success' => true, 'data' => $events]);
    }
}
