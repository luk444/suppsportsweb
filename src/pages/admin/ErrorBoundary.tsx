import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const isFirebaseError = this.state.error?.name === 'FirebaseError';
      const isPermissionError = isFirebaseError && 
        this.state.error?.message?.includes('permission');

      return (
        <div className="flex flex-col items-center justify-center p-6 bg-white rounded-lg shadow-sm">
          <AlertTriangle size={48} className="text-yellow-500 mb-4" />
          <h2 className="text-xl font-semibold mb-2">
            {isPermissionError ? 'Authentication Required' : 'Something went wrong'}
          </h2>
          <p className="text-gray-600 text-center mb-4">
            {isPermissionError 
              ? 'You do not have sufficient permissions to access this data. Please make sure you are properly authenticated as an admin.'
              : 'We encountered an error while loading this content. Please try again later.'}
          </p>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;