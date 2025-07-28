<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\ReceiptService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class ReceiptVerificationController extends Controller
{
    protected $receiptService;

    public function __construct(ReceiptService $receiptService)
    {
        $this->receiptService = $receiptService;
    }

    /**
     * Verify receipt authenticity
     */
    public function verify(Request $request, $receiptNumber)
    {
        try {
            // Validate receipt number format
            if (!preg_match('/^KWT-\d{8}-\d{6}$/', $receiptNumber)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Format nomor kwitansi tidak valid'
                ], 400);
            }

            // Verify receipt
            $verificationResult = $this->receiptService->verifyReceipt($receiptNumber);

            if (!$verificationResult) {
                return response()->json([
                    'success' => false,
                    'message' => 'Kwitansi tidak valid atau tidak ditemukan',
                    'data' => [
                        'valid' => false,
                        'receipt_number' => $receiptNumber
                    ]
                ], 404);
            }

            Log::info('Receipt verification successful', [
                'receipt_number' => $receiptNumber,
                'payment_id' => $verificationResult['payment_id'],
                'verifier_ip' => $request->ip()
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Kwitansi valid dan asli',
                'data' => $verificationResult
            ]);

        } catch (\Exception $e) {
            Log::error('Error verifying receipt', [
                'receipt_number' => $receiptNumber,
                'error' => $e->getMessage(),
                'ip' => $request->ip()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan saat memverifikasi kwitansi'
            ], 500);
        }
    }

    /**
     * Get verification page (for QR code)
     */
    public function showVerification(Request $request, $receiptNumber)
    {
        try {
            $verificationResult = $this->receiptService->verifyReceipt($receiptNumber);

            return view('receipts.verification', [
                'receipt_number' => $receiptNumber,
                'verification_result' => $verificationResult,
                'is_valid' => $verificationResult !== null
            ]);

        } catch (\Exception $e) {
            Log::error('Error showing verification page', [
                'receipt_number' => $receiptNumber,
                'error' => $e->getMessage()
            ]);

            return view('receipts.verification', [
                'receipt_number' => $receiptNumber,
                'verification_result' => null,
                'is_valid' => false,
                'error' => 'Terjadi kesalahan saat memverifikasi kwitansi'
            ]);
        }
    }
}