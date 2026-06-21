<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Event;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;
use App\Models\AuditLog;

class EventController extends Controller
{
    public function index()
    {
        $events = Event::all();
        return response()->json([
            'success' => true,
            'data' => $events
        ]);
    }

    public function show(int $id)
    {
        $event = Event::find($id);

        if (!$event) {
            return response()->json([
                'success' => false,
                'message' => 'Event tidak ditemukan'
            ], Response::HTTP_NOT_FOUND);
        }

        return response()->json([
            'success' => true,
            'data' => $event
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'nama_event' => 'required|string|max:255',
            'deskripsi' => 'required|string',
            'tanggal_mulai' => 'required|date',
            'tanggal_selesai' => 'required|date|after:tanggal_mulai',
            'lokasi' => 'required|string|max:255',
            'kuota_tim' => 'required|integer|min:2',
            'biaya_pendaftaran' => 'required|integer|min:0',
            'status' => 'required|in:draft,aktif,selesai',
        ]);

        $validated['created_by'] = Auth::id();

        $event = Event::create($validated);

        AuditLog::create([
            'user_id' => Auth::id(),
            'tabel' => 'events',
            'aksi' => 'create',
            'tanggal' => now(),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Event berhasil dibuat',
            'data' => $event
        ], Response::HTTP_CREATED);
    }

    public function update(Request $request, int $id)
    {
        $event = Event::find($id);

        if (!$event) {
            return response()->json([
                'success' => false,
                'message' => 'Event tidak ditemukan'
            ], Response::HTTP_NOT_FOUND);
        }

        $validated = $request->validate([
            'nama_event' => 'string|max:255',
            'deskripsi' => 'string',
            'tanggal_mulai' => 'date',
            'tanggal_selesai' => 'date',
            'lokasi' => 'string|max:255',
            'kuota_tim' => 'integer|min:2',
            'biaya_pendaftaran' => 'integer|min:0',
            'status' => 'in:draft,aktif,selesai',
        ]);

        $event->update($validated);

        AuditLog::create([
            'user_id' => Auth::id(),
            'tabel' => 'events',
            'aksi' => 'update',
            'tanggal' => now(),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Event berhasil diperbarui',
            'data' => $event
        ]);
    }

    public function destroy(int $id)
    {
        $event = Event::find($id);

        if (!$event) {
            return response()->json([
                'success' => false,
                'message' => 'Event tidak ditemukan'
            ], Response::HTTP_NOT_FOUND);
        }

        $event->delete();

        AuditLog::create([
            'user_id' => Auth::id(),
            'tabel' => 'events',
            'aksi' => 'delete',
            'tanggal' => now(),
        ]);

        $event->delete();

        return response()->json([
            'success' => true,
            'message' => 'Event berhasil dihapus'
        ]);
    }
}
