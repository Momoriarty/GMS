<?php

namespace App\Console\Commands;

use App\Models\Notifikasi;
use App\Models\Pendaftaran;
use Carbon\Carbon;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;

class ExpirePendingPendaftaran extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'pendaftaran:expire {--hours=24 : Timeout in hours before pending pendaftaran is rejected}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Expire pending pendaftaran after configurable timeout and mark them as ditolak';

    public function handle()
    {
        $hours = (int) $this->option('hours') ?: (int) env('PENDAFTARAN_PAYMENT_TIMEOUT_HOURS', 24);
        $cutoff = Carbon::now()->subHours($hours);

        $pendaftaran = Pendaftaran::with(['tim.user', 'event'])
            ->where('status', 'menunggu')
            ->where(function ($q) use ($cutoff) {
                $q->where('created_at', '<', $cutoff)
                    ->orWhere('tanggal_daftar', '<', $cutoff);
            })
            ->get();

        if ($pendaftaran->isEmpty()) {
            $this->info('No pending pendaftaran to expire.');

            return 0;
        }

        $ids = [];
        foreach ($pendaftaran as $p) {
            $old = $p->status;
            $p->status = 'ditolak';
            $p->save();
            $ids[] = $p->id;

            // create notification for the user
            try {
                Notifikasi::create([
                    'user_id' => $p->tim?->user_id ?? null,
                    'judul' => 'Pendaftaran Ditolak',
                    'pesan' => "Pendaftaran Anda untuk event {$p->event?->nama_event} telah ditolak karena pembayaran tidak diterima dalam waktu yang ditentukan.",
                    'tipe' => 'pendaftaran',
                    'is_read' => false,
                ]);
            } catch (\Exception $e) {
                Log::error('Failed to create notification for expired pendaftaran: '.$e->getMessage());
            }
        }

        Log::info('Expired pending pendaftaran', ['ids' => $ids, 'hours' => $hours]);
        $this->info('Expired '.count($ids).' pending pendaftaran.');

        return 0;
    }
}
