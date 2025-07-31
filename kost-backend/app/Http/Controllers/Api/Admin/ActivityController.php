<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class ActivityController extends Controller
{
    /**
     * Mengambil gabungan aktivitas terbaru dari berbagai sumber.
     */
    public function getRecentActivities(Request $request)
    {
        try {
            $perPage = min(50, max(5, (int) $request->get('per_page', 15)));

            $activities = Cache::remember("recent_activities_{$perPage}", 120, function () use ($perPage) {
                // Ambil data dari berbagai sumber
                $accessLogs = $this->getRecentAccessLogs(ceil($perPage / 3));
                $payments = $this->getRecentPayments(ceil($perPage / 3));
                $rfidActivities = $this->getRecentRfidActivities(ceil($perPage / 3));

                // Gabungkan semua aktivitas
                $allActivities = array_merge($accessLogs, $payments, $rfidActivities);

                // Urutkan semua aktivitas berdasarkan waktu (terbaru lebih dulu)
                usort($allActivities, fn ($a, $b) => strtotime($b['timestamp']) <=> strtotime($a['timestamp']));

                // Ambil sejumlah data sesuai per_page
                return array_slice($allActivities, 0, $perPage);
            });

            return response()->json([
                'success' => true,
                'data' => $activities,
                'message' => 'Aktivitas terbaru berhasil diambil.',
            ], 200);

        } catch (\Exception $e) {
            Log::error('Gagal mengambil aktivitas terbaru', ['error' => $e->getMessage()]);

            // Kembalikan array kosong jika terjadi error untuk mencegah crash di frontend
            return response()->json(['success' => false, 'message' => 'Gagal mengambil aktivitas.', 'data' => []], 500);
        }
    }

    /**
     * Helper untuk mengambil log akses terbaru.
     */
    private function getRecentAccessLogs(int $limit): array
    {
        try {
            return DB::table('access_logs')
                ->join('users', 'access_logs.user_id', '=', 'users.id')
                ->latest('access_logs.accessed_at')
                ->limit($limit)
                ->get(['users.name as user_name', 'access_logs.accessed_at as timestamp_val', 'access_logs.id', 'access_logs.notes'])
                ->map(fn ($log) => [
                    'id' => 'access_'.$log->id,
                    'type' => 'access',
                    'title' => 'Akses Ruangan',
                    'description' => $log->user_name.': '.($log->notes ?? 'Mengakses gedung.'),
                    'timestamp' => Carbon::parse($log->timestamp_val)->toISOString(),
                    'icon' => 'door-open',
                ])->toArray();
        } catch (\Exception $e) {
            Log::error('Gagal mengambil log akses terbaru: '.$e->getMessage());

            return []; // Kembalikan array kosong jika gagal
        }
    }

    /**
     * Helper untuk mengambil data pembayaran terbaru.
     */
    private function getRecentPayments(int $limit): array
    {
        try {
            return DB::table('payments')
                ->join('tenants', 'payments.tenant_id', '=', 'tenants.id')
                ->join('users', 'tenants.user_id', '=', 'users.id')
                ->where('payments.status', 'paid')
                ->latest('payments.paid_at')
                ->limit($limit)
                ->get(['payments.id', 'payments.amount', 'users.name as user_name', 'payments.paid_at as timestamp_val'])
                ->map(fn ($p) => [
                    'id' => 'payment_'.$p->id,
                    'type' => 'payment',
                    'title' => 'Pembayaran Diterima',
                    'description' => 'Pembayaran sebesar Rp '.number_format($p->amount, 0, ',', '.')." dari {$p->user_name}.",
                    'timestamp' => Carbon::parse($p->timestamp_val)->toISOString(),
                    'icon' => 'credit-card',
                ])->toArray();
        } catch (\Exception $e) {
            Log::error('Gagal mengambil pembayaran terbaru: '.$e->getMessage());

            return [];
        }
    }

    /**
     * Helper untuk mengambil aktivitas RFID terbaru.
     */
    private function getRecentRfidActivities(int $limit): array
    {
        try {
            return DB::table('rfid_cards')
                ->join('users', 'rfid_cards.user_id', '=', 'users.id')
                ->whereNotNull('rfid_cards.user_id')
                ->latest('rfid_cards.updated_at')
                ->limit($limit)
                ->get(['rfid_cards.id', 'rfid_cards.uid', 'users.name as user_name', 'rfid_cards.updated_at as timestamp_val'])
                ->map(fn ($card) => [
                    'id' => 'rfid_'.$card->id,
                    'type' => 'rfid',
                    'title' => 'Kartu RFID Dihubungkan',
                    'description' => "Kartu {$card->uid} dihubungkan ke {$card->user_name}.",
                    'timestamp' => Carbon::parse($card->timestamp_val)->toISOString(),
                    'icon' => 'id-card',
                ])->toArray();
        } catch (\Exception $e) {
            Log::error('Gagal mengambil aktivitas RFID terbaru: '.$e->getMessage());

            return [];
        }
    }
}
