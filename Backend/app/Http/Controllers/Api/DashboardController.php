<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use App\Models\Transaksi;

class DashboardController extends Controller
{
    public function aktivitasTerbaru()
    {
        $logs = AuditLog::with('user')
            ->orderBy('created_at', 'desc')
            ->take(10)
            ->get();

        return response()->json([
            'success' => true,
            'data' => $logs
        ]);
    }

    public function keuangan()
    {
        $totalPemasukan = (float) Transaksi::where('jenis', 'pemasukan')->sum('nominal');
        $totalPengeluaran = (float) Transaksi::where('jenis', 'pengeluaran')->sum('nominal');

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

        return response()->json([
            'success' => true,
            'data' => [
                'summary' => [
                    'total_pemasukan' => $totalPemasukan,
                    'total_pengeluaran' => $totalPengeluaran,
                    'saldo' => $totalPemasukan - $totalPengeluaran,
                ],
                'recent_transactions' => $recentTransactions,
            ],
        ]);
    }
}
