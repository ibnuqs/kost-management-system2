<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Services\TenantAccessService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;

class PaymentManagementController extends Controller
{
    private $tenantAccessService;

    public function __construct(TenantAccessService $tenantAccessService)
    {
        $this->tenantAccessService = $tenantAccessService;
    }

    /**
     * Manually trigger monthly payment generation
     */
    public function generateMonthlyPayments(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'date' => 'sometimes|date|date_format:Y-m-d',
                'dry_run' => 'sometimes|boolean',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors(),
                ], 422);
            }

            $dryRun = $request->get('dry_run', false);
            $targetDate = $request->get('date');

            Log::info('Manual payment generation triggered', [
                'triggered_by' => Auth::id(),
                'target_date' => $targetDate,
                'dry_run' => $dryRun,
            ]);

            // Build command with options
            $command = 'payments:generate-monthly';
            $options = [];

            if ($targetDate) {
                $options['--date'] = $targetDate;
            }

            if ($dryRun) {
                $options['--dry-run'] = true;
            }

            // Check if command exists first
            $registeredCommands = Artisan::all();
            if (! isset($registeredCommands[$command])) {
                return response()->json([
                    'success' => false,
                    'message' => "Command '{$command}' not found. Please check if the command is properly registered.",
                    'error' => 'Command not registered',
                    'available_commands' => array_keys(array_filter($registeredCommands, function ($cmd, $key) {
                        return str_contains($key, 'payment');
                    }, ARRAY_FILTER_USE_BOTH)),
                ], 500);
            }

            // Execute the command
            $exitCode = Artisan::call($command, $options);
            $output = Artisan::output();

            if ($exitCode === 0) {
                return response()->json([
                    'success' => true,
                    'message' => $dryRun ? 'Payment generation simulation completed' : 'Payment generation completed successfully',
                    'data' => [
                        'exit_code' => $exitCode,
                        'output' => $output,
                        'dry_run' => $dryRun,
                        'target_date' => $targetDate ?: date('Y-m-d'),
                    ],
                ], 200);
            } else {
                throw new \Exception("Command failed with exit code: {$exitCode}. Output: ".trim($output));
            }

        } catch (\Exception $e) {
            Log::error('Manual payment generation failed', [
                'error' => $e->getMessage(),
                'triggered_by' => Auth::id(),
                'request_data' => $request->all(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Payment generation failed',
                'error' => app()->environment('local') ? $e->getMessage() : 'Internal server error',
                'data' => [
                    'output' => Artisan::output(),
                ],
            ], 500);
        }
    }

    /**
     * Manually trigger payment status processing
     */
    public function processPaymentStatus(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'grace_days' => 'sometimes|integer|min:1|max:30',
                'dry_run' => 'sometimes|boolean',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors(),
                ], 422);
            }

            $dryRun = $request->get('dry_run', false);
            $graceDays = $request->get('grace_days', 7);

            Log::info('Manual payment status processing triggered', [
                'triggered_by' => Auth::id(),
                'grace_days' => $graceDays,
                'dry_run' => $dryRun,
            ]);

            // Build command with options
            $command = 'payments:process-status';
            $options = [
                '--grace-days' => $graceDays,
            ];

            if ($dryRun) {
                $options['--dry-run'] = true;
            }

            // Check if command exists first
            $registeredCommands = Artisan::all();
            if (! isset($registeredCommands[$command])) {
                return response()->json([
                    'success' => false,
                    'message' => "Command '{$command}' not found. Please check if the command is properly registered.",
                    'error' => 'Command not registered',
                    'available_commands' => array_keys(array_filter($registeredCommands, function ($cmd, $key) {
                        return str_contains($key, 'payment');
                    }, ARRAY_FILTER_USE_BOTH)),
                ], 500);
            }

            // Execute the command
            $exitCode = Artisan::call($command, $options);
            $output = Artisan::output();

            if ($exitCode === 0) {
                return response()->json([
                    'success' => true,
                    'message' => $dryRun ? 'Payment status processing simulation completed' : 'Payment status processing completed successfully',
                    'data' => [
                        'exit_code' => $exitCode,
                        'output' => $output,
                        'dry_run' => $dryRun,
                        'grace_days' => $graceDays,
                    ],
                ], 200);
            } else {
                throw new \Exception("Command failed with exit code: {$exitCode}. Output: ".trim($output));
            }

        } catch (\Exception $e) {
            Log::error('Manual payment status processing failed', [
                'error' => $e->getMessage(),
                'triggered_by' => Auth::id(),
                'request_data' => $request->all(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Payment status processing failed',
                'error' => app()->environment('local') ? $e->getMessage() : 'Internal server error',
                'data' => [
                    'output' => Artisan::output(),
                ],
            ], 500);
        }
    }

    /**
     * Update specific tenant access status
     */
    public function updateTenantAccess(Request $request, $tenantId)
    {
        try {
            $validator = Validator::make(['tenant_id' => $tenantId], [
                'tenant_id' => 'required|integer|exists:tenants,id',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Invalid tenant ID',
                    'errors' => $validator->errors(),
                ], 422);
            }

            Log::info('Manual tenant access update triggered', [
                'tenant_id' => $tenantId,
                'triggered_by' => Auth::id(),
            ]);

            // Update tenant access using service
            $result = $this->tenantAccessService->updateTenantAccess($tenantId);

            if ($result['success']) {
                return response()->json([
                    'success' => true,
                    'message' => 'Tenant access updated successfully',
                    'data' => $result,
                ], 200);
            } else {
                return response()->json([
                    'success' => false,
                    'message' => 'Failed to update tenant access',
                    'error' => $result['error'],
                ], 500);
            }

        } catch (\Exception $e) {
            Log::error('Manual tenant access update failed', [
                'tenant_id' => $tenantId,
                'error' => $e->getMessage(),
                'triggered_by' => Auth::id(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to update tenant access',
                'error' => app()->environment('local') ? $e->getMessage() : 'Internal server error',
            ], 500);
        }
    }

    /**
     * Bulk update all tenants access status
     */
    public function updateAllTenantsAccess()
    {
        try {
            Log::info('Bulk tenant access update triggered', [
                'triggered_by' => Auth::id(),
            ]);

            // Update all tenants access using service
            $results = $this->tenantAccessService->updateAllTenantsAccess();

            return response()->json([
                'success' => true,
                'message' => 'All tenants access updated successfully',
                'data' => $results,
            ], 200);

        } catch (\Exception $e) {
            Log::error('Bulk tenant access update failed', [
                'error' => $e->getMessage(),
                'triggered_by' => Auth::id(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to update all tenants access',
                'error' => app()->environment('local') ? $e->getMessage() : 'Internal server error',
            ], 500);
        }
    }

    /**
     * Clean up expired room reservations
     */
    public function cleanupExpiredReservations(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'dry_run' => 'sometimes|boolean',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors(),
                ], 422);
            }

            $dryRun = $request->get('dry_run', false);

            Log::info('Manual reservation cleanup triggered', [
                'triggered_by' => Auth::id(),
                'dry_run' => $dryRun,
            ]);

            // Build command with options
            $command = 'rooms:cleanup-expired-reservations';
            $options = [];

            if ($dryRun) {
                $options['--dry-run'] = true;
            }

            // Check if command exists first
            $registeredCommands = Artisan::all();
            if (! isset($registeredCommands[$command])) {
                return response()->json([
                    'success' => false,
                    'message' => "Command '{$command}' not found. Please check if the command is properly registered.",
                    'error' => 'Command not registered',
                    'available_commands' => array_keys(array_filter($registeredCommands, function ($cmd, $key) {
                        return str_contains($key, 'room') || str_contains($key, 'reservation');
                    }, ARRAY_FILTER_USE_BOTH)),
                ], 500);
            }

            // Execute the command
            $exitCode = Artisan::call($command, $options);
            $output = Artisan::output();

            if ($exitCode === 0) {
                return response()->json([
                    'success' => true,
                    'message' => $dryRun ? 'Reservation cleanup simulation completed' : 'Reservation cleanup completed successfully',
                    'data' => [
                        'exit_code' => $exitCode,
                        'output' => $output,
                        'dry_run' => $dryRun,
                    ],
                ], 200);
            } else {
                throw new \Exception("Command failed with exit code: {$exitCode}. Output: ".trim($output));
            }

        } catch (\Exception $e) {
            Log::error('Manual reservation cleanup failed', [
                'error' => $e->getMessage(),
                'triggered_by' => Auth::id(),
                'request_data' => $request->all(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Reservation cleanup failed',
                'error' => app()->environment('local') ? $e->getMessage() : 'Internal server error',
                'data' => [
                    'output' => Artisan::output(),
                ],
            ], 500);
        }
    }

    /**
     * Get payment system health status
     */
    public function getSystemHealth()
    {
        try {
            $health = [
                'database' => $this->checkDatabaseHealth(),
                'payments' => $this->checkPaymentSystemHealth(),
                'tenants' => $this->checkTenantSystemHealth(),
                'commands' => $this->checkCommandsHealth(),
                'timestamp' => now()->toISOString(),
            ];

            $overallStatus = $this->calculateOverallHealth($health);

            return response()->json([
                'success' => true,
                'data' => [
                    'overall_status' => $overallStatus,
                    'health_checks' => $health,
                ],
                'message' => 'System health retrieved successfully',
            ], 200);

        } catch (\Exception $e) {
            Log::error('System health check failed', [
                'error' => $e->getMessage(),
                'triggered_by' => Auth::id(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve system health',
                'error' => app()->environment('local') ? $e->getMessage() : 'Internal server error',
            ], 500);
        }
    }

    private function checkDatabaseHealth(): array
    {
        try {
            $totalRooms = \App\Models\Room::count();
            $totalTenants = \App\Models\Tenant::count();
            $totalPayments = \App\Models\Payment::count();

            return [
                'status' => 'healthy',
                'rooms_count' => $totalRooms,
                'tenants_count' => $totalTenants,
                'payments_count' => $totalPayments,
            ];
        } catch (\Exception $e) {
            return [
                'status' => 'unhealthy',
                'error' => $e->getMessage(),
            ];
        }
    }

    private function checkPaymentSystemHealth(): array
    {
        try {
            $pendingPayments = \App\Models\Payment::where('status', 'pending')->count();
            $overduePayments = \App\Models\Payment::where('status', 'overdue')->count();
            $oldPendingPayments = \App\Models\Payment::where('status', 'pending')
                ->where('created_at', '<', now()->subDays(5))
                ->count();

            $status = 'healthy';
            $alerts = [];

            if ($oldPendingPayments > 10) {
                $status = 'warning';
                $alerts[] = "High number of old pending payments: {$oldPendingPayments}";
            }

            if ($overduePayments > 20) {
                $status = 'critical';
                $alerts[] = "High number of overdue payments: {$overduePayments}";
            }

            return [
                'status' => $status,
                'pending_payments' => $pendingPayments,
                'overdue_payments' => $overduePayments,
                'old_pending_payments' => $oldPendingPayments,
                'alerts' => $alerts,
            ];
        } catch (\Exception $e) {
            return [
                'status' => 'unhealthy',
                'error' => $e->getMessage(),
            ];
        }
    }

    private function checkTenantSystemHealth(): array
    {
        try {
            $activeTenants = \App\Models\Tenant::where('status', 'active')->count();
            $suspendedTenants = \App\Models\Tenant::where('status', 'suspended')->count();

            $status = 'healthy';
            $alerts = [];

            $suspensionRate = $activeTenants > 0 ? ($suspendedTenants / ($activeTenants + $suspendedTenants)) * 100 : 0;

            if ($suspensionRate > 20) {
                $status = 'warning';
                $alerts[] = 'High tenant suspension rate: '.round($suspensionRate, 1).'%';
            }

            return [
                'status' => $status,
                'active_tenants' => $activeTenants,
                'suspended_tenants' => $suspendedTenants,
                'suspension_rate' => round($suspensionRate, 2),
                'alerts' => $alerts,
            ];
        } catch (\Exception $e) {
            return [
                'status' => 'unhealthy',
                'error' => $e->getMessage(),
            ];
        }
    }

    private function checkCommandsHealth(): array
    {
        try {
            // Test if commands are registered and available
            $commands = [
                'payments:generate-monthly',
                'payments:process-status',
                'rooms:cleanup-expired-reservations',
            ];

            $commandStatus = [];
            foreach ($commands as $command) {
                try {
                    // Check if command exists by trying to show help
                    Artisan::call($command, ['--help' => true]);
                    $commandStatus[$command] = 'available';
                } catch (\Exception $e) {
                    $commandStatus[$command] = 'unavailable';
                }
            }

            $unavailableCount = count(array_filter($commandStatus, fn ($status) => $status === 'unavailable'));
            $status = $unavailableCount === 0 ? 'healthy' : ($unavailableCount < count($commands) ? 'warning' : 'critical');

            return [
                'status' => $status,
                'commands' => $commandStatus,
                'unavailable_count' => $unavailableCount,
            ];
        } catch (\Exception $e) {
            return [
                'status' => 'unhealthy',
                'error' => $e->getMessage(),
            ];
        }
    }

    private function calculateOverallHealth(array $health): string
    {
        $statuses = array_column($health, 'status');

        if (in_array('unhealthy', $statuses)) {
            return 'unhealthy';
        }

        if (in_array('critical', $statuses)) {
            return 'critical';
        }

        if (in_array('warning', $statuses)) {
            return 'warning';
        }

        return 'healthy';
    }
}
