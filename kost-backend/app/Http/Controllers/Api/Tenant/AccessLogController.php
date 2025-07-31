<?php

namespace App\Http\Controllers\Api\Tenant;

use App\Http\Controllers\Controller;
use App\Models\AccessLog;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class AccessLogController extends Controller
{
    /**
     * Get tenant's access history
     */
    public function history(Request $request)
    {
        try {
            $user = Auth::user();

            // Get tenant info first to get their room
            $tenant = \App\Models\Tenant::where('user_id', $user->id)
                ->where('status', \App\Models\Tenant::STATUS_ACTIVE)
                ->first();

            if (! $tenant) {
                return response()->json([
                    'success' => false,
                    'message' => 'Active tenant record not found',
                ], 404);
            }

            // Option B Implementation: Show only logs for tenant's room
            $query = AccessLog::where('room_id', $tenant->room_id)
                ->with('room')
                ->orderBy('accessed_at', 'desc');

            // Debug: Check raw count before pagination
            $totalCount = AccessLog::where('room_id', $tenant->room_id)->count();
            \Log::info('Access logs query debug', [
                'tenant_room_id' => $tenant->room_id,
                'total_logs_for_room' => $totalCount,
                'user_id' => $user->id,
                'tenant_status' => $tenant->status,
            ]);

            // Apply filters if provided
            if ($request->has('date_from') && $request->date_from) {
                $query->where('accessed_at', '>=', Carbon::parse($request->date_from)->startOfDay());
            }

            if ($request->has('date_to') && $request->date_to) {
                $query->where('accessed_at', '<=', Carbon::parse($request->date_to)->endOfDay());
            }

            // Pagination
            $perPage = $request->get('per_page', 15);
            $page = $request->get('page', 1);

            $accessLogs = $query->paginate($perPage, ['*'], 'page', $page);

            // Debug: Check paginated results
            \Log::info('Paginated results', [
                'items_count' => count($accessLogs->items()),
                'total' => $accessLogs->total(),
                'per_page' => $accessLogs->perPage(),
                'current_page' => $accessLogs->currentPage(),
            ]);

            $data = [
                'data' => $accessLogs->items(),
                'current_page' => $accessLogs->currentPage(),
                'last_page' => $accessLogs->lastPage(),
                'per_page' => $accessLogs->perPage(),
                'total' => $accessLogs->total(),
                'from' => $accessLogs->firstItem(),
                'to' => $accessLogs->lastItem(),
            ];

            // Debug: Sample log before transformation
            if (count($accessLogs->items()) > 0) {
                $sampleLog = $accessLogs->items()[0];
                \Log::info('Sample log before transformation', [
                    'id' => $sampleLog->id,
                    'user_id' => $sampleLog->user_id,
                    'room_id' => $sampleLog->room_id,
                    'access_granted' => $sampleLog->access_granted,
                    'accessed_at' => $sampleLog->accessed_at,
                    'accessed_at_type' => gettype($sampleLog->accessed_at),
                    'reason' => $sampleLog->reason,
                    'room_loaded' => $sampleLog->room ? true : false,
                ]);
            }

            // Transform data to match frontend expectations
            $data['data'] = collect($accessLogs->items())->map(function ($log) {
                // Handle potential date format issues
                $accessedAt = $log->accessed_at;
                if (is_string($accessedAt)) {
                    try {
                        $accessedAt = Carbon::parse($accessedAt);
                    } catch (\Exception $e) {
                        $accessedAt = Carbon::now(); // Fallback to current time
                    }
                }

                return [
                    'id' => $log->id,
                    'user_id' => $log->user_id,
                    'room_id' => $log->room_id,
                    'tenant_id' => null, // Not in current schema
                    'rfid_uid' => $log->rfid_uid,
                    'device_id' => $log->device_id,
                    'access_granted' => (bool) $log->access_granted,
                    'accessed_at' => $accessedAt->format('c'),
                    'reason' => $log->reason,
                    'created_at' => $accessedAt->format('c'),
                    'updated_at' => $accessedAt->format('c'),

                    // Additional fields for frontend compatibility
                    'access_time' => $accessedAt->format('c'),
                    'access_type' => $log->access_granted ? 'Akses Berhasil' : 'Akses Ditolak',
                    'location' => $log->room ? $log->room->room_number : 'Pintu Utama',
                    'status' => $log->access_granted ? 'success' : 'failed',
                    'room_number' => $log->room ? $log->room->room_number : null,
                    'room' => $log->room ? [
                        'id' => $log->room->id,
                        'room_number' => $log->room->room_number,
                        'name' => $log->room->room_name ?? $log->room->room_number,
                    ] : null,
                ];
            })->toArray();

            return response()->json([
                'success' => true,
                'data' => $data,
                'message' => 'Access history retrieved successfully',
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve access history: '.$e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get tenant's access statistics
     */
    public function stats(Request $request)
    {
        try {
            $user = Auth::user();

            // Get tenant info first to get their room
            $tenant = \App\Models\Tenant::where('user_id', $user->id)
                ->where('status', \App\Models\Tenant::STATUS_ACTIVE)
                ->first();

            if (! $tenant) {
                return response()->json([
                    'success' => false,
                    'message' => 'Active tenant record not found',
                ], 404);
            }

            $today = Carbon::today();
            $thisWeek = Carbon::now()->startOfWeek();
            $thisMonth = Carbon::now()->startOfMonth();
            $lastMonth = Carbon::now()->subMonth()->startOfMonth();

            // Basic stats - only for tenant's room (Option B)
            $totalCount = AccessLog::where('room_id', $tenant->room_id)->count();
            $todayCount = AccessLog::where('room_id', $tenant->room_id)
                ->whereDate('accessed_at', $today)
                ->count();
            $weekCount = AccessLog::where('room_id', $tenant->room_id)
                ->where('accessed_at', '>=', $thisWeek)
                ->count();
            $monthCount = AccessLog::where('room_id', $tenant->room_id)
                ->where('accessed_at', '>=', $thisMonth)
                ->count();
            $lastMonthCount = AccessLog::where('room_id', $tenant->room_id)
                ->where('accessed_at', '>=', $lastMonth)
                ->where('accessed_at', '<', $thisMonth)
                ->count();

            // Success/Failure stats - only for tenant's room
            $successfulAccesses = AccessLog::where('room_id', $tenant->room_id)
                ->where('access_granted', true)
                ->count();
            $deniedAccesses = AccessLog::where('room_id', $tenant->room_id)
                ->where('access_granted', false)
                ->count();

            // Calculate success rate
            $successRate = $totalCount > 0 ? ($successfulAccesses / $totalCount) * 100 : 0;

            // Calculate average daily access (this month)
            $daysInMonth = $thisMonth->diffInDays(Carbon::now()) + 1;
            $averageDaily = $daysInMonth > 0 ? round($monthCount / $daysInMonth, 1) : 0;

            // Peak hours (most frequent access hours this month) - only for tenant's room
            $peakHours = AccessLog::where('room_id', $tenant->room_id)
                ->where('accessed_at', '>=', $thisMonth)
                ->selectRaw('HOUR(accessed_at) as hour, COUNT(*) as count')
                ->groupBy('hour')
                ->orderBy('count', 'desc')
                ->limit(5)
                ->get()
                ->map(function ($item) {
                    return [
                        'hour' => (int) $item->hour,
                        'count' => (int) $item->count,
                    ];
                });

            // Method distribution - simulate based on device_id patterns (for tenant's room only)
            $methodDistribution = null;
            try {
                // Get distribution based on device_id patterns
                $deviceDistribution = AccessLog::where('room_id', $tenant->room_id)
                    ->whereNotNull('device_id')
                    ->selectRaw('
                        CASE 
                            WHEN device_id LIKE "%rfid%" OR device_id LIKE "%card%" THEN "rfid"
                            WHEN device_id LIKE "%mobile%" OR device_id LIKE "%app%" THEN "mobile"
                            WHEN device_id LIKE "%manual%" THEN "manual"
                            ELSE "rfid"
                        END as method,
                        COUNT(*) as count
                    ')
                    ->groupBy('method')
                    ->get()
                    ->pluck('count', 'method')
                    ->toArray();

                // If no device_id pattern, assume all are RFID
                if (empty($deviceDistribution) && $totalCount > 0) {
                    $deviceDistribution = ['rfid' => $totalCount];
                }

                $methodDistribution = $deviceDistribution;
            } catch (\Exception $e) {
                // If query fails, set to null
                $methodDistribution = null;
            }

            $stats = [
                'today_count' => $todayCount,
                'week_count' => $weekCount,
                'month_count' => $monthCount,
                'last_month' => $lastMonthCount,
                'total_count' => $totalCount,
                'success_rate' => round($successRate, 2),
                'average_daily' => $averageDaily,
                'denial_count' => $deniedAccesses,
                'peak_hours' => $peakHours->toArray(),
                'method_distribution' => $methodDistribution,
                // Additional insights data
                'successful_accesses' => $successfulAccesses,
                'denied_accesses' => $deniedAccesses,
            ];

            return response()->json([
                'success' => true,
                'data' => $stats,
                'message' => 'Access statistics retrieved successfully',
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve access statistics: '.$e->getMessage(),
            ], 500);
        }
    }
}
