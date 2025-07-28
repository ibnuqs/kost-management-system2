import React from 'react';

interface PaymentLoadingScreenProps {
  message: string;
}

const PaymentLoadingScreen: React.FC<PaymentLoadingScreenProps> = ({ message }) => {
  return (
    <div className="text-center py-12">
      {/* Animated Loading Spinner */}
      <div className="relative mb-8">
        <div className="w-20 h-20 mx-auto relative">
          {/* Outer rotating ring */}
          <div className="absolute inset-0 border-4 border-blue-200 rounded-full animate-spin border-t-blue-600"></div>
          
          {/* Inner pulsing circle */}
          <div className="absolute inset-2 bg-blue-100 rounded-full flex items-center justify-center">
            <div className="w-8 h-8 bg-blue-600 rounded-full animate-pulse"></div>
          </div>
        </div>
        
        {/* Payment icon in center */}
        <div className="absolute inset-0 flex items-center justify-center">
          <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                  d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
          </svg>
        </div>
      </div>

      {/* Loading Message */}
      <h3 className="text-lg font-semibold text-gray-800 mb-2">
        {message}
      </h3>
      
      {/* Animated dots */}
      <div className="flex justify-center space-x-1 mb-6">
        <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></div>
        <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
        <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
      </div>

      {/* Security Notice */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex items-center justify-center space-x-2 text-green-700">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
          <span className="text-sm font-medium">Secure Payment</span>
        </div>
        <p className="text-green-600 text-xs mt-1">
          Your payment is protected by Midtrans security
        </p>
      </div>
    </div>
  );
};

export default PaymentLoadingScreen;