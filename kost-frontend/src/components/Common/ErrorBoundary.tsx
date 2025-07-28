// src/components/Common/ErrorBoundary.tsx
import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface Props {
  children?: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ errorInfo });
    
    // Call custom error handler if provided
    this.props.onError?.(error, errorInfo);
    
    // Log error in development mode only
    if (process.env.NODE_ENV === 'development') {
      console.group('🚨 Error Boundary Caught An Error');
      console.error('Error:', error);
      console.error('Error Info:', errorInfo);
      console.groupEnd();
    }
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleGoHome = () => {
    window.location.href = '/';
  };

  private handleRetry = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  public render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center p-4">
          <div className="max-w-lg w-full bg-white rounded-xl shadow-2xl p-8 text-center border border-red-100">
            <div className="mb-6">
              <div className="relative">
                <AlertTriangle className="w-20 h-20 text-red-500 mx-auto animate-pulse" />
                <div className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs font-bold">!</span>
                </div>
              </div>
            </div>
            
            <h1 className="text-2xl font-bold text-gray-900 mb-3">
              🚨 Oops! Something went wrong
            </h1>
            
            <p className="text-gray-600 mb-2">
              An unexpected error occurred in the application.
            </p>
            <p className="text-sm text-gray-500 mb-8">
              Don't worry, this has been logged and our team will investigate.
            </p>

            {/* Error details in development */}
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mb-6 text-left bg-red-50 border border-red-200 p-4 rounded-lg">
                <summary className="cursor-pointer font-medium text-red-700 hover:text-red-800">
                  🔍 Error Details (Development Mode)
                </summary>
                <div className="mt-3 space-y-2">
                  <div className="bg-white p-3 rounded border">
                    <div className="text-xs font-medium text-gray-600 mb-1">Error Message:</div>
                    <pre className="text-xs text-red-600 overflow-auto whitespace-pre-wrap">
                      {this.state.error.message}
                    </pre>
                  </div>
                  {this.state.error.stack && (
                    <div className="bg-white p-3 rounded border">
                      <div className="text-xs font-medium text-gray-600 mb-1">Stack Trace:</div>
                      <pre className="text-xs text-gray-600 overflow-auto whitespace-pre-wrap max-h-32">
                        {this.state.error.stack}
                      </pre>
                    </div>
                  )}
                  {this.state.errorInfo?.componentStack && (
                    <div className="bg-white p-3 rounded border">
                      <div className="text-xs font-medium text-gray-600 mb-1">Component Stack:</div>
                      <pre className="text-xs text-gray-600 overflow-auto whitespace-pre-wrap max-h-32">
                        {this.state.errorInfo.componentStack}
                      </pre>
                    </div>
                  )}
                </div>
              </details>
            )}
            
            <div className="space-y-3">
              <button
                onClick={this.handleRetry}
                className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-all duration-200 flex items-center justify-center gap-2 font-medium shadow-lg hover:shadow-xl"
              >
                <RefreshCw className="w-5 h-5" />
                🔄 Try Again
              </button>
              
              <button
                onClick={this.handleReload}
                className="w-full bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-all duration-200 flex items-center justify-center gap-2 font-medium shadow-lg hover:shadow-xl"
              >
                <RefreshCw className="w-5 h-5" />
                🔄 Reload Page
              </button>
              
              <button
                onClick={this.handleGoHome}
                className="w-full bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-all duration-200 flex items-center justify-center gap-2 font-medium shadow-lg hover:shadow-xl"
              >
                <Home className="w-5 h-5" />
                🏠 Go to Homepage
              </button>
            </div>
            
            <div className="mt-6 pt-4 border-t border-gray-200">
              <p className="text-xs text-gray-500">
                Error ID: {Date.now().toString(36)} • {new Date().toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// HOC for easier usage
export const withErrorBoundary = <P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<Props, 'children'>
) => {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </ErrorBoundary>
  );

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;
  return WrappedComponent;
};

export default ErrorBoundary;