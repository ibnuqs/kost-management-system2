<?php

namespace App\Http\Controllers\Api\Tenant;

use App\Http\Controllers\Controller;
use App\Models\Room;
use App\Models\Tenant;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class RoomController extends Controller
{
    /**
     * Menampilkan detail kamar yang sedang ditempati oleh penyewa yang login.
     */
    public function myRoom(Request $request)
    {
        try {
            $user = $request->user();

            // Cari data penyewa aktif berdasarkan user yang login
            $tenant = Tenant::where('user_id', $user->id)
                ->where('status', 'active')
                ->first();

            if (! $tenant) {
                return response()->json(['success' => false, 'message' => 'Anda saat ini tidak menempati kamar manapun.'], 404);
            }

            // Ambil data kamar berdasarkan room_id dari data penyewa
            $room = Room::with(['tenant.user'])->find($tenant->room_id);

            if (! $room) {
                return response()->json(['success' => false, 'message' => 'Informasi kamar tidak ditemukan.'], 404);
            }

            return response()->json([
                'success' => true,
                'data' => $room,
                'message' => 'Data kamar Anda berhasil diambil.',
            ]);

        } catch (\Exception $e) {
            Log::error('Gagal mengambil data kamar penyewa: '.$e->getMessage(), ['user_id' => $request->user()->id]);

            return response()->json(['success' => false, 'message' => 'Terjadi kesalahan saat mengambil data kamar.'], 500);
        }
    }
}
