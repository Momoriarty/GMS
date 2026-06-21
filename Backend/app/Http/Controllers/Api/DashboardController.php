<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;

class DashboardController extends Controller
{
    public function aktivitasTerbaru()
    {
        $logs = AuditLog::with('user')
            ->latest('tanggal')
            ->take(5)
            ->get();

        return response()->json($logs);
    }
}
