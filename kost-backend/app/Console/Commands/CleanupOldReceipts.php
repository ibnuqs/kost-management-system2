<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;

class CleanupOldReceipts extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'receipts:cleanup {--days=30 : Number of days to keep receipts}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Clean up old receipt files to save storage space';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $days = $this->option('days');
        $cutoffDate = now()->subDays($days);
        
        $this->info("Cleaning up receipt files older than {$days} days...");
        
        try {
            $disk = Storage::disk('public');
            $receiptFiles = $disk->files('receipts');
            
            $deletedCount = 0;
            $totalSize = 0;
            
            foreach ($receiptFiles as $file) {
                if ($file === 'receipts/.gitignore') {
                    continue;
                }
                
                $lastModified = $disk->lastModified($file);
                $fileDate = \Carbon\Carbon::createFromTimestamp($lastModified);
                
                if ($fileDate->isBefore($cutoffDate)) {
                    $fileSize = $disk->size($file);
                    
                    if ($disk->delete($file)) {
                        $deletedCount++;
                        $totalSize += $fileSize;
                        
                        $this->line("Deleted: {$file} ({$this->formatBytes($fileSize)})");
                    } else {
                        $this->error("Failed to delete: {$file}");
                    }
                }
            }
            
            $this->info("\nCleanup completed!");
            $this->info("Files deleted: {$deletedCount}");
            $this->info("Space freed: {$this->formatBytes($totalSize)}");
            
            Log::info('Receipt cleanup completed', [
                'days' => $days,
                'files_deleted' => $deletedCount,
                'bytes_freed' => $totalSize
            ]);
            
        } catch (\Exception $e) {
            $this->error("Error during cleanup: {$e->getMessage()}");
            Log::error('Receipt cleanup failed', [
                'error' => $e->getMessage()
            ]);
        }
    }

    /**
     * Format bytes to human readable format
     */
    private function formatBytes($bytes, $precision = 2)
    {
        $units = ['B', 'KB', 'MB', 'GB'];
        
        for ($i = 0; $bytes > 1024 && $i < count($units) - 1; $i++) {
            $bytes /= 1024;
        }
        
        return round($bytes, $precision) . ' ' . $units[$i];
    }
}