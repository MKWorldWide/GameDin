import React from 'react';

/**
 * Interface for LoadingSpinner props
 */
interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large';
  text?: string;
  className?: string;
}

/**
 * Galaxy LoadingSpinner component with cosmic animations
 *
 * Features Apple-inspired design with:
 * - Cosmic gradient spinner
 * - Floating star animations
 * - Glassmorphism effects
 * - Premium typography
 * - Accessibility-first approach
 *
 * @param props - Component props
 * @returns Galaxy-themed loading spinner component
 */
const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'medium',
  text = 'Exploring the galaxy...',
  className = '',
}) => {
  // Size classes for different spinner sizes
  const sizeClasses = {
    small: 'w-6 h-6',
    medium: 'w-12 h-12',
    large: 'w-16 h-16',
  };

  return (
    <div
      className={`flex justify-center items-center min-h-screen relative ${className}`}
      role="status"
      aria-live="polite"
      aria-label={text}
    >
      {/* Animated background stars */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-accent-gold rounded-full animate-star-twinkle"
            style={{
              left: `${20 + (i * 10)}%`,
              top: `${30 + (i * 8)}%`,
              animationDelay: `${i * 0.2}s`,
              animationDuration: `${1.5 + (i * 0.1)}s`,
            }}
          ></div>
        ))}
        {[...Array(6)].map((_, i) => (
          <div
            key={`cyan-${i}`}
            className="absolute w-0.5 h-0.5 bg-accent-cyan rounded-full animate-star-twinkle"
            style={{
              left: `${70 + (i * 5)}%`,
              top: `${20 + (i * 10)}%`,
              animationDelay: `${i * 0.3}s`,
              animationDuration: `${1.8 + (i * 0.1)}s`,
            }}
          ></div>
        ))}
      </div>

      <div className="flex flex-col items-center space-y-6 relative z-10">
        {/* Cosmic Spinner */}
        <div className="relative">
          {/* Outer ring */}
          <div
            className={`${sizeClasses[size]} border-4 border-cosmic-glass rounded-full animate-spin`}
            style={{ borderTopColor: 'transparent' }}
            role="status"
            aria-hidden="true"
          />

          {/* Inner gradient ring */}
          <div
            className={'absolute inset-1 border-2 border-transparent rounded-full bg-gradient-to-r from-primary-500 to-secondary-500 animate-pulse-glow'}
            style={{
              background: 'conic-gradient(from 0deg, #6b46c1, #3b82f6, #f093fb, #6b46c1)',
              animation: 'spin 2s linear infinite',
            }}
          />

          {/* Center glow */}
          <div className="absolute inset-2 bg-gradient-to-br from-primary-400 to-secondary-400 rounded-full animate-pulse-glow opacity-30"></div>

          {/* Floating center element */}
          <div className="absolute inset-3 bg-gradient-to-br from-accent-gold to-accent-orange rounded-full flex items-center justify-center animate-float">
            <div className="w-1 h-1 bg-white rounded-full"></div>
          </div>
        </div>

        {/* Loading text with gradient */}
        <div className="text-center">
          <p className="text-text-primary font-sf-text font-medium text-lg bg-gradient-to-r from-primary-400 to-secondary-400 bg-clip-text text-transparent animate-pulse">
            {text}
          </p>
          <div className="mt-2 flex space-x-1 justify-center">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="w-2 h-2 bg-gradient-to-br from-primary-400 to-secondary-400 rounded-full animate-pulse"
                style={{ animationDelay: `${i * 0.2}s` }}
              ></div>
            ))}
          </div>
        </div>

        {/* Screen reader only text */}
        <span className="sr-only">
          {text}
        </span>
      </div>
    </div>
  );
};

export default LoadingSpinner;
