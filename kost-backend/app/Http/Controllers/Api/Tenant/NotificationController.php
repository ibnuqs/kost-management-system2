<?php

namespace App\Http\Controllers\Api\Tenant;

use App\Http\Controllers\Controller;
use App\Models\Notification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class NotificationController extends Controller
{
    /**
     * Get tenant notifications with filtering and pagination
     */
    public function index(Request $request)
    {
        try {
            $user = Auth::user();
            $query = Notification::where('user_id', $user->id);

            // Apply filters
            if ($request->has('type') && $request->type !== 'all') {
                $query->where('type', $request->type);
            }

            if ($request->has('status') && $request->status !== 'all') {
                $query->where('status', $request->status);
            }

            // Date range filter
            if ($request->has('date_from')) {
                $query->whereDate('created_at', '>=', $request->date_from);
            }

            if ($request->has('date_to')) {
                $query->whereDate('created_at', '<=', $request->date_to);
            }

            // Sorting
            $sortBy = $request->get('sort_by', 'created_at');
            $sortOrder = $request->get('sort_order', 'desc');
            $query->orderBy($sortBy, $sortOrder);

            // Pagination
            $perPage = $request->get('per_page', 15);
            $notifications = $query->paginate($perPage);

            // Debug logging
            \Log::info('Tenant notifications request', [
                'user_id' => $user->id,
                'per_page' => $perPage,
                'total_notifications' => $notifications->total(),
                'returned_count' => count($notifications->items()),
                'filters' => $request->only(['type', 'status', 'date_from', 'date_to'])
            ]);

            return response()->json([
                'success' => true,
                'data' => [
                    'notifications' => $notifications->items(),
                    'total' => $notifications->total()
                ],
                'message' => 'Notifications retrieved successfully'
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to fetch tenant notifications: ' . $e->getMessage(), ['user_id' => $user->id ?? null]);
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch notifications',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get unread notifications count
     */
    public function unreadCount()
    {
        try {
            $user = Auth::user();
            $count = Notification::where('user_id', $user->id)
                ->where('status', 'unread')
                ->count();

            return response()->json([
                'success' => true,
                'data' => [
                    'count' => $count
                ],
                'message' => 'Unread count retrieved successfully'
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to fetch unread count: ' . $e->getMessage(), ['user_id' => $user->id ?? null]);
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch unread count',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Mark notification as read
     */
    public function markAsRead(Request $request, $id)
    {
        try {
            $user = Auth::user();
            $notification = Notification::where('id', $id)
                ->where('user_id', $user->id)
                ->first();

            if (!$notification) {
                Log::warning('Notification not found for markAsRead', [
                    'user_id' => $user->id,
                    'notification_id' => $id
                ]);
                return response()->json([
                    'success' => false,
                    'message' => 'Notifikasi tidak ditemukan'
                ], 404);
            }

            // Cek apakah sudah read
            if ($notification->status === 'read') {
                return response()->json([
                    'success' => true,
                    'message' => 'Notifikasi sudah dibaca sebelumnya',
                    'data' => $notification
                ]);
            }

            // Update status
            $notification->update([
                'status' => 'read'
            ]);

            Log::info('Notification marked as read', [
                'user_id' => $user->id,
                'notification_id' => $id,
                'notification_type' => $notification->type
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Notifikasi berhasil ditandai sebagai sudah dibaca',
                'data' => $notification
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to mark notification as read', [
                'user_id' => $user->id ?? null,
                'notification_id' => $id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return response()->json([
                'success' => false,
                'message' => 'Gagal menandai notifikasi sebagai sudah dibaca',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Mark all notifications as read
     */
    public function markAllAsRead()
    {
        try {
            $user = Auth::user();
            $updated = Notification::where('user_id', $user->id)
                ->where('status', 'unread')
                ->update([
                    'status' => 'read'
                ]);

            Log::info('All notifications marked as read', [
                'user_id' => $user->id,
                'updated_count' => $updated
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Semua notifikasi berhasil ditandai sebagai sudah dibaca',
                'data' => [
                    'updated_count' => $updated
                ]
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to mark all notifications as read', [
                'user_id' => $user->id ?? null,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return response()->json([
                'success' => false,
                'message' => 'Gagal menandai semua notifikasi sebagai sudah dibaca',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}

