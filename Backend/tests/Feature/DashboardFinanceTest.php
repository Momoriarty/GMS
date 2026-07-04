<?php

namespace Tests\Feature;

use App\Models\Transaksi;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class DashboardFinanceTest extends TestCase
{
    use RefreshDatabase;

    public function test_dashboard_keuangan_returns_summary_and_recent_transactions(): void
    {
        $user = User::factory()->create();

        Transaksi::create([
            'event_id' => null,
            'pendaftaran_id' => null,
            'jenis' => 'pemasukan',
            'nominal' => 500000,
            'kategori' => 'Pendaftaran',
            'metode_pembayaran' => 'bank_transfer',
            'keterangan' => 'Pembayaran pendaftaran',
            'tanggal_transaksi' => now()->toDateString(),
            'dibuat_oleh' => $user->id,
        ]);

        Transaksi::create([
            'event_id' => null,
            'pendaftaran_id' => null,
            'jenis' => 'pengeluaran',
            'nominal' => 150000,
            'kategori' => 'Sewa Lapangan',
            'metode_pembayaran' => 'cash',
            'keterangan' => 'Sewa lapangan',
            'tanggal_transaksi' => now()->toDateString(),
            'dibuat_oleh' => $user->id,
        ]);

        $response = $this->actingAs($user)->getJson('/api/dashboard/keuangan');

        $response->assertOk()
            ->assertJsonStructure([
                'success',
                'data' => [
                    'summary' => ['total_pemasukan', 'total_pengeluaran', 'saldo'],
                    'recent_transactions' => [['id', 'jenis', 'nominal', 'kategori', 'keterangan', 'tanggal_transaksi']],
                ],
            ]);

        $response->assertJsonPath('data.summary.total_pemasukan', 500000);
        $response->assertJsonPath('data.summary.total_pengeluaran', 150000);
        $response->assertJsonPath('data.summary.saldo', 350000);
    }
}
