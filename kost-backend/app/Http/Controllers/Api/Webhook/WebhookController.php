<?php

// PERBAIKAN: Namespace disesuaikan dengan jalur file yang Anda inginkan
// Jika file berada di 'app/Http/Controllers/Api/Webhook/WebhookController.php'

namespace App\Http\Controllers\Api\Webhook;

use App\Http\Controllers\Controller;
// PERBAIKAN: use App\Models\Payment; (menggunakan backslash \)
use App\Models\Payment;
// PERBAIKAN: use App\Services\MidtransService; (menggunakan backslash \)
use App\Services\MidtransService;
// PERBAIKAN: use Illuminate\Http\Request; (menggunakan backslash \)
use Illuminate\Http\Request;
// PERBAIKAN: use Illuminate\Support\Facades\Log; (menggunakan backslash \)
use Illuminate\Support\Facades\Log;

// PERBAIKAN: use Illuminate\Support\Facades\Hash; (menggunakan backslash \)

class WebhookController extends Controller
{
    protected $midtransService;

    public function __construct(MidtransService $midtransService)
    {
        $this->midtransService = $midtransService;
    }

    /**
     * Handle Midtrans webhook notification.
     * This is the main method for processing all Midtrans notifications.
     */
    public function midtransWebhook(Request $request)
    {
        try {
            Log::info('Midtrans Webhook Received:', $request->all());

            // Check for subscription/recurring notifications
            if ($request->has('schedule') && $request->has('token')) {
                Log::info('Received subscription notification, acknowledging');

                return response()->json([
                    'status' => 'ok',
                    'message' => 'subscription notification received',
                ], 200);
            }

            // Check for test notifications (Midtrans' dummy notifications often have 'name' field)
            if ($request->has('name') && str_contains($request->get('name', ''), 'SUBSCRIBE-')) {
                Log::info('Received test notification, acknowledging');

                return response()->json([
                    'status' => 'ok',
                    'message' => 'test notification received',
                ], 200);
            }

            // Check for payment notifications (should have order_id)
            if (! $request->has('order_id')) {
                Log::warning('Webhook missing order_id, might be other notification type', [
                    'available_keys' => array_keys($request->all()),
                ]);

                return response()->json([
                    'status' => 'ok',
                    'message' => 'notification acknowledged',
                ], 200);
            }

            $orderId = $request->order_id;
            $statusCode = $request->status_code;
            $grossAmount = $request->gross_amount;
            $signatureKey = $request->signature_key;
            $transactionStatus = $request->transaction_status;

            // Validate required fields for payment notification
            if (! $statusCode || ! $grossAmount || ! $signatureKey) {
                Log::warning('Missing required payment fields', [
                    'order_id' => $orderId,
                    'missing_fields' => [
                        'status_code' => ! $statusCode,
                        'gross_amount' => ! $grossAmount,
                        'signature_key' => ! $signatureKey,
                    ],
                ]);

                return response()->json([
                    'status' => 'ok',
                    'message' => 'incomplete payment data but acknowledged',
                ], 200);
            }

            $serverKey = env('MIDTRANS_SERVER_KEY');

            if (! $serverKey) {
                Log::error('Midtrans server key not configured');

                return response()->json([
                    'status' => 'ok',
                    'message' => 'server configuration issue but acknowledged',
                ], 200);
            }

            // Verify signature to ensure notification authenticity
            $mySignature = hash('sha512', $orderId.$statusCode.$grossAmount.$serverKey);

            if ($mySignature !== $signatureKey) {
                Log::error('Invalid signature for order', [
                    'order_id' => $orderId,
                    'received_signature' => $signatureKey,
                    'calculated_signature' => $mySignature,
                ]);

                return response()->json([
                    'status' => 'ok',
                    'message' => 'invalid signature but acknowledged',
                ], 200);
            }

            // Find payment in your database
            $payment = Payment::where('order_id', $orderId)->first();

            if (! $payment) {
                Log::error('Payment not found for order: '.$orderId);

                return response()->json([
                    'status' => 'ok',
                    'message' => 'payment not found but acknowledged',
                ], 200);
            }

            Log::info('Payment before update', [
                'order_id' => $orderId,
                'current_status' => $payment->status,
                'new_transaction_status' => $transactionStatus,
            ]);

            // Update payment status based on Midtrans transaction status
            switch ($transactionStatus) {
                case 'settlement':
                case 'capture':
                    $payment->update([
                        'status' => 'paid',
                        'paid_at' => now(),
                        'payment_method' => $request->payment_type ?? null,
                        'transaction_id' => $request->transaction_id ?? null,
                        'updated_at' => now(),
                    ]);
                    Log::info("✅ Payment {$orderId} marked as PAID");
                    break;

                case 'pending':
                    $payment->update([
                        'status' => 'pending',
                        'updated_at' => now(),
                    ]);
                    Log::info("⏳ Payment {$orderId} status: PENDING");
                    break;

                case 'deny':
                case 'cancel':
                case 'failure':
                    $payment->update([
                        'status' => 'failed',
                        'failed_at' => now(),
                        'failure_reason' => $transactionStatus,
                        'updated_at' => now(),
                    ]);
                    Log::info("❌ Payment {$orderId} marked as FAILED: {$transactionStatus}");
                    break;

                case 'expire':
                    $payment->update([
                        'status' => 'expired',
                        'expired_at' => now(),
                        'failure_reason' => 'Payment expired',
                        'updated_at' => now(),
                    ]);
                    Log::info("⏰ Payment {$orderId} marked as EXPIRED");
                    break;

                default:
                    Log::warning("⚠️ Unknown transaction status for {$orderId}: {$transactionStatus}");
                    break;
            }

            $payment->refresh(); // Reload the model to get updated attributes
            Log::info('Payment after update', [
                'order_id' => $orderId,
                'final_status' => $payment->status,
                'paid_at' => $payment->paid_at,
                'expired_at' => $payment->expired_at,
                'payment_method' => $payment->payment_method,
            ]);

            return response()->json([
                'status' => 'ok',
                'message' => 'Webhook processed successfully',
                'data' => [
                    'order_id' => $orderId,
                    'transaction_status' => $transactionStatus,
                    'payment_status' => $payment->status,
                ],
            ], 200);

        } catch (\Exception $e) {
            Log::error('Failed to process Midtrans webhook', [
                'error' => $e->getMessage(),
                'line' => $e->getLine(),
                'file' => $e->getFile(),
                'request_data' => $request->all(),
                'trace' => $e->getTraceAsString(),
            ]);

            // Always return 200 OK for webhooks to prevent Midtrans from retrying excessively
            return response()->json([
                'status' => 'ok',
                'message' => 'webhook received but processing failed',
            ], 200);
        }
    }

    /**
     * Alias for midtransWebhook.
     */
    public function paymentWebhook(Request $request)
    {
        return $this->midtransWebhook($request);
    }

    /**
     * Alias for midtransWebhook.
     */
    public function handleMidtransWebhook(Request $request)
    {
        return $this->midtransWebhook($request);
    }

    /**
     * Test webhook endpoint.
     * Useful for debugging webhook reception.
     */
    public function testWebhook(Request $request)
    {
        Log::info('Webhook Test Endpoint Hit:', $request->all());

        return response()->json([
            'status' => 'test received',
            'message' => 'Webhook test endpoint working',
            'data' => $request->all(),
            'timestamp' => now()->toDateTimeString(),
            'server_info' => [
                'php_version' => PHP_VERSION,
                'laravel_version' => app()->version(),
                'environment' => app()->environment(),
            ],
        ], 200);
    }
}
