// File: src/pages/Tenant/components/feature/payments/SnapPayment.tsx
import React, { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import LoadingSpinner from '../../ui/Status/LoadingSpinner';
import StatusBadge from '../../ui/Status/StatusBadge';
import Button from '../../ui/Buttons/Button';
import Card from '../../ui/Card/Card';

interface SnapPaymentProps {
  snapToken: string;
  clientKey: string;
  isProduction: boolean;
  paymentData: {
    order_id: string;
    gross_amount: number;
    payment_id: number;
  };
  onSuccess?: (result: any) => void;
  onPending?: (result: any) => void;
  onError?: (result: any) => void;
  onClose?: () => void;
}

// Extend Window interface for Snap
declare global {
  interface Window {
    snap: {
      pay: (token: string, options: {
        onSuccess: (result: any) => void;
        onPending: (result: any) => void;
        onError: (result: any) => void;
        onClose: () => void;
      }) => void;
    };
  }
}

export const SnapPayment: React.FC<SnapPaymentProps> = ({
  snapToken,
  clientKey,
  isProduction,
  paymentData,
  onSuccess,
  onPending,
  onError,
  onClose
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [snapLoaded, setSnapLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadSnapScript();
  }, [clientKey, isProduction]);

  const loadSnapScript = () => {
    // Check if Snap script already exists
    if (document.querySelector('#snap-script')) {
      checkSnapReady();
      return;
    }

    const script = document.createElement('script');
    script.id = 'snap-script';
    script.src = isProduction 
      ? 'https://app.midtrans.com/snap/snap.js'
      : 'https://app.sandbox.midtrans.com/snap/snap.js';
    script.setAttribute('data-client-key', clientKey);

    script.onload = () => {
      console.log('✅ Snap.js loaded successfully');
      checkSnapReady();
    };

    script.onerror = () => {
      console.error('❌ Failed to load Snap.js');
      setError('Gagal memuat gateway pembayaran. Silakan periksa koneksi internet Anda.');
      toast.error('Gagal memuat gateway pembayaran');
    };

    document.head.appendChild(script);
  };

  const checkSnapReady = () => {
    // Check if window.snap is available
    const checkInterval = setInterval(() => {
      if (window.snap) {
        console.log('✅ Snap object is ready');
        setSnapLoaded(true);
        clearInterval(checkInterval);
      }
    }, 100);

    // Timeout after 10 seconds
    setTimeout(() => {
      clearInterval(checkInterval);
      if (!window.snap) {
        setError('Timeout inisialisasi gateway pembayaran');
        toast.error('Inisialisasi gateway pembayaran gagal');
      }
    }, 10000);
  };

  const handlePayment = async () => {
    if (!window.snap) {
      toast.error('Gateway pembayaran tidak siap. Silakan coba lagi.');
      return;
    }

    if (!snapToken) {
      toast.error('Token pembayaran tidak tersedia. Silakan refresh dan coba lagi.');
      return;
    }

    setIsLoading(true);
    
    try {
      console.log('🚀 Opening Snap payment popup...');
      
      window.snap.pay(snapToken, {
        onSuccess: (result: any) => {
          console.log('✅ Payment Success:', result);
          setIsLoading(false);
          
          toast.success('Pembayaran berhasil!');
          
          // Call custom success handler
          if (onSuccess) {
            onSuccess(result);
          } else {
            // Default success behavior
            window.location.href = `/tenant/payments/success?order_id=${paymentData.order_id}`;
          }
        },

        onPending: (result: any) => {
          console.log('⏳ Payment Pending:', result);
          setIsLoading(false);
          
          toast.loading('Pembayaran sedang diproses...');
          
          // Call custom pending handler
          if (onPending) {
            onPending(result);
          } else {
            // Default pending behavior
            window.location.href = `/tenant/payments/pending?order_id=${paymentData.order_id}`;
          }
        },

        onError: (result: any) => {
          console.error('❌ Payment Error:', result);
          setIsLoading(false);
          
          toast.error('Pembayaran gagal. Silakan coba lagi.');
          
          // Call custom error handler
          if (onError) {
            onError(result);
          } else {
            // Default error behavior
            console.error('Payment failed:', result);
          }
        },

        onClose: () => {
          console.log('🔒 Payment popup closed');
          setIsLoading(false);
          
          // Call custom close handler
          if (onClose) {
            onClose();
          } else {
            // Default close behavior
            toast('Pembayaran dibatalkan oleh pengguna');
          }
        }
      });

    } catch (error: any) {
      console.error('❌ Snap payment error:', error);
      setIsLoading(false);
      toast.error('Gagal membuka pembayaran. Silakan coba lagi.');
      setError(error.message || 'Inisialisasi pembayaran gagal');
    }
  };

  if (error) {
    return (
      <Card className="snap-payment-error">
        <div className="error-container p-6 text-center">
          <div className="text-4xl mb-4">⚠️</div>
          <h4 className="text-lg font-semibold text-red-600 mb-2">Error Gateway Pembayaran</h4>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button 
            variant="danger"
            onClick={() => {
              setError(null);
              loadSnapScript();
            }}
          >
            🔄 Coba Lagi
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <div className="snap-payment-container space-y-6">
      {/* Payment Info Card */}
      <Card className="payment-info">
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <span className="mr-2">💳</span>
            Detail Pembayaran
          </h3>
          
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">ID Pesanan:</span>
              <span className="font-medium">{paymentData.order_id}</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-gray-600">Jumlah:</span>
              <span className="font-medium text-lg">
                Rp {paymentData.gross_amount.toLocaleString('id-ID')}
              </span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Status Gateway:</span>
              <StatusBadge 
                status={snapLoaded ? 'success' : 'info'}
                text={snapLoaded ? 'Siap' : 'Memuat...'}
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Payment Action */}
      <Card className="payment-actions">
        <div className="p-6 text-center">
          <Button
            onClick={handlePayment}
            disabled={!snapLoaded || isLoading}
            variant={snapLoaded && !isLoading ? 'primary' : 'secondary'}
            size="lg"
            className="w-full min-h-[60px]"
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <LoadingSpinner size="sm" className="mr-2" />
                Memproses...
              </div>
            ) : snapLoaded ? (
              <div className="flex items-center justify-center">
                <span className="mr-2">🚀</span>
                Bayar Sekarang
              </div>
            ) : (
              <div className="flex items-center justify-center">
                <LoadingSpinner size="sm" className="mr-2" />
                Memuat Gateway Pembayaran...
              </div>
            )}
          </Button>

          {snapLoaded && (
            <p className="mt-4 text-sm text-gray-500 max-w-md mx-auto">
              🔒 Pembayaran aman didukung oleh Midtrans. 
              Klik "Bayar Sekarang" untuk membuka popup pembayaran. 
              Tidak perlu redirect - mengatasi masalah proxy!
            </p>
          )}
        </div>
      </Card>

      {/* Benefits Info */}
      <Card className="benefits-info">
        <div className="p-6">
          <h4 className="text-md font-medium text-gray-800 mb-3">
            💡 Mengapa Popup Snap.js Lebih Baik:
          </h4>
          <ul className="space-y-2 text-sm text-gray-600">
            <li className="flex items-start">
              <span className="text-green-500 mr-2">✅</span>
              <span><strong>Tidak ada masalah proxy</strong> - Bekerja di balik firewall perusahaan</span>
            </li>
            <li className="flex items-start">
              <span className="text-green-500 mr-2">✅</span>
              <span><strong>Memuat lebih cepat</strong> - Tidak perlu redirect halaman</span>
            </li>
            <li className="flex items-start">
              <span className="text-green-500 mr-2">✅</span>
              <span><strong>UX yang lebih baik</strong> - Tetap di halaman yang sama</span>
            </li>
            <li className="flex items-start">
              <span className="text-green-500 mr-2">✅</span>
              <span><strong>Mobile friendly</strong> - Responsive popup design</span>
            </li>
            <li className="flex items-start">
              <span className="text-green-500 mr-2">✅</span>
              <span><strong>Secure</strong> - Direct communication with Midtrans</span>
            </li>
          </ul>
        </div>
      </Card>

      {/* Debug Info (Development only) */}
      {process.env.NODE_ENV === 'development' && (
        <Card className="debug-info">
          <details className="p-4">
            <summary className="text-sm font-medium text-gray-600 cursor-pointer">
              🛠️ Debug Information
            </summary>
            <pre className="mt-2 text-xs bg-gray-50 p-3 rounded overflow-auto">
              {JSON.stringify({
                snapToken: snapToken?.substring(0, 20) + '...',
                clientKey: clientKey?.substring(0, 20) + '...',
                isProduction,
                snapLoaded,
                paymentData
              }, null, 2)}
            </pre>
          </details>
        </Card>
      )}
    </div>
  );
};