<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Klasemen;
use App\Models\Pendaftaran;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class KlasemenController extends Controller
{
    public function index(Request $request)
    {
        $query = Klasemen::with('tim')
            ->orderByRaw('(gol_masuk - gol_kemasukan) DESC')
            ->orderByDesc('gol_masuk');

        if ($request->event_id) {
            $query->where('event_id', $request->event_id);
        }

        $klasemen = $query->get();

        if ($request->event_id && $klasemen->isEmpty()) {
            $registeredTeams = Pendaftaran::with('tim')
                ->where('event_id', $request->event_id)
                ->where('status', 'diterima')
                ->get()
                ->map(function ($item) {
                    return [
                        'id' => null,
                        'tim_id' => $item->tim_id,
                        'nama_tim' => $item->tim?->nama_tim,
                        'main' => 0,
                        'menang' => 0,
                        'seri' => 0,
                        'kalah' => 0,
                        'gol_masuk' => 0,
                        'gol_kemasukan' => 0,
                        'selisih_gol' => 0,
                    ];
                });

            return response()->json([
                'success' => true,
                'data' => $registeredTeams
            ]);
        }

        $formatted = $klasemen->map(function ($item) {
            return [
                'id' => $item->id,
                'tim_id' => $item->tim_id,
                'nama_tim' => $item->tim?->nama_tim,
                'main' => $item->main,
                'menang' => $item->menang,
                'seri' => $item->seri,
                'kalah' => $item->kalah,
                'gol_masuk' => $item->gol_masuk,
                'gol_kemasukan' => $item->gol_kemasukan,
                'selisih_gol' => $item->gol_masuk - $item->gol_kemasukan,
            ];
        });

        return response()->json([
            'success' => true,
            'data' => $formatted
        ]);
    }

    /**
     * Update klasemen
     */
    public function update(Request $request, int $id)
    {
        $klasemen = Klasemen::find($id);

        if (!$klasemen) {
            return response()->json([
                'success' => false,
                'message' => 'Klasemen tidak ditemukan'
            ], Response::HTTP_NOT_FOUND);
        }

        $validated = $request->validate([
            'main' => 'integer|min:0',
            'menang' => 'integer|min:0',
            'seri' => 'integer|min:0',
            'kalah' => 'integer|min:0',
            'gol_masuk' => 'integer|min:0',
            'gol_kemasukan' => 'integer|min:0',
        ]);

        $klasemen->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Klasemen berhasil diperbarui',
            'data' => $klasemen
        ]);
    }
}
