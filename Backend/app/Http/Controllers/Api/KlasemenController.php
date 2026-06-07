<?php

namespace App\Http\Controllers\Api;

use App\Models\Klasemen;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class KlasemenController extends Controller
{
    /**
     * Get klasemen (dengan filter event)
     */
    public function index(Request $request)
    {
        $query = Klasemen::with(['event', 'tim'])->orderBy('poin', 'desc');

        if ($request->event_id) {
            $query->where('event_id', $request->event_id);
        }

        $klasemen = $query->get();

        return response()->json([
            'success' => true,
            'data' => $klasemen
        ]);
    }

    /**
     * Get single klasemen entry
     */
    public function show($id)
    {
        $klasemen = Klasemen::with(['event', 'tim'])->find($id);
        
        if (!$klasemen) {
            return response()->json([
                'success' => false,
                'message' => 'Klasemen tidak ditemukan'
            ], Response::HTTP_NOT_FOUND);
        }

        return response()->json([
            'success' => true,
            'data' => $klasemen
        ]);
    }

    /**
     * Create klasemen entry
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'event_id' => 'required|exists:events,id',
            'tim_id' => 'required|exists:tim,id',
            'main' => 'required|integer|min:0',
            'menang' => 'required|integer|min:0',
            'seri' => 'required|integer|min:0',
            'kalah' => 'required|integer|min:0',
            'poin' => 'required|integer|min:0',
            'gol_masuk' => 'required|integer|min:0',
            'gol_kemasukan' => 'required|integer|min:0',
        ]);

        $klasemen = Klasemen::create($validated);

        return response()->json([
            'success' => true,
            'message' => 'Klasemen berhasil dibuat',
            'data' => $klasemen
        ], Response::HTTP_CREATED);
    }

    /**
     * Update klasemen
     */
    public function update(Request $request, $id)
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
            'poin' => 'integer|min:0',
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
