'use client';

import { LoadingSpinner } from './loading-spinner';
import { ErrorAlert } from './error-alert';

interface LoadingStateProps {
  isLoading: boolean;
  error: Error | null;
  onRetry?: () => void;
  loadingText?: string;
  errorTitle?: string;
  children: React.ReactNode;
  className?: string;
}

export function LoadingState({
  isLoading,
  error,
  onRetry,
  loadingText = 'Loading...',
  errorTitle = 'Error',
  children,
  className = '',
}: LoadingStateProps) {
  if (isLoading) {
    return (
      <div className={`flex justify-center items-center py-12 ${className}`}>
        <LoadingSpinner text={loadingText} />
      </div>
    );
  }

  if (error) {
    return (
      <div className={className}>
        <ErrorAlert
          title={errorTitle}
          message={error.message}
          onRetry={onRetry}
        />
      </div>
    );
  }

  return <>{children}</>;
}
