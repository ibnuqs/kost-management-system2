<?php

// File: app/Http/Controllers/Api/Admin/AccessLogController.php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\AccessLog;
use App\Models\Room;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;

class AccessLogController extends Controller
{
    /**
     * Display a listing of access logs with filtering and pagination (Admin)
     */
    public function adminIndex(Request $request)
    {
        return $this->index($request);
    }

    /**
     * Display a listing of access logs with filtering and pagination
     */
    public function index(Request $request)
    {
        try {
            $perPage = min(500, max(5, (int) $request->get('per_page', 20)));
            $accessGranted = $request->get('access_granted', 'all'); // all, granted, denied
            $dateFrom = $request->get('date_from', '');
            $dateTo = $request->get('date_to', '');
            $userId = $request->get('user_id', '');
            $roomId = $request->get('room_id', '');
            $search = $request->get('search', '');
            $sortBy = $request->get('sort_by', 'accessed_at');
            $sortOrder = $request->get('sort_order', 'desc');

            $query = AccessLog::with(['user', 'room']);

            // Filter by access granted/denied
            if ($accessGranted === 'granted') {
                $query->where('access_granted', true);
            } elseif ($accessGranted === 'denied') {
                $query->where('access_granted', false);
            }

            // Filter by date range
            if (! empty($dateFrom)) {
                $query->whereDate('accessed_at', '>=', $dateFrom);
            }
            if (! empty($dateTo)) {
                $query->whereDate('accessed_at', '<=', $dateTo);
            }

            // Filter by user
            if (! empty($userId)) {
                $query->where('user_id', $userId);
            }

            // Filter by room
            if (! empty($roomId)) {
                $query->where('room_id', $roomId);
            }

            // Search functionality
            if (! empty($search)) {
                $query->where(function ($q) use ($search) {
                    $q->where('rfid_uid', 'like', "%{$search}%")
                        ->orWhere('device_id', 'like', "%{$search}%")
                        ->orWhere('reason', 'like', "%{$search}%")
                        ->orWhereHas('user', function ($userQuery) use ($search) {
                            $userQuery->where('name', 'like', "%{$search}%")
                                ->orWhere('email', 'like', "%{$search}%");
                        })
                        ->orWhereHas('room', function ($roomQuery) use ($search) {
                            $roomQuery->where('room_number', 'like', "%{$search}%")
                                ->orWhere('room_name', 'like', "%{$search}%");
                        });
                });
            }

            // Sorting
            $allowedSortFields = ['accessed_at', 'access_granted', 'user_id', 'room_id', 'created_at'];
            if (in_array($sortBy, $allowedSortFields)) {
                $query->orderBy($sortBy, $sortOrder === 'desc' ? 'desc' : 'asc');
            }

            $accessLogs = $query->paginate($perPage);

            $logsData = $accessLogs->getCollection()->map(function ($log) {
                return $log->getApiData();
            });

            // Calculate summary statistics for the current period/filters
            $totalToday = AccessLog::whereDate('accessed_at', now()->toDateString())->count();
            $grantedToday = AccessLog::whereDate('accessed_at', now()->toDateString())->where('access_granted', true)->count();
            $deniedToday = AccessLog::whereDate('accessed_at', now()->toDateString())->where('access_granted', false)->count();
            $totalWeek = AccessLog::whereBetween('accessed_at', [now()->startOfWeek(), now()->endOfWeek()])->count();

            $summary = [
                'total_today' => $totalToday,
                'granted_today' => $grantedToday,
                'denied_today' => $deniedToday,
                'total_week' => $totalWeek,
            ];

            return response()->json([
                'success' => true,
                'data' => $logsData,
                'pagination' => [
                    'current_page' => $accessLogs->currentPage(),
                    'per_page' => $accessLogs->perPage(),
                    'total' => $accessLogs->total(),
                    'last_page' => $accessLogs->lastPage(),
                    'from' => $accessLogs->firstItem(),
                    'to' => $accessLogs->lastItem(),
                ],
                'summary' => $summary, // Add summary data here
                'filters' => [
                    'access_granted' => $accessGranted,
                    'date_from' => $dateFrom,
                    'date_to' => $dateTo,
                    'user_id' => $userId,
                    'room_id' => $roomId,
                    'search' => $search,
                    'sort_by' => $sortBy,
                    'sort_order' => $sortOrder,
                ],
                'message' => 'Access logs retrieved successfully',
            ], 200);

        } catch (\Exception $e) {
            Log::error('Failed to fetch access logs', [
                'error' => $e->getMessage(),
                'user_id' => Auth::id(),
                'request_params' => $request->all(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve access logs',
                'error' => app()->environment('local') ? $e->getMessage() : 'Internal server error',
                'data' => [],
            ], 500);
        }
    }

    /**
     * Display the specified access log
     */
    public function show($id)
    {
        try {
            $accessLog = AccessLog::with(['user', 'room'])->findOrFail($id);

            return response()->json([
                'success' => true,
                'data' => $accessLog->getApiData(),
                'message' => 'Access log details retrieved successfully',
            ], 200);

        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Access log not found',
            ], 404);

        } catch (\Exception $e) {
            Log::error('Failed to fetch access log details', [
                'log_id' => $id,
                'error' => $e->getMessage(),
                'user_id' => Auth::id(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve access log details',
                'error' => app()->environment('local') ? $e->getMessage() : 'Internal server error',
            ], 500);
        }
    }

    /**
     * Get access log statistics (alias for stats method)
     */
    public function statistics(Request $request)
    {
        return $this->stats($request);
    }

    /**
     * Get access log statistics
     */
    public function stats(Request $request)
    {
        try {
            $dateFrom = $request->get('date_from', now()->subDays(30)->format('Y-m-d'));
            $dateTo = $request->get('date_to', now()->format('Y-m-d'));

            $baseQuery = AccessLog::whereBetween('accessed_at', [$dateFrom.' 00:00:00', $dateTo.' 23:59:59']);

            $stats = [
                'period' => [
                    'from' => $dateFrom,
                    'to' => $dateTo,
                ],
                'total_attempts' => (clone $baseQuery)->count(),
                'successful_access' => (clone $baseQuery)->where('access_granted', true)->count(),
                'denied_access' => (clone $baseQuery)->where('access_granted', false)->count(),
                'unique_users' => (clone $baseQuery)->distinct('user_id')->count('user_id'),
                'unique_rooms' => (clone $baseQuery)->distinct('room_id')->count('room_id'),
                'access_rate' => $this->calculateAccessRate($baseQuery),
                'hourly_distribution' => $this->getHourlyDistribution($baseQuery),
                'daily_distribution' => $this->getDailyDistribution($baseQuery),
                'top_users' => $this->getTopUsers($baseQuery, 10),
                'top_rooms' => $this->getTopRooms($baseQuery, 10),
                'recent_denied_attempts' => $this->getRecentDeniedAttempts(10),
            ];

            return response()->json([
                'success' => true,
                'data' => $stats,
                'message' => 'Access log statistics retrieved successfully',
            ], 200);

        } catch (\Exception $e) {
            Log::error('Failed to fetch access log statistics', [
                'error' => $e->getMessage(),
                'user_id' => Auth::id(),
                'request_params' => $request->all(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve access log statistics',
                'error' => app()->environment('local') ? $e->getMessage() : 'Internal server error',
            ], 500);
        }
    }

    /**
     * Export access logs to CSV
     */
    public function export(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'date_from' => 'required|date',
                'date_to' => 'required|date|after_or_equal:date_from',
                'format' => 'sometimes|in:csv,excel',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors(),
                ], 422);
            }

            $dateFrom = $request->date_from;
            $dateTo = $request->date_to;
            $format = $request->get('format', 'csv');

            $accessLogs = AccessLog::with(['user', 'room'])
                ->whereBetween('accessed_at', [$dateFrom.' 00:00:00', $dateTo.' 23:59:59'])
                ->orderBy('accessed_at', 'desc')
                ->get();

            $exportData = $accessLogs->map(function ($log) {
                return [
                    'ID' => $log->id,
                    'User Name' => $log->user->name ?? 'N/A',
                    'User Email' => $log->user->email ?? 'N/A',
                    'Room Number' => $log->room->room_number ?? 'N/A',
                    'Room Name' => $log->room->room_name ?? 'N/A',
                    'RFID UID' => $log->rfid_uid ?? 'N/A',
                    'Device ID' => $log->device_id ?? 'N/A',
                    'Access Granted' => $log->access_granted ? 'Yes' : 'No',
                    'Reason' => $log->reason ?? 'N/A',
                    'Accessed At' => $log->accessed_at->format('Y-m-d H:i:s'),
                ];
            })->toArray();

            // Log the export activity
            Log::info('Access logs exported', [
                'date_from' => $dateFrom,
                'date_to' => $dateTo,
                'format' => $format,
                'records_count' => count($exportData),
                'exported_by' => Auth::id(),
            ]);

            return response()->json([
                'success' => true,
                'data' => [
                    'export_data' => $exportData,
                    'filename' => "access_logs_{$dateFrom}_to_{$dateTo}.{$format}",
                    'records_count' => count($exportData),
                ],
                'message' => 'Access logs exported successfully',
            ], 200);

        } catch (\Exception $e) {
            Log::error('Failed to export access logs', [
                'error' => $e->getMessage(),
                'request_data' => $request->all(),
                'user_id' => Auth::id(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to export access logs',
                'error' => app()->environment('local') ? $e->getMessage() : 'Internal server error',
            ], 500);
        }
    }

    /**
     * Get real-time access monitoring data
     */
    public function realTimeMonitoring()
    {
        try {
            $recentLogs = AccessLog::with(['user', 'room'])
                ->where('accessed_at', '>=', now()->subMinutes(30))
                ->orderBy('accessed_at', 'desc')
                ->limit(50)
                ->get()
                ->map(function ($log) {
                    return $log->getApiData();
                });

            $currentStats = [
                'last_30_minutes' => [
                    'total_attempts' => AccessLog::where('accessed_at', '>=', now()->subMinutes(30))->count(),
                    'successful_access' => AccessLog::where('accessed_at', '>=', now()->subMinutes(30))
                        ->where('access_granted', true)->count(),
                    'denied_access' => AccessLog::where('accessed_at', '>=', now()->subMinutes(30))
                        ->where('access_granted', false)->count(),
                ],
                'last_hour' => [
                    'total_attempts' => AccessLog::where('accessed_at', '>=', now()->subHour())->count(),
                    'unique_users' => AccessLog::where('accessed_at', '>=', now()->subHour())
                        ->distinct('user_id')->count('user_id'),
                ],
                'active_rooms' => $this->getActiveRoomsLastHour(),
            ];

            return response()->json([
                'success' => true,
                'data' => [
                    'recent_logs' => $recentLogs,
                    'current_stats' => $currentStats,
                    'last_updated' => now()->format('c'),
                ],
                'message' => 'Real-time monitoring data retrieved successfully',
            ], 200);

        } catch (\Exception $e) {
            Log::error('Failed to fetch real-time monitoring data', [
                'error' => $e->getMessage(),
                'user_id' => Auth::id(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve real-time monitoring data',
                'error' => app()->environment('local') ? $e->getMessage() : 'Internal server error',
            ], 500);
        }
    }

    /**
     * Calculate access success rate
     */
    private function calculateAccessRate($query): float
    {
        $total = (clone $query)->count();
        $successful = (clone $query)->where('access_granted', true)->count();

        return $total > 0 ? round(($successful / $total) * 100, 2) : 0.0;
    }

    /**
     * Get hourly access distribution
     */
    private function getHourlyDistribution($query): array
    {
        return (clone $query)
            ->select(DB::raw('HOUR(accessed_at) as hour'), DB::raw('COUNT(*) as count'))
            ->groupBy(DB::raw('HOUR(accessed_at)'))
            ->orderBy('hour')
            ->get()
            ->map(function ($item) {
                return [
                    'hour' => sprintf('%02d:00', $item->hour),
                    'count' => (int) $item->count,
                ];
            })
            ->toArray();
    }

    /**
     * Get daily access distribution
     */
    private function getDailyDistribution($query): array
    {
        return (clone $query)
            ->select(DB::raw('DATE(accessed_at) as date'), DB::raw('COUNT(*) as count'))
            ->groupBy(DB::raw('DATE(accessed_at)'))
            ->orderBy('date')
            ->get()
            ->map(function ($item) {
                return [
                    'date' => $item->date,
                    'count' => (int) $item->count,
                ];
            })
            ->toArray();
    }

    /**
     * Get top users by access count
     */
    private function getTopUsers($query, int $limit): array
    {
        return (clone $query)
            ->select('user_id', DB::raw('COUNT(*) as access_count'))
            ->with('user')
            ->groupBy('user_id')
            ->orderBy('access_count', 'desc')
            ->limit($limit)
            ->get()
            ->map(function ($item) {
                return [
                    'user_id' => $item->user_id,
                    'user_name' => $item->user->name ?? 'N/A',
                    'user_email' => $item->user->email ?? 'N/A',
                    'access_count' => (int) $item->access_count,
                ];
            })
            ->toArray();
    }

    /**
     * Get top rooms by access count
     */
    private function getTopRooms($query, int $limit): array
    {
        return (clone $query)
            ->select('room_id', DB::raw('COUNT(*) as access_count'))
            ->with('room')
            ->whereNotNull('room_id')
            ->groupBy('room_id')
            ->orderBy('access_count', 'desc')
            ->limit($limit)
            ->get()
            ->map(function ($item) {
                return [
                    'room_id' => $item->room_id,
                    'room_number' => $item->room->room_number ?? 'N/A',
                    'room_name' => $item->room->room_name ?? 'N/A',
                    'access_count' => (int) $item->access_count,
                ];
            })
            ->toArray();
    }

    /**
     * Get recent denied access attempts
     */
    private function getRecentDeniedAttempts(int $limit): array
    {
        return AccessLog::with(['user', 'room'])
            ->where('access_granted', false)
            ->latest('accessed_at')
            ->limit($limit)
            ->get()
            ->map(function ($log) {
                return [
                    'id' => $log->id,
                    'user_name' => $log->user->name ?? 'Unknown',
                    'room_number' => $log->room->room_number ?? 'N/A',
                    'rfid_uid' => $log->rfid_uid,
                    'reason' => $log->reason,
                    'accessed_at' => $log->accessed_at ? $log->accessed_at->format('c') : null,
                ];
            })
            ->toArray();
    }

    /**
     * Get rooms with recent access activity
     */
    private function getActiveRoomsLastHour(): array
    {
        return AccessLog::with('room')
            ->where('accessed_at', '>=', now()->subHour())
            ->whereNotNull('room_id')
            ->select('room_id', DB::raw('COUNT(*) as access_count'))
            ->groupBy('room_id')
            ->orderBy('access_count', 'desc')
            ->limit(10)
            ->get()
            ->map(function ($item) {
                return [
                    'room_id' => $item->room_id,
                    'room_number' => $item->room->room_number ?? 'N/A',
                    'room_name' => $item->room->room_name ?? 'N/A',
                    'access_count' => (int) $item->access_count,
                ];
            })
            ->toArray();
    }

    /**
     * Get access analytics
     */
    public function accessAnalytics(Request $request)
    {
        try {
            $period = $request->get('period', '30'); // days
            $startDate = now()->subDays($period);

            $analytics = [
                'access_trends' => $this->getAccessTrends($startDate),
                'user_analytics' => $this->getUserAnalytics($startDate),
                'room_analytics' => $this->getRoomAnalytics($startDate),
                'security_metrics' => $this->getSecurityMetrics($startDate),
            ];

            return response()->json([
                'success' => true,
                'data' => $analytics,
                'message' => 'Access analytics retrieved successfully',
            ], 200);

        } catch (\Exception $e) {
            Log::error('Failed to fetch access analytics', [
                'error' => $e->getMessage(),
                'user_id' => Auth::id(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve access analytics',
                'error' => app()->environment('local') ? $e->getMessage() : 'Internal server error',
            ], 500);
        }
    }

    /**
     * Get suspicious activity
     */
    public function suspiciousActivity(Request $request)
    {
        try {
            $limit = min(100, max(10, (int) $request->get('limit', 50)));
            $hours = min(168, max(1, (int) $request->get('hours', 24))); // Max 1 week

            $suspiciousLogs = AccessLog::with(['user', 'room'])
                ->where('accessed_at', '>=', now()->subHours($hours))
                ->where('access_granted', false)
                ->orderBy('accessed_at', 'desc')
                ->limit($limit)
                ->get()
                ->map(function ($log) {
                    return $log->getApiData();
                });

            return response()->json([
                'success' => true,
                'data' => [
                    'suspicious_logs' => $suspiciousLogs,
                    'count' => $suspiciousLogs->count(),
                    'period_hours' => $hours,
                ],
                'message' => 'Suspicious activity retrieved successfully',
            ], 200);

        } catch (\Exception $e) {
            Log::error('Failed to fetch suspicious activity', [
                'error' => $e->getMessage(),
                'user_id' => Auth::id(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve suspicious activity',
                'error' => app()->environment('local') ? $e->getMessage() : 'Internal server error',
            ], 500);
        }
    }

    /**
     * Get access trends over time
     */
    private function getAccessTrends($startDate): array
    {
        return AccessLog::where('accessed_at', '>=', $startDate)
            ->select(DB::raw('DATE(accessed_at) as date'),
                DB::raw('COUNT(*) as total'),
                DB::raw('SUM(CASE WHEN access_granted = 1 THEN 1 ELSE 0 END) as granted'),
                DB::raw('SUM(CASE WHEN access_granted = 0 THEN 1 ELSE 0 END) as denied'))
            ->groupBy(DB::raw('DATE(accessed_at)'))
            ->orderBy('date')
            ->get()
            ->map(function ($item) {
                return [
                    'date' => $item->date,
                    'total' => (int) $item->total,
                    'granted' => (int) $item->granted,
                    'denied' => (int) $item->denied,
                ];
            })
            ->toArray();
    }

    /**
     * Get user analytics
     */
    private function getUserAnalytics($startDate): array
    {
        return AccessLog::with('user')
            ->where('accessed_at', '>=', $startDate)
            ->select('user_id',
                DB::raw('COUNT(*) as total_attempts'),
                DB::raw('SUM(CASE WHEN access_granted = 1 THEN 1 ELSE 0 END) as successful_attempts'))
            ->groupBy('user_id')
            ->having('total_attempts', '>', 0)
            ->orderBy('total_attempts', 'desc')
            ->limit(20)
            ->get()
            ->map(function ($item) {
                return [
                    'user_id' => $item->user_id,
                    'user_name' => $item->user ? $item->user->name : 'Unknown',
                    'total_attempts' => (int) $item->total_attempts,
                    'successful_attempts' => (int) $item->successful_attempts,
                    'success_rate' => $item->total_attempts > 0 ?
                        round(($item->successful_attempts / $item->total_attempts) * 100, 2) : 0,
                ];
            })
            ->toArray();
    }

    /**
     * Get room analytics
     */
    private function getRoomAnalytics($startDate): array
    {
        return AccessLog::with('room')
            ->where('accessed_at', '>=', $startDate)
            ->whereNotNull('room_id')
            ->select('room_id',
                DB::raw('COUNT(*) as total_attempts'),
                DB::raw('SUM(CASE WHEN access_granted = 1 THEN 1 ELSE 0 END) as successful_attempts'))
            ->groupBy('room_id')
            ->having('total_attempts', '>', 0)
            ->orderBy('total_attempts', 'desc')
            ->limit(20)
            ->get()
            ->map(function ($item) {
                return [
                    'room_id' => $item->room_id,
                    'room_number' => $item->room ? $item->room->room_number : 'Unknown',
                    'room_name' => $item->room ? $item->room->room_name : 'Unknown',
                    'total_attempts' => (int) $item->total_attempts,
                    'successful_attempts' => (int) $item->successful_attempts,
                    'success_rate' => $item->total_attempts > 0 ?
                        round(($item->successful_attempts / $item->total_attempts) * 100, 2) : 0,
                ];
            })
            ->toArray();
    }

    /**
     * Get security metrics
     */
    private function getSecurityMetrics($startDate): array
    {
        $total = AccessLog::where('accessed_at', '>=', $startDate)->count();
        $denied = AccessLog::where('accessed_at', '>=', $startDate)
            ->where('access_granted', false)->count();

        return [
            'total_attempts' => $total,
            'denied_attempts' => $denied,
            'denied_rate' => $total > 0 ? round(($denied / $total) * 100, 2) : 0,
            'unique_users' => AccessLog::where('accessed_at', '>=', $startDate)
                ->distinct('user_id')->count('user_id'),
            'unique_rooms' => AccessLog::where('accessed_at', '>=', $startDate)
                ->whereNotNull('room_id')
                ->distinct('room_id')->count('room_id'),
        ];
    }
}
