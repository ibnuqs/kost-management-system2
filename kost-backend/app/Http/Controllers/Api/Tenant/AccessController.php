<?php

namespace App\Http\Controllers\Api\Tenant;

use App\Http\Controllers\Controller;
use App\Models\AccessLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;

class AccessController extends Controller
{
    /**
     * Menampilkan riwayat akses untuk penyewa yang sedang login.
     */
    public function index(Request $request)
    {
        try {
            $user = Auth::user();

            $query = AccessLog::where('user_id', $user->id)->with(['room']);

            // Filter berdasarkan rentang tanggal
            if ($request->filled('date_from')) {
                $query->whereDate('accessed_at', '>=', Carbon::parse($request->date_from));
            }
            if ($request->filled('date_to')) {
                $query->whereDate('accessed_at', '<=', Carbon::parse($request->date_to));
            }
            if ($request->filled('access_granted') && $request->access_granted !== 'all') {
                $query->where('access_granted', $request->boolean('access_granted'));
            }
            
            $perPage = min(100, max(10, (int) $request->get('per_page', 15)));
            $logs = $query->orderBy('accessed_at', 'desc')->paginate($perPage);

            return response()->json([
                'success' => true,
                'data' => $logs,
                'message' => 'Riwayat akses berhasil diambil.'
            ]);
        } catch (\Exception $e) {
            Log::error('Gagal mengambil riwayat akses penyewa: ' . $e->getMessage(), ['user_id' => Auth::id()]);
            return response()->json(['success' => false, 'message' => 'Gagal mengambil riwayat akses.'], 500);
        }
    }

    /**
     * Menampilkan statistik dan pola akses untuk penyewa.
     */
    public function stats(Request $request)
    {
        try {
            $user = Auth::user();
            $query = AccessLog::where('user_id', $user->id);

            $totalCount = (clone $query)->count();
            $grantedCount = (clone $query)->where('access_granted', true)->count();

            $stats = [
                'total_akses' => $totalCount,
                'akses_berhasil' => $grantedCount,
                'akses_gagal' => $totalCount - $grantedCount,
                'tingkat_keberhasilan' => $totalCount > 0 ? round(($grantedCount / $totalCount) * 100, 2) : 0,
                'akses_terakhir' => (clone $query)->where('access_granted', true)->latest('accessed_at')->first(),
                'pola_harian' => $this->getAccessPatterns($user->id, 'DAYNAME'),
                'pola_jam' => $this->getAccessPatterns($user->id, 'HOUR'),
            ];

            return response()->json([
                'success' => true,
                'data' => $stats,
                'message' => 'Statistik akses berhasil diambil.'
            ]);

        } catch (\Exception $e) {
            Log::error('Gagal mengambil statistik akses penyewa: ' . $e->getMessage(), ['user_id' => Auth::id()]);
            return response()->json(['success' => false, 'message' => 'Gagal mengambil statistik akses.'], 500);
        }
    }

    /**
     * Metode bantu untuk mendapatkan pola akses berdasarkan unit waktu.
     * @param int $userId
     * @param string $timeUnit (DAYNAME atau HOUR)
     * @return array
     */
    private function getAccessPatterns(int $userId, string $timeUnit): array
    {
        try {
            $column = strtolower($timeUnit); // 'dayname' atau 'hour'
            return AccessLog::where('user_id', $userId)
                ->select(DB::raw("{$timeUnit}(accessed_at) as {$column}, COUNT(*) as jumlah"))
                ->groupBy(DB::raw("{$timeUnit}(accessed_at)"))
                ->orderBy('jumlah', 'desc')
                ->get()
                ->toArray();
        } catch (\Exception $e) {
            Log::warning("Gagal mengambil pola akses {$timeUnit}: " . $e->getMessage());
            return [];
        }
    }
}
