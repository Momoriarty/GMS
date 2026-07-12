<?php

use App\Models\Pendaftaran;

$duplicates = Pendaftaran::select('event_id', 'tim_id')->groupBy('event_id', 'tim_id')->havingRaw('COUNT(*) > 1')->get();
foreach ($duplicates as $dup) {
    $pendaftarans = Pendaftaran::where('event_id', $dup->event_id)->where('tim_id', $dup->tim_id)->orderBy('id', 'desc')->get();
    $pendaftarans->shift();
    foreach ($pendaftarans as $p) {
        $p->delete();
        echo 'Deleted duplicate pendaftaran ID: '.$p->id.PHP_EOL;
    }
}
echo "Done cleaning up duplicates\n";
