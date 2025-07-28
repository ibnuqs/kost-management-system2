import React from 'react';

type PaymentStep = 'loading' | 'payment' | 'processing' | 'success' | 'error';

interface PaymentProgressIndicatorProps {
  currentStep: PaymentStep;
}

const PaymentProgressIndicator: React.FC<PaymentProgressIndicatorProps> = ({ currentStep }) => {
  const steps = [
    { key: 'loading', label: 'Initializing', icon: '🔄' },
    { key: 'payment', label: 'Payment', icon: '💳' },
    { key: 'processing', label: 'Processing', icon: '⚡' },
    { key: 'success', label: 'Complete', icon: '✅' },
  ];

  const getStepStatus = (stepKey: string) => {
    const stepIndex = steps.findIndex(step => step.key === stepKey);
    const currentIndex = steps.findIndex(step => step.key === currentStep);
    
    if (currentStep === 'error') {
      return stepIndex <= currentIndex ? 'error' : 'pending';
    }
    
    if (stepIndex < currentIndex) return 'completed';
    if (stepIndex === currentIndex) return 'active';
    return 'pending';
  };

  const getStepClasses = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500 border-green-500 text-white';
      case 'active':
        return 'bg-blue-500 border-blue-500 text-white animate-pulse';
      case 'error':
        return 'bg-red-500 border-red-500 text-white';
      default:
        return 'bg-gray-200 border-gray-300 text-gray-500';
    }
  };

  const getConnectorClasses = (stepKey: string) => {
    const stepIndex = steps.findIndex(step => step.key === stepKey);
    const currentIndex = steps.findIndex(step => step.key === currentStep);
    
    if (currentStep === 'error') {
      return stepIndex < currentIndex ? 'bg-red-500' : 'bg-gray-300';
    }
    
    return stepIndex < currentIndex ? 'bg-green-500' : 'bg-gray-300';
  };

  // Don't show progress for error state
  if (currentStep === 'error') {
    return (
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-center space-x-2 text-red-600">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.94-.833-2.71 0L4.104 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
          <span className="font-medium">Payment Error</span>
        </div>
      </div>
    );
  }

  return (
    <div className="px-6 py-4 border-b border-gray-200">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const status = getStepStatus(step.key);
          
          return (
            <React.Fragment key={step.key}>
              {/* Step Circle */}
              <div className="flex flex-col items-center">
                <div className={`
                  w-10 h-10 rounded-full border-2 flex items-center justify-center
                  transition-all duration-300 relative
                  ${getStepClasses(status)}
                `}>
                  {status === 'completed' ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : status === 'active' ? (
                    <div className="w-3 h-3 bg-white rounded-full animate-ping"></div>
                  ) : status === 'error' ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  ) : (
                    <span className="text-sm font-bold">{index + 1}</span>
                  )}
                  
                  {/* Active step glow effect */}
                  {status === 'active' && (
                    <div className="absolute inset-0 rounded-full bg-blue-400 animate-ping opacity-75"></div>
                  )}
                </div>
                
                {/* Step Label */}
                <span className={`
                  text-xs mt-2 font-medium transition-colors duration-300
                  ${status === 'active' ? 'text-blue-600' : 
                    status === 'completed' ? 'text-green-600' : 
                    status === 'error' ? 'text-red-600' : 'text-gray-500'}
                `}>
                  {step.label}
                </span>
              </div>
              
              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div className="flex-1 mx-2">
                  <div className={`
                    h-0.5 transition-all duration-500
                    ${getConnectorClasses(step.key)}
                  `}></div>
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
      
      {/* Progress Percentage */}
      <div className="mt-4">
        <div className="flex justify-between text-xs text-gray-500 mb-1">
          <span>Progress</span>
          <span>{getProgressPercentage(currentStep)}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className={`h-2 rounded-full transition-all duration-500 ${
              currentStep === 'error' ? 'bg-red-500' : 'bg-blue-500'
            }`}
            style={{ width: `${getProgressPercentage(currentStep)}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
};

function getProgressPercentage(currentStep: PaymentStep): number {
  switch (currentStep) {
    case 'loading': return 25;
    case 'payment': return 50;
    case 'processing': return 75;
    case 'success': return 100;
    case 'error': return 25;
    default: return 0;
  }
}

export default PaymentProgressIndicator;