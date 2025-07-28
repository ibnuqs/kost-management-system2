<?php

namespace App\Http\Controllers\Api\Tenant;

use App\Http\Controllers\Controller;
use App\Models\Tenant;
use App\Models\Payment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;

class ProfileController extends Controller
{
    /**
     * Menampilkan profil dan ringkasan data untuk penyewa yang login.
     */
    public function show(Request $request)
    {
        try {
            $user = $request->user();
            $tenant = Tenant::with(['room:id,room_number'])->where('user_id', $user->id)->where('status', 'active')->firstOrFail();

            // Statistik ringkas
            $stats = [
                'total_pembayaran_lunas' => $tenant->payments()->where('status', 'paid')->count(),
                'total_nominal_dibayar' => $tenant->payments()->where('status', 'paid')->sum('amount'),
                'jumlah_tagihan_tertunda' => $tenant->payments()->whereIn('status', ['pending', 'expired'])->count(),
                'hari_sejak_masuk' => $tenant->start_date ? now()->diffInDays($tenant->start_date) : 0,
            ];

            $profileData = [
                'user_info' => [
                    'name' => $user->name,
                    'email' => $user->email,
                    'phone' => $user->phone,
                ],
                'tenant_info' => $tenant,
                'quick_stats' => $stats,
            ];

            return response()->json(['success' => true, 'data' => $profileData, 'message' => 'Profil Anda berhasil diambil.']);
        } catch (\Exception $e) {
            Log::error('Gagal mengambil profil penyewa: ' . $e->getMessage(), ['user_id' => $request->user()->id]);
            return response()->json(['success' => false, 'message' => 'Gagal mengambil data profil.'], 500);
        }
    }

    /**
     * Memperbarui profil penyewa (data pengguna).
     */
    public function update(Request $request)
    {
        try {
            $user = $request->user();
            
            $validator = Validator::make($request->all(), [
                'name' => 'required|string|max:255',
                'phone' => 'nullable|string|max:20',
            ]);

            if ($validator->fails()) {
                return response()->json(['success' => false, 'message' => 'Validasi gagal.', 'errors' => $validator->errors()], 422);
            }
            
            $user->update($validator->validated());

            return response()->json(['success' => true, 'data' => $user, 'message' => 'Profil berhasil diperbarui.']);
        } catch (\Exception $e) {
            Log::error('Gagal memperbarui profil penyewa: ' . $e->getMessage(), ['user_id' => $request->user()->id]);
            return response()->json(['success' => false, 'message' => 'Gagal memperbarui profil.'], 500);
        }
    }
}
