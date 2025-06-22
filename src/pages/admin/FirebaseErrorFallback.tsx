import React from 'react';
import { AlertTriangle, RefreshCw, Lock } from 'lucide-react';

interface FirebaseErrorFallbackProps {
  error: Error | null;
  resetErrorBoundary?: () => void;
  retryAction?: () => void;
}

const FirebaseErrorFallback: React.FC<FirebaseErrorFallbackProps> = ({ 
  error, 
  resetErrorBoundary,
  retryAction 
}) => {
  const isPermissionError = 
    error?.name === 'FirebaseError' && 
    (error.message.includes('permission') || error?.['code'] === 'permission-denied');
  
  const handleRetry = () => {
    if (retryAction) {
      retryAction();
    } else if (resetErrorBoundary) {
      resetErrorBoundary();
    } else {
      window.location.reload();
    }
  };

  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-8 bg-white rounded-lg shadow-sm">
      <div className="w-full max-w-md text-center">
        {isPermissionError ? (
          <Lock size={48} className="mx-auto text-red-500 mb-4" />
        ) : (
          <AlertTriangle size={48} className="mx-auto text-yellow-500 mb-4" />
        )}
        
        <h2 className="text-xl font-semibold mb-2">
          {isPermissionError ? 'Authentication Required' : 'Error Loading Data'}
        </h2>
        
        <p className="text-gray-600 mb-6">
          {isPermissionError 
            ? 'You do not have sufficient permissions to access this data. Please make sure you are properly authenticated as an admin.'
            : 'We encountered a problem while loading the data. This might be due to a network issue or a temporary service disruption.'}
        </p>
        
        <div className="flex flex-col sm:flex-row justify-center gap-3">
          <button 
            onClick={handleRetry}
            className="flex items-center justify-center px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
          >
            <RefreshCw size={16} className="mr-2" />
            Try Again
          </button>
          
          {isPermissionError && (
            <button 
              onClick={() => window.location.href = '/login'}
              className="flex items-center justify-center px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
            >
              Go to Login
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default FirebaseErrorFallback;