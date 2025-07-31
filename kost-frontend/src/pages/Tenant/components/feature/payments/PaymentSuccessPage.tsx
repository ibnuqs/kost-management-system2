import React, { useEffect, useState } from 'react';

interface PaymentSuccessPageProps {
  paymentResult: { status_code: string; transaction_status: string; order_id: string; gross_amount?: string };
  paymentData: {
    order_id: string;
    amount: number;
    payment_month: string;
  };
  onClose: () => void;
}

const PaymentSuccessPage: React.FC<PaymentSuccessPageProps> = ({ 
  paymentResult, 
  paymentData, 
  onClose 
}) => {
  const [showConfetti, setShowConfetti] = useState(true);

  useEffect(() => {
    // Hide confetti after animation
    const timer = setTimeout(() => {
      setShowConfetti(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="text-center py-8 relative overflow-hidden">
      {/* Confetti Animation */}
      {showConfetti && (
        <div className="absolute inset-0 pointer-events-none">
          {Array.from({ length: 20 }).map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 bg-yellow-400 rounded-full animate-bounce"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 50}%`,
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${1 + Math.random()}s`
              }}
            />
          ))}
        </div>
      )}

      {/* Success Icon */}
      <div className="mb-6">
        <div className="w-24 h-24 mx-auto bg-green-100 rounded-full flex items-center justify-center">
          <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center animate-pulse">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        </div>
      </div>

      {/* Success Message */}
      <h3 className="text-2xl font-bold text-green-600 mb-2">
        Payment Successful!
      </h3>
      
      <p className="text-gray-600 mb-8">
        Your rent payment has been processed successfully
      </p>

      {/* Payment Details */}
      <div className="bg-gray-50 rounded-lg p-6 mb-8 text-left">
        <h4 className="font-semibold text-gray-800 mb-4">Payment Details</h4>
        
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-gray-600">Order ID:</span>
            <span className="font-mono text-sm">{paymentData.order_id}</span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-gray-600">Period:</span>
            <span className="font-medium">{paymentData.payment_month}</span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-gray-600">Amount:</span>
            <span className="font-bold text-green-600">
              Rp {paymentData.amount.toLocaleString('id-ID')}
            </span>
          </div>
          
          {paymentResult?.payment_type && (
            <div className="flex justify-between">
              <span className="text-gray-600">Payment Method:</span>
              <span className="font-medium capitalize">
                {paymentResult.payment_type.replace('_', ' ')}
              </span>
            </div>
          )}
          
          <div className="flex justify-between">
            <span className="text-gray-600">Transaction Time:</span>
            <span className="text-sm">
              {new Date().toLocaleString('id-ID')}
            </span>
          </div>
        </div>
      </div>

      {/* Next Steps */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <h5 className="font-semibold text-blue-800 mb-2">What's Next?</h5>
        <ul className="text-blue-700 text-sm space-y-1">
          <li>• Payment receipt will be sent to your email</li>
          <li>• Your room access remains active</li>
          <li>• Next payment due: {getNextPaymentMonth()}</li>
        </ul>
      </div>

      {/* Action Buttons */}
      <div className="space-y-3">
        <button
          onClick={onClose}
          className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
        >
          Continue to Dashboard
        </button>
        
        <button
          onClick={() => window.print()}
          className="w-full border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium py-2 px-6 rounded-lg transition-colors"
        >
          Print Receipt
        </button>
      </div>

      {/* Success Animation */}
      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fadeInUp {
          animation: fadeInUp 0.6s ease-out;
        }
      `}</style>
    </div>
  );
};

// Helper function to get next payment month
function getNextPaymentMonth(): string {
  const nextMonth = new Date();
  nextMonth.setMonth(nextMonth.getMonth() + 1);
  return nextMonth.toLocaleDateString('id-ID', { 
    year: 'numeric', 
    month: 'long' 
  });
}

export default PaymentSuccessPage;