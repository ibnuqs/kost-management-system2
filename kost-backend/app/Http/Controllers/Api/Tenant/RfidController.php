<?php

namespace App\Http\Controllers\Api\Tenant;

use App\Http\Controllers\Controller;
use App\Models\RfidCard;
use App\Models\Tenant;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;

class RfidController extends Controller
{
    /**
     * Get tenant's RFID cards
     */
    public function cards(Request $request)
    {
        try {
            $user = Auth::user();

            $cards = RfidCard::where('user_id', $user->id)
                ->with('tenant.room')
                ->orderBy('created_at', 'desc')
                ->get()
                ->map(function ($card) {
                    return [
                        'id' => $card->id,
                        'uid' => $card->uid,
                        'user_id' => $card->user_id,
                        'tenant_id' => $card->tenant_id,
                        'card_type' => $card->card_type,
                        'status' => $card->status,
                        'issued_date' => $card->created_at->format('Y-m-d'),
                        'created_at' => $card->created_at->format('c'),
                        'updated_at' => $card->updated_at->format('c'),
                        'last_used' => null, // Bisa ditambahkan dari access_logs
                        'usage_count' => 0, // Bisa dihitung dari access_logs
                        'room' => $card->tenant && $card->tenant->room ? [
                            'id' => $card->tenant->room->id,
                            'room_number' => $card->tenant->room->room_number,
                            'room_name' => $card->tenant->room->room_name,
                        ] : null,
                    ];
                });

            return response()->json([
                'success' => true,
                'data' => $cards->toArray(),
                'message' => 'RFID cards retrieved successfully',
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve RFID cards: '.$e->getMessage(),
            ], 500);
        }
    }

    /**
     * Request new RFID card
     */
    public function requestCard(Request $request)
    {
        try {
            $user = Auth::user();

            $tenant = Tenant::where('user_id', $user->id)
                ->where('status', Tenant::STATUS_ACTIVE)
                ->first();

            if (! $tenant) {
                return response()->json([
                    'success' => false,
                    'message' => 'Active tenant record not found',
                ], 404);
            }

            $validator = Validator::make($request->all(), [
                'reason' => 'required|string|max:500',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors(),
                ], 422);
            }

            // Check if tenant already has active cards
            $activeCards = RfidCard::where('user_id', $user->id)
                ->where('status', 'active')
                ->count();

            if ($activeCards >= 2) { // Limit to 2 cards per tenant
                return response()->json([
                    'success' => false,
                    'message' => 'You already have the maximum number of active RFID cards (2)',
                ], 422);
            }

            // Untuk sekarang, kita buat record request atau langsung buat card
            // Tergantung workflow yang diinginkan

            // Simulasi: Langsung buat card dengan status 'pending'
            $newCard = RfidCard::create([
                'uid' => 'REQ-'.time().'-'.$user->id, // Temporary UID untuk request
                'user_id' => $user->id,
                'tenant_id' => $tenant->id,
                'card_type' => 'primary',
                'status' => 'inactive', // Admin akan mengubah ke 'active' dan set UID yang benar
            ]);

            return response()->json([
                'success' => true,
                'data' => [
                    'message' => 'RFID card request submitted successfully',
                    'request_id' => $newCard->id,
                    'status' => 'pending',
                    'reason' => $request->reason,
                ],
                'message' => 'RFID card request submitted successfully',
            ], 201);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to submit RFID card request: '.$e->getMessage(),
            ], 500);
        }
    }

    /**
     * Report lost RFID card
     */
    public function reportLost(Request $request)
    {
        try {
            $user = Auth::user();

            $validator = Validator::make($request->all(), [
                'card_id' => 'required|integer|exists:rfid_cards,id',
                'reason' => 'required|string|max:500',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors(),
                ], 422);
            }

            $card = RfidCard::where('id', $request->card_id)
                ->where('user_id', $user->id)
                ->first();

            if (! $card) {
                return response()->json([
                    'success' => false,
                    'message' => 'RFID card not found or does not belong to you',
                ], 404);
            }

            if ($card->status === 'lost') {
                return response()->json([
                    'success' => false,
                    'message' => 'This card has already been reported as lost',
                ], 422);
            }

            // Update card status to lost
            $card->update([
                'status' => 'lost',
                // Bisa tambahkan field 'lost_reason', 'lost_at', dll jika ada
            ]);

            return response()->json([
                'success' => true,
                'data' => [
                    'card_id' => $card->id,
                    'uid' => $card->uid,
                    'status' => $card->status,
                    'reason' => $request->reason,
                ],
                'message' => 'RFID card reported as lost successfully',
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to report lost card: '.$e->getMessage(),
            ], 500);
        }
    }

    /**
     * Toggle RFID card status (activate/deactivate)
     */
    public function toggleStatus(Request $request, $cardId)
    {
        try {
            $user = Auth::user();

            $validator = Validator::make($request->all(), [
                'status' => 'required|in:active,inactive',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors(),
                ], 422);
            }

            $card = RfidCard::where('id', $cardId)
                ->where('user_id', $user->id)
                ->first();

            if (! $card) {
                return response()->json([
                    'success' => false,
                    'message' => 'RFID card not found or does not belong to you',
                ], 404);
            }

            // Update card status
            $card->update([
                'status' => $request->status,
            ]);

            $statusText = $request->status === 'active' ? 'diaktifkan' : 'dinonaktifkan';

            return response()->json([
                'success' => true,
                'data' => [
                    'card_id' => $card->id,
                    'uid' => $card->uid,
                    'status' => $card->status,
                ],
                'message' => "Kartu RFID berhasil {$statusText}",
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update card status: '.$e->getMessage(),
            ], 500);
        }
    }
}
