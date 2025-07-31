<?php

// File: app/Http/Controllers/Api/Admin/DashboardController.php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\AccessLog;
use App\Models\IoTDevice;
use App\Models\Payment;
use App\Models\RfidCard;
use App\Models\Room;
use App\Models\Tenant;
// Import Models
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class DashboardController extends Controller
{
    /**
     * Get dashboard statistics
     */
    public function getStats()
    {
        try {
            $stats = Cache::remember('admin_dashboard_stats', 60, function () {
                $currentMonth = now()->format('Y-m');
                $currentYear = now()->year;

                return [
                    // Room Statistics
                    'rooms' => [
                        'total' => Room::count(),
                        'occupied' => Room::where('status', Room::STATUS_OCCUPIED)->count(),
                        'available' => Room::where('status', Room::STATUS_AVAILABLE)->count(),
                        'maintenance' => Room::where('status', Room::STATUS_MAINTENANCE)->count(),
                        'occupancy_rate' => $this->calculateOccupancyRate(),
                    ],

                    // Tenant Statistics
                    'tenants' => [
                        'total_active' => Tenant::where('status', Tenant::STATUS_ACTIVE)->count(),
                        'total_users' => User::where('role', 'tenant')->count(),
                        'new_this_month' => $this->getNewTenantsThisMonth(),
                        'moved_out_this_month' => $this->getMovedOutThisMonth(),
                    ],

                    // RFID Statistics
                    'rfid' => [
                        'total_cards' => RfidCard::count(),
                        'active_cards' => RfidCard::where('status', 'active')->count(),
                        'assigned_cards' => RfidCard::whereNotNull('user_id')->count(),
                        'unassigned_cards' => RfidCard::whereNull('user_id')->count(),
                    ],

                    // Finance Statistics
                    'finance' => [
                        'monthly_revenue' => $this->getMonthlyRevenue($currentMonth),
                        'yearly_revenue' => $this->getYearlyRevenue($currentYear),
                        'pending_amount' => $this->getPendingAmount(),
                        'overdue_amount' => $this->getOverdueAmount($currentMonth),
                        'collection_rate' => $this->calculateCollectionRate($currentMonth),
                    ],

                    // Payment Statistics
                    'payments' => [
                        'pending_count' => Payment::where('status', Payment::STATUS_PENDING)->count(),
                        'overdue_count' => Payment::where('status', Payment::STATUS_OVERDUE)->count(),
                        'paid_this_month' => $this->getPaidThisMonth($currentMonth),
                        'total_this_month' => $this->getTotalThisMonth($currentMonth),
                        'collection_rate' => $this->calculateCollectionRate($currentMonth),
                    ],

                    // Access Statistics
                    'access' => [
                        'total_today' => $this->getTotalAccessToday(),
                        'total_this_week' => $this->getTotalAccessThisWeek(),
                        'total_all_time' => $this->getTotalAccessAllTime(),
                        'unique_users_today' => $this->getUniqueUsersToday(),
                        'peak_hour' => $this->getPeakAccessHour() ?? '00:00',
                    ],
                ];
            });

            Log::info('Dashboard statistics retrieved successfully', [
                'user_id' => Auth::id(),
                'timestamp' => now(),
            ]);

            return response()->json([
                'success' => true,
                'data' => $stats,
                'message' => 'Dashboard statistics retrieved successfully',
                'timestamp' => $this->formatDateForApi(now()),
            ], 200);

        } catch (\Exception $e) {
            Log::error('Failed to get dashboard statistics', [
                'error' => $e->getMessage(),
                'user_id' => Auth::id(),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
            ]);

            // Default structure to prevent frontend errors
            $defaultStats = [
                'rooms' => [
                    'total' => 0, 'occupied' => 0, 'available' => 0, 'maintenance' => 0, 'occupancy_rate' => 0.0,
                ],
                'tenants' => [
                    'total_active' => 0, 'total_users' => 0, 'new_this_month' => 0, 'moved_out_this_month' => 0,
                ],
                'rfid' => [
                    'total_cards' => 0, 'active_cards' => 0, 'assigned_cards' => 0, 'unassigned_cards' => 0,
                ],
                'finance' => [
                    'monthly_revenue' => 0.0, 'yearly_revenue' => 0.0, 'pending_amount' => 0.0, 'overdue_amount' => 0.0, 'collection_rate' => 0.0,
                ],
                'payments' => [
                    'pending_count' => 0, 'overdue_count' => 0, 'paid_this_month' => 0, 'total_this_month' => 0, 'collection_rate' => 0.0,
                ],
                'access' => [
                    'total_today' => 0, 'total_this_week' => 0, 'unique_users_today' => 0, 'peak_hour' => '00:00',
                ],
            ];

            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve dashboard statistics',
                'error' => app()->environment('local') ? $e->getMessage() : 'Internal server error',
                'data' => $defaultStats,
            ], 500);
        }
    }

    /**
     * Get recent activities
     */
    public function recentActivities(Request $request)
    {
        try {
            $perPage = min(50, max(5, (int) $request->get('per_page', 15)));

            $activities = Cache::remember("recent_activities_{$perPage}", 120, function () use ($perPage) {
                $activities = [];

                // Get recent access logs
                try {
                    $accessLogs = $this->getRecentAccessLogs(ceil($perPage / 3));
                    $activities = array_merge($activities, $accessLogs);
                } catch (\Exception $e) {
                    Log::warning('Failed to get access logs for activities', ['error' => $e->getMessage()]);
                }

                // Get recent payments
                try {
                    $payments = $this->getRecentPayments(ceil($perPage / 3));
                    $activities = array_merge($activities, $payments);
                } catch (\Exception $e) {
                    Log::warning('Failed to get payments for activities', ['error' => $e->getMessage()]);
                }

                // Get recent RFID activities
                try {
                    $rfidActivities = $this->getRecentRfidActivities(ceil($perPage / 3));
                    $activities = array_merge($activities, $rfidActivities);
                } catch (\Exception $e) {
                    Log::warning('Failed to get RFID activities', ['error' => $e->getMessage()]);
                }

                // Sort by timestamp and limit
                usort($activities, function ($a, $b) {
                    return strtotime($b['timestamp']) - strtotime($a['timestamp']);
                });

                // Ensure unique IDs for React keys
                $finalActivities = [];
                foreach (array_slice($activities, 0, $perPage) as $index => $activity) {
                    $baseId = $activity['id'] ?? ($activity['type'].'_'.$index);
                    $uniqueId = $activity['type'].'_'.$baseId.'_'.microtime(true).'_'.$index;

                    $activity['id'] = $uniqueId;
                    $finalActivities[] = $activity;
                }

                return $finalActivities;
            });

            return response()->json([
                'success' => true,
                'data' => $activities,
                'message' => 'Recent activities retrieved successfully',
            ], 200);

        } catch (\Exception $e) {
            Log::error('Failed to get recent activities', [
                'error' => $e->getMessage(),
                'user_id' => Auth::id(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve activities',
                'data' => [],
                'error' => app()->environment('local') ? $e->getMessage() : 'Internal server error',
            ], 500);
        }
    }

    /**
     * Check system health
     */
    public function systemHealth()
    {
        try {
            $health = Cache::remember('system_health', 60, function () {
                return [
                    'database' => $this->checkDatabaseHealth(),
                    'mqtt' => $this->checkMqttConnection(),
                    'storage' => [
                        'percent_used' => (int) $this->getStorageUsage(),
                        'free_space' => $this->getFreeSpace(),
                    ],
                    'memory' => [
                        'percent_used' => (int) $this->getMemoryUsage(),
                        'total_memory' => $this->getTotalMemory(),
                    ],
                    'uptime' => $this->getSystemUptime(),
                    'last_backup' => $this->getLastBackupTime(),
                ];
            });

            return response()->json([
                'success' => true,
                'data' => $health,
                'message' => 'System health status retrieved successfully',
            ], 200);

        } catch (\Exception $e) {
            Log::error('Failed to get system health', [
                'error' => $e->getMessage(),
            ]);

            // Return fallback health data
            $fallbackHealth = [
                'database' => 'error',
                'mqtt' => 'connected',
                'storage' => [
                    'percent_used' => 0,
                    'free_space' => '0 GB',
                ],
                'memory' => [
                    'percent_used' => 0,
                    'total_memory' => '0 GB',
                ],
                'uptime' => 'N/A',
                'last_backup' => 'Unknown',
            ];

            return response()->json([
                'success' => false,
                'data' => $fallbackHealth,
                'message' => 'Failed to retrieve system health',
                'error' => app()->environment('local') ? $e->getMessage() : 'Internal server error',
            ], 500);
        }
    }

    /**
     * Get revenue analytics
     */
    public function revenueAnalytics(Request $request)
    {
        try {
            $period = strtolower($request->get('period', 'monthly'));
            $year = (int) $request->get('year', now()->year);

            // Validate period
            if (! in_array($period, ['monthly', 'yearly', 'weekly', 'daily'])) {
                $period = 'monthly';
            }

            // Validate year
            if ($year < 2020 || $year > (now()->year + 1)) {
                $year = now()->year;
            }

            $cacheKey = "revenue_analytics_{$period}_{$year}";
            $analytics = Cache::remember($cacheKey, 600, function () use ($period, $year) {
                switch ($period) {
                    case 'monthly':
                        return $this->getMonthlyRevenueAnalytics($year);
                    case 'weekly':
                        return $this->getWeeklyRevenueAnalytics();
                    case 'daily':
                        return $this->getDailyRevenueAnalytics();
                    default:
                        return $this->getYearlyRevenueAnalytics();
                }
            });

            return response()->json([
                'success' => true,
                'data' => $analytics,
                'message' => 'Revenue analytics retrieved successfully',
                'metadata' => [
                    'period' => $period,
                    'year' => $year,
                    'count' => count($analytics),
                ],
            ], 200);

        } catch (\Exception $e) {
            Log::error('Failed to get revenue analytics', [
                'error' => $e->getMessage(),
                'period' => $request->get('period'),
                'year' => $request->get('year'),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve revenue analytics',
                'data' => [],
                'error' => app()->environment('local') ? $e->getMessage() : 'Internal server error',
            ], 500);
        }
    }

    // ===================================================================
    // PRIVATE HELPER METHODS
    // ===================================================================

    /**
     * Format date for API response
     */
    private function formatDateForApi($date): ?string
    {
        return $date ? $date->format('c') : null;
    }

    /**
     * Safely convert decimal/numeric values to float
     */
    private function toFloat($value): float
    {
        return (float) $value;
    }

    /**
     * Safely get diffForHumans from date
     */
    private function getDiffForHumans($date): string
    {
        try {
            if (! $date) {
                return 'Unknown';
            }

            if ($date instanceof Carbon) {
                return $date->diffForHumans();
            }

            return Carbon::parse($date)->diffForHumans();
        } catch (\Exception $e) {
            return 'Unknown';
        }
    }

    private function calculateOccupancyRate(): float
    {
        try {
            $totalRooms = Room::count();
            $occupiedRooms = Room::where('status', Room::STATUS_OCCUPIED)->count();

            return $totalRooms > 0 ? round(((float) $occupiedRooms / (float) $totalRooms) * 100, 2) : 0.0;
        } catch (\Exception $e) {
            Log::error('Error calculating occupancy rate', ['error' => $e->getMessage()]);

            return 0.0;
        }
    }

    private function getNewTenantsThisMonth(): int
    {
        try {
            return Tenant::where('status', Tenant::STATUS_ACTIVE)
                ->whereMonth('created_at', now()->month)
                ->whereYear('created_at', now()->year)
                ->count();
        } catch (\Exception $e) {
            Log::error('Error getting new tenants this month', ['error' => $e->getMessage()]);

            return 0;
        }
    }

    private function getMovedOutThisMonth(): int
    {
        try {
            return Tenant::where('status', Tenant::STATUS_MOVED_OUT)
                ->whereMonth('updated_at', now()->month)
                ->whereYear('updated_at', now()->year)
                ->count();
        } catch (\Exception $e) {
            Log::error('Error getting moved out tenants this month', ['error' => $e->getMessage()]);

            return 0;
        }
    }

    private function getMonthlyRevenue(string $month): float
    {
        try {
            return (float) Payment::where('status', Payment::STATUS_PAID)
                ->where('payment_month', $month)
                ->sum('amount');
        } catch (\Exception $e) {
            Log::error('Error getting monthly revenue', ['error' => $e->getMessage()]);

            return 0.0;
        }
    }

    private function getYearlyRevenue(int $year): float
    {
        try {
            return (float) Payment::where('status', Payment::STATUS_PAID)
                ->whereYear('paid_at', $year)
                ->sum('amount');
        } catch (\Exception $e) {
            Log::error('Error getting yearly revenue', ['error' => $e->getMessage()]);

            return 0.0;
        }
    }

    private function getPendingAmount(): float
    {
        try {
            return (float) Payment::where('status', Payment::STATUS_PENDING)
                ->sum('amount');
        } catch (\Exception $e) {
            Log::error('Error getting pending amount', ['error' => $e->getMessage()]);

            return 0.0;
        }
    }

    private function getOverdueAmount(string $currentMonth): float
    {
        try {
            return (float) Payment::where('status', Payment::STATUS_OVERDUE)
                ->orWhere(function ($query) use ($currentMonth) {
                    $query->where('payment_month', '<', $currentMonth)
                        ->where('status', '!=', Payment::STATUS_PAID);
                })
                ->sum('amount');
        } catch (\Exception $e) {
            Log::error('Error getting overdue amount', ['error' => $e->getMessage()]);

            return 0.0;
        }
    }

    private function calculateCollectionRate(string $month): float
    {
        try {
            $totalPayments = Payment::where('payment_month', $month)->count();
            $paidPayments = Payment::where('payment_month', $month)
                ->where('status', Payment::STATUS_PAID)
                ->count();

            return $totalPayments > 0 ? round(((float) $paidPayments / (float) $totalPayments) * 100, 2) : 0.0;
        } catch (\Exception $e) {
            Log::error('Error calculating collection rate', ['error' => $e->getMessage()]);

            return 0.0;
        }
    }

    private function getPaidThisMonth(string $month): int
    {
        try {
            return Payment::where('status', Payment::STATUS_PAID)
                ->where('payment_month', $month)
                ->count();
        } catch (\Exception $e) {
            Log::error('Error getting paid this month', ['error' => $e->getMessage()]);

            return 0;
        }
    }

    private function getTotalThisMonth(string $month): int
    {
        try {
            return Payment::where('payment_month', $month)->count();
        } catch (\Exception $e) {
            Log::error('Error getting total this month', ['error' => $e->getMessage()]);

            return 0;
        }
    }

    private function getTotalAccessToday(): int
    {
        try {
            return AccessLog::whereDate('accessed_at', now()->toDateString())->count();
        } catch (\Exception $e) {
            Log::error('Error getting total access today', ['error' => $e->getMessage()]);

            return 0;
        }
    }

    private function getTotalAccessThisWeek(): int
    {
        try {
            return AccessLog::whereBetween('accessed_at', [
                now()->startOfWeek(),
                now()->endOfWeek(),
            ])->count();
        } catch (\Exception $e) {
            Log::error('Error getting total access this week', ['error' => $e->getMessage()]);

            return 0;
        }
    }

    private function getTotalAccessAllTime(): int
    {
        try {
            return AccessLog::count();
        } catch (\Exception $e) {
            Log::error('Error getting total access all time', ['error' => $e->getMessage()]);

            return 0;
        }
    }

    private function getUniqueUsersToday(): int
    {
        try {
            return AccessLog::whereDate('accessed_at', now()->toDateString())
                ->distinct('user_id')
                ->count('user_id');
        } catch (\Exception $e) {
            Log::error('Error getting unique users today', ['error' => $e->getMessage()]);

            return 0;
        }
    }

    private function getPeakAccessHour(): ?string
    {
        try {
            $peakHour = AccessLog::whereDate('accessed_at', now()->toDateString())
                ->select(DB::raw('HOUR(accessed_at) as hour'), DB::raw('COUNT(*) as count'))
                ->groupBy(DB::raw('HOUR(accessed_at)'))
                ->orderBy('count', 'desc')
                ->first();

            if ($peakHour && $peakHour->hour !== null) {
                return sprintf('%02d:00', $peakHour->hour);
            }

            return null;
        } catch (\Exception $e) {
            Log::error('Error getting peak access hour', ['error' => $e->getMessage()]);

            return null;
        }
    }

    // Activity methods using Models
    private function getRecentAccessLogs(int $limit): array
    {
        try {
            $logs = AccessLog::with(['user:id,name,email', 'room:id,room_number'])
                ->latest('accessed_at')
                ->limit($limit)
                ->get();

            $activities = [];
            foreach ($logs as $index => $log) {
                $activities[] = [
                    'id' => 'access_'.$log->id.'_'.$index,
                    'type' => 'access',
                    'title' => 'Room Access',
                    'description' => ($log->user ? $log->user->name : 'Unknown User').' accessed '.
                                   ($log->room ? "Room {$log->room->room_number}" : 'Building'),
                    'user' => $log->user ? [
                        'id' => $log->user->id,
                        'name' => $log->user->name,
                        'email' => $log->user->email,
                    ] : null,
                    'timestamp' => $this->formatDateForApi($log->accessed_at),
                    'icon' => 'door-open',
                    'color' => $log->access_granted ? 'green' : 'red',
                    'priority' => $log->access_granted ? 'low' : 'medium',
                ];
            }

            return $activities;
        } catch (\Exception $e) {
            Log::warning('Failed to get recent access logs', ['error' => $e->getMessage()]);

            return [];
        }
    }

    private function getRecentPayments(int $limit): array
    {
        try {
            $payments = Payment::with(['tenant.user:id,name,email'])
                ->where('status', Payment::STATUS_PAID)
                ->latest('paid_at')
                ->limit($limit)
                ->get();

            $activities = [];
            foreach ($payments as $index => $payment) {
                $user = $payment->tenant ? $payment->tenant->user : null;

                $activities[] = [
                    'id' => 'payment_'.$payment->id.'_'.$index,
                    'type' => 'payment',
                    'title' => 'Payment Received',
                    'description' => 'Payment of Rp '.number_format((float) $payment->amount, 0, ',', '.').
                                   ' from '.($user ? $user->name : 'Unknown User'),
                    'user' => $user ? [
                        'id' => $user->id,
                        'name' => $user->name,
                        'email' => $user->email,
                    ] : null,
                    'timestamp' => $payment->paid_at
                        ? $this->formatDateForApi($payment->paid_at)
                        : $this->formatDateForApi($payment->created_at),
                    'icon' => 'credit-card',
                    'color' => 'green',
                    'priority' => 'medium',
                ];
            }

            return $activities;
        } catch (\Exception $e) {
            Log::warning('Failed to get recent payments', ['error' => $e->getMessage()]);

            return [];
        }
    }

    private function getRecentRfidActivities(int $limit): array
    {
        try {
            $cards = RfidCard::with(['user:id,name,email'])
                ->whereNotNull('user_id')
                ->latest('created_at')
                ->limit($limit)
                ->get();

            $activities = [];
            foreach ($cards as $index => $card) {
                $activities[] = [
                    'id' => 'rfid_'.$card->id.'_'.$index,
                    'type' => 'rfid',
                    'title' => 'RFID Card Assigned',
                    'description' => "Card {$card->uid} assigned to ".($card->user ? $card->user->name : 'Unknown User'),
                    'user' => $card->user ? [
                        'id' => $card->user->id,
                        'name' => $card->user->name,
                        'email' => $card->user->email,
                    ] : null,
                    'timestamp' => $this->formatDateForApi($card->created_at),
                    'icon' => 'credit-card',
                    'color' => 'purple',
                    'priority' => 'low',
                ];
            }

            return $activities;
        } catch (\Exception $e) {
            Log::warning('Failed to get recent RFID activities', ['error' => $e->getMessage()]);

            return [];
        }
    }

    // System Health Methods
    private function checkDatabaseHealth(): string
    {
        try {
            DB::connection()->getPdo();
            User::count(); // Test query using model

            return 'healthy';
        } catch (\Exception $e) {
            Log::error('Database health check failed', ['error' => $e->getMessage()]);

            return 'error';
        }
    }

    private function checkMqttConnection(): string
    {
        try {
            // Get MQTT service if available
            if (app()->bound(\App\Services\MqttService::class)) {
                $mqttService = app(\App\Services\MqttService::class);

                // Add your MQTT connection check logic here
                return 'connected';
            }

            return 'disconnected';
        } catch (\Exception $e) {
            Log::warning('MQTT health check failed', ['error' => $e->getMessage()]);

            return 'error';
        }
    }

    private function getStorageUsage(): int
    {
        try {
            $totalSpace = disk_total_space(storage_path());
            $freeSpace = disk_free_space(storage_path());

            if ($totalSpace && $freeSpace && $totalSpace > 0) {
                $usedSpace = $totalSpace - $freeSpace;

                return (int) round(($usedSpace / $totalSpace) * 100);
            }

            return 0;
        } catch (\Exception $e) {
            Log::warning('Failed to get storage usage', ['error' => $e->getMessage()]);

            return 0;
        }
    }

    private function getFreeSpace(): string
    {
        try {
            $freeBytes = disk_free_space(storage_path());

            return $freeBytes ? $this->formatBytes($freeBytes) : '0 GB';
        } catch (\Exception $e) {
            Log::warning('Failed to get free space', ['error' => $e->getMessage()]);

            return '0 GB';
        }
    }

    private function getMemoryUsage(): int
    {
        try {
            $memoryUsage = memory_get_usage(true);
            $memoryLimit = ini_get('memory_limit');

            if ($memoryLimit == -1) {
                return 0;
            }

            $memoryLimitBytes = $this->convertToBytes($memoryLimit);

            return $memoryLimitBytes > 0 ? (int) round(((float) $memoryUsage / (float) $memoryLimitBytes) * 100) : 0;
        } catch (\Exception $e) {
            Log::warning('Failed to get memory usage', ['error' => $e->getMessage()]);

            return 0;
        }
    }

    private function getTotalMemory(): string
    {
        try {
            $memoryLimit = ini_get('memory_limit');

            return $memoryLimit == -1 ? 'N/A' : $memoryLimit;
        } catch (\Exception $e) {
            Log::warning('Failed to get total memory', ['error' => $e->getMessage()]);

            return 'N/A';
        }
    }

    private function getSystemUptime(): string
    {
        try {
            $startTime = Cache::get('app_start_time', now()->subMinutes(5));
            if (! ($startTime instanceof Carbon)) {
                $startTime = Carbon::parse($startTime);
            }
            $diffInSeconds = now()->diffInSeconds($startTime);

            if ($diffInSeconds < 60) {
                return $diffInSeconds.' seconds';
            } elseif ($diffInSeconds < 3600) {
                return round($diffInSeconds / 60).' minutes';
            } elseif ($diffInSeconds < 86400) {
                return round($diffInSeconds / 3600).' hours';
            } else {
                return round($diffInSeconds / 86400).' days';
            }

        } catch (\Exception $e) {
            Log::warning('Failed to get system uptime', ['error' => $e->getMessage()]);

            return 'N/A';
        }
    }

    private function getLastBackupTime(): string
    {
        try {
            $lastBackup = Cache::get('last_backup_time', now()->subHours(2));
            if (! ($lastBackup instanceof Carbon)) {
                $lastBackup = Carbon::parse($lastBackup);
            }

            return $this->getDiffForHumans($lastBackup);
        } catch (\Exception $e) {
            Log::warning('Failed to get last backup time', ['error' => $e->getMessage()]);

            return 'Unknown';
        }
    }

    // Revenue Analytics Methods (Using Models)
    private function getMonthlyRevenueAnalytics(int $year): array
    {
        try {
            $months = [
                1 => 'Jan', 2 => 'Feb', 3 => 'Mar', 4 => 'Apr',
                5 => 'May', 6 => 'Jun', 7 => 'Jul', 8 => 'Aug',
                9 => 'Sep', 10 => 'Oct', 11 => 'Nov', 12 => 'Dec',
            ];

            $data = Payment::where('status', Payment::STATUS_PAID)
                ->whereYear('paid_at', $year)
                ->select(
                    DB::raw('MONTH(paid_at) as month'),
                    DB::raw('SUM(amount) as revenue'),
                    DB::raw('COUNT(*) as payments'),
                    DB::raw('AVG(amount) as avg_payment')
                )
                ->groupBy(DB::raw('MONTH(paid_at)'))
                ->orderBy('month')
                ->get()
                ->keyBy('month');

            $result = [];
            for ($month = 1; $month <= 12; $month++) {
                $monthData = $data->get($month);
                $result[] = [
                    'month' => $months[$month],
                    'revenue' => $monthData ? (float) $monthData->revenue : 0.0,
                    'payments' => $monthData ? (int) $monthData->payments : 0,
                    'avg_payment' => $monthData ? round((float) $monthData->avg_payment, 2) : 0.0,
                ];
            }

            return $result;
        } catch (\Exception $e) {
            Log::error('Failed to get monthly revenue analytics', ['error' => $e->getMessage()]);

            return [];
        }
    }

    private function getWeeklyRevenueAnalytics(): array
    {
        try {
            $startOfMonth = now()->startOfMonth();
            $endOfMonth = now()->endOfMonth();

            return Payment::where('status', Payment::STATUS_PAID)
                ->whereBetween('paid_at', [$startOfMonth, $endOfMonth])
                ->select(
                    DB::raw('WEEK(paid_at) as week'),
                    DB::raw('SUM(amount) as revenue'),
                    DB::raw('COUNT(*) as payments')
                )
                ->groupBy(DB::raw('WEEK(paid_at)'))
                ->orderBy('week')
                ->get()
                ->map(function ($item) {
                    return [
                        'month' => 'Week '.$item->week,
                        'revenue' => (float) $item->revenue,
                        'payments' => (int) $item->payments,
                    ];
                })
                ->toArray();
        } catch (\Exception $e) {
            Log::error('Failed to get weekly revenue analytics', ['error' => $e->getMessage()]);

            return [];
        }
    }

    private function getDailyRevenueAnalytics(): array
    {
        try {
            return Payment::where('status', Payment::STATUS_PAID)
                ->whereDate('paid_at', '>=', now()->subDays(30))
                ->select(
                    DB::raw('DATE(paid_at) as date'),
                    DB::raw('SUM(amount) as revenue'),
                    DB::raw('COUNT(*) as payments')
                )
                ->groupBy(DB::raw('DATE(paid_at)'))
                ->orderBy('date')
                ->get()
                ->map(function ($item) {
                    return [
                        'month' => Carbon::parse($item->date)->format('M d'),
                        'revenue' => (float) $item->revenue,
                        'payments' => (int) $item->payments,
                    ];
                })
                ->toArray();
        } catch (\Exception $e) {
            Log::error('Failed to get daily revenue analytics', ['error' => $e->getMessage()]);

            return [];
        }
    }

    private function getYearlyRevenueAnalytics(): array
    {
        try {
            return Payment::where('status', Payment::STATUS_PAID)
                ->select(
                    DB::raw('YEAR(paid_at) as year'),
                    DB::raw('SUM(amount) as revenue'),
                    DB::raw('COUNT(*) as payments'),
                    DB::raw('AVG(amount) as avg_payment')
                )
                ->groupBy(DB::raw('YEAR(paid_at)'))
                ->orderBy('year', 'desc')
                ->limit(5)
                ->get()
                ->map(function ($item) {
                    return [
                        'year' => (string) $item->year,
                        'month' => (string) $item->year, // For frontend compatibility
                        'revenue' => (float) $item->revenue,
                        'payments' => (int) $item->payments,
                        'avg_payment' => round((float) $item->avg_payment, 2),
                    ];
                })
                ->toArray();
        } catch (\Exception $e) {
            Log::error('Failed to get yearly revenue analytics', ['error' => $e->getMessage()]);

            return [];
        }
    }

    // UTILITY METHODS
    private function formatBytes(int $bytes, int $precision = 2): string
    {
        $units = ['B', 'KB', 'MB', 'GB', 'TB'];

        for ($i = 0; $bytes > 1024 && $i < count($units) - 1; $i++) {
            $bytes /= 1024;
        }

        return round($bytes, $precision).' '.$units[$i];
    }

    private function convertToBytes(string $value): int
    {
        $value = trim($value);
        $last = strtolower($value[strlen($value) - 1]);
        $value = (int) $value;

        switch ($last) {
            case 'g': $value *= 1024;
            case 'm': $value *= 1024;
            case 'k': $value *= 1024;
        }

        return $value;
    }

    /**
     * Get IoT device status
     */
    public function getIoTDeviceStatus()
    {
        try {
            $devices = Cache::remember('iot_device_status', 300, function () {
                return [
                    'total_devices' => IoTDevice::count(),
                    'online_devices' => IoTDevice::where('status', IoTDevice::STATUS_ONLINE)->count(),
                    'offline_devices' => IoTDevice::where('status', IoTDevice::STATUS_OFFLINE)->count(),
                    'door_locks' => IoTDevice::where('device_type', IoTDevice::TYPE_DOOR_LOCK)->count(),
                    'card_scanners' => IoTDevice::where('device_type', IoTDevice::TYPE_CARD_SCANNER)->count(),
                    'recent_offline' => $this->getRecentOfflineDevices(),
                ];
            });

            return response()->json([
                'success' => true,
                'data' => $devices,
                'message' => 'IoT device status retrieved successfully',
            ], 200);

        } catch (\Exception $e) {
            Log::error('Failed to get IoT device status', [
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve IoT device status',
                'data' => [
                    'total_devices' => 0,
                    'online_devices' => 0,
                    'offline_devices' => 0,
                    'door_locks' => 0,
                    'card_scanners' => 0,
                    'recent_offline' => [],
                ],
                'error' => app()->environment('local') ? $e->getMessage() : 'Internal server error',
            ], 500);
        }
    }

    private function getRecentOfflineDevices(): array
    {
        try {
            return IoTDevice::with(['room:id,room_number,room_name'])
                ->where('status', IoTDevice::STATUS_OFFLINE)
                ->latest('last_seen')
                ->limit(5)
                ->get()
                ->map(function ($device) {
                    return [
                        'id' => $device->id,
                        'device_id' => $device->device_id,
                        'device_name' => $device->device_name,
                        'device_type' => $device->device_type,
                        'room' => $device->room ? [
                            'id' => $device->room->id,
                            'room_number' => $device->room->room_number,
                            'room_name' => $device->room->room_name,
                        ] : null,
                        'last_seen' => $this->formatDateForApi($device->last_seen),
                        'offline_duration' => $this->getDiffForHumans($device->last_seen),
                    ];
                })
                ->toArray();
        } catch (\Exception $e) {
            Log::warning('Failed to get recent offline devices', ['error' => $e->getMessage()]);

            return [];
        }
    }

    /**
     * Get occupancy trends
     */
    public function getOccupancyTrends(Request $request)
    {
        try {
            $period = strtolower($request->get('period', 'monthly'));
            $year = (int) $request->get('year', now()->year);

            if (! in_array($period, ['monthly', 'weekly', 'daily'])) {
                $period = 'monthly';
            }

            $cacheKey = "occupancy_trends_{$period}_{$year}";
            $trends = Cache::remember($cacheKey, 600, function () use ($period, $year) {
                switch ($period) {
                    case 'weekly':
                        return $this->getWeeklyOccupancyTrends();
                    case 'daily':
                        return $this->getDailyOccupancyTrends();
                    default:
                        return $this->getMonthlyOccupancyTrends($year);
                }
            });

            return response()->json([
                'success' => true,
                'data' => $trends,
                'message' => 'Occupancy trends retrieved successfully',
                'metadata' => [
                    'period' => $period,
                    'year' => $year,
                    'count' => count($trends),
                ],
            ], 200);

        } catch (\Exception $e) {
            Log::error('Failed to get occupancy trends', [
                'error' => $e->getMessage(),
                'period' => $request->get('period'),
                'year' => $request->get('year'),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve occupancy trends',
                'data' => [],
                'error' => app()->environment('local') ? $e->getMessage() : 'Internal server error',
            ], 500);
        }
    }

    private function getMonthlyOccupancyTrends(int $year): array
    {
        try {
            $months = [
                1 => 'Jan', 2 => 'Feb', 3 => 'Mar', 4 => 'Apr',
                5 => 'May', 6 => 'Jun', 7 => 'Jul', 8 => 'Aug',
                9 => 'Sep', 10 => 'Oct', 11 => 'Nov', 12 => 'Dec',
            ];

            $totalRooms = Room::count();
            $result = [];

            for ($month = 1; $month <= 12; $month++) {
                // Get occupied rooms at the end of each month
                $occupiedRooms = Tenant::where('status', Tenant::STATUS_ACTIVE)
                    ->where(function ($query) use ($year, $month) {
                        $query->where(function ($q) use ($year, $month) {
                            $q->whereYear('start_date', '<', $year)
                                ->orWhere(function ($subQ) use ($year, $month) {
                                    $subQ->whereYear('start_date', $year)
                                        ->whereMonth('start_date', '<=', $month);
                                });
                        });
                    })
                    ->where(function ($query) use ($year, $month) {
                        $query->whereNull('end_date')
                            ->orWhere(function ($q) use ($year, $month) {
                                $q->whereYear('end_date', '>', $year)
                                    ->orWhere(function ($subQ) use ($year, $month) {
                                        $subQ->whereYear('end_date', $year)
                                            ->whereMonth('end_date', '>=', $month);
                                    });
                            });
                    })
                    ->count();

                $occupancyRate = $totalRooms > 0 ? round(($occupiedRooms / $totalRooms) * 100, 2) : 0.0;

                $result[] = [
                    'month' => $months[$month],
                    'occupancy_rate' => $occupancyRate,
                    'occupied_rooms' => $occupiedRooms,
                    'total_rooms' => $totalRooms,
                    'available_rooms' => $totalRooms - $occupiedRooms,
                ];
            }

            return $result;
        } catch (\Exception $e) {
            Log::error('Failed to get monthly occupancy trends', ['error' => $e->getMessage()]);

            return [];
        }
    }

    private function getWeeklyOccupancyTrends(): array
    {
        try {
            $startOfMonth = now()->startOfMonth();
            $endOfMonth = now()->endOfMonth();
            $totalRooms = Room::count();
            $result = [];

            $currentWeek = $startOfMonth->copy();
            $weekNumber = 1;

            while ($currentWeek->lte($endOfMonth)) {
                $weekEnd = $currentWeek->copy()->endOfWeek()->min($endOfMonth);

                $occupiedRooms = Tenant::where('status', Tenant::STATUS_ACTIVE)
                    ->where('start_date', '<=', $weekEnd)
                    ->where(function ($query) use ($weekEnd) {
                        $query->whereNull('end_date')
                            ->orWhere('end_date', '>=', $weekEnd);
                    })
                    ->count();

                $occupancyRate = $totalRooms > 0 ? round(($occupiedRooms / $totalRooms) * 100, 2) : 0.0;

                $result[] = [
                    'month' => 'Week '.$weekNumber,
                    'occupancy_rate' => $occupancyRate,
                    'occupied_rooms' => $occupiedRooms,
                    'total_rooms' => $totalRooms,
                    'available_rooms' => $totalRooms - $occupiedRooms,
                ];

                $currentWeek->addWeek();
                $weekNumber++;
            }

            return $result;
        } catch (\Exception $e) {
            Log::error('Failed to get weekly occupancy trends', ['error' => $e->getMessage()]);

            return [];
        }
    }

    private function getDailyOccupancyTrends(): array
    {
        try {
            $totalRooms = Room::count();
            $result = [];

            for ($i = 29; $i >= 0; $i--) {
                $date = now()->subDays($i);

                $occupiedRooms = Tenant::where('status', Tenant::STATUS_ACTIVE)
                    ->where('start_date', '<=', $date->endOfDay())
                    ->where(function ($query) use ($date) {
                        $query->whereNull('end_date')
                            ->orWhere('end_date', '>=', $date->startOfDay());
                    })
                    ->count();

                $occupancyRate = $totalRooms > 0 ? round(($occupiedRooms / $totalRooms) * 100, 2) : 0.0;

                $result[] = [
                    'month' => $date->format('M d'),
                    'occupancy_rate' => $occupancyRate,
                    'occupied_rooms' => $occupiedRooms,
                    'total_rooms' => $totalRooms,
                    'available_rooms' => $totalRooms - $occupiedRooms,
                ];
            }

            return $result;
        } catch (\Exception $e) {
            Log::error('Failed to get daily occupancy trends', ['error' => $e->getMessage()]);

            return [];
        }
    }

    /**
     * Get payment status summary
     */
    public function getPaymentStatusSummary()
    {
        try {
            $currentMonth = now()->format('Y-m');

            $summary = Cache::remember('payment_status_summary', 300, function () use ($currentMonth) {
                return [
                    'current_month' => [
                        'total' => Payment::where('payment_month', $currentMonth)->count(),
                        'paid' => Payment::where('payment_month', $currentMonth)
                            ->where('status', Payment::STATUS_PAID)->count(),
                        'pending' => Payment::where('payment_month', $currentMonth)
                            ->where('status', Payment::STATUS_PENDING)->count(),
                        'overdue' => Payment::where('payment_month', $currentMonth)
                            ->where('status', Payment::STATUS_OVERDUE)->count(),
                    ],
                    'amounts' => [
                        'total_revenue' => (float) Payment::where('payment_month', $currentMonth)
                            ->where('status', Payment::STATUS_PAID)->sum('amount'),
                        'pending_amount' => (float) Payment::where('payment_month', $currentMonth)
                            ->where('status', Payment::STATUS_PENDING)->sum('amount'),
                        'overdue_amount' => (float) Payment::where('payment_month', $currentMonth)
                            ->where('status', Payment::STATUS_OVERDUE)->sum('amount'),
                    ],
                    'recent_payments' => $this->getRecentSuccessfulPayments(10),
                    'overdue_tenants' => $this->getOverdueTenants(5),
                ];
            });

            return response()->json([
                'success' => true,
                'data' => $summary,
                'message' => 'Payment status summary retrieved successfully',
            ], 200);

        } catch (\Exception $e) {
            Log::error('Failed to get payment status summary', [
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve payment status summary',
                'data' => [
                    'current_month' => ['total' => 0, 'paid' => 0, 'pending' => 0, 'overdue' => 0],
                    'amounts' => ['total_revenue' => 0.0, 'pending_amount' => 0.0, 'overdue_amount' => 0.0],
                    'recent_payments' => [],
                    'overdue_tenants' => [],
                ],
                'error' => app()->environment('local') ? $e->getMessage() : 'Internal server error',
            ], 500);
        }
    }

    private function getRecentSuccessfulPayments(int $limit): array
    {
        try {
            return Payment::with(['tenant.user:id,name,email'])
                ->where('status', Payment::STATUS_PAID)
                ->latest('paid_at')
                ->limit($limit)
                ->get()
                ->map(function ($payment) {
                    $user = $payment->tenant ? $payment->tenant->user : null;

                    return [
                        'id' => $payment->id,
                        'order_id' => $payment->order_id,
                        'amount' => $this->toFloat($payment->amount),
                        'payment_month' => $payment->payment_month,
                        'paid_at' => $this->formatDateForApi($payment->paid_at),
                        'user' => $user ? [
                            'id' => $user->id,
                            'name' => $user->name,
                            'email' => $user->email,
                        ] : null,
                    ];
                })
                ->toArray();
        } catch (\Exception $e) {
            Log::warning('Failed to get recent successful payments', ['error' => $e->getMessage()]);

            return [];
        }
    }

    private function getOverdueTenants(int $limit): array
    {
        try {
            $currentMonth = now()->format('Y-m');

            return Payment::with(['tenant.user:id,name,email', 'tenant.room:id,room_number'])
                ->where('status', Payment::STATUS_OVERDUE)
                ->orWhere(function ($query) use ($currentMonth) {
                    $query->where('payment_month', '<', $currentMonth)
                        ->where('status', '!=', Payment::STATUS_PAID);
                })
                ->latest('created_at')
                ->limit($limit)
                ->get()
                ->map(function ($payment) {
                    $tenant = $payment->tenant;
                    $user = $tenant ? $tenant->user : null;
                    $room = $tenant ? $tenant->room : null;

                    return [
                        'id' => $payment->id,
                        'order_id' => $payment->order_id,
                        'amount' => $this->toFloat($payment->amount),
                        'payment_month' => $payment->payment_month,
                        'days_overdue' => now()->diffInDays(Carbon::parse($payment->payment_month.'-01')->endOfMonth()),
                        'user' => $user ? [
                            'id' => $user->id,
                            'name' => $user->name,
                            'email' => $user->email,
                        ] : null,
                        'room' => $room ? [
                            'id' => $room->id,
                            'room_number' => $room->room_number,
                        ] : null,
                    ];
                })
                ->toArray();
        } catch (\Exception $e) {
            Log::warning('Failed to get overdue tenants', ['error' => $e->getMessage()]);

            return [];
        }
    }

    /**
     * Get payment trends for dashboard charts
     */
    public function paymentTrends(Request $request)
    {
        try {
            $period = strtolower($request->get('period', 'monthly'));
            $year = (int) $request->get('year', now()->year);

            if (! in_array($period, ['monthly', 'weekly', 'daily'])) {
                $period = 'monthly';
            }

            $cacheKey = "payment_trends_{$period}_{$year}";
            $trends = Cache::remember($cacheKey, 300, function () use ($period, $year) {
                switch ($period) {
                    case 'weekly':
                        return $this->getWeeklyPaymentTrends();
                    case 'daily':
                        return $this->getDailyPaymentTrends();
                    default:
                        return $this->getMonthlyPaymentTrends($year);
                }
            });

            return response()->json([
                'success' => true,
                'data' => $trends,
                'message' => 'Payment trends retrieved successfully',
                'metadata' => [
                    'period' => $period,
                    'year' => $year,
                    'count' => count($trends),
                ],
            ], 200);

        } catch (\Exception $e) {
            Log::error('Failed to get payment trends', [
                'error' => $e->getMessage(),
                'period' => $request->get('period'),
                'year' => $request->get('year'),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve payment trends',
                'data' => [],
                'error' => app()->environment('local') ? $e->getMessage() : 'Internal server error',
            ], 500);
        }
    }

    /**
     * Get access history for dashboard charts
     */
    public function accessHistory(Request $request)
    {
        try {
            $period = strtolower($request->get('period', 'daily'));
            $days = (int) $request->get('days', 7);

            if (! in_array($period, ['hourly', 'daily', 'weekly'])) {
                $period = 'daily';
            }

            if ($days < 1 || $days > 365) {
                $days = 7;
            }

            $cacheKey = "access_history_{$period}_{$days}";
            $history = Cache::remember($cacheKey, 60, function () use ($period, $days) {
                switch ($period) {
                    case 'hourly':
                        return $this->getHourlyAccessHistory();
                    case 'weekly':
                        return $this->getWeeklyAccessHistory($days);
                    default:
                        return $this->getDailyAccessHistory($days);
                }
            });

            return response()->json([
                'success' => true,
                'data' => $history,
                'message' => 'Access history retrieved successfully',
                'metadata' => [
                    'period' => $period,
                    'days' => $days,
                    'count' => count($history),
                ],
            ], 200);

        } catch (\Exception $e) {
            Log::error('Failed to get access history', [
                'error' => $e->getMessage(),
                'period' => $request->get('period'),
                'days' => $request->get('days'),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve access history',
                'data' => [],
                'error' => app()->environment('local') ? $e->getMessage() : 'Internal server error',
            ], 500);
        }
    }

    private function getMonthlyPaymentTrends(int $year): array
    {
        try {
            $months = [
                1 => 'Jan', 2 => 'Feb', 3 => 'Mar', 4 => 'Apr',
                5 => 'May', 6 => 'Jun', 7 => 'Jul', 8 => 'Aug',
                9 => 'Sep', 10 => 'Oct', 11 => 'Nov', 12 => 'Dec',
            ];

            $data = Payment::where('status', Payment::STATUS_PAID)
                ->whereYear('paid_at', $year)
                ->select(
                    DB::raw('MONTH(paid_at) as month'),
                    DB::raw('COUNT(*) as total_payments'),
                    DB::raw('SUM(amount) as total_amount'),
                    DB::raw('AVG(amount) as avg_amount')
                )
                ->groupBy(DB::raw('MONTH(paid_at)'))
                ->orderBy('month')
                ->get()
                ->keyBy('month');

            $result = [];
            for ($month = 1; $month <= 12; $month++) {
                $monthData = $data->get($month);
                $result[] = [
                    'period' => $months[$month],
                    'total_payments' => $monthData ? (int) $monthData->total_payments : 0,
                    'total_amount' => $monthData ? $this->toFloat($monthData->total_amount) : 0.0,
                    'avg_amount' => $monthData ? round($this->toFloat($monthData->avg_amount), 2) : 0.0,
                ];
            }

            return $result;
        } catch (\Exception $e) {
            Log::error('Failed to get monthly payment trends', ['error' => $e->getMessage()]);

            return [];
        }
    }

    private function getWeeklyPaymentTrends(): array
    {
        try {
            $startDate = now()->subWeeks(12)->startOfWeek();
            $result = [];

            for ($i = 0; $i < 12; $i++) {
                $weekStart = $startDate->copy()->addWeeks($i);
                $weekEnd = $weekStart->copy()->endOfWeek();

                $payments = Payment::where('status', Payment::STATUS_PAID)
                    ->whereBetween('paid_at', [$weekStart, $weekEnd])
                    ->select(
                        DB::raw('COUNT(*) as total_payments'),
                        DB::raw('SUM(amount) as total_amount'),
                        DB::raw('AVG(amount) as avg_amount')
                    )
                    ->first();

                $result[] = [
                    'period' => 'Week '.$weekStart->format('M d'),
                    'total_payments' => $payments ? (int) $payments->total_payments : 0,
                    'total_amount' => $payments ? $this->toFloat($payments->total_amount) : 0.0,
                    'avg_amount' => $payments ? round($this->toFloat($payments->avg_amount), 2) : 0.0,
                ];
            }

            return $result;
        } catch (\Exception $e) {
            Log::error('Failed to get weekly payment trends', ['error' => $e->getMessage()]);

            return [];
        }
    }

    private function getDailyPaymentTrends(): array
    {
        try {
            $result = [];

            for ($i = 29; $i >= 0; $i--) {
                $date = now()->subDays($i);

                $payments = Payment::where('status', Payment::STATUS_PAID)
                    ->whereDate('paid_at', $date)
                    ->select(
                        DB::raw('COUNT(*) as total_payments'),
                        DB::raw('SUM(amount) as total_amount'),
                        DB::raw('AVG(amount) as avg_amount')
                    )
                    ->first();

                $result[] = [
                    'period' => $date->format('M d'),
                    'total_payments' => $payments ? (int) $payments->total_payments : 0,
                    'total_amount' => $payments ? $this->toFloat($payments->total_amount) : 0.0,
                    'avg_amount' => $payments ? round($this->toFloat($payments->avg_amount), 2) : 0.0,
                ];
            }

            return $result;
        } catch (\Exception $e) {
            Log::error('Failed to get daily payment trends', ['error' => $e->getMessage()]);

            return [];
        }
    }

    private function getHourlyAccessHistory(): array
    {
        try {
            $result = [];
            $today = now()->startOfDay();

            for ($hour = 0; $hour < 24; $hour++) {
                $hourStart = $today->copy()->addHours($hour);
                $hourEnd = $hourStart->copy()->addHour();

                $accessCount = AccessLog::whereBetween('accessed_at', [$hourStart, $hourEnd])->count();
                $successfulAccess = AccessLog::whereBetween('accessed_at', [$hourStart, $hourEnd])
                    ->where('access_granted', true)->count();
                $failedAccess = AccessLog::whereBetween('accessed_at', [$hourStart, $hourEnd])
                    ->where('access_granted', false)->count();

                $result[] = [
                    'period' => sprintf('%02d:00', $hour),
                    'total_access' => $accessCount,
                    'successful_access' => $successfulAccess,
                    'failed_access' => $failedAccess,
                    'success_rate' => $accessCount > 0 ? round(($successfulAccess / $accessCount) * 100, 2) : 0.0,
                ];
            }

            return $result;
        } catch (\Exception $e) {
            Log::error('Failed to get hourly access history', ['error' => $e->getMessage()]);

            return [];
        }
    }

    private function getDailyAccessHistory(int $days): array
    {
        try {
            $result = [];

            for ($i = $days - 1; $i >= 0; $i--) {
                $date = now()->subDays($i);

                $accessCount = AccessLog::whereDate('accessed_at', $date->toDateString())->count();
                $successfulAccess = AccessLog::whereDate('accessed_at', $date->toDateString())
                    ->where('access_granted', true)->count();
                $failedAccess = AccessLog::whereDate('accessed_at', $date->toDateString())
                    ->where('access_granted', false)->count();
                $uniqueUsers = AccessLog::whereDate('accessed_at', $date->toDateString())
                    ->whereNotNull('user_id')
                    ->distinct('user_id')
                    ->count('user_id');

                $result[] = [
                    'period' => $date->format('M d'),
                    'total_access' => $accessCount,
                    'successful_access' => $successfulAccess,
                    'failed_access' => $failedAccess,
                    'unique_users' => $uniqueUsers,
                    'success_rate' => $accessCount > 0 ? round(($successfulAccess / $accessCount) * 100, 2) : 0.0,
                ];
            }

            return $result;
        } catch (\Exception $e) {
            Log::error('Failed to get daily access history', ['error' => $e->getMessage()]);

            return [];
        }
    }

    private function getWeeklyAccessHistory(int $days): array
    {
        try {
            $weeks = ceil($days / 7);
            $result = [];

            for ($i = $weeks - 1; $i >= 0; $i--) {
                $weekStart = now()->subWeeks($i)->startOfWeek();
                $weekEnd = $weekStart->copy()->endOfWeek();

                $accessCount = AccessLog::whereBetween('accessed_at', [$weekStart, $weekEnd])->count();
                $successfulAccess = AccessLog::whereBetween('accessed_at', [$weekStart, $weekEnd])
                    ->where('access_granted', true)->count();
                $failedAccess = AccessLog::whereBetween('accessed_at', [$weekStart, $weekEnd])
                    ->where('access_granted', false)->count();
                $uniqueUsers = AccessLog::whereBetween('accessed_at', [$weekStart, $weekEnd])
                    ->whereNotNull('user_id')
                    ->distinct('user_id')
                    ->count('user_id');

                $result[] = [
                    'period' => 'Week '.$weekStart->format('M d'),
                    'total_access' => $accessCount,
                    'successful_access' => $successfulAccess,
                    'failed_access' => $failedAccess,
                    'unique_users' => $uniqueUsers,
                    'success_rate' => $accessCount > 0 ? round(($successfulAccess / $accessCount) * 100, 2) : 0.0,
                ];
            }

            return $result;
        } catch (\Exception $e) {
            Log::error('Failed to get weekly access history', ['error' => $e->getMessage()]);

            return [];
        }
    }
}
