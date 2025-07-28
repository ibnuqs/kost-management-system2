<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Tenant;
use App\Models\Payment;
use Carbon\Carbon;
use Illuminate\Support\Facades\Log;

class GenerateMonthlyPayments extends Command
{
    protected $signature = 'payments:generate-monthly 
                          {--date= : Target date for payment (Y-m-d format)}
                          {--dry-run : Run without actually creating payments}';

    protected $description = 'Generate monthly payments for all active tenants';

    public function handle()
    {
        $isDryRun = $this->option('dry-run');
        $targetDate = $this->option('date') ? Carbon::parse($this->option('date')) : now();
        
        $this->info("🏠 Starting monthly payment generation for: " . $targetDate->format('Y-m-d'));
        
        if ($isDryRun) {
            $this->warn("⚠️  DRY RUN MODE - No payments will be created");
        }

        try {
            $result = $this->generatePayments($targetDate, $isDryRun);
            
            $this->info("✅ Payment generation completed!");
            $this->table(['Metric', 'Count'], [
                ['Active Tenants Processed', $result['processed']],
                ['New Payments Created', $result['created']],
                ['Already Exists (Skipped)', $result['skipped']],
                ['Errors', $result['errors']]
            ]);

            if ($result['errors'] > 0) {
                $this->error("❌ Some payments failed to generate. Check logs for details.");
                return 1;
            }

            return 0;
        } catch (\Exception $e) {
            $this->error("❌ Fatal error: " . $e->getMessage());
            Log::error('Monthly payment generation failed', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return 1;
        }
    }

    private function generatePayments(Carbon $targetDate, bool $isDryRun = false): array
    {
        $stats = [
            'processed' => 0,
            'created' => 0,
            'skipped' => 0,
            'errors' => 0
        ];

        // Get all active tenants
        $activeTenants = Tenant::with(['user', 'room'])
            ->where('status', 'active')
            ->get();

        $this->info("Found {$activeTenants->count()} active tenants");

        foreach ($activeTenants as $tenant) {
            try {
                $stats['processed']++;
                
                $paymentData = $this->calculateMonthlyPayment($tenant, $targetDate);
                
                if (!$paymentData) {
                    $this->warn("⚠️  Skipping tenant {$tenant->id} - No payment needed");
                    continue;
                }

                // Check if payment already exists
                $existingPayment = Payment::where('tenant_id', $tenant->id)
                    ->where('month', $paymentData['month'])
                    ->where('year', $paymentData['year'])
                    ->first();

                if ($existingPayment) {
                    $this->line("ℹ️  Payment already exists for tenant {$tenant->user->name} - {$paymentData['month']}/{$paymentData['year']}");
                    $stats['skipped']++;
                    continue;
                }

                if (!$isDryRun) {
                    $payment = Payment::create($paymentData);
                    $this->info("✅ Created payment for {$tenant->user->name}: Rp " . number_format($payment->amount, 0, ',', '.'));
                } else {
                    $this->info("🔍 Would create payment for {$tenant->user->name}: Rp " . number_format($paymentData['amount'], 0, ',', '.'));
                }

                $stats['created']++;

            } catch (\Exception $e) {
                $stats['errors']++;
                $this->error("❌ Error processing tenant {$tenant->id}: " . $e->getMessage());
                Log::error('Error generating payment for tenant', [
                    'tenant_id' => $tenant->id,
                    'error' => $e->getMessage()
                ]);
            }
        }

        return $stats;
    }

    private function calculateMonthlyPayment(Tenant $tenant, Carbon $targetDate): ?array
    {
        $room = $tenant->room;
        if (!$room) {
            throw new \Exception("Room not found for tenant {$tenant->id}");
        }

        // Calculate next payment month
        $nextPaymentDate = $this->calculateNextPaymentDate($tenant, $targetDate);
        
        if (!$nextPaymentDate) {
            return null; // No payment needed yet
        }

        // Calculate payment amount
        $amount = $this->calculatePaymentAmount($tenant, $nextPaymentDate);
        
        // Set due date (7 days from start of month)
        $dueDate = $nextPaymentDate->copy()->addDays(7);
        
        return [
            'tenant_id' => $tenant->id,
            'amount' => $amount,
            'month' => $nextPaymentDate->month,
            'year' => $nextPaymentDate->year,
            'due_date' => $dueDate->toDateString(),
            'status' => 'pending',
            'payment_method' => 'pending',
            'description' => $this->generatePaymentDescription($tenant, $nextPaymentDate, $amount),
            'created_at' => now(),
            'updated_at' => now()
        ];
    }

    private function calculateNextPaymentDate(Tenant $tenant, Carbon $targetDate): ?Carbon
    {
        $startDate = Carbon::parse($tenant->start_date);
        
        // For monthly generation, we want to create payment for next month
        $nextMonth = $targetDate->copy()->addMonth()->startOfMonth();
        
        // Don't create payment if it's before the tenant's start date
        if ($nextMonth->lt($startDate)) {
            return null;
        }

        return $nextMonth;
    }

    private function calculatePaymentAmount(Tenant $tenant, Carbon $paymentDate): float
    {
        $room = $tenant->room;
        $monthlyRent = $tenant->monthly_rent;
        
        $startDate = Carbon::parse($tenant->start_date);
        $isFirstPayment = $paymentDate->isSameMonth($startDate);
        
        if ($isFirstPayment) {
            // Prorated calculation for first month
            return $this->calculateProratedAmount($monthlyRent, $startDate, $paymentDate);
        }
        
        // Regular monthly payment
        return $monthlyRent;
    }

    private function calculateProratedAmount(float $monthlyRent, Carbon $startDate, Carbon $paymentMonth): float
    {
        $daysInMonth = $paymentMonth->daysInMonth;
        $remainingDays = $daysInMonth - $startDate->day + 1; // Include start date
        
        $dailyRate = $monthlyRent / $daysInMonth;
        $proratedAmount = $dailyRate * $remainingDays;
        
        $this->info("📊 Prorated calculation: {$remainingDays} days of {$daysInMonth} = Rp " . number_format($proratedAmount, 0, ',', '.'));
        
        return round($proratedAmount, 2);
    }

    private function generatePaymentDescription(Tenant $tenant, Carbon $paymentDate, float $amount): string
    {
        $room = $tenant->room;
        $monthName = $paymentDate->format('F Y');
        
        return "Sewa Bulanan - {$room->room_number} ({$room->room_name}) - {$monthName}";
    }
}