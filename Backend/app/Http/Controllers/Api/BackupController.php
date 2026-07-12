<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Symfony\Component\HttpFoundation\Response;

class BackupController extends Controller
{
    /**
     * Backup seluruh database ke file .sql (Pure PHP)
     */
    public function backup()
    {
        try {
            $databaseName = DB::getDatabaseName();
            $tables = DB::select('SHOW TABLES');
            $tablesKey = 'Tables_in_' . $databaseName;

            $sqlDump = "-- Database Backup for: " . $databaseName . "\n";
            $sqlDump .= "-- Generated on: " . now()->toDateTimeString() . "\n";
            $sqlDump .= "-- -----------------------------------------------------\n\n";
            
            $sqlDump .= "SET FOREIGN_KEY_CHECKS=0;\n\n";

            foreach ($tables as $tableRow) {
                $tableName = $tableRow->$tablesKey;

                if ($tableName === 'sessions') {
                    $createTableObj = DB::select("SHOW CREATE TABLE `{$tableName}`");
                    $createKey = 'Create Table';
                    $sqlDump .= "DROP TABLE IF EXISTS `{$tableName}`;\n";
                    $sqlDump .= $createTableObj[0]->$createKey . ";\n\n";
                    continue;
                }

                // 1. Get CREATE TABLE statement
                $createTableObj = DB::select("SHOW CREATE TABLE `{$tableName}`");
                $createKey = 'Create Table';
                $sqlDump .= "DROP TABLE IF EXISTS `{$tableName}`;\n";
                $sqlDump .= $createTableObj[0]->$createKey . ";\n\n";

                // 2. Get table data
                $rows = DB::select("SELECT * FROM `{$tableName}`");
                if (count($rows) > 0) {
                    $sqlDump .= "LOCK TABLES `{$tableName}` WRITE;\n";
                    $sqlDump .= "INSERT INTO `{$tableName}` VALUES \n";

                    $valueLines = [];
                    foreach ($rows as $row) {
                        $values = [];
                        foreach ((array)$row as $val) {
                            if (is_null($val)) {
                                $values[] = "NULL";
                            } elseif (is_numeric($val) && !str_starts_with($val, '0')) {
                                $values[] = $val;
                            } else {
                                $escaped = str_replace(
                                    ["\\", "\x00", "\n", "\r", "'", '"', "\x1a"],
                                    ["\\\\", "\\0", "\\n", "\\r", "\\'", '\\"', "\\Z"],
                                    $val
                                );
                                $values[] = "'" . $escaped . "'";
                            }
                        }
                        $valueLines[] = "(" . implode(", ", $values) . ")";
                    }
                    $sqlDump .= implode(",\n", $valueLines) . ";\n";
                    $sqlDump .= "UNLOCK TABLES;\n\n";
                }
            }

            $sqlDump .= "SET FOREIGN_KEY_CHECKS=1;\n";

            $filename = 'backup-' . $databaseName . '-' . now()->format('Y-m-d_H-i-s') . '.sql';

            return response($sqlDump, 200, [
                'Content-Type' => 'application/octet-stream',
                'Content-Disposition' => 'attachment; filename="' . $filename . '"',
            ]);

        } catch (Exception $e) {
            Log::error('Database backup failed: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Gagal membuat cadangan database: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Restore database dari file .sql yang diunggah
     */
    public function restore(Request $request)
    {
        $request->validate([
            'file' => 'required|file'
        ]);

        try {
            $file = $request->file('file');
            $sqlContent = file_get_contents($file->getRealPath());

            if (empty($sqlContent)) {
                return response()->json([
                    'success' => false,
                    'message' => 'File SQL kosong atau tidak terbaca.'
                ], 422);
            }

            // Disable foreign key checks
            DB::statement('SET FOREIGN_KEY_CHECKS=0');

            // Drop all tables first to clean database
            $databaseName = DB::getDatabaseName();
            $tables = DB::select('SHOW TABLES');
            $tablesKey = 'Tables_in_' . $databaseName;

            foreach ($tables as $tableRow) {
                $tableName = $tableRow->$tablesKey;
                DB::statement("DROP TABLE IF EXISTS `{$tableName}`");
            }

            // Run SQL Dump statements
            DB::unprepared($sqlContent);

            // Re-enable foreign key checks
            DB::statement('SET FOREIGN_KEY_CHECKS=1');

            return response()->json([
                'success' => true,
                'message' => 'Database berhasil dipulihkan dari cadangan.'
            ]);

        } catch (Exception $e) {
            Log::error('Database restore failed: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Gagal memulihkan database: ' . $e->getMessage()
            ], 500);
        }
    }
}
