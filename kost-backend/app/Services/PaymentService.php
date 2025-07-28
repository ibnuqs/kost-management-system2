<?php
// app/Services/PaymentService.php

namespace App\Services;

use Midtrans\Config;
use Midtrans\Snap;
use Midtrans\Transaction;
use App\Models\Payment;
use App\Models\Tenant;
use Illuminate\Support\Facades\Log;
use Exception;

class PaymentService
{
    public function __construct()
    {
        // Configure Midtrans
        Config::$serverKey = config('midtrans.server_key');
        Config::$isProduction = config('midtrans.is_production');
        Config::$isSanitized = config('midtrans.is_sanitized');
        Config::$is3ds = config('midtrans.is_3ds');
    }

    /**
     * Create payment for tenant
     */
    public function createPayment($tenantId, $month, $amount)
    {
        try {
            $tenant = Tenant::with('user', 'room')->findOrFail($tenantId);
            
            // Generate unique order ID
            $orderId = 'KOST-' . $tenantId . '-' . date('Ym') . '-' . time();
            
            // Create payment record
            $payment = Payment::create([
                'order_id' => $orderId,
                'tenant_id' => $tenantId,
                'payment_month' => $month,
                'amount' => $amount,
                'status' => 'pending'
            ]);

            // Prepare transaction details for Midtrans
            $transactionDetails = [
                'order_id' => $orderId,
                'gross_amount' => $amount,
            ];

            $customerDetails = [
                'first_name' => $tenant->user->name,
                'email' => $tenant->user->email,
                'phone' => $tenant->user->phone,
            ];

            $itemDetails = [
                [
                    'id' => 'rent-' . $tenant->room->id,
                    'price' => $amount,
                    'quantity' => 1,
                    'name' => 'Sewa Kamar ' . $tenant->room->room_number . ' - ' . date('F Y', strtotime($month))
                ]
            ];

            $transactionData = [
                'transaction_details' => $transactionDetails,
                'customer_details' => $customerDetails,
                'item_details' => $itemDetails,
            ];

            // Get Snap token from Midtrans
            $snapToken = Snap::getSnapToken($transactionData);
            
            // Update payment with snap token
            $payment->update(['snap_token' => $snapToken]);

            Log::info("Payment created successfully for tenant {$tenantId}, order ID: {$orderId}");

            return [
                'success' => true,
                'payment' => $payment,
                'snap_token' => $snapToken,
                'redirect_url' => 'https://app.sandbox.midtrans.com/snap/v2/vtweb/' . $snapToken
            ];

        } catch (Exception $e) {
            Log::error('Payment creation failed: ' . $e->getMessage());
            return [
                'success' => false,
                'message' => $e->getMessage()
            ];
        }
    }

    /**
     * Handle payment notification from Midtrans
     */
    public function handleNotification($notification)
    {
        try {
            $orderId = $notification['order_id'];
            $transactionStatus = $notification['transaction_status'];
            $fraudStatus = $notification['fraud_status'] ?? '';

            // Verify signature
            $signatureKey = hash('sha512', 
                $orderId . 
                $notification['status_code'] . 
                $notification['gross_amount'] . 
                config('midtrans.server_key')
            );

            if ($signatureKey !== $notification['signature_key']) {
                throw new Exception('Invalid signature');
            }

            // Find payment record
            $payment = Payment::where('order_id', $orderId)->firstOrFail();

            // Update payment status based on transaction status
            if ($transactionStatus == 'capture') {
                if ($fraudStatus == 'challenge') {
                    $payment->update(['status' => 'pending']);
                } else if ($fraudStatus == 'accept') {
                    $payment->update([
                        'status' => 'paid',
                        'paid_at' => now(),
                        'payment_method' => $notification['payment_type'] ?? 'unknown'
                    ]);
                }
            } else if ($transactionStatus == 'settlement') {
                $payment->update([
                    'status' => 'paid',
                    'paid_at' => now(),
                    'payment_method' => $notification['payment_type'] ?? 'unknown'
                ]);
            } else if ($transactionStatus == 'pending') {
                $payment->update(['status' => 'pending']);
            } else if (in_array($transactionStatus, ['deny', 'expire', 'cancel'])) {
                $payment->update(['status' => 'overdue']);
            }

            Log::info("Payment notification processed for order {$orderId}: {$transactionStatus}");

            return [
                'success' => true,
                'payment' => $payment
            ];

        } catch (Exception $e) {
            Log::error('Payment notification processing failed: ' . $e->getMessage());
            return [
                'success' => false,
                'message' => $e->getMessage()
            ];
        }
    }

    /**
     * Get payment status from Midtrans
     */
    public function getPaymentStatus($orderId)
    {
        try {
            $status = Transaction::status($orderId);
            
            return [
                'success' => true,
                'status' => $status
            ];
        } catch (Exception $e) {
            Log::error('Get payment status failed: ' . $e->getMessage());
            return [
                'success' => false,
                'message' => $e->getMessage()
            ];
        }
    }

    /**
     * Cancel payment
     */
    public function cancelPayment($orderId)
    {
        try {
            $cancel = Transaction::cancel($orderId);
            
            // Update local payment record
            $payment = Payment::where('order_id', $orderId)->first();
            if ($payment) {
                $payment->update(['status' => 'overdue']);
            }

            return [
                'success' => true,
                'result' => $cancel
            ];
        } catch (Exception $e) {
            Log::error('Cancel payment failed: ' . $e->getMessage());
            return [
                'success' => false,
                'message' => $e->getMessage()
            ];
        }
    }
}