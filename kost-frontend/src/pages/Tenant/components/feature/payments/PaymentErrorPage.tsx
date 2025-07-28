import React from 'react';

interface PaymentErrorPageProps {
  error: string | null;
  onRetry: () => void;
  onClose: () => void;
}

const PaymentErrorPage: React.FC<PaymentErrorPageProps> = ({ 
  error, 
  onRetry, 
  onClose 
}) => {
  const getErrorDetails = (errorMessage: string | null) => {
    if (!errorMessage) {
      return {
        title: 'Payment Failed',
        message: 'An unexpected error occurred during payment processing.',
        suggestions: ['Please try again', 'Check your internet connection', 'Contact support if problem persists']
      };
    }

    const lowerError = errorMessage.toLowerCase();
    
    if (lowerError.includes('network') || lowerError.includes('connection')) {
      return {
        title: 'Connection Error',
        message: 'Unable to connect to payment gateway.',
        suggestions: ['Check your internet connection', 'Try again in a few moments', 'Switch to a different network']
      };
    }
    
    if (lowerError.includes('timeout')) {
      return {
        title: 'Request Timeout',
        message: 'Payment request took too long to process.',
        suggestions: ['Try again with a stable connection', 'Check if payment was processed', 'Contact support if charged']
      };
    }
    
    if (lowerError.includes('cancelled') || lowerError.includes('canceled')) {
      return {
        title: 'Payment Cancelled',
        message: 'Payment was cancelled by user.',
        suggestions: ['Click retry to try again', 'Choose a different payment method', 'Contact support for assistance']
      };
    }
    
    return {
      title: 'Payment Error',
      message: errorMessage,
      suggestions: ['Try a different payment method', 'Check your account balance', 'Contact your bank if needed']
    };
  };

  const errorDetails = getErrorDetails(error);

  return (
    <div className="text-center py-8">
      {/* Error Icon */}
      <div className="mb-6">
        <div className="w-24 h-24 mx-auto bg-red-100 rounded-full flex items-center justify-center">
          <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.94-.833-2.71 0L4.104 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
        </div>
      </div>

      {/* Error Message */}
      <h3 className="text-2xl font-bold text-red-600 mb-2">
        {errorDetails.title}
      </h3>
      
      <p className="text-gray-600 mb-6">
        {errorDetails.message}
      </p>

      {/* Error Details */}
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 text-left">
        <h4 className="font-semibold text-red-800 mb-3">Troubleshooting Steps:</h4>
        <ul className="space-y-2">
          {errorDetails.suggestions.map((suggestion, index) => (
            <li key={index} className="flex items-start space-x-2 text-red-700">
              <span className="text-red-500 mt-1">•</span>
              <span className="text-sm">{suggestion}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Common Issues */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6 text-left">
        <h4 className="font-semibold text-yellow-800 mb-3">Common Issues:</h4>
        <div className="space-y-2 text-sm text-yellow-700">
          <div className="flex items-start space-x-2">
            <span className="text-yellow-500">🔒</span>
            <span>Bank security: Some banks block online transactions by default</span>
          </div>
          <div className="flex items-start space-x-2">
            <span className="text-yellow-500">💳</span>
            <span>Card limits: Check your daily transaction limits</span>
          </div>
          <div className="flex items-start space-x-2">
            <span className="text-yellow-500">🌐</span>
            <span>Network: Poor connection can cause timeouts</span>
          </div>
          <div className="flex items-start space-x-2">
            <span className="text-yellow-500">🏦</span>
            <span>Bank maintenance: Some services may be temporarily down</span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-3">
        <button
          onClick={onRetry}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center space-x-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          <span>Try Again</span>
        </button>
        
        <button
          onClick={onClose}
          className="w-full border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium py-2 px-6 rounded-lg transition-colors"
        >
          Cancel Payment
        </button>
      </div>

      {/* Support Info */}
      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h5 className="font-semibold text-blue-800 mb-2">Need Help?</h5>
        <div className="text-blue-700 text-sm space-y-1">
          <p>📧 Email: support@kostmanagement.com</p>
          <p>📱 WhatsApp: +62 812-3456-7890</p>
          <p>🕒 Support Hours: 9 AM - 6 PM (Mon-Fri)</p>
        </div>
      </div>
    </div>
  );
};

export default PaymentErrorPage;