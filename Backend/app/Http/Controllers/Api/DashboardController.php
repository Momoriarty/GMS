<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use App\Models\Transaksi;
use Illuminate\Support\Facades\Cache;

class DashboardController extends Controller
{
    public function aktivitasTerbaru()
    {
        $logs = Cache::remember('dashboard_aktivitas', 60, function () {
            return AuditLog::with('user')
                ->orderBy('created_at', 'desc')
                ->take(10)
                ->get();
        });

        return response()->json([
            'success' => true,
            'data' => $logs,
        ]);
    }

    public function keuangan()
    {
        $data = Cache::remember('dashboard_keuangan', 60, function () {
            $totals = Transaksi::selectRaw("
                SUM(CASE WHEN jenis = 'pemasukan' THEN nominal ELSE 0 END) as total_pemasukan,
                SUM(CASE WHEN jenis = 'pengeluaran' THEN nominal ELSE 0 END) as total_pengeluaran
            ")->first();

            $totalPemasukan = (float) ($totals->total_pemasukan ?? 0);
            $totalPengeluaran = (float) ($totals->total_pengeluaran ?? 0);

            $recentTransactions = Transaksi::with(['event', 'pendaftaran', 'pembuat'])
                ->orderByDesc('tanggal_transaksi')
                ->orderByDesc('created_at')
                ->take(5)
                ->get()
                ->map(function ($item) {
                    return [
                        'id' => $item->id,
                        'jenis' => $item->jenis,
                        'nominal' => (float) $item->nominal,
                        'kategori' => $item->kategori,
                        'keterangan' => $item->keterangan,
                        'tanggal_transaksi' => $item->tanggal_transaksi?->toDateString(),
                        'metode_pembayaran' => $item->metode_pembayaran,
                    ];
                });

            return [
                'summary' => [
                    'total_pemasukan' => $totalPemasukan,
                    'total_pengeluaran' => $totalPengeluaran,
                    'saldo' => $totalPemasukan - $totalPengeluaran,
                ],
                'recent_transactions' => $recentTransactions,
            ];
        });

        return response()->json([
            'success' => true,
            'data' => $data,
        ]);
    }
}
