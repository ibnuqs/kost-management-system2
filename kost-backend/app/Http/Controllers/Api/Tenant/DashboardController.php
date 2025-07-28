<?php

namespace App\Http\Controllers\Api\Tenant;

use App\Http\Controllers\Controller;
use App\Models\Tenant;
use App\Models\Payment;
use App\Models\AccessLog;
use App\Models\RfidCard;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Carbon\Carbon;

class DashboardController extends Controller
{
    /**
     * Debug tenant dashboard data
     */
    public function debugTenantDashboard(Request $request)
    {
        try {
            $user = Auth::user();
            
            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'User not authenticated',
                    'debug' => 'Auth::user() returned null'
                ], 401);
            }

            // Debug: Check all tenant records for this user
            $allTenants = Tenant::where('user_id', $user->id)->get();
            
            // Debug: Check if any tenant exists
            $activeTenant = Tenant::where('user_id', $user->id)
                ->where('status', Tenant::STATUS_ACTIVE)
                ->first();
            
            return response()->json([
                'success' => true,
                'debug' => [
                    'user' => [
                        'id' => $user->id,
                        'name' => $user->name,
                        'email' => $user->email,
                        'role' => $user->role,
                    ],
                    'all_tenants' => $allTenants->map(function($t) {
                        return [
                            'id' => $t->id,
                            'user_id' => $t->user_id,
                            'room_id' => $t->room_id,
                            'status' => $t->status,
                            'start_date' => $t->start_date,
                            'created_at' => $t->created_at,
                        ];
                    }),
                    'active_tenant' => $activeTenant ? [
                        'id' => $activeTenant->id,
                        'user_id' => $activeTenant->user_id,
                        'room_id' => $activeTenant->room_id,
                        'status' => $activeTenant->status,
                    ] : null,
                    'status_constants' => [
                        'STATUS_ACTIVE' => Tenant::STATUS_ACTIVE,
                        'STATUS_MOVED_OUT' => Tenant::STATUS_MOVED_OUT,
                        'STATUS_SUSPENDED' => Tenant::STATUS_SUSPENDED,
                    ]
                ]
            ]);
            
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Debug failed: ' . $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ], 500);
        }
    }

    /**
     * Get tenant dashboard data
     */
    public function tenantDashboard(Request $request)
    {
        try {
            $user = Auth::user();
            
            // Add debug logging
            \Log::info('Tenant dashboard request', [
                'user_id' => $user ? $user->id : 'null',
                'user_role' => $user ? $user->role : 'null'
            ]);
            
            // Get active tenant record
            $tenant = Tenant::where('user_id', $user->id)
                ->where('status', Tenant::STATUS_ACTIVE)
                ->with(['room', 'user'])
                ->first();

            if (!$tenant) {
                \Log::warning('Active tenant not found', [
                    'user_id' => $user->id,
                    'all_tenants' => Tenant::where('user_id', $user->id)->get(['id', 'status', 'user_id'])->toArray()
                ]);
                
                return response()->json([
                    'success' => false,
                    'message' => 'Active tenant record not found'
                ], 404);
            }

            // Get dashboard data with error handling
            $dashboardData = [
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'role' => $user->role,
                ],
                'tenant_info' => [
                    'id' => $tenant->id,
                    'user_id' => $tenant->user_id,
                    'room_id' => $tenant->room_id,
                    'user_name' => $user->name,
                    'user_email' => $user->email,
                    'room_number' => $tenant->room->room_number ?? null,
                    'status' => $tenant->status,
                    'start_date' => $tenant->start_date ? $tenant->start_date->format('Y-m-d') : null,
                    'end_date' => $tenant->end_date ? $tenant->end_date->format('Y-m-d') : null,
                    'monthly_rent' => (float) $tenant->monthly_rent,
                    'security_deposit' => 0, // Not in current schema
                    'created_at' => $tenant->created_at->format('c'),
                    'updated_at' => $tenant->updated_at->format('c'),
                ],
            ];

            // Debug: Log tenant data
            \Log::info('Tenant info data', [
                'tenant_id' => $tenant->id,
                'room_id' => $tenant->room_id,
                'room_number' => $tenant->room->room_number ?? 'null',
                'start_date' => $tenant->start_date ? $tenant->start_date->format('Y-m-d') : 'null',
                'end_date' => $tenant->end_date ? $tenant->end_date->format('Y-m-d') : 'null',
                'monthly_rent' => $tenant->monthly_rent,
                'status' => $tenant->status
            ]);

            // Add each section with error handling
            try {
                $dashboardData['payment_info'] = $this->getPaymentInfo($tenant->id);
            } catch (\Exception $e) {
                \Log::error('Payment info error: ' . $e->getMessage());
                $dashboardData['payment_info'] = ['error' => 'Failed to load payment info'];
            }

            try {
                $dashboardData['access_stats'] = $this->getAccessStats($tenant);
            } catch (\Exception $e) {
                \Log::error('Access stats error: ' . $e->getMessage());
                $dashboardData['access_stats'] = ['error' => 'Failed to load access stats'];
            }

            try {
                $dashboardData['rfid_cards'] = $this->getRfidCards($user->id);
            } catch (\Exception $e) {
                \Log::error('RFID cards error: ' . $e->getMessage());
                $dashboardData['rfid_cards'] = ['error' => 'Failed to load RFID cards'];
            }

            try {
                $dashboardData['notifications'] = $this->getNotifications($user->id);
            } catch (\Exception $e) {
                \Log::error('Notifications error: ' . $e->getMessage());
                $dashboardData['notifications'] = ['error' => 'Failed to load notifications'];
            }

            try {
                $dashboardData['recent_activities'] = $this->getRecentActivities($user->id);
            } catch (\Exception $e) {
                \Log::error('Recent activities error: ' . $e->getMessage());
                $dashboardData['recent_activities'] = ['error' => 'Failed to load recent activities'];
            }

            try {
                $quickStats = $this->getQuickStats($tenant);
                $dashboardData['quick_stats'] = $quickStats;
                
                // Debug: Log quick stats data
                \Log::info('Quick stats data', [
                    'tenant_id' => $tenant->id,
                    'quick_stats' => $quickStats
                ]);
            } catch (\Exception $e) {
                \Log::error('Quick stats error: ' . $e->getMessage());
                $dashboardData['quick_stats'] = ['error' => 'Failed to load quick stats'];
            }

            return response()->json([
                'success' => true,
                'data' => $dashboardData,
                'message' => 'Dashboard data retrieved successfully'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve dashboard data: ' . $e->getMessage()
            ], 500);
        }
    }

    private function getPaymentInfo($tenantId)
    {
        $currentMonth = Carbon::now()->format('Y-m');
        $nextMonth = Carbon::now()->addMonth()->format('Y-m');

        // Current month payment
        $currentPayment = Payment::where('tenant_id', $tenantId)
            ->where('payment_month', $currentMonth)
            ->first();

        // Next month payment
        $nextPayment = Payment::where('tenant_id', $tenantId)
            ->where('payment_month', $nextMonth)
            ->first();

        // Recent payments (last 3 months)
        $recentPayments = Payment::where('tenant_id', $tenantId)
            ->where('payment_month', '>=', Carbon::now()->subMonths(3)->format('Y-m'))
            ->orderBy('payment_month', 'desc')
            ->limit(5)
            ->get()
            ->map(function ($payment) {
                return [
                    'id' => $payment->id,
                    'amount' => (float) $payment->amount,
                    'payment_month' => $payment->payment_month,
                    'due_date' => $payment->created_at->addDays(7)->format('Y-m-d'),
                    'paid_at' => $payment->paid_at ? $payment->paid_at->format('c') : null,
                    'status' => $payment->status,
                ];
            });

        // Overdue count
        $overdueCount = Payment::where('tenant_id', $tenantId)
            ->where('status', 'pending')
            ->where('created_at', '<', Carbon::now()->subDays(7))
            ->count();

        return [
            'current' => $currentPayment ? [
                'id' => $currentPayment->id,
                'tenant_id' => $currentPayment->tenant_id,
                'amount' => (float) $currentPayment->amount,
                'payment_month' => $currentPayment->payment_month,
                'due_date' => $currentPayment->created_at->addDays(7)->format('Y-m-d'),
                'status' => $currentPayment->status,
                'payment_url' => null, // Will be generated when needed
                'paid_at' => $currentPayment->paid_at ? $currentPayment->paid_at->format('c') : null,
                'created_at' => $currentPayment->created_at->format('c'),
            ] : null,
            'next' => $nextPayment ? [
                'id' => $nextPayment->id,
                'tenant_id' => $nextPayment->tenant_id,
                'amount' => (float) $nextPayment->amount,
                'payment_month' => $nextPayment->payment_month,
                'due_date' => $nextPayment->created_at->addDays(7)->format('Y-m-d'),
                'status' => $nextPayment->status,
            ] : null,
            'recent' => $recentPayments->toArray(),
            'overdue_count' => $overdueCount,
        ];
    }

    private function getAccessStats($tenant)
    {
        $thisWeek = Carbon::now()->startOfWeek();
        $thisMonth = Carbon::now()->startOfMonth();

        $totalAccesses = AccessLog::where('room_id', $tenant->room_id)->count();
        $thisMonthAccesses = AccessLog::where('room_id', $tenant->room_id)
            ->where('accessed_at', '>=', $thisMonth)
            ->count();
        $thisWeekAccesses = AccessLog::where('room_id', $tenant->room_id)
            ->where('accessed_at', '>=', $thisWeek)
            ->count();

        $lastAccess = AccessLog::where('room_id', $tenant->room_id)
            ->latest('accessed_at')
            ->first();

        // Calculate success rate for this room
        $successfulAccesses = AccessLog::where('room_id', $tenant->room_id)
            ->where('access_granted', true)
            ->count();
        
        $successRate = $totalAccesses > 0 ? ($successfulAccesses / $totalAccesses) * 100 : 0;

        // Calculate average daily accesses (for current month)
        $daysInMonth = Carbon::now()->daysInMonth;
        $averageDaily = $thisMonthAccesses / $daysInMonth;

        // Get peak hour (hour with most accesses) for this room
        $peakHour = AccessLog::where('room_id', $tenant->room_id)
            ->selectRaw('HOUR(accessed_at) as hour, COUNT(*) as count')
            ->groupBy('hour')
            ->orderBy('count', 'desc')
            ->first();

        // Get denied accesses count for tenant's room
        $deniedAccesses = AccessLog::where('room_id', $tenant->room_id)
            ->where('access_granted', false)
            ->count();


        $result = [
            'total_accesses' => $totalAccesses,
            'this_month' => $thisMonthAccesses,
            'this_week' => $thisWeekAccesses,
            'last_access' => $lastAccess ? $lastAccess->accessed_at->format('c') : null,
            // Additional stats for the AccessStats component
            'total_count' => $totalAccesses,
            'success_rate' => round($successRate, 2),
            'average_daily' => round($averageDaily, 1),
            'peak_hours' => $peakHour ? [['hour' => $peakHour->hour, 'count' => $peakHour->count]] : [],
            'denial_count' => $deniedAccesses
        ];

        // Debug: Log access stats data
        \Log::info('Access stats data', [
            'tenant_id' => $tenant->id,
            'room_id' => $tenant->room_id,
            'access_stats' => $result
        ]);

        return $result;
    }

    private function getRfidCards($userId)
    {
        return RfidCard::where('user_id', $userId)
            ->with(['tenant.room'])
            ->get()
            ->map(function ($card) {
                return [
                    'id' => $card->id,
                    'uid' => $card->uid,
                    'user_id' => $card->user_id,
                    'tenant_id' => $card->tenant_id,
                    'status' => $card->status,
                    'issued_date' => $card->created_at->format('Y-m-d'),
                    'created_at' => $card->created_at->format('c'),
                    'updated_at' => $card->updated_at->format('c'),
                    'room_number' => $card->tenant && $card->tenant->room ? $card->tenant->room->room_number : null,
                    'room_id' => $card->tenant && $card->tenant->room ? $card->tenant->room->id : null,
                ];
            })
            ->toArray();
    }

    private function getNotifications($userId)
    {
        // Placeholder for notifications
        return [
            [
                'type' => 'info',
                'title' => 'Welcome',
                'message' => 'Welcome to the tenant dashboard',
                'action' => 'View',
            ]
        ];
    }

    private function getRecentActivities($userId)
    {
        // Get tenant's room first for Option B consistency
        $tenant = Tenant::where('user_id', $userId)
            ->where('status', Tenant::STATUS_ACTIVE)
            ->first();
            
        if (!$tenant) {
            return [];
        }
        
        return AccessLog::where('room_id', $tenant->room_id)
            ->with('room')
            ->latest('accessed_at')
            ->limit(10)
            ->get()
            ->map(function ($log) {
                $roomNumber = 'room';
                if ($log->room) {
                    $roomNumber = $log->room->room_number;
                } elseif ($log->room_id) {
                    // Fallback: get room data if relationship failed
                    $room = \App\Models\Room::find($log->room_id);
                    $roomNumber = $room ? $room->room_number : 'room ' . $log->room_id;
                }
                
                return [
                    'type' => 'access',
                    'description' => $log->access_granted 
                        ? 'Access granted to ' . $roomNumber
                        : 'Access denied to ' . $roomNumber,
                    'timestamp' => $log->accessed_at->format('c'),
                    'room_number' => $roomNumber,
                ];
            })
            ->toArray();
    }

    private function getQuickStats($tenant)
    {
        $user = $tenant->user;
        $today = Carbon::today();
        $thisWeek = Carbon::now()->startOfWeek();
        $thisMonth = Carbon::now()->startOfMonth();
        
        $daysSinceMovein = $tenant->start_date ? 
            Carbon::parse($tenant->start_date)->diffInDays(Carbon::now()) : 0;

        $totalPaymentsMade = Payment::where('tenant_id', $tenant->id)
            ->where('status', 'paid')
            ->count();

        $totalAmountPaid = Payment::where('tenant_id', $tenant->id)
            ->where('status', 'paid')
            ->sum('amount');

        // Access statistics - only for tenant's room (Option B)
        $accessCountToday = AccessLog::where('room_id', $tenant->room_id)
            ->whereDate('accessed_at', $today)
            ->count();

        $accessCountWeek = AccessLog::where('room_id', $tenant->room_id)
            ->where('accessed_at', '>=', $thisWeek)
            ->count();

        $accessCountMonth = AccessLog::where('room_id', $tenant->room_id)
            ->where('accessed_at', '>=', $thisMonth)
            ->count();

        // Device statistics - get devices for this room
        $devicesTotal = \App\Models\IoTDevice::where('room_id', $tenant->room_id)->count();
        
        // Consider devices online if they have recent activity (last 5 minutes)
        // FIXED: Add proper WHERE clause grouping for room_id
        $devicesOnline = \App\Models\IoTDevice::where('room_id', $tenant->room_id)
            ->where(function($query) {
                $query->where('status', 'online')
                      ->orWhere('last_seen', '>=', Carbon::now()->subMinutes(5));
            })
            ->count();

        // Debug: Log device query details
        \Log::info('Device count debug', [
            'tenant_id' => $tenant->id,
            'room_id' => $tenant->room_id,
            'devices_total' => $devicesTotal,
            'devices_online' => $devicesOnline,
            'all_devices_for_room' => \App\Models\IoTDevice::where('room_id', $tenant->room_id)->get(['id', 'device_id', 'device_name', 'status', 'last_seen'])->toArray()
        ]);

        return [
            'days_since_move_in' => (int) $daysSinceMovein,
            'total_payments_made' => $totalPaymentsMade,
            'total_amount_paid' => (float) $totalAmountPaid,
            // Access data
            'access_count_today' => $accessCountToday,
            'access_count_week' => $accessCountWeek,
            'access_count_month' => $accessCountMonth,
            // Device data
            'devices_total' => $devicesTotal,
            'devices_online' => $devicesOnline,
            // Payment streak (consecutive paid months)
            'current_streak' => $totalPaymentsMade, // Simplified for now
        ];
    }
}
