<?php

namespace App\Http\Controllers\Api\Tenant;

use App\Http\Controllers\Controller;
use App\Models\Payment;
use App\Services\ReceiptService;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;

class ReceiptController extends Controller
{
    protected $receiptService;

    public function __construct(ReceiptService $receiptService)
    {
        $this->receiptService = $receiptService;
    }

    /**
     * Download receipt for a payment
     */
    public function download(Request $request, $paymentId)
    {
        try {
            $user = Auth::user();
            
            Log::info('Receipt download requested', [
                'user_id' => $user->id,
                'payment_id' => $paymentId
            ]);
            
            // Get payment and verify ownership
            $payment = Payment::with(['tenant.user', 'tenant.room'])
                ->whereHas('tenant', function ($query) use ($user) {
                    $query->where('user_id', $user->id);
                })
                ->findOrFail($paymentId);

            Log::info('Payment found', [
                'payment_id' => $payment->id,
                'status' => $payment->status,
                'paid_at' => $payment->paid_at
            ]);

            // Check if payment is paid
            if ($payment->status !== 'paid') {
                return response()->json([
                    'success' => false,
                    'message' => 'Kwitansi hanya tersedia untuk pembayaran yang sudah lunas',
                    'debug' => [
                        'payment_status' => $payment->status,
                        'payment_id' => $payment->id
                    ]
                ], 400);
            }

            // Check dependencies first
            Log::info('Checking DomPDF dependency');
            if (!class_exists('\Dompdf\Dompdf')) {
                Log::error('DomPDF class not found');
                return response()->json([
                    'success' => false,
                    'message' => 'PDF library tidak tersedia. Silakan hubungi administrator.',
                    'debug' => [
                        'error' => 'DomPDF not installed'
                    ]
                ], 500);
            }
            Log::info('DomPDF dependency check passed');

            // Generate receipt
            Log::info('About to call generateReceipt method');
            $receiptPath = $this->receiptService->generateReceipt($payment);
            
            Log::info('Receipt generated', [
                'path' => $receiptPath
            ]);
            
            // Check if file exists
            if (!Storage::disk('public')->exists($receiptPath)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Kwitansi tidak dapat dibuat. Silakan coba lagi.',
                    'debug' => [
                        'receipt_path' => $receiptPath,
                        'storage_disk' => 'public'
                    ]
                ], 500);
            }

            // Get file content
            $fileContent = Storage::disk('public')->get($receiptPath);
            $fileName = basename($receiptPath);

            Log::info('Receipt downloaded successfully', [
                'user_id' => $user->id,
                'payment_id' => $paymentId,
                'file_size' => strlen($fileContent),
                'file_name' => $fileName
            ]);

            // Determine content type based on file extension
            $contentType = str_ends_with($receiptPath, '.pdf') ? 'application/pdf' : 'text/plain';

            return response($fileContent, 200, [
                'Content-Type' => $contentType,
                'Content-Disposition' => "attachment; filename=\"{$fileName}\"",
                'Content-Length' => strlen($fileContent),
                'Cache-Control' => 'no-cache, no-store, must-revalidate',
                'Pragma' => 'no-cache',
                'Expires' => '0'
            ]);

        } catch (\Exception $e) {
            Log::error('Error downloading receipt', [
                'user_id' => Auth::id(),
                'payment_id' => $paymentId,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan saat mengunduh kwitansi: ' . $e->getMessage(),
                'debug' => [
                    'error_class' => get_class($e),
                    'error_message' => $e->getMessage(),
                    'file' => $e->getFile(),
                    'line' => $e->getLine()
                ]
            ], 500);
        }
    }

    /**
     * Get receipt URL for a payment
     */
    public function getUrl(Request $request, $paymentId)
    {
        try {
            $user = Auth::user();
            
            // Get payment and verify ownership
            $payment = Payment::with(['tenant.user', 'tenant.room'])
                ->whereHas('tenant', function ($query) use ($user) {
                    $query->where('user_id', $user->id);
                })
                ->findOrFail($paymentId);

            // Check if payment is paid
            if ($payment->status !== 'paid') {
                return response()->json([
                    'success' => false,
                    'message' => 'Kwitansi hanya tersedia untuk pembayaran yang sudah lunas'
                ], 400);
            }

            // Generate receipt URL
            $receiptUrl = $this->receiptService->getReceiptUrl($payment);

            return response()->json([
                'success' => true,
                'data' => [
                    'receipt_url' => $receiptUrl,
                    'payment_id' => $payment->id,
                    'order_id' => $payment->order_id,
                    'amount' => $payment->amount,
                    'paid_at' => $payment->paid_at
                ]
            ]);

        } catch (\Exception $e) {
            Log::error('Error getting receipt URL', [
                'user_id' => Auth::id(),
                'payment_id' => $paymentId,
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan saat memuat kwitansi'
            ], 500);
        }
    }

    /**
     * Check if receipt is available for a payment
     */
    public function checkAvailability(Request $request, $paymentId)
    {
        try {
            $user = Auth::user();
            
            // Get payment and verify ownership
            $payment = Payment::whereHas('tenant', function ($query) use ($user) {
                $query->where('user_id', $user->id);
            })->findOrFail($paymentId);

            $available = $payment->status === 'paid' && $payment->paid_at !== null;

            return response()->json([
                'success' => true,
                'data' => [
                    'available' => $available,
                    'payment_id' => $payment->id,
                    'status' => $payment->status,
                    'paid_at' => $payment->paid_at,
                    'reason' => $available ? 'Kwitansi tersedia' : 'Kwitansi hanya tersedia untuk pembayaran yang sudah lunas'
                ]
            ]);

        } catch (\Exception $e) {
            Log::error('Error checking receipt availability', [
                'user_id' => Auth::id(),
                'payment_id' => $paymentId,
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan saat memeriksa ketersediaan kwitansi'
            ], 500);
        }
    }
}