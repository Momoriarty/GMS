<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class WhatsAppService
{
    /**
     * Kirim pesan WhatsApp menggunakan Local API Gateway.
     *
     * @param string $target Nomor HP tujuan (format: 628xxxx / 08xxxx)
     * @param string $message Isi pesan WhatsApp
     * @return bool
     */
    public static function send(string $target, string $message): bool
    {
        try {
            $response = Http::post('http://localhost:5000/send', [
                'target' => $target,
                'message' => $message,
            ]);

            if ($response->successful()) {
                Log::info("WhatsApp sent successfully via Local Gateway to $target");
                return true;
            }

            Log::error("Local WhatsApp Gateway API error for $target: " . $response->body());
            return false;
        } catch (\Exception $e) {
            Log::error("Failed to send WhatsApp via Local Gateway to $target: " . $e->getMessage());
            return false;
        }
    }
}
