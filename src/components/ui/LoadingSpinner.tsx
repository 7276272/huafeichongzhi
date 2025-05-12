import React from 'react';
import './LoadingSpinner.css';

type LoadingSpinnerProps = {
  /**
   * Size variant for the spinner
   * - 'fullscreen': covers the entire screen (for page loading)
   * - 'large': standalone large spinner (for empty states)
   * - 'medium': medium sized spinner (default)
   * - 'small': small spinner (for inline or button loading states)
   * - 'tiny': very small spinner for tight spaces
   */
  size?: 'fullscreen' | 'large' | 'medium' | 'small' | 'tiny';
  
  /**
   * Optional text to display
   */
  text?: string;
  
  /**
   * Optional className to apply additional styles
   */
  className?: string;
};

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'medium', 
  text = 'loading',
  className = ''
}) => {
  const getSizeClass = () => {
    switch (size) {
      case 'fullscreen': return 'loading-fullscreen';
      case 'large': return 'loading-large';
      case 'small': return 'loading-small';
      case 'tiny': return 'loading-tiny';
      default: return 'loading-medium'; // medium is default
    }
  };
  
  const showText = size !== 'tiny';

  return (
    <div className={`loading-spinner ${getSizeClass()} ${className}`}>
      <div className="loading-container">
        <div className="loading-ring"></div>
        <div className="loading-ring"></div>
        <div className="loading-ring"></div>
        <div className="loading-ring"></div>
        {showText && <div className="loading-text">{text}</div>}
      </div>
    </div>
  );
};

/**
 * LoadingButton component specifically designed for button loading states
 */
export const LoadingButton: React.FC<{children?: React.ReactNode, className?: string}> = ({ children, className = '' }) => {
  return (
    <span className={`flex items-center justify-center ${className}`}>
      <LoadingSpinner size="tiny" />
      {children && <span className="ml-2">{children}</span>}
    </span>
  );
};

/**
 * InlineLoading component for inline loading indicators
 */
export const InlineLoading: React.FC<{className?: string}> = ({ className = '' }) => {
  return <LoadingSpinner size="small" text="" className={className} />;
};

export default LoadingSpinner;
