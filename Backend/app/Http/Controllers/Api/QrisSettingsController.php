<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\QrisSetting;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class QrisSettingsController extends Controller
{
    /**
     * Get current stored QRIS payload.
     */
    public function show()
    {
        $setting = QrisSetting::first();
        return response()->json([
            'success' => true,
            'data' => $setting ? ['static_payload' => $setting->static_payload] : null,
        ]);
    }

    /**
     * Store static QRIS payload uploaded by admin.
     */
    public function store(Request $request)
    {
        $payload = $request->input('static_payload');
        if (! $payload) {
            return response()->json([
                'success' => false,
                'message' => 'Payload QRIS tidak diberikan',
            ], Response::HTTP_BAD_REQUEST);
        }
        // Simpan satu record, timpa yang lama
        QrisSetting::truncate();
        QrisSetting::create(['static_payload' => $payload]);
        return response()->json([
            'success' => true,
            'message' => 'QRIS static payload berhasil disimpan',
        ]);
    }

    /**
     * Generate a dynamic QRIS payload with amount injected.
     * Public endpoint for guest payment flow.
     */
    public function generate(Request $request)
    {
        $amount = (int) $request->input('amount', 0);
        $txnId = $request->input('txn_id');

        if ($amount <= 0) {
            return response()->json([
                'success' => false,
                'message' => 'Amount harus lebih dari 0',
            ], Response::HTTP_BAD_REQUEST);
        }

        $setting = QrisSetting::first();
        if (! $setting) {
            return response()->json([
                'success' => false,
                'message' => 'QRIS belum dikonfigurasi oleh admin',
            ], Response::HTTP_NOT_FOUND);
        }

        $service = new \App\Services\QrisGeneratorService();
        $dynamicPayload = $service->generate($setting->static_payload, $amount, $txnId);

        // Return QR image URL via public API
        $qrImageUrl = 'https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=' . urlencode($dynamicPayload);

        return response()->json([
            'success' => true,
            'data' => [
                'qr_url' => $qrImageUrl,
                'payload' => $dynamicPayload,
                'amount' => $amount,
            ],
        ]);
    }
}

