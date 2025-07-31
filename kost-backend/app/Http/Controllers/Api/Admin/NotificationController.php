<?php

// File: app/Http/Controllers/Api/Admin/NotificationController.php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class NotificationController extends Controller
{
    /**
     * ✅ Dapatkan semua notifikasi untuk admin
     */
    public function index()
    {
        try {
            $notifications = $this->getAdminNotifications(50); // Dapatkan lebih banyak untuk admin

            return response()->json([
                'success' => true,
                'data' => $notifications,
                'message' => 'Notifikasi admin berhasil diambil',
            ], 200);

        } catch (\Exception $e) {
            Log::error('Gagal mengambil notifikasi admin', [
                'error' => $e->getMessage(),
                'user_id' => Auth::id(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Gagal mengambil notifikasi admin',
                'error' => config('app.debug') ? $e->getMessage() : 'Terjadi kesalahan server internal',
            ], 500);
        }
    }

    /**
     * ✅ Dapatkan jumlah notifikasi yang belum dibaca
     */
    public function unreadCount()
    {
        try {
            $unreadCount = $this->getAdminUnreadCount();

            return response()->json([
                'success' => true,
                'data' => ['unread_count' => $unreadCount],
                'message' => 'Jumlah notifikasi yang belum dibaca berhasil diambil',
            ], 200);

        } catch (\Exception $e) {
            Log::error('Gagal mendapatkan jumlah notifikasi yang belum dibaca', [
                'error' => $e->getMessage(),
                'user_id' => Auth::id(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Gagal mengambil jumlah notifikasi yang belum dibaca',
                'error' => config('app.debug') ? $e->getMessage() : 'Terjadi kesalahan server internal',
            ], 500);
        }
    }

    /**
     * ✅ Tandai notifikasi sebagai sudah dibaca
     */
    public function markAsRead($notificationId)
    {
        try {
            // Karena kita tidak memiliki tabel notifikasi, kita akan mensimulasikannya
            // Anda dapat mengimplementasikan pelacakan baca aktual jika diperlukan nanti

            return response()->json([
                'success' => true,
                'message' => 'Notifikasi berhasil ditandai sebagai sudah dibaca',
            ], 200);

        } catch (\Exception $e) {
            Log::error('Gagal menandai notifikasi sebagai sudah dibaca', [
                'error' => $e->getMessage(),
                'notification_id' => $notificationId,
                'user_id' => Auth::id(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Gagal menandai notifikasi sebagai sudah dibaca',
                'error' => config('app.debug') ? $e->getMessage() : 'Terjadi kesalahan server internal',
            ], 500);
        }
    }

    /**
     * ✅ Tandai semua notifikasi sebagai sudah dibaca
     */
    public function markAllAsRead()
    {
        try {
            // Simulasi - tandai semua sebagai sudah dibaca
            return response()->json([
                'success' => true,
                'message' => 'Semua notifikasi berhasil ditandai sebagai sudah dibaca',
            ], 200);

        } catch (\Exception $e) {
            Log::error('Gagal menandai semua notifikasi sebagai sudah dibaca', [
                'error' => $e->getMessage(),
                'user_id' => Auth::id(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Gagal menandai semua notifikasi sebagai sudah dibaca',
                'error' => config('app.debug') ? $e->getMessage() : 'Terjadi kesalahan server internal',
            ], 500);
        }
    }

    /**
     * ✅ Broadcast notifikasi ke pengguna
     */
    public function broadcast(Request $request)
    {
        try {
            $request->validate([
                'title' => 'required|string|max:255',
                'message' => 'required|string',
                'type' => 'required|in:info,warning,error,success',
                'target' => 'required|in:all,tenants,admins',
            ]);

            // Di sini Anda akan mengimplementasikan broadcasting sebenarnya
            // Untuk sekarang, kita hanya akan mencatatnya
            Log::info('Permintaan broadcast notifikasi', [
                'title' => $request->title,
                'message' => $request->message,
                'type' => $request->type,
                'target' => $request->target,
                'from_user' => Auth::id(),
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Notifikasi berhasil disiarkan',
            ], 200);

        } catch (\Exception $e) {
            Log::error('Gagal menyiarkan notifikasi', [
                'error' => $e->getMessage(),
                'user_id' => Auth::id(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Gagal menyiarkan notifikasi',
                'error' => config('app.debug') ? $e->getMessage() : 'Terjadi kesalahan server internal',
            ], 500);
        }
    }

    /**
     * ✅ Dapatkan template notifikasi
     */
    public function templates()
    {
        try {
            $templates = [
                [
                    'id' => 1,
                    'name' => 'Pengingat Pembayaran',
                    'title' => 'Pengingat Jatuh Tempo Pembayaran',
                    'message' => 'Pembayaran Anda untuk bulan ini akan segera jatuh tempo. Mohon selesaikan pembayaran untuk menghindari denda keterlambatan.',
                    'type' => 'warning',
                ],
                [
                    'id' => 2,
                    'name' => 'Maintenance Sistem',
                    'title' => 'Maintenance Terjadwal',
                    'message' => 'Maintenance sistem dijadwalkan. Beberapa fitur mungkin tidak tersedia sementara.',
                    'type' => 'info',
                ],
                [
                    'id' => 3,
                    'name' => 'Pesan Selamat Datang',
                    'title' => 'Selamat Datang di Manajemen Kost',
                    'message' => 'Selamat datang! Silakan baca panduan dan hubungi kami jika ada pertanyaan.',
                    'type' => 'success',
                ],
                [
                    'id' => 4,
                    'name' => 'Update Kebijakan',
                    'title' => 'Update Kebijakan',
                    'message' => 'Kebijakan kami telah diperbarui. Silakan tinjau syarat dan ketentuan yang baru.',
                    'type' => 'info',
                ],
                [
                    'id' => 5,
                    'name' => 'Alert Darurat',
                    'title' => 'Alert Darurat',
                    'message' => 'Situasi darurat terdeteksi. Silakan ikuti prosedur darurat.',
                    'type' => 'error',
                ],
            ];

            return response()->json([
                'success' => true,
                'data' => $templates,
                'message' => 'Template notifikasi berhasil diambil',
            ], 200);

        } catch (\Exception $e) {
            Log::error('Gagal mendapatkan template notifikasi', [
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Gagal mengambil template notifikasi',
                'error' => config('app.debug') ? $e->getMessage() : 'Terjadi kesalahan server internal',
            ], 500);
        }
    }

    /**
     * ✅ Jadwalkan notifikasi
     */
    public function scheduleNotification(Request $request)
    {
        try {
            $request->validate([
                'title' => 'required|string|max:255',
                'message' => 'required|string',
                'type' => 'required|in:info,warning,error,success',
                'target' => 'required|in:all,tenants,admins',
                'scheduled_at' => 'required|date|after:now',
            ]);

            // Catat notifikasi terjadwal (implementasikan penjadwalan sebenarnya nanti)
            Log::info('Notifikasi dijadwalkan', [
                'title' => $request->title,
                'message' => $request->message,
                'type' => $request->type,
                'target' => $request->target,
                'scheduled_at' => $request->scheduled_at,
                'created_by' => Auth::id(),
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Notifikasi berhasil dijadwalkan',
            ], 200);

        } catch (\Exception $e) {
            Log::error('Gagal menjadwalkan notifikasi', [
                'error' => $e->getMessage(),
                'user_id' => Auth::id(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Gagal menjadwalkan notifikasi',
                'error' => config('app.debug') ? $e->getMessage() : 'Terjadi kesalahan server internal',
            ], 500);
        }
    }

    /**
     * Kirim notifikasi ke pengguna tertentu
     */
    public function sendToUser(Request $request)
    {
        try {
            $request->validate([
                'user_id' => 'required|exists:users,id',
                'title' => 'required|string|max:255',
                'message' => 'required|string',
                'type' => 'required|in:info,warning,error,success',
            ]);

            // Log notifikasi individual
            Log::info('Notifikasi dikirim ke pengguna tertentu', [
                'title' => $request->title,
                'message' => $request->message,
                'type' => $request->type,
                'target_user_id' => $request->user_id,
                'from_admin' => Auth::id(),
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Notifikasi berhasil dikirim ke pengguna',
            ], 200);

        } catch (\Exception $e) {
            Log::error('Gagal mengirim notifikasi ke pengguna', [
                'error' => $e->getMessage(),
                'user_id' => Auth::id(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Gagal mengirim notifikasi ke pengguna',
                'error' => config('app.debug') ? $e->getMessage() : 'Terjadi kesalahan server internal',
            ], 500);
        }
    }

    /**
     * Hapus notifikasi
     */
    public function destroy($notificationId)
    {
        try {
            // Simulasi penghapusan notifikasi
            Log::info('Notifikasi dihapus oleh admin', [
                'notification_id' => $notificationId,
                'admin_id' => Auth::id(),
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Notifikasi berhasil dihapus',
            ], 200);

        } catch (\Exception $e) {
            Log::error('Gagal menghapus notifikasi', [
                'error' => $e->getMessage(),
                'notification_id' => $notificationId,
                'user_id' => Auth::id(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Gagal menghapus notifikasi',
                'error' => config('app.debug') ? $e->getMessage() : 'Terjadi kesalahan server internal',
            ], 500);
        }
    }

    /**
     * Dapatkan statistik notifikasi
     */
    public function getNotificationStats()
    {
        try {
            $stats = [
                'total_sent' => 0, // Implementasikan berdasarkan data sebenarnya
                'total_read' => 0,
                'total_unread' => 0,
                'sent_today' => 0,
                'sent_this_week' => 0,
                'sent_this_month' => 0,
                'by_type' => [
                    'info' => 0,
                    'warning' => 0,
                    'error' => 0,
                    'success' => 0,
                ],
                'by_target' => [
                    'all' => 0,
                    'tenants' => 0,
                    'admins' => 0,
                ],
            ];

            return response()->json([
                'success' => true,
                'data' => $stats,
                'message' => 'Statistik notifikasi berhasil diambil',
            ], 200);

        } catch (\Exception $e) {
            Log::error('Gagal mendapatkan statistik notifikasi', [
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Gagal mengambil statistik notifikasi',
                'error' => config('app.debug') ? $e->getMessage() : 'Terjadi kesalahan server internal',
            ], 500);
        }
    }

    // ✅ PRIVATE HELPER METHODS

    /**
     * Dapatkan notifikasi admin dari data yang ada
     */
    private function getAdminNotifications($limit = 20)
    {
        $notifications = [];

        try {
            // Dapatkan pembayaran terlambat sebagai notifikasi
            $overduePayments = DB::table('payments')
                ->join('tenants', 'payments.tenant_id', '=', 'tenants.id')
                ->join('users', 'tenants.user_id', '=', 'users.id')
                ->where('payments.status', '!=', 'paid')
                ->where('payments.payment_month', '<', now()->format('Y-m'))
                ->select('payments.*', 'users.name as tenant_name')
                ->limit(5)
                ->get();

            foreach ($overduePayments as $payment) {
                $notifications[] = [
                    'id' => 'overdue_'.$payment->id,
                    'type' => 'warning',
                    'title' => 'Pembayaran Terlambat',
                    'message' => "Pembayaran dari {$payment->tenant_name} terlambat untuk {$payment->payment_month}",
                    'created_at' => $payment->created_at,
                    'read_at' => null,
                    'action_url' => '/admin/payments',
                    'priority' => 'high',
                ];
            }

            // Dapatkan penyewa baru sebagai notifikasi
            $newTenants = DB::table('tenants')
                ->join('users', 'tenants.user_id', '=', 'users.id')
                ->where('tenants.created_at', '>=', now()->subDays(7))
                ->select('tenants.*', 'users.name as tenant_name')
                ->limit(3)
                ->get();

            foreach ($newTenants as $tenant) {
                $notifications[] = [
                    'id' => 'new_tenant_'.$tenant->id,
                    'type' => 'success',
                    'title' => 'Penyewa Baru',
                    'message' => "Penyewa baru {$tenant->tenant_name} telah terdaftar",
                    'created_at' => $tenant->created_at,
                    'read_at' => null,
                    'action_url' => '/admin/tenants',
                    'priority' => 'medium',
                ];
            }

            // Dapatkan akses mencurigakan (jika ada logika untuk ini)
            $suspiciousAccess = DB::table('access_logs')
                ->join('users', 'access_logs.user_id', '=', 'users.id')
                ->where('access_logs.created_at', '>=', now()->subHours(24))
                ->where(function ($query) {
                    $query->whereTime('access_logs.accessed_at', '<', '06:00:00')
                        ->orWhereTime('access_logs.accessed_at', '>', '23:00:00');
                })
                ->select('access_logs.*', 'users.name as user_name')
                ->limit(2)
                ->get();

            foreach ($suspiciousAccess as $access) {
                $notifications[] = [
                    'id' => 'suspicious_access_'.$access->id,
                    'type' => 'warning',
                    'title' => 'Waktu Akses Tidak Biasa',
                    'message' => "{$access->user_name} mengakses gedung pada jam yang tidak biasa",
                    'created_at' => $access->accessed_at,
                    'read_at' => null,
                    'action_url' => '/admin/access-logs',
                    'priority' => 'medium',
                ];
            }

            // Urutkan berdasarkan created_at desc dan batasi
            usort($notifications, function ($a, $b) {
                return strtotime($b['created_at']) - strtotime($a['created_at']);
            });

            return array_slice($notifications, 0, $limit);

        } catch (\Exception $e) {
            Log::error('Error mendapatkan notifikasi admin', ['error' => $e->getMessage()]);

            return [];
        }
    }

    /**
     * Dapatkan jumlah notifikasi admin yang belum dibaca
     */
    private function getAdminUnreadCount()
    {
        try {
            $count = 0;

            // Hitung pembayaran terlambat
            $count += DB::table('payments')
                ->where('status', '!=', 'paid')
                ->where('payment_month', '<', now()->format('Y-m'))
                ->count();

            // Hitung penyewa baru dalam 3 hari terakhir
            $count += DB::table('tenants')
                ->where('created_at', '>=', now()->subDays(3))
                ->count();

            return min($count, 99); // Batasi di 99
        } catch (\Exception $e) {
            return 0;
        }
    }
}
