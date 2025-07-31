import React, { useState, useEffect, useRef } from 'react';
import PaymentLoadingScreen from './PaymentLoadingScreen';
import PaymentSuccessPage from './PaymentSuccessPage';
import PaymentErrorPage from './PaymentErrorPage';
import PaymentProgressIndicator from './PaymentProgressIndicator';

// Snap payment result types
interface SnapPaymentResult {
  transaction_id: string;
  status_code: string;
  payment_type: string;
  order_id: string;
  gross_amount: string;
  transaction_status: string;
  signature_key?: string;
  status_message?: string;
}

interface CustomSnapPaymentProps {
  snapToken: string;
  paymentData: {
    order_id: string;
    amount: number;
    payment_month: string;
  };
  onSuccess: (result: SnapPaymentResult) => void;
  onPending: (result: SnapPaymentResult) => void;
  onError: (result: SnapPaymentResult) => void;
  onClose: () => void;
}

type PaymentStep = 'loading' | 'payment' | 'processing' | 'success' | 'error';

const CustomSnapPayment: React.FC<CustomSnapPaymentProps> = ({
  snapToken,
  paymentData,
  onSuccess,
  onPending,
  onError,
  onClose,
}) => {
  const [currentStep, setCurrentStep] = useState<PaymentStep>('loading');
  const [paymentResult, setPaymentResult] = useState<SnapPaymentResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSnapLoaded, setIsSnapLoaded] = useState(false);
  const snapContainerRef = useRef<HTMLDivElement>(null);

  // Load Snap.js script
  useEffect(() => {
    const loadSnapScript = async () => {
      if (window.snap) {
        setIsSnapLoaded(true);
        return;
      }

      try {
        const script = document.createElement('script');
        script.src = 'https://app.sandbox.midtrans.com/snap/snap.js';
        script.setAttribute('data-client-key', import.meta.env.VITE_MIDTRANS_CLIENT_KEY);
        
        script.onload = () => {
          setIsSnapLoaded(true);
          console.log('✅ Snap.js loaded successfully');
        };
        
        script.onerror = () => {
          setError('Failed to load payment gateway');
          setCurrentStep('error');
        };
        
        document.head.appendChild(script);
      } catch {
        setError('Failed to initialize payment gateway');
        setCurrentStep('error');
      }
    };

    loadSnapScript();

    return () => {
      // Cleanup script if needed
      const existingScript = document.querySelector('script[src*="snap.js"]');
      if (existingScript) {
        existingScript.remove();
      }
    };
  }, []);

  // Initialize Snap payment when script is loaded
  useEffect(() => {
    if (!isSnapLoaded || !snapToken) return;

    const initializePayment = () => {
      try {
        console.log('🔄 Initializing Snap payment with token:', snapToken.substring(0, 20) + '...');
        console.log('🔧 Environment:', {
          clientKey: import.meta.env.VITE_MIDTRANS_CLIENT_KEY?.substring(0, 10) + '...',
          isProduction: import.meta.env.VITE_MIDTRANS_IS_PRODUCTION,
          snapUrl: 'https://app.sandbox.midtrans.com/snap/snap.js'
        });
        
        // Validate snap token format (should be a UUID)
        if (!snapToken || snapToken.length < 30) {
          throw new Error('Invalid snap token format');
        }
        
        setCurrentStep('payment');
        
        window.snap.pay(snapToken, {
          onSuccess: function(result: SnapPaymentResult) {
            console.log('Payment Success:', result);
            setCurrentStep('processing');
            
            // Simulate processing delay for better UX
            setTimeout(() => {
              setPaymentResult(result);
              setCurrentStep('success');
              onSuccess(result);
            }, 2000);
          },
          
          onPending: function(result: SnapPaymentResult) {
            console.log('Payment Pending:', result);
            setCurrentStep('processing');
            
            setTimeout(() => {
              setPaymentResult(result);
              setCurrentStep('success'); // Treat pending as success for now
              onPending(result);
            }, 1500);
          },
          
          onError: function(result: SnapPaymentResult) {
            console.error('💥 Payment Error:', result);
            
            // Handle specific error types
            let errorMessage = 'Payment failed';
            if (result.status_code === '404' || result.status_message?.includes('404')) {
              errorMessage = 'Payment token expired or invalid. Please try again.';
            } else if (result.status_message?.includes('network')) {
              errorMessage = 'Network connection error. Please check your internet.';
            } else if (result.status_message) {
              errorMessage = result.status_message;
            }
            
            setError(errorMessage);
            setCurrentStep('error');
            onError(result);
          },
          
          onClose: function() {
            console.log('Payment popup closed');
            onClose();
          }
        });
      } catch (err) {
        console.error('Snap initialization error:', err);
        const errorMessage = err instanceof Error ? err.message : 'Failed to initialize payment';
        setError(errorMessage);
        setCurrentStep('error');
      }
    };

    // Small delay to ensure everything is ready
    const timer = setTimeout(initializePayment, 500);
    
    return () => clearTimeout(timer);
  }, [isSnapLoaded, snapToken, onSuccess, onPending, onError, onClose]);

  const handleRetry = () => {
    setCurrentStep('loading');
    setError(null);
    setPaymentResult(null);
    
    // Reinitialize payment
    if (window.snap && snapToken) {
      setTimeout(() => {
        setCurrentStep('payment');
        window.snap.pay(snapToken, {
          onSuccess: (result: SnapPaymentResult) => {
            setCurrentStep('processing');
            setTimeout(() => {
              setPaymentResult(result);
              setCurrentStep('success');
              onSuccess(result);
            }, 2000);
          },
          onPending: (result: SnapPaymentResult) => {
            setCurrentStep('processing');
            setTimeout(() => {
              setPaymentResult(result);
              setCurrentStep('success');
              onPending(result);
            }, 1500);
          },
          onError: (result: SnapPaymentResult) => {
            setError(result.status_message || 'Payment failed');
            setCurrentStep('error');
            onError(result);
          },
          onClose: onClose
        });
      }, 1000);
    }
  };

  const handleClose = () => {
    if (currentStep === 'success') {
      // Allow close after success
      onClose();
    } else if (currentStep === 'error') {
      // Allow close on error
      onClose();
    } else {
      // Confirm close during payment
      if (confirm('Are you sure you want to cancel the payment?')) {
        onClose();
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
      <div className="bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] sm:max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-4 sm:p-6 text-white relative">
          <button
            onClick={handleClose}
            className="absolute top-3 right-3 sm:top-4 sm:right-4 text-white hover:text-gray-200 transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
            aria-label="Close"
          >
            <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          
          <h2 className="text-lg sm:text-xl font-bold mb-2 pr-12">Payment</h2>
          <p className="text-blue-100 text-xs sm:text-sm pr-12">
            {paymentData.payment_month} - Rp {paymentData.amount.toLocaleString('id-ID')}
          </p>
        </div>

        {/* Progress Indicator */}
        <PaymentProgressIndicator currentStep={currentStep} />

        {/* Content */}
        <div className="p-4 sm:p-6 overflow-y-auto max-h-[60vh] sm:max-h-none">
          {currentStep === 'loading' && (
            <PaymentLoadingScreen message="Initializing payment gateway..." />
          )}

          {currentStep === 'payment' && (
            <PaymentLoadingScreen message="Opening payment options..." />
          )}

          {currentStep === 'processing' && (
            <PaymentLoadingScreen message="Processing your payment..." />
          )}

          {currentStep === 'success' && (
            <PaymentSuccessPage 
              paymentResult={paymentResult}
              paymentData={paymentData}
              onClose={onClose}
            />
          )}

          {currentStep === 'error' && (
            <PaymentErrorPage 
              error={error}
              onRetry={handleRetry}
              onClose={onClose}
            />
          )}
        </div>

        {/* Hidden container for Snap (if needed) */}
        <div ref={snapContainerRef} className="hidden" />
      </div>
    </div>
  );
};

// Extend Window interface for TypeScript
declare global {
  interface Window {
    snap: {
      pay: (token: string, options: {
        onSuccess: (result: SnapPaymentResult) => void;
        onPending: (result: SnapPaymentResult) => void;
        onError: (result: SnapPaymentResult) => void;
        onClose: () => void;
      }) => void;
    };
  }
}

export default CustomSnapPayment;