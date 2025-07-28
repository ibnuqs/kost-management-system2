<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Kwitansi Pembayaran - {{ $receipt_number }}</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'Times New Roman', serif;
            line-height: 1.6;
            color: #333;
            background: #fff;
        }

        .receipt-container {
            max-width: 800px;
            margin: 0 auto;
            padding: 40px;
            background: #fff;
            position: relative;
        }

        /* Watermark */
        .watermark {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%) rotate(-45deg);
            font-size: 120px;
            color: #f0f0f0;
            font-weight: bold;
            z-index: 1;
            opacity: 0.1;
        }

        .content {
            position: relative;
            z-index: 2;
        }

        /* Header */
        .header {
            text-align: center;
            border-bottom: 3px solid #2563eb;
            padding-bottom: 20px;
            margin-bottom: 30px;
        }

        .logo {
            font-size: 28px;
            font-weight: bold;
            color: #2563eb;
            margin-bottom: 10px;
        }

        .company-info {
            font-size: 14px;
            color: #666;
            line-height: 1.4;
        }

        .receipt-title {
            font-size: 36px;
            font-weight: bold;
            color: #1e40af;
            margin: 30px 0 20px 0;
            text-align: center;
            text-transform: uppercase;
            letter-spacing: 2px;
        }

        .receipt-number {
            text-align: center;
            font-size: 16px;
            color: #666;
            margin-bottom: 40px;
        }

        /* Details Section */
        .details-section {
            margin-bottom: 30px;
        }

        .details-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 40px;
        }

        .details-column {
            flex: 1;
        }

        .details-column h4 {
            font-size: 16px;
            font-weight: bold;
            color: #1e40af;
            margin-bottom: 10px;
            text-transform: uppercase;
            border-bottom: 2px solid #e5e7eb;
            padding-bottom: 5px;
        }

        .detail-item {
            margin-bottom: 8px;
            display: flex;
        }

        .detail-label {
            font-weight: bold;
            width: 140px;
            color: #374151;
        }

        .detail-value {
            flex: 1;
            color: #111827;
        }

        /* Payment Amount Section */
        .amount-section {
            background: #f8fafc;
            border: 2px solid #e2e8f0;
            border-radius: 8px;
            padding: 25px;
            margin: 30px 0;
            text-align: center;
        }

        .amount-label {
            font-size: 18px;
            font-weight: bold;
            color: #1e40af;
            margin-bottom: 10px;
        }

        .amount-value {
            font-size: 32px;
            font-weight: bold;
            color: #059669;
            margin-bottom: 10px;
        }

        .amount-words {
            font-size: 14px;
            color: #6b7280;
            font-style: italic;
            text-transform: capitalize;
        }

        .status-badge {
            background: #10b981;
            color: white;
            padding: 8px 20px;
            border-radius: 20px;
            font-weight: bold;
            font-size: 16px;
            margin: 20px 0;
            display: inline-block;
        }

        /* Footer */
        .footer {
            margin-top: 50px;
            padding-top: 30px;
            border-top: 2px solid #e5e7eb;
        }

        .signature-section {
            display: flex;
            justify-content: space-between;
            margin-top: 40px;
        }

        .signature-box {
            text-align: center;
            width: 200px;
        }

        .signature-line {
            border-top: 1px solid #333;
            margin: 60px 0 10px 0;
        }

        .signature-label {
            font-weight: bold;
            color: #374151;
        }

        .signature-name {
            color: #6b7280;
            font-size: 14px;
        }

        /* QR Code Section */
        .verification-section {
            text-align: center;
            margin-top: 40px;
            padding: 20px;
            background: #f1f5f9;
            border-radius: 8px;
        }

        .qr-code {
            width: 120px;
            height: 120px;
            margin: 0 auto 15px auto;
            border: 2px solid #cbd5e1;
            display: flex;
            align-items: center;
            justify-content: center;
            background: white;
            border-radius: 8px;
        }

        .verification-text {
            font-size: 12px;
            color: #64748b;
            margin-bottom: 5px;
        }

        .verification-url {
            font-size: 11px;
            color: #3b82f6;
            word-break: break-all;
        }

        /* Print Styles */
        @media print {
            .receipt-container {
                padding: 20px;
            }
            
            .watermark {
                opacity: 0.05;
            }
        }

        /* Security Features */
        .security-features {
            margin-top: 30px;
            padding: 15px;
            background: #fef3c7;
            border-left: 4px solid #f59e0b;
            font-size: 12px;
            color: #92400e;
        }

        .security-title {
            font-weight: bold;
            margin-bottom: 8px;
        }

        .security-item {
            margin-bottom: 4px;
        }
    </style>
</head>
<body>
    <div class="receipt-container">
        <!-- Watermark -->
        <div class="watermark">{{ $company_name }}</div>

        <div class="content">
            <!-- Header -->
            <div class="header">
                <div class="logo">{{ $company_name }}</div>
                <div class="company-info">
                    {{ $company_address }}<br>
                    Telp: {{ $company_phone }} | Email: {{ $company_email }}
                </div>
            </div>

            <!-- Receipt Title -->
            <div class="receipt-title">KWITANSI</div>
            <div class="receipt-number">No. {{ $receipt_number }}</div>

            <!-- Details Section -->
            <div class="details-section">
                <div class="details-row">
                    <div class="details-column">
                        <h4>Informasi Pembayaran</h4>
                        <div class="detail-item">
                            <span class="detail-label">ID Transaksi:</span>
                            <span class="detail-value">{{ $order_id }}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Tanggal Bayar:</span>
                            <span class="detail-value">{{ $paid_at }}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Metode Bayar:</span>
                            <span class="detail-value">{{ $payment_method }}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Status:</span>
                            <span class="detail-value">
                                <span class="status-badge">{{ $status }}</span>
                            </span>
                        </div>
                    </div>

                    <div class="details-column">
                        <h4>Informasi Penyewa</h4>
                        <div class="detail-item">
                            <span class="detail-label">Nama:</span>
                            <span class="detail-value">{{ $tenant_name }}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Email:</span>
                            <span class="detail-value">{{ $tenant_email }}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Telepon:</span>
                            <span class="detail-value">{{ $tenant_phone }}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Kamar:</span>
                            <span class="detail-value">{{ $room_number }} - {{ $room_name }}</span>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Amount Section -->
            <div class="amount-section">
                <div class="amount-label">JUMLAH YANG DITERIMA</div>
                <div class="amount-value">Rp {{ number_format($amount, 0, ',', '.') }}</div>
                <div class="amount-words">({{ $amount_words }} rupiah)</div>
            </div>

            <!-- Payment Details -->
            <div class="details-section">
                <div class="detail-item">
                    <span class="detail-label">Untuk Pembayaran:</span>
                    <span class="detail-value">{{ $period_text }}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Periode:</span>
                    <span class="detail-value">{{ $period_start }} s/d {{ $period_end }}</span>
                </div>
            </div>

            <!-- Footer -->
            <div class="footer">
                <div class="signature-section">
                    <div class="signature-box">
                        <div class="signature-line"></div>
                        <div class="signature-label">Penerima</div>
                        <div class="signature-name">{{ $company_name }}</div>
                    </div>
                    
                    <div class="signature-box">
                        <div class="signature-line"></div>
                        <div class="signature-label">Pembayar</div>
                        <div class="signature-name">{{ $tenant_name }}</div>
                    </div>
                </div>

                <!-- Verification Section -->
                <div class="verification-section">
                    <div class="qr-code">
                        <!-- QR Code would be generated here -->
                        <img src="data:image/svg+xml;base64,{{ base64_encode('
                            <svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100">
                                <rect width="100" height="100" fill="#f8fafc" stroke="#cbd5e1" stroke-width="2"/>
                                <text x="50" y="50" text-anchor="middle" font-size="10" fill="#64748b">QR Code</text>
                                <text x="50" y="65" text-anchor="middle" font-size="8" fill="#64748b">Verifikasi</text>
                            </svg>
                        ') }}" alt="QR Code Verifikasi" width="100" height="100">
                    </div>
                    <div class="verification-text">
                        <strong>Verifikasi Keaslian Kwitansi</strong><br>
                        Scan QR code atau kunjungi:
                    </div>
                    <div class="verification-url">{{ $verification_url }}</div>
                </div>

                <!-- Security Features -->
                <div class="security-features">
                    <div class="security-title">🔒 Fitur Keamanan Dokumen:</div>
                    <div class="security-item">• Watermark perusahaan di latar belakang</div>
                    <div class="security-item">• QR Code untuk verifikasi online</div>
                    <div class="security-item">• Nomor kwitansi unik: {{ $receipt_number }}</div>
                    <div class="security-item">• Tanggal cetak: {{ $generated_at }}</div>
                </div>
            </div>
        </div>
    </div>
</body>
</html>