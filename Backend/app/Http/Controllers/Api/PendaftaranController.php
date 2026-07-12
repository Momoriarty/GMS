<?php

namespace App\Http\Controllers\Api;

use App\Events\NotifikasiCreated;
use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use App\Models\Event;
use App\Models\Notifikasi;
use App\Models\Pendaftaran;
use App\Models\Tim;
use App\Models\Transaksi;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Midtrans\Config;
use Midtrans\CoreApi;
use Symfony\Component\HttpFoundation\Response;

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
        } elseif (! $isAdmin) {
            $query->whereHas('tim', function ($q) use ($currentUser) {
                $q->where('user_id', $currentUser->id);
            });
        }

        $pendaftaran = $query->get();

        $formatted = $pendaftaran->map(function ($item) {
            return [
                'id' => $item->id,
                'tim_id' => $item->tim_id,
                'event_id' => $item->event_id,
                'status' => $item->status,
                'tanggal_daftar' => $item->tanggal_daftar,
                'user' => $item->tim && $item->tim->user ? [
                    'id' => $item->tim->user->id,
                    'name' => $item->tim->user->name,
                    'email' => $item->tim->user->email,
                ] : null,
                'tim' => $item->tim ? [
                    'id' => $item->tim->id,
                    'nama_tim' => $item->tim->nama_tim,
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

        if (! $pendaftaran) {
            return response()->json([
                'success' => false,
                'message' => 'Pendaftaran tidak ditemukan',
            ], Response::HTTP_NOT_FOUND);
        }

        return response()->json(['success' => true, 'data' => $pendaftaran]);
    }

    private function setupMidtrans()
    {
        Config::$serverKey = env('MIDTRANS_SERVER_KEY');
        Config::$isProduction = false;
        Config::$isSanitized = true;
        Config::$is3ds = true;
        Config::$curlOptions = [
            CURLOPT_SSL_VERIFYPEER => false,
            CURLOPT_HTTPHEADER => [],
        ];
    }

    private function chargePayment(string $method, array $transactionDetails, array $customerDetails, ?string $notificationUrl = null): object
    {
        $params = [
            'transaction_details' => $transactionDetails,
            'customer_details' => $customerDetails,
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
                    'bill_info2' => 'Registrasi Turnamen',
                ];
            } else {
                $params['payment_type'] = 'bank_transfer';
                $params['bank_transfer'] = ['bank' => $bank];
            }
        } else {
            switch ($method) {
                case 'qris':
                    $params['payment_type'] = 'qris';
                    $params['qris'] = ['acquirer' => 'gopay'];
                    break;

                case 'gopay':
                    $params['payment_type'] = 'gopay';
                    $params['gopay'] = ['enable_callback' => false];
                    break;

                case 'shopeepay':
                    $params['payment_type'] = 'shopeepay';
                    $params['shopeepay'] = ['callback_url' => ''];
                    break;

                case 'bank_transfer':
                    $params['payment_type'] = 'bank_transfer';
                    $params['bank_transfer'] = ['bank' => 'bca'];
                    break;

                default:
                    $params['payment_type'] = 'qris';
                    $params['qris'] = ['acquirer' => 'gopay'];
            }
        }

        return CoreApi::charge($params);
    }

    public function store(Request $request)
    {
        $request->validate([
            'event_id' => 'required|exists:events,id',
            'tim_id' => 'nullable|exists:tim,id',
            'nama_tim' => 'required_without:tim_id|string|max:255',
            'kelompok_umur' => 'required_without:tim_id|string',
            'logo_tim' => 'nullable|image|mimes:jpg,jpeg,png|max:5120',
            'payment_method' => 'nullable|string|in:qris,gopay,shopeepay,bank_transfer,bank_transfer_bca,bank_transfer_bni,bank_transfer_bri,bank_transfer_mandiri,bank_transfer_permata',
        ], [
            'logo_tim.max' => 'Ukuran logo tim tidak boleh melebihi 5 MB.',
            'logo_tim.image' => 'Logo tim harus berupa file gambar.',
            'logo_tim.mimes' => 'Logo tim harus berformat JPG, JPEG, atau PNG.',
            'nama_tim.required_without' => 'Nama tim wajib diisi.',
            'kelompok_umur.required_without' => 'Kelompok umur wajib diisi.',
        ]);

        $user = Auth::user();
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
                'user_id' => $user->id,
                'nama_tim' => $request->nama_tim,
                'kelompok_umur' => $request->kelompok_umur,
                'logo_tim' => $request->hasFile('logo_tim')
                    ? $request->file('logo_tim')->store('logo_tim', 'public')
                    : null,
            ]);
        }

        // Simpan pendaftaran
        $paymentMethod = $request->input('payment_method', 'qris');

        $pendaftaran = Pendaftaran::create([
            'tim_id' => $tim->id,
            'event_id' => $event->id,
            'status' => 'menunggu',
            'tanggal_daftar' => now(),
        ]);

        if (Auth::check()) {
            AuditLog::create([
                'user_id' => Auth::id(),
                'tabel' => 'pendaftaran',
                'aksi' => 'create',
                'deskripsi' => 'Pendaftaran baru untuk tim: '.$tim->nama_tim,
            ]);
        }

        // Setup payment
        $paymentData = null;
        $paymentError = null;

        // Cek apakah admin sudah atur QRIS custom
        $qrisSetting = \App\Models\QrisSetting::first();

        if ($paymentMethod === 'qris' && $qrisSetting) {
            // Gunakan QRIS custom (bypass Midtrans)
            try {
                $service = new \App\Services\QrisGeneratorService();
                $txnId = 'REG-' . $pendaftaran->id;
                
                // Tambahkan kode unik (3 digit terakhir dari ID pendaftaran)
                $kodeUnik = $pendaftaran->id % 1000;
                $amount = (int) $event->biaya_pendaftaran + $kodeUnik;
                
                $dynamicPayload = $service->generate($qrisSetting->static_payload, $amount, $txnId);
                $qrImageUrl = 'https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=' . urlencode($dynamicPayload);

                $paymentData = [
                    'payment_type' => 'qris_custom',
                    'qr_code_url' => $qrImageUrl,
                    'qris_payload' => $dynamicPayload,
                    'gross_amount' => $amount,
                ];
            } catch (Exception $e) {
                Log::error('Custom QRIS Error: ' . $e->getMessage());
                $paymentError = $e->getMessage();
            }
        } else {
            // Fallback ke Midtrans
            $this->setupMidtrans();
            try {
                $response = $this->chargePayment(
                    $paymentMethod,
                    [
                        'order_id' => 'ORDER-'.$pendaftaran->id.'-'.time(),
                        'gross_amount' => (int) $event->biaya_pendaftaran,
                    ],
                    [
                        'first_name' => $user->name,
                        'email' => $user->email,
                        'phone' => $user->no_wa ?? $user->phone_number ?? '',
                    ],
                    env('MIDTRANS_NOTIFICATION_URL')
                );
                $paymentData = json_decode(json_encode($response), true);
            } catch (Exception $e) {
                Log::error('Midtrans Core API Error: '.$e->getMessage());
                $paymentError = $e->getMessage();
            }
        }

        return response()->json([
            'message' => 'Pendaftaran berhasil',
            'tim' => $tim,
            'pendaftaran' => $pendaftaran,
            'payment_data' => $paymentData,
            'payment_error' => $paymentError,
        ], 201);
    }


    public function webhook(Request $request)
    {
        $signature = hash(
            'sha512',
            $request->order_id.
                $request->status_code.
                $request->gross_amount.
                env('MIDTRANS_SERVER_KEY')
        );

        if ($request->signature_key !== $signature) {
            return response()->json(['message' => 'Invalid signature'], 403);
        }

        $pendaftaranId = explode('-', $request->order_id)[1] ?? null;
        $pendaftaran = Pendaftaran::with(['tim.user', 'event'])->find($pendaftaranId);

        if (! $pendaftaran) {
            return response()->json(['message' => 'Pendaftaran tidak ditemukan'], 404);
        }

        $status = match ($request->transaction_status) {
            'capture' => $request->fraud_status === 'accept' ? 'diterima' : 'menunggu',
            'settlement' => 'diterima',
            'cancel', 'deny', 'expire' => 'ditolak',
            default => 'menunggu',
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

                if (! $existing) {
                    Transaksi::create([
                        'event_id' => $pendaftaran->event_id,
                        'pendaftaran_id' => $pendaftaran->id,
                        'jenis' => 'pemasukan',
                        'nominal' => (float) $pendaftaran->event->biaya_pendaftaran,
                        'kategori' => 'pendaftaran',
                        'metode_pembayaran' => $paymentMethod,
                        'keterangan' => "Pembayaran pendaftaran event via Midtrans ({$paymentMethod})",
                        'tanggal_transaksi' => now(),
                        'dibuat_oleh' => $pendaftaran->tim->user_id,
                    ]);
                }

                $notifikasi = Notifikasi::create([
                    'user_id' => $pendaftaran->tim->user_id,
                    'judul' => 'Status Pendaftaran',
                    'pesan' => "Pendaftaran {$pendaftaran->event->nama_event} telah diterima.",
                    'tipe' => 'pendaftaran',
                    'is_read' => false,
                ]);

                // Kirim WhatsApp
                $phone = $pendaftaran->tim->user->no_wa ?? $pendaftaran->tim->user->phone_number ?? null;
                if ($phone) {
                    $message = "Halo *{$pendaftaran->tim->user->name}*,\n\n";
                    $message .= "Pembayaran pendaftaran tim *{$pendaftaran->tim->nama_tim}* untuk turnamen *{$pendaftaran->event->nama_event}* sebesar *Rp " . number_format($pendaftaran->event->biaya_pendaftaran, 0, ',', '.') . "* telah *LUNAS & DISETUJUI*.\n\n";
                    $message .= "Silakan pantau jadwal pertandingan dan klasemen secara langsung di website GMS Garuda Melayu Futsal.\n\n";
                    $message .= "Terima kasih,\n*Panitia Turnamen Garuda Melayu Futsal*";

                    \App\Services\WhatsAppService::send($phone, $message);
                }

                // Dispatch broadcast event for realtime notification
                try {
                    event(new NotifikasiCreated($notifikasi));
                } catch (Exception $e) {
                    Log::error('Broadcast error: '.$e->getMessage());
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

        if (! $pendaftaran) {
            return response()->json([
                'success' => false,
                'message' => 'Pendaftaran tidak ditemukan',
            ], Response::HTTP_NOT_FOUND);
        }

        $oldStatus = $pendaftaran->status;
        $pendaftaran->update(['status' => $validated['status']]);

        // Kirim WhatsApp jika status diubah ke diterima/ditolak
        if (in_array($validated['status'], ['diterima', 'ditolak'])) {
            $phone = $pendaftaran->tim->user->no_wa ?? $pendaftaran->tim->user->phone_number ?? null;
            if ($phone) {
                $statusText = $validated['status'] === 'diterima' ? 'DISETUJUI' : 'DITOLAK';
                $message = "Halo *{$pendaftaran->tim->user->name}*,\n\n";
                $message .= "Pendaftaran tim futsal Anda *{$pendaftaran->tim->nama_tim}* untuk turnamen *{$pendaftaran->event->nama_event}* telah *{$statusText}* oleh Admin.\n\n";
                if ($validated['status'] === 'diterima') {
                    $message .= "Silakan persiapkan tim Anda dan pantau jadwal pertandingan di website GMS Garuda Melayu Futsal.\n";
                } else {
                    $message .= "Mohon maaf, pendaftaran Anda ditolak. Hubungi panitia untuk informasi lebih lanjut.\n";
                }
                $message .= "\nTerima kasih,\n*Panitia Turnamen Garuda Melayu Futsal*";

                \App\Services\WhatsAppService::send($phone, $message);
            }
        }

        if (Auth::check()) {
            AuditLog::create([
                'user_id' => Auth::id(),
                'tabel' => 'pendaftaran',
                'aksi' => 'update',
                'deskripsi' => "Status pendaftaran tim {$pendaftaran->tim->nama_tim} diverifikasi menjadi {$validated['status']}",
            ]);
        }

        try {
            Notifikasi::create([
                'user_id' => $pendaftaran->tim->user_id,
                'judul' => 'Status Pendaftaran',
                'pesan' => "Pendaftaran {$pendaftaran->event->nama_event} telah {$validated['status']}",
                'tipe' => 'pendaftaran',
                'is_read' => false,
            ]);
        } catch (Exception $e) {
            Log::error($e->getMessage());
        }

        return response()->json([
            'success' => true,
            'message' => "Status berhasil diubah dari {$oldStatus} menjadi {$validated['status']}",
            'data' => $pendaftaran,
        ]);
    }

    public function pay(Request $request, int $id)
    {
        $request->validate([
            'payment_method' => 'nullable|string|in:qris,gopay,shopeepay,bank_transfer,bank_transfer_bca,bank_transfer_bni,bank_transfer_bri,bank_transfer_mandiri,bank_transfer_permata',
        ]);

        $pendaftaran = Pendaftaran::with(['tim.user', 'event'])->find($id);

        if (! $pendaftaran) {
            return response()->json([
                'success' => false,
                'message' => 'Pendaftaran tidak ditemukan',
            ], Response::HTTP_NOT_FOUND);
        }

        if ($pendaftaran->status === 'diterima') {
            return response()->json([
                'success' => false,
                'message' => 'Pendaftaran ini sudah lunas/diterima',
            ], Response::HTTP_BAD_REQUEST);
        }

        $paymentMethod = $request->input('payment_method', 'qris');

        $paymentData = null;
        $paymentError = null;

        // Cek apakah admin sudah atur QRIS custom
        $qrisSetting = \App\Models\QrisSetting::first();

        if ($paymentMethod === 'qris' && $qrisSetting) {
            // Gunakan QRIS custom (bypass Midtrans)
            try {
                $service = new \App\Services\QrisGeneratorService();
                $txnId = 'REG-' . $pendaftaran->id;
                
                // Tambahkan kode unik (3 digit terakhir dari ID pendaftaran)
                $kodeUnik = $pendaftaran->id % 1000;
                $amount = (int) $pendaftaran->event->biaya_pendaftaran + $kodeUnik;
                
                $dynamicPayload = $service->generate($qrisSetting->static_payload, $amount, $txnId);
                $qrImageUrl = 'https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=' . urlencode($dynamicPayload);

                $paymentData = [
                    'payment_type' => 'qris_custom',
                    'qr_code_url' => $qrImageUrl,
                    'qris_payload' => $dynamicPayload,
                    'gross_amount' => $amount,
                ];
            } catch (Exception $e) {
                Log::error('Custom QRIS Error: ' . $e->getMessage());
                $paymentError = $e->getMessage();
            }
        } else {
            // Fallback ke Midtrans
            $this->setupMidtrans();
            try {
                $response = $this->chargePayment(
                    $paymentMethod,
                    [
                        'order_id' => 'ORDER-'.$pendaftaran->id.'-'.time(),
                        'gross_amount' => (int) $pendaftaran->event->biaya_pendaftaran,
                    ],
                    [
                        'first_name' => $pendaftaran->tim->user->name,
                        'email' => $pendaftaran->tim->user->email,
                        'phone' => $pendaftaran->tim->user->no_wa ?? $pendaftaran->tim->user->phone_number ?? '',
                    ],
                    env('MIDTRANS_NOTIFICATION_URL')
                );
                $paymentData = json_decode(json_encode($response), true);
            } catch (Exception $e) {
                Log::error('Midtrans Core API Error: '.$e->getMessage());
                $paymentError = $e->getMessage();
            }
        }

        return response()->json([
            'success' => true,
            'payment_data' => $paymentData,
            'payment_error' => $paymentError,
        ]);
    }


    public function destroy(int $id)
    {
        $pendaftaran = Pendaftaran::find($id);

        if (! $pendaftaran) {
            return response()->json([
                'success' => false,
                'message' => 'Pendaftaran tidak ditemukan',
            ], Response::HTTP_NOT_FOUND);
        }

        $pendaftaranId = $pendaftaran->id;
        $pendaftaran->delete();

        if (Auth::check()) {
            AuditLog::create([
                'user_id' => Auth::id(),
                'tabel' => 'pendaftaran',
                'aksi' => 'delete',
                'deskripsi' => "Pendaftaran dibatalkan/dihapus (ID: {$pendaftaranId})",
            ]);
        }

        return response()->json([
            'success' => true,
            'message' => 'Pendaftaran berhasil dihapus',
        ]);
    }

    public function webhookGopay(Request $request)
    {
        $title = $request->input('title', '');
        $message = $request->input('message', '');

        Log::info("GoPay Webhook received: Title: {$title}, Message: {$message}");

        if (empty($message)) {
            return response()->json(['success' => false, 'message' => 'Empty message'], 400);
        }

        $amount = 0;
        if (preg_match('/Rp\s*([0-9\.,]+)/i', $message, $matches)) {
            $cleanAmount = str_replace(['.', ','], '', $matches[1]);
            $amount = (int) $cleanAmount;
        } else {
            $cleanAmount = preg_replace('/[^0-9]/', '', $message);
            $amount = (int) $cleanAmount;
        }

        if ($amount <= 0) {
            return response()->json(['success' => false, 'message' => 'Nominal tidak ditemukan dalam pesan'], 422);
        }

        // Ambil semua pendaftaran yang statusnya 'menunggu'
        $semuaMenunggu = Pendaftaran::with('event')->where('status', 'menunggu')->get();
        
        // Cari yang total biaya (termasuk kode unik) cocok dengan $amount
        $pendaftaran = $semuaMenunggu->first(function ($p) use ($amount) {
            $biaya = (int) $p->event->biaya_pendaftaran;
            $kodeUnik = $p->id % 1000;
            return ($biaya + $kodeUnik) === $amount;
        });

        if (!$pendaftaran) {
            return response()->json([
                'success' => false,
                'message' => "Pendaftaran dengan nominal Rp {$amount} tidak ditemukan (mungkin tidak ada kecocokan kode unik)"
            ], 404);
        }

        $pendaftaran->status = 'diterima';
        $pendaftaran->save();

        try {
            $pesan = "Halo, pendaftaran tim *{$pendaftaran->tim->nama_tim}* untuk event *{$pendaftaran->event->nama_event}* telah kami terima dan berstatus LUNAS (Verified via GoPay). Terima kasih!";
            $phone = $pendaftaran->tim->user->no_wa ?? $pendaftaran->tim->user->phone_number ?? null;
            if ($phone) {
                \App\Services\WhatsAppService::send($phone, $pesan);
            }
        } catch (\Exception $e) {
            Log::error("Failed to send WhatsApp notification: " . $e->getMessage());
        }

        return response()->json([
            'success' => true,
            'message' => 'Status pendaftaran berhasil diperbarui otomatis!',
            'data' => $pendaftaran
        ]);
    }
}
