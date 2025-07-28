<?php

namespace App\Services;

use App\Models\Payment;
use App\Models\Tenant;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\View;
use Illuminate\Support\Str;

class ReceiptService
{
    /**
     * Generate receipt PDF for a payment
     */
    public function generateReceipt(Payment $payment): string
    {
        Log::info('Starting receipt generation', [
            'payment_id' => $payment->id,
            'payment_status' => $payment->status,
            'payment_amount' => $payment->amount
        ]);

        // Validate payment can have receipt
        if (!$this->canGenerateReceipt($payment)) {
            throw new \Exception('Kwitansi hanya dapat dibuat untuk pembayaran yang sudah lunas');
        }

        // Get receipt file path
        $receiptPath = $this->getReceiptPath($payment);
        Log::info('Receipt path determined', ['path' => $receiptPath]);

        // Check if receipt already exists
        if (Storage::disk('public')->exists($receiptPath)) {
            Log::info('Receipt already exists', ['payment_id' => $payment->id, 'path' => $receiptPath]);
            return $receiptPath;
        }

        try {
            // Generate new receipt
            Log::info('Preparing receipt data');
            $receiptData = $this->prepareReceiptData($payment);
            Log::info('Receipt data prepared', ['data_keys' => array_keys($receiptData)]);
            
            Log::info('Generating HTML');
            $html = $this->generateReceiptHtml($receiptData);
            Log::info('HTML generated', ['html_length' => strlen($html)]);
            
            // Convert HTML to PDF
            Log::info('Converting HTML to PDF');
            try {
                $pdfContent = $this->convertHtmlToPdf($html);
                Log::info('PDF converted', ['pdf_size' => strlen($pdfContent)]);
            } catch (\Exception $e) {
                Log::error('PDF conversion failed, creating fallback text file', ['error' => $e->getMessage()]);
                // Create a simple text receipt as fallback
                $pdfContent = $this->createTextReceipt($receiptData);
                $receiptPath = str_replace('.pdf', '.txt', $receiptPath);
            }
            
            // Save receipt to storage
            Log::info('Saving receipt to storage');
            Storage::disk('public')->put($receiptPath, $pdfContent);
            
            Log::info('Receipt generated successfully', [
                'payment_id' => $payment->id,
                'path' => $receiptPath,
                'size' => strlen($pdfContent)
            ]);

            return $receiptPath;
        } catch (\Exception $e) {
            Log::error('Error generating receipt', [
                'payment_id' => $payment->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            throw $e;
        }
    }

    /**
     * Get receipt URL for download
     */
    public function getReceiptUrl(Payment $payment): string
    {
        $receiptPath = $this->generateReceipt($payment);
        return Storage::disk('public')->url($receiptPath);
    }

    /**
     * Check if receipt can be generated for this payment
     */
    private function canGenerateReceipt(Payment $payment): bool
    {
        return $payment->status === 'paid' && $payment->paid_at !== null;
    }

    /**
     * Get receipt file path
     */
    private function getReceiptPath(Payment $payment): string
    {
        $receiptNumber = $this->generateReceiptNumber($payment);
        $filename = "kwitansi_{$receiptNumber}.pdf";
        return "receipts/{$filename}";
    }

    /**
     * Generate unique receipt number
     */
    private function generateReceiptNumber(Payment $payment): string
    {
        $date = Carbon::parse($payment->paid_at)->format('Ymd');
        $paymentId = str_pad($payment->id, 6, '0', STR_PAD_LEFT);
        return "KWT-{$date}-{$paymentId}";
    }

    /**
     * Prepare data for receipt generation
     */
    private function prepareReceiptData(Payment $payment): array
    {
        $payment->load(['tenant.user', 'tenant.room']);
        
        $tenant = $payment->tenant;
        $user = $tenant->user;
        $room = $tenant->room;
        
        $receiptNumber = $this->generateReceiptNumber($payment);
        $verificationUrl = url("/receipt/verify/{$receiptNumber}");
        
        return [
            // Receipt Info
            'receipt_number' => $receiptNumber,
            'generated_at' => now()->format('d/m/Y H:i:s'),
            'verification_url' => $verificationUrl,
            'qr_code_data' => $verificationUrl,
            
            // Company Info
            'company_name' => config('app.name', 'Kost Management System'),
            'company_address' => config('app.address', 'Jl. Contoh No. 123, Kota Contoh'),
            'company_phone' => config('app.phone', '0812-3456-7890'),
            'company_email' => config('app.email', 'info@kostmanagement.com'),
            
            // Payment Info
            'payment_id' => $payment->id,
            'order_id' => $payment->order_id,
            'amount' => $payment->amount,
            'amount_words' => $this->convertNumberToWords($payment->amount),
            'payment_method' => $payment->payment_method ?? 'Transfer Bank',
            'payment_month' => $payment->payment_month,
            'paid_at' => Carbon::parse($payment->paid_at)->format('d/m/Y H:i:s'),
            'status' => 'LUNAS',
            
            // Tenant Info
            'tenant_name' => $user->name,
            'tenant_email' => $user->email,
            'tenant_phone' => $user->phone ?? '-',
            'room_number' => $room->room_number,
            'room_name' => $room->room_name,
            
            // Period Info
            'period_start' => $this->getPeriodStart($payment),
            'period_end' => $this->getPeriodEnd($payment),
            'period_text' => $this->getPeriodText($payment),
        ];
    }

    /**
     * Generate HTML template for receipt
     */
    private function generateReceiptHtml(array $data): string
    {
        try {
            Log::info('Attempting to render view with data', ['data_keys' => array_keys($data)]);
            
            // Check if view exists
            if (!View::exists('receipts.payment-receipt')) {
                Log::error('Receipt view template not found, falling back to simple HTML');
                return $this->generateFallbackHtml($data);
            }
            
            $html = view('receipts.payment-receipt', $data)->render();
            Log::info('View rendered successfully', ['html_length' => strlen($html)]);
            
            return $html;
        } catch (\Exception $e) {
            Log::error('Error rendering receipt view, falling back to simple HTML', [
                'error' => $e->getMessage(),
                'data_keys' => array_keys($data),
                'view_exists' => View::exists('receipts.payment-receipt')
            ]);
            return $this->generateFallbackHtml($data);
        }
    }

    /**
     * Generate fallback HTML when view rendering fails
     */
    private function generateFallbackHtml(array $data): string
    {
        return "
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset='UTF-8'>
            <title>Kwitansi Pembayaran</title>
            <style>
                body { font-family: Arial, sans-serif; margin: 40px; }
                .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 20px; }
                .content { margin: 30px 0; }
                .amount { font-size: 24px; font-weight: bold; color: green; text-align: center; margin: 20px 0; }
            </style>
        </head>
        <body>
            <div class='header'>
                <h1>{$data['company_name']}</h1>
                <p>{$data['company_address']}</p>
                <h2>KWITANSI</h2>
                <p>No. {$data['receipt_number']}</p>
            </div>
            <div class='content'>
                <p><strong>Nama Penyewa:</strong> {$data['tenant_name']}</p>
                <p><strong>Kamar:</strong> {$data['room_number']} - {$data['room_name']}</p>
                <p><strong>Periode:</strong> {$data['period_text']}</p>
                <p><strong>Tanggal Bayar:</strong> {$data['paid_at']}</p>
                <div class='amount'>
                    <p>JUMLAH: Rp " . number_format($data['amount'], 0, ',', '.') . "</p>
                    <p>({$data['amount_words']} rupiah)</p>
                </div>
                <p><strong>Status:</strong> {$data['status']}</p>
                <p><strong>Metode Pembayaran:</strong> {$data['payment_method']}</p>
            </div>
        </body>
        </html>";
    }

    /**
     * Create simple text receipt as fallback
     */
    private function createTextReceipt(array $data): string
    {
        $receipt = "
=============================================
              KWITANSI PEMBAYARAN
=============================================

No. Kwitansi: {$data['receipt_number']}
Tanggal Cetak: {$data['generated_at']}

---------------------------------------------
INFORMASI PERUSAHAAN:
---------------------------------------------
{$data['company_name']}
{$data['company_address']}
Telp: {$data['company_phone']}
Email: {$data['company_email']}

---------------------------------------------
INFORMASI PEMBAYARAN:
---------------------------------------------
ID Transaksi  : {$data['order_id']}
Tanggal Bayar : {$data['paid_at']}
Metode Bayar  : {$data['payment_method']}
Status        : {$data['status']}

---------------------------------------------
INFORMASI PENYEWA:
---------------------------------------------
Nama    : {$data['tenant_name']}
Email   : {$data['tenant_email']}
Telepon : {$data['tenant_phone']}
Kamar   : {$data['room_number']} - {$data['room_name']}

---------------------------------------------
DETAIL PEMBAYARAN:
---------------------------------------------
Untuk Pembayaran: {$data['period_text']}
Periode: {$data['period_start']} s/d {$data['period_end']}

JUMLAH YANG DITERIMA:
Rp " . number_format($data['amount'], 0, ',', '.') . "
({$data['amount_words']} rupiah)

---------------------------------------------
VERIFIKASI:
Kunjungi: {$data['verification_url']}

=============================================
        Kwitansi ini sah dan resmi
=============================================
";
        return $receipt;
    }

    /**
     * Convert HTML to PDF
     */
    private function convertHtmlToPdf(string $html): string
    {
        try {
            Log::info('Starting PDF conversion', ['html_length' => strlen($html)]);
            
            // Check if dompdf is available
            if (!class_exists('\Dompdf\Dompdf')) {
                throw new \Exception('DomPDF library is not installed. Please run: composer require dompdf/dompdf');
            }

            // Create Dompdf instance with configuration for v3.1
            $options = new \Dompdf\Options();
            $options->set('defaultFont', 'serif');
            $options->set('isRemoteEnabled', false);
            $options->set('isHtml5ParserEnabled', true);
            $options->set('isFontSubsettingEnabled', false);
            $options->set('chroot', realpath(base_path()));
            
            $dompdf = new \Dompdf\Dompdf($options);
            
            Log::info('Loading HTML into Dompdf');
            $dompdf->loadHtml($html);
            
            Log::info('Setting paper size');
            $dompdf->setPaper('A4', 'portrait');
            
            Log::info('Rendering PDF');
            $dompdf->render();
            
            Log::info('Getting PDF output');
            $output = $dompdf->output();
            
            Log::info('PDF generation completed', ['pdf_size' => strlen($output)]);
            
            return $output;
            
        } catch (\Exception $e) {
            Log::error('PDF generation failed', [
                'error' => $e->getMessage(),
                'html_length' => strlen($html),
                'line' => $e->getLine(),
                'file' => $e->getFile()
            ]);
            
            throw new \Exception('Failed to generate PDF: ' . $e->getMessage());
        }
    }

    /**
     * Convert number to Indonesian words
     */
    private function convertNumberToWords(float $amount): string
    {
        $amount = (int) $amount;
        
        // Handle zero case
        if ($amount === 0) {
            return 'nol';
        }
        
        $ones = [
            '', 'satu', 'dua', 'tiga', 'empat', 'lima', 'enam', 'tujuh', 'delapan', 'sembilan',
            'sepuluh', 'sebelas', 'dua belas', 'tiga belas', 'empat belas', 'lima belas',
            'enam belas', 'tujuh belas', 'delapan belas', 'sembilan belas'
        ];
        
        $tens = [
            '', '', 'dua puluh', 'tiga puluh', 'empat puluh', 'lima puluh',
            'enam puluh', 'tujuh puluh', 'delapan puluh', 'sembilan puluh'
        ];
        
        if ($amount < 20) {
            return $ones[$amount];
        } elseif ($amount < 100) {
            $remainder = $amount % 10;
            return trim($tens[intval($amount / 10)] . ' ' . $ones[$remainder]);
        } elseif ($amount < 1000) {
            $remainder = $amount % 100;
            return trim($ones[intval($amount / 100)] . ' ratus ' . $this->convertNumberToWords($remainder));
        } elseif ($amount < 1000000) {
            $remainder = $amount % 1000;
            return trim($this->convertNumberToWords(intval($amount / 1000)) . ' ribu ' . $this->convertNumberToWords($remainder));
        } elseif ($amount < 1000000000) {
            $remainder = $amount % 1000000;
            return trim($this->convertNumberToWords(intval($amount / 1000000)) . ' juta ' . $this->convertNumberToWords($remainder));
        } else {
            $remainder = $amount % 1000000000;
            return trim($this->convertNumberToWords(intval($amount / 1000000000)) . ' miliar ' . $this->convertNumberToWords($remainder));
        }
    }

    /**
     * Get period start date
     */
    private function getPeriodStart(Payment $payment): string
    {
        if ($payment->payment_month) {
            [$year, $month] = explode('-', $payment->payment_month);
            return Carbon::create($year, $month, 1)->format('d/m/Y');
        }
        
        return Carbon::parse($payment->created_at)->startOfMonth()->format('d/m/Y');
    }

    /**
     * Get period end date
     */
    private function getPeriodEnd(Payment $payment): string
    {
        if ($payment->payment_month) {
            [$year, $month] = explode('-', $payment->payment_month);
            return Carbon::create($year, $month, 1)->endOfMonth()->format('d/m/Y');
        }
        
        return Carbon::parse($payment->created_at)->endOfMonth()->format('d/m/Y');
    }

    /**
     * Get period text
     */
    private function getPeriodText(Payment $payment): string
    {
        if ($payment->payment_month) {
            [$year, $month] = explode('-', $payment->payment_month);
            $monthName = Carbon::create($year, $month, 1)->locale('id')->format('F Y');
            return "Pembayaran Sewa Bulan {$monthName}";
        }
        
        $monthName = Carbon::parse($payment->created_at)->locale('id')->format('F Y');
        return "Pembayaran Sewa Bulan {$monthName}";
    }

    /**
     * Verify receipt authenticity
     */
    public function verifyReceipt(string $receiptNumber): ?array
    {
        // Extract payment ID from receipt number
        $parts = explode('-', $receiptNumber);
        if (count($parts) !== 3) {
            return null;
        }
        
        $paymentId = (int) ltrim($parts[2], '0');
        
        $payment = Payment::with(['tenant.user', 'tenant.room'])
            ->where('id', $paymentId)
            ->where('status', 'paid')
            ->first();
        
        if (!$payment) {
            return null;
        }
        
        // Verify receipt number matches
        $expectedReceiptNumber = $this->generateReceiptNumber($payment);
        if ($receiptNumber !== $expectedReceiptNumber) {
            return null;
        }
        
        return [
            'valid' => true,
            'receipt_number' => $receiptNumber,
            'payment_id' => $payment->id,
            'order_id' => $payment->order_id,
            'amount' => $payment->amount,
            'paid_at' => Carbon::parse($payment->paid_at)->format('d/m/Y H:i:s'),
            'tenant_name' => $payment->tenant->user->name,
            'room_number' => $payment->tenant->room->room_number,
            'room_name' => $payment->tenant->room->room_name,
            'period_text' => $this->getPeriodText($payment),
        ];
    }
}