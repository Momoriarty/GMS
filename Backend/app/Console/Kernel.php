<?php

namespace App\Console;

use App\Console\Commands\ExpirePendingPendaftaran;
use Illuminate\Console\Scheduling\Schedule;
use Illuminate\Foundation\Console\Kernel as ConsoleKernel;

class Kernel extends ConsoleKernel
{
    /**
     * The Artisan commands provided by your application.
     *
     * @var array
     */
    protected $commands = [
        ExpirePendingPendaftaran::class,
    ];

    /**
     * Define the application's command schedule.
     */
    protected function schedule(Schedule $schedule): void
    {
        // Run every 5 minutes to expire unpaid registrations
        $schedule->command('pendaftaran:expire')->everyFiveMinutes();
    }

    /**
     * Register the commands for the application.
     */
    protected function commands(): void
    {
        // load default commands
        $this->load(__DIR__.'/Commands');
    }
}
