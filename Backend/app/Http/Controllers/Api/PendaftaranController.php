<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Pendaftaran;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;
use App\Models\Tim;
use App\Models\Event;
use Midtrans\Config;
use Midtrans\Snap;

class PendaftaranController extends Controller
{
    public function index(Request $request)
    {
        $query = Pendaftaran::with(['user', 'event', 'verifiedBy', 'user.tim']);

        if ($request->event_id) $query->where('event_id', $request->event_id);
        if ($request->status)   $query->where('status', $request->status);
        if ($request->user_id)  $query->where('user_id', $request->user_id);

        $pendaftaran = $query->get();

        $formatted = $pendaftaran->map(function ($item) {
            return [
                'id'             => $item->id,
                'user_id'        => $item->user_id,
                'event_id'       => $item->event_id,
                'status'         => $item->status,
                'tanggal_daftar' => $item->tanggal_daftar,
                'user' => $item->user ? [
                    'id'    => $item->user->id,
                    'name'  => $item->user->name,
                    'email' => $item->user->email,
                    'tim'   => $item->user->tim ? [
                        'id'            => $item->user->tim->id,
                        'nama_tim'      => $item->user->tim->nama_tim,
                        'kelompok_umur' => $item->user->tim->kelompok_umur,
                        'user_id'       => $item->user->tim->user_id,
                    ] : null
                ] : null,
                'event' => $item->event,
            ];
        });

        return response()->json(['success' => true, 'data' => $formatted]);
    }

    public function show(int $id)
    {
        $pendaftaran = Pendaftaran::with(['user', 'event', 'verifiedBy'])->find($id);

        if (!$pendaftaran) {
            return response()->json([
                'success' => false,
                'message' => 'Pendaftaran tidak ditemukan'
            ], Response::HTTP_NOT_FOUND);
        }

        return response()->json(['success' => true, 'data' => $pendaftaran]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'event_id'      => 'required|exists:events,id',
            'nama_tim'      => 'required|string|max:255',
            'kelompok_umur' => 'required|string',
            'logo_tim'      => 'nullable|image|mimes:jpg,jpeg,png|max:2048',
        ]);

        $userId = auth()->id();

        // 1. Simpan Logo Tim
        $logoPath = null;
        if ($request->hasFile('logo_tim')) {
            $logoPath = $request->file('logo_tim')->store('logo_tim', 'public');
        }

        // 2. Simpan ke tabel tim
        $tim = Tim::create([
            'user_id'       => $userId,
            'nama_tim'      => $request->nama_tim,
            'kelompok_umur' => $request->kelompok_umur,
            'logo_tim'      => $logoPath,
        ]);

        // 3. Simpan ke tabel pendaftaran
        $pendaftaran = Pendaftaran::create([
            'user_id'        => $userId,
            'event_id'       => $request->event_id,
            'status'         => 'menunggu',
            'tanggal_daftar' => now(),
        ]);

        // 4. Ambil data event untuk harga
        $event = Event::findOrFail($request->event_id);

        // 5. Setup Midtrans
        Config::$serverKey    = env('MIDTRANS_SERVER_KEY');
        Config::$isProduction = false;
        Config::$isSanitized  = true;
        Config::$is3ds        = true;
        Config::$curlOptions  = [CURLOPT_SSL_VERIFYPEER => false];

        // 6. Generate Snap Token
        $params = [
            'transaction_details' => [
                'order_id'     => 'ORDER-' . $pendaftaran->id . '-' . time(),
                'gross_amount' => (int) $event->biaya_pendaftaran,
            ],
            'customer_details' => [
                'email' => $request->email_pendaftar,
                'phone' => $request->no_wa_pendaftar,
            ],
            'enabled_payments' => ['gopay'], // ← tambah ini

        ];

        $snapToken = Snap::getSnapToken($params);

        return response()->json([
            'message'    => 'Pendaftaran berhasil',
            'tim'        => $tim,
            'pendaftaran' => $pendaftaran,
            'snap_token' => $snapToken,
        ], 201);
    }
    public function webhook(Request $request)
    {
        $serverKey = env('MIDTRANS_SERVER_KEY');

        // Validasi signature dari Midtrans
        $orderId         = $request->order_id;
        $statusCode      = $request->status_code;
        $grossAmount     = $request->gross_amount;
        $signatureKey    = $request->signature_key;

        $expectedSignature = hash('sha512', $orderId . $statusCode . $grossAmount . $serverKey);

        if ($signatureKey !== $expectedSignature) {
            return response()->json(['message' => 'Invalid signature'], 403);
        }

        // Ambil ID pendaftaran dari order_id (format: ORDER-{id}-{timestamp})
        $parts           = explode('-', $orderId);
        $pendaftaranId   = $parts[1] ?? null;

        if (!$pendaftaranId) {
            return response()->json(['message' => 'Invalid order id'], 400);
        }

        $pendaftaran = Pendaftaran::find($pendaftaranId);

        if (!$pendaftaran) {
            return response()->json(['message' => 'Pendaftaran tidak ditemukan'], 404);
        }

        // Update status berdasarkan transaction_status dari Midtrans
        $transactionStatus = $request->transaction_status;
        $fraudStatus       = $request->fraud_status;

        if ($transactionStatus === 'capture') {
            $status = ($fraudStatus === 'accept') ? 'selesai' : 'menunggu';
        } elseif ($transactionStatus === 'settlement') {
            $status = 'selesai';
        } elseif (in_array($transactionStatus, ['cancel', 'deny', 'expire'])) {
            $status = 'ditolak';
        } else {
            $status = 'menunggu';
        }

        $pendaftaran->status = $status;
        $pendaftaran->save();

        return response()->json(['message' => 'Webhook berhasil diproses']);
    }

    public function destroy(int $id)
    {
        $pendaftaran = Pendaftaran::find($id);

        if (!$pendaftaran) {
            return response()->json([
                'success' => false,
                'message' => 'Pendaftaran tidak ditemukan'
            ], Response::HTTP_NOT_FOUND);
        }

        $pendaftaran->delete();

        return response()->json([
            'success' => true,
            'message' => 'Pendaftaran berhasil dihapus'
        ]);
    }
}
