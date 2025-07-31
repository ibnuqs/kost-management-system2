<?php

namespace App\Console\Commands;

use App\Models\Payment;
use Carbon\Carbon;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class CleanupOldExpiredPayments extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'payments:cleanup-old-expired 
                            {--days=90 : Number of days to keep expired payments}
                            {--dry-run : Show what would be deleted without making changes}
                            {--force : Force cleanup without confirmation}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Cleanup very old expired payments to maintain database performance';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $days = (int) $this->option('days');
        $isDryRun = $this->option('dry-run');
        $isForced = $this->option('force');

        $this->info("🧹 Cleaning up expired payments older than {$days} days...");

        // Find expired payments older than specified days
        $cutoffDate = now()->subDays($days);

        $oldExpiredPayments = Payment::where('status', 'expired')
            ->where('expired_at', '<', $cutoffDate)
            ->orderBy('expired_at', 'asc');

        $count = $oldExpiredPayments->count();

        if ($count === 0) {
            $this->info('✅ No old expired payments found to cleanup.');

            return self::SUCCESS;
        }

        $this->info("Found {$count} expired payments older than {$days} days:");

        // Show some examples
        $examples = $oldExpiredPayments->limit(5)->get();
        foreach ($examples as $payment) {
            $amount = (float) $payment->amount;
            $expiredDaysAgo = Carbon::parse($payment->expired_at)->diffInDays(now());

            $this->line("  📋 Payment #{$payment->id} - Rp ".number_format($amount, 0, ',', '.').
                       " (Expired {$expiredDaysAgo} days ago)");
        }

        if ($count > 5) {
            $this->line('  ... and '.($count - 5).' more payments');
        }

        // Confirmation
        if (! $isDryRun && ! $isForced) {
            if (! $this->confirm("Are you sure you want to delete {$count} old expired payments?")) {
                $this->info('❌ Cleanup cancelled.');

                return self::SUCCESS;
            }
        }

        if ($isDryRun) {
            $this->warn('🔄 DRY RUN MODE: No payments will be deleted');
            $this->info("Would delete {$count} expired payments older than {$days} days");

            // Show statistics
            $this->showCleanupStatistics($oldExpiredPayments->get());

            return self::SUCCESS;
        }

        // Perform cleanup
        $deletedCount = 0;
        $errors = 0;

        try {
            DB::beginTransaction();

            // Get payments to delete for logging
            $paymentsToDelete = $oldExpiredPayments->get();

            // Log statistics before deletion
            $this->logCleanupStatistics($paymentsToDelete);

            // Delete payments in batches
            $batchSize = 100;
            $totalBatches = ceil($count / $batchSize);

            $this->info("Deleting {$count} payments in {$totalBatches} batches...");

            $progressBar = $this->output->createProgressBar($totalBatches);
            $progressBar->start();

            for ($i = 0; $i < $totalBatches; $i++) {
                try {
                    $batchPayments = Payment::where('status', 'expired')
                        ->limit($batchSize)
                        ->delete();

                    $deletedCount += $batchSize;
                    $progressBar->advance();

                } catch (\Exception $e) {
                    $errors++;
                    \Illuminate\Support\Facades\Log::error('Failed to delete batch of expired payments', [
                        'batch' => $i + 1,
                        'error' => $e->getMessage(),
                    ]);
                }
            }

            $progressBar->finish();
            $this->newLine();

            DB::commit();

            $this->info('✅ Cleanup completed successfully!');
            $this->info("   Deleted: {$deletedCount} payments");

            if ($errors > 0) {
                $this->warn("   Errors: {$errors} batches failed");
            }

            // Log cleanup completion
            Log::info('Old expired payments cleanup completed', [
                'days_threshold' => $days,
                'total_found' => $count,
                'deleted_count' => $deletedCount,
                'errors' => $errors,
                'cutoff_date' => $cutoffDate->toDateTimeString(),
                'completion_time' => now()->toDateTimeString(),
            ]);

        } catch (\Exception $e) {
            DB::rollback();

            $this->error('❌ Cleanup failed: '.$e->getMessage());

            Log::error('Old expired payments cleanup failed', [
                'error' => $e->getMessage(),
                'days_threshold' => $days,
                'cutoff_date' => $cutoffDate->toDateTimeString(),
            ]);

            return self::FAILURE;
        }

        return self::SUCCESS;
    }

    /**
     * Show cleanup statistics for dry run
     */
    private function showCleanupStatistics($payments): void
    {
        $stats = [
            'total_count' => $payments->count(),
            'total_amount' => $payments->sum('amount'),
            'oldest_payment' => $payments->min('expired_at'),
            'newest_payment' => $payments->max('expired_at'),
            'tenants_affected' => $payments->pluck('tenant_id')->unique()->count(),
            'months_affected' => $payments->pluck('payment_month')->unique()->count(),
        ];

        $this->info("\n📊 Cleanup Statistics:");
        $this->line("   Total Payments: {$stats['total_count']}");
        $this->line('   Total Amount: Rp '.number_format((float) $stats['total_amount'], 0, ',', '.'));
        $this->line("   Tenants Affected: {$stats['tenants_affected']}");
        $this->line("   Payment Months: {$stats['months_affected']}");
        $this->line("   Date Range: {$stats['oldest_payment']} to {$stats['newest_payment']}");
    }

    /**
     * Log cleanup statistics
     */
    private function logCleanupStatistics($payments): void
    {
        $stats = [
            'total_count' => $payments->count(),
            'total_amount' => $payments->sum('amount'),
            'oldest_payment' => $payments->min('expired_at'),
            'newest_payment' => $payments->max('expired_at'),
            'tenants_affected' => $payments->pluck('tenant_id')->unique()->count(),
            'months_affected' => $payments->pluck('payment_month')->unique()->count(),
            'cleanup_initiated_at' => now()->toDateTimeString(),
        ];

        Log::info('Old expired payments cleanup initiated', $stats);
    }
}
