<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Verifikasi Kwitansi - {{ $receipt_number }}</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
        }

        .verification-container {
            background: white;
            border-radius: 20px;
            padding: 40px;
            box-shadow: 0 20px 40px rgba(0,0,0,0.1);
            max-width: 600px;
            width: 100%;
            text-align: center;
        }

        .header {
            margin-bottom: 30px;
        }

        .logo {
            font-size: 32px;
            font-weight: bold;
            color: #2563eb;
            margin-bottom: 10px;
        }

        .subtitle {
            color: #6b7280;
            font-size: 16px;
        }

        .receipt-number {
            font-size: 24px;
            font-weight: bold;
            color: #1f2937;
            margin: 20px 0;
            padding: 15px;
            background: #f3f4f6;
            border-radius: 10px;
            border: 2px dashed #d1d5db;
        }

        .status-valid {
            background: #ecfdf5;
            border: 2px solid #10b981;
            color: #065f46;
            padding: 20px;
            border-radius: 15px;
            margin: 30px 0;
        }

        .status-invalid {
            background: #fef2f2;
            border: 2px solid #ef4444;
            color: #991b1b;
            padding: 20px;
            border-radius: 15px;
            margin: 30px 0;
        }

        .status-icon {
            font-size: 48px;
            margin-bottom: 15px;
        }

        .status-title {
            font-size: 24px;
            font-weight: bold;
            margin-bottom: 10px;
        }

        .status-message {
            font-size: 16px;
            line-height: 1.6;
        }

        .details-section {
            text-align: left;
            background: #f8fafc;
            padding: 25px;
            border-radius: 15px;
            margin: 30px 0;
        }

        .details-title {
            font-size: 20px;
            font-weight: bold;
            color: #1f2937;
            margin-bottom: 20px;
            text-align: center;
        }

        .detail-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 15px;
            padding: 10px;
            background: white;
            border-radius: 8px;
            border-left: 4px solid #3b82f6;
        }

        .detail-label {
            font-weight: bold;
            color: #374151;
            flex: 1;
        }

        .detail-value {
            color: #111827;
            flex: 2;
            text-align: right;
        }

        .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #e5e7eb;
            color: #6b7280;
            font-size: 14px;
        }

        .security-note {
            background: #fef3c7;
            border: 1px solid #f59e0b;
            border-radius: 10px;
            padding: 15px;
            margin: 20px 0;
            font-size: 14px;
            color: #92400e;
        }

        .back-button {
            background: #3b82f6;
            color: white;
            border: none;
            padding: 12px 24px;
            border-radius: 8px;
            font-size: 16px;
            cursor: pointer;
            margin-top: 20px;
            transition: background 0.2s;
        }

        .back-button:hover {
            background: #2563eb;
        }

        @media (max-width: 640px) {
            .verification-container {
                padding: 20px;
            }
            
            .detail-row {
                flex-direction: column;
                gap: 5px;
            }
            
            .detail-value {
                text-align: left;
            }
        }
    </style>
</head>
<body>
    <div class="verification-container">
        <div class="header">
            <div class="logo">{{ config('app.name', 'Kost Management') }}</div>
            <div class="subtitle">Sistem Verifikasi Kwitansi</div>
        </div>

        <div class="receipt-number">{{ $receipt_number }}</div>

        @if($is_valid && $verification_result)
            <div class="status-valid">
                <div class="status-icon">✅</div>
                <div class="status-title">Kwitansi Valid</div>
                <div class="status-message">
                    Kwitansi ini asli dan telah diverifikasi oleh sistem.
                </div>
            </div>

            <div class="details-section">
                <div class="details-title">Informasi Pembayaran</div>
                
                <div class="detail-row">
                    <div class="detail-label">ID Transaksi</div>
                    <div class="detail-value">{{ $verification_result['order_id'] }}</div>
                </div>
                
                <div class="detail-row">
                    <div class="detail-label">Jumlah Bayar</div>
                    <div class="detail-value">Rp {{ number_format($verification_result['amount'], 0, ',', '.') }}</div>
                </div>
                
                <div class="detail-row">
                    <div class="detail-label">Tanggal Bayar</div>
                    <div class="detail-value">{{ $verification_result['paid_at'] }}</div>
                </div>
                
                <div class="detail-row">
                    <div class="detail-label">Nama Penyewa</div>
                    <div class="detail-value">{{ $verification_result['tenant_name'] }}</div>
                </div>
                
                <div class="detail-row">
                    <div class="detail-label">Kamar</div>
                    <div class="detail-value">{{ $verification_result['room_number'] }} - {{ $verification_result['room_name'] }}</div>
                </div>
                
                <div class="detail-row">
                    <div class="detail-label">Keterangan</div>
                    <div class="detail-value">{{ $verification_result['period_text'] }}</div>
                </div>
            </div>

            <div class="security-note">
                <strong>🔒 Keamanan:</strong> Kwitansi ini telah diverifikasi langsung dengan database sistem. 
                Informasi di atas adalah data asli yang tidak dapat diubah.
            </div>

        @else
            <div class="status-invalid">
                <div class="status-icon">❌</div>
                <div class="status-title">Kwitansi Tidak Valid</div>
                <div class="status-message">
                    @if(isset($error))
                        {{ $error }}
                    @else
                        Kwitansi dengan nomor ini tidak ditemukan dalam sistem atau telah dipalsukan.
                    @endif
                </div>
            </div>

            <div class="security-note">
                <strong>⚠️ Peringatan:</strong> Kwitansi ini kemungkinan palsu atau tidak asli. 
                Silakan hubungi {{ config('app.name', 'Kost Management') }} untuk verifikasi lebih lanjut.
            </div>
        @endif

        <div class="footer">
            <p>Verifikasi dilakukan pada: {{ now()->format('d/m/Y H:i:s') }}</p>
            <p>Sistem Verifikasi {{ config('app.name', 'Kost Management System') }}</p>
            
            <button class="back-button" onclick="window.history.back()">
                ← Kembali
            </button>
        </div>
    </div>
</body>
</html>