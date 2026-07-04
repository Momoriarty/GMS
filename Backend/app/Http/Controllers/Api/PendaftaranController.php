<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Pendaftaran;
use App\Models\Tim;
use App\Models\Event;
use App\Models\Transaksi;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use Midtrans\Config;
use Midtrans\CoreApi;
use Illuminate\Support\Facades\Log;
use Exception;
use App\Models\Notifikasi;
use Illuminate\Support\Facades\Auth;

class PendaftaranController extends Controller
{
    public function index(Request $request)
    {
        $query = Pendaftaran::with(['tim.user', 'event', 'verifiedBy']);

        if ($request->event_id) {
            $query->where('event_id', $request->event_id);
        }

        if ($request->status) {
            $query->where('status', $request->status);
        }

        $currentUser = Auth::user();
        $isAdmin = $currentUser?->role === 'admin';

        if ($request->user_id && ($isAdmin || $request->user_id == $currentUser?->id)) {
            $query->whereHas('tim', function ($q) use ($request) {
                $q->where('user_id', $request->user_id);
            });
        } elseif (!$isAdmin) {
            $query->whereHas('tim', function ($q) use ($currentUser) {
                $q->where('user_id', $currentUser->id);
            });
        }

        $pendaftaran = $query->get();

        $formatted = $pendaftaran->map(function ($item) {
            return [
                'id'             => $item->id,
                'tim_id'         => $item->tim_id,
                'event_id'       => $item->event_id,
                'status'         => $item->status,
                'tanggal_daftar' => $item->tanggal_daftar,
                'user' => $item->tim && $item->tim->user ? [
                    'id'    => $item->tim->user->id,
                    'name'  => $item->tim->user->name,
                    'email' => $item->tim->user->email,
                ] : null,
                'tim' => $item->tim ? [
                    'id'            => $item->tim->id,
                    'nama_tim'      => $item->tim->nama_tim,
                    'kelompok_umur' => $item->tim->kelompok_umur,
                ] : null,
                'event' => $item->event,
            ];
        });

        return response()->json(['success' => true, 'data' => $formatted]);
    }

    public function show(int $id)
    {
        $pendaftaran = Pendaftaran::with(['tim.user', 'event', 'verifiedBy'])->find($id);

        if (!$pendaftaran) {
            return response()->json([
                'success' => false,
                'message' => 'Pendaftaran tidak ditemukan'
            ], Response::HTTP_NOT_FOUND);
        }

        return response()->json(['success' => true, 'data' => $pendaftaran]);
    }

    private function setupMidtrans()
    {
        Config::$serverKey    = env('MIDTRANS_SERVER_KEY');
        Config::$isProduction = false;
        Config::$isSanitized  = true;
        Config::$is3ds        = true;
        Config::$curlOptions  = [CURLOPT_SSL_VERIFYPEER => false];
    }

    private function chargePayment(string $method, array $transactionDetails, array $customerDetails, ?string $notificationUrl = null): object
    {
        $params = [
            'transaction_details' => $transactionDetails,
            'customer_details'    => $customerDetails,
        ];

        if ($notificationUrl) {
            $params['notification_url'] = $notificationUrl;
        }

        if (str_starts_with($method, 'bank_transfer_')) {
            $bank = substr($method, 14); // e.g. "bca", "bni", "bri", "mandiri", "permata"
            if ($bank === 'mandiri') {
                $params['payment_type'] = 'echannel';
                $params['echannel'] = [
                    'bill_info1' => 'Pembayaran:',
                    'bill_info2' => 'Registrasi Turnamen'
                ];
            } else {
                $params['payment_type']   = 'bank_transfer';
                $params['bank_transfer']  = ['bank' => $bank];
            }
        } else {
            switch ($method) {
                case 'qris':
                    $params['payment_type'] = 'qris';
                    $params['qris']         = ['acquirer' => 'gopay'];
                    break;

                case 'gopay':
                    $params['payment_type'] = 'gopay';
                    $params['gopay']        = ['enable_callback' => false];
                    break;

                case 'shopeepay':
                    $params['payment_type'] = 'shopeepay';
                    $params['shopeepay']    = ['callback_url' => ''];
                    break;

                case 'bank_transfer':
                    $params['payment_type']   = 'bank_transfer';
                    $params['bank_transfer']  = ['bank' => 'bca'];
                    break;

                default:
                    $params['payment_type'] = 'qris';
                    $params['qris']         = ['acquirer' => 'gopay'];
            }
        }

        return CoreApi::charge($params);
    }

    public function store(Request $request)
    {
        $request->validate([
            'event_id'       => 'required|exists:events,id',
            'tim_id'         => 'nullable|exists:tim,id',
            'nama_tim'       => 'required_without:tim_id|string|max:255',
            'kelompok_umur'  => 'required_without:tim_id|string',
            'logo_tim'       => 'nullable|image|mimes:jpg,jpeg,png|max:2048',
            'payment_method' => 'nullable|string|in:qris,gopay,shopeepay,bank_transfer,bank_transfer_bca,bank_transfer_bni,bank_transfer_bri,bank_transfer_mandiri,bank_transfer_permata',
        ]);

        $user  = Auth::user();
        $event = Event::findOrFail($request->event_id);

        if ($request->filled('tim_id')) {
            $tim = Tim::where('id', $request->tim_id)
                ->where('user_id', $user->id)
                ->firstOrFail();

            // Cek apakah tim ini sudah mendaftar di event yang sama
            $existingPendaftaran = Pendaftaran::where('event_id', $request->event_id)
                ->where('tim_id', $tim->id)
                ->exists();

            if ($existingPendaftaran) {
                return response()->json([
                    'success' => false,
                    'message' => 'Tim ini sudah terdaftar pada event ini.',
                ], 422);
            }
        } else {
            $tim = Tim::create([
                'user_id'       => $user->id,
                'nama_tim'      => $request->nama_tim,
                'kelompok_umur' => $request->kelompok_umur,
                'logo_tim'      => $request->hasFile('logo_tim')
                    ? $request->file('logo_tim')->store('logo_tim', 'public')
                    : null,
            ]);
        }

        // Simpan pendaftaran
        $paymentMethod = $request->input('payment_method', 'qris');

        $pendaftaran = Pendaftaran::create([
            'tim_id'         => $tim->id,
            'event_id'       => $event->id,
            'status'         => 'menunggu',
            'tanggal_daftar' => now(),
        ]);

        // Setup & charge Midtrans Core API
        $this->setupMidtrans();

        $paymentData  = null;
        $paymentError = null;

        try {
            $response = $this->chargePayment(
                $paymentMethod,
                [
                    'order_id'     => 'ORDER-' . $pendaftaran->id . '-' . time(),
                    'gross_amount' => (int) $event->biaya_pendaftaran,
                ],
                [
                    'first_name' => $user->name,
                    'email'      => $user->email,
                    'phone'      => $user->no_wa ?? $user->phone_number ?? '',
                ],
                env('MIDTRANS_NOTIFICATION_URL')
            );

            // Normalisasi response ke array
            $paymentData = json_decode(json_encode($response), true);

        } catch (Exception $e) {
            Log::error('Midtrans Core API Error: ' . $e->getMessage());
            $paymentError = $e->getMessage();
        }

        return response()->json([
            'message'       => 'Pendaftaran berhasil',
            'tim'           => $tim,
            'pendaftaran'   => $pendaftaran,
            'payment_data'  => $paymentData,
            'payment_error' => $paymentError,
        ], 201);
    }

    public function webhook(Request $request)
    {
        $signature = hash(
            'sha512',
            $request->order_id .
                $request->status_code .
                $request->gross_amount .
                env('MIDTRANS_SERVER_KEY')
        );

        if ($request->signature_key !== $signature) {
            return response()->json(['message' => 'Invalid signature'], 403);
        }

        $pendaftaranId = explode('-', $request->order_id)[1] ?? null;
        $pendaftaran   = Pendaftaran::with(['tim', 'event'])->find($pendaftaranId);

        if (!$pendaftaran) {
            return response()->json(['message' => 'Pendaftaran tidak ditemukan'], 404);
        }

        $status = match ($request->transaction_status) {
            'capture'              => $request->fraud_status === 'accept' ? 'diterima' : 'menunggu',
            'settlement'           => 'diterima',
            'cancel', 'deny', 'expire' => 'ditolak',
            default                => 'menunggu',
        };

        $pendaftaran->update(['status' => $status]);

        // Create a notification only when registration is accepted ('diterima')
        if ($status === 'diterima') {
            try {
                // Create transaction record for successful registration payment
                $paymentMethod = $request->payment_type ?? $request->payment_method ?? 'unknown';
                $existing = Transaksi::where('pendaftaran_id', $pendaftaran->id)
                    ->where('jenis', 'pendaftaran')
                    ->first();

                if (!$existing) {
                    Transaksi::create([
                        'event_id'         => $pendaftaran->event_id,
                        'pendaftaran_id'   => $pendaftaran->id,
                        'jenis'            => 'pemasukan',
                        'nominal'          => (float) $pendaftaran->event->biaya_pendaftaran,
                        'kategori'         => 'pendaftaran',
                        'metode_pembayaran'=> $paymentMethod,
                        'keterangan'       => "Pembayaran pendaftaran event via Midtrans ({$paymentMethod})",
                        'tanggal_transaksi'=> now(),
                        'dibuat_oleh'      => $pendaftaran->tim->user_id,
                    ]);
                }

                $notifikasi = Notifikasi::create([
                    'user_id' => $pendaftaran->tim->user_id,
                    'judul'   => 'Status Pendaftaran',
                    'pesan'   => "Pendaftaran {$pendaftaran->event->nama_event} telah diterima.",
                    'tipe'    => 'pendaftaran',
                    'is_read' => false,
                ]);

                // Dispatch broadcast event for realtime notification
                try {
                    event(new \App\Events\NotifikasiCreated($notifikasi));
                } catch (Exception $e) {
                    Log::error('Broadcast error: ' . $e->getMessage());
                }
            } catch (Exception $e) {
                Log::error($e->getMessage());
            }
        }

        return response()->json(['message' => 'Webhook berhasil diproses']);
    }

    public function verify(Request $request, int $id)
    {
        $validated = $request->validate([
            'status' => 'required|in:menunggu,diterima,ditolak',
        ]);

        $pendaftaran = Pendaftaran::with(['tim.user', 'event'])->find($id);

        if (!$pendaftaran) {
            return response()->json([
                'success' => false,
                'message' => 'Pendaftaran tidak ditemukan'
            ], Response::HTTP_NOT_FOUND);
        }

        $oldStatus = $pendaftaran->status;
        $pendaftaran->update(['status' => $validated['status']]);

        try {
            Notifikasi::create([
                'user_id' => $pendaftaran->tim->user_id,
                'judul'   => 'Status Pendaftaran',
                'pesan'   => "Pendaftaran {$pendaftaran->event->nama_event} telah {$validated['status']}",
                'tipe'    => 'pendaftaran',
                'is_read' => false,
            ]);
        } catch (Exception $e) {
            Log::error($e->getMessage());
        }

        return response()->json([
            'success' => true,
            'message' => "Status berhasil diubah dari {$oldStatus} menjadi {$validated['status']}",
            'data'    => $pendaftaran,
        ]);
    }

    public function pay(Request $request, int $id)
    {
        $request->validate([
            'payment_method' => 'nullable|string|in:qris,gopay,shopeepay,bank_transfer,bank_transfer_bca,bank_transfer_bni,bank_transfer_bri,bank_transfer_mandiri,bank_transfer_permata',
        ]);

        $pendaftaran = Pendaftaran::with(['tim.user', 'event'])->find($id);

        if (!$pendaftaran) {
            return response()->json([
                'success' => false,
                'message' => 'Pendaftaran tidak ditemukan'
            ], Response::HTTP_NOT_FOUND);
        }

        if ($pendaftaran->status === 'diterima') {
            return response()->json([
                'success' => false,
                'message' => 'Pendaftaran ini sudah lunas/diterima'
            ], Response::HTTP_BAD_REQUEST);
        }

        $paymentMethod = $request->input('payment_method', 'qris');

        // Setup & charge Midtrans Core API
        $this->setupMidtrans();

        $paymentData  = null;
        $paymentError = null;

        try {
            $response = $this->chargePayment(
                $paymentMethod,
                [
                    'order_id'     => 'ORDER-' . $pendaftaran->id . '-' . time(),
                    'gross_amount' => (int) $pendaftaran->event->biaya_pendaftaran,
                ],
                [
                    'first_name' => $pendaftaran->tim->user->name,
                    'email'      => $pendaftaran->tim->user->email,
                    'phone'      => $pendaftaran->tim->user->no_wa ?? $pendaftaran->tim->user->phone_number ?? '',
                ],
                env('MIDTRANS_NOTIFICATION_URL')
            );

            $paymentData = json_decode(json_encode($response), true);
        } catch (Exception $e) {
            Log::error('Midtrans Core API Error: ' . $e->getMessage());
            $paymentError = $e->getMessage();
        }

        return response()->json([
            'success'       => true,
            'payment_data'  => $paymentData,
            'payment_error' => $paymentError,
        ]);
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