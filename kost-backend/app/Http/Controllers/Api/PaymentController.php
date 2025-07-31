<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Payment;
use App\Services\MidtransService;

class PaymentController extends Controller
{
    protected $midtransService;

    public function __construct(MidtransService $midtransService)
    {
        $this->midtransService = $midtransService;
    }

    /**
     * Show payment details
     */
    public function show($id)
    {
        try {
            $payment = Payment::with(['tenant.user', 'tenant.room'])->findOrFail($id);

            return response()->json([
                'success' => true,
                'data' => [
                    'id' => $payment->id,
                    'order_id' => $payment->order_id,
                    'amount' => $payment->amount,
                    'payment_month' => $payment->payment_month,
                    'status' => $payment->status,
                    'payment_method' => $payment->payment_method,
                    'snap_token' => $payment->snap_token,
                    'payment_url' => $payment->payment_url,
                    'paid_at' => $payment->paid_at,
                    'created_at' => $payment->created_at,
                    'tenant' => $payment->tenant ? [
                        'id' => $payment->tenant->id,
                        'tenant_code' => $payment->tenant->tenant_code,
                        'user' => $payment->tenant->user ? [
                            'name' => $payment->tenant->user->name,
                            'email' => $payment->tenant->user->email,
                        ] : null,
                        'room' => $payment->tenant->room ? [
                            'room_number' => $payment->tenant->room->room_number,
                            'room_name' => $payment->tenant->room->room_name,
                        ] : null,
                    ] : null,
                ],
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Payment not found',
                'error' => $e->getMessage(),
            ], 404);
        }
    }

    /**
     * Check payment status from Midtrans
     */
    public function checkStatus($id)
    {
        try {
            $payment = Payment::findOrFail($id);

            if (! $payment->order_id) {
                return response()->json([
                    'success' => false,
                    'message' => 'Payment does not have order_id for status check',
                ], 422);
            }

            // Check status from Midtrans
            $result = $this->midtransService->checkPaymentStatus($payment->order_id);

            if ($result['success']) {
                // Update payment status based on Midtrans response
                $midtransStatus = $result['data']['transaction_status'] ?? '';
                $fraudStatus = $result['data']['fraud_status'] ?? '';

                $newStatus = $this->mapMidtransStatus($midtransStatus, $fraudStatus);

                if ($newStatus && $payment->status !== $newStatus) {
                    $payment->update([
                        'status' => $newStatus,
                        'payment_method' => $result['data']['payment_type'] ?? $payment->payment_method,
                        'paid_at' => in_array($newStatus, ['paid', 'success']) ? now() : $payment->paid_at,
                    ]);
                }

                return response()->json([
                    'success' => true,
                    'data' => [
                        'payment_id' => $payment->id,
                        'order_id' => $payment->order_id,
                        'local_status' => $payment->fresh()->status,
                        'midtrans_status' => $midtransStatus,
                        'fraud_status' => $fraudStatus,
                        'payment_type' => $result['data']['payment_type'] ?? null,
                        'status_updated' => $payment->status !== $newStatus,
                    ],
                ]);
            } else {
                return response()->json([
                    'success' => false,
                    'message' => 'Failed to check payment status from Midtrans',
                    'error' => $result['error'] ?? 'Unknown error',
                ], 500);
            }
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error checking payment status',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Map Midtrans status to local status
     */
    private function mapMidtransStatus($transactionStatus, $fraudStatus = '')
    {
        switch ($transactionStatus) {
            case 'capture':
                return $fraudStatus === 'challenge' ? 'challenge' : 'paid';
            case 'settlement':
                return 'paid';
            case 'pending':
                return 'pending';
            case 'deny':
                return 'failed';
            case 'cancel':
                return 'cancelled';
            case 'expire':
                return 'expired';
            case 'failure':
                return 'failed';
            default:
                return null;
        }
    }
}
