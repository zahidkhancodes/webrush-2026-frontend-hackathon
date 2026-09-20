/**
 * @module LoadingSpinner
 * @description Accessible loading indicator with ARIA live announcements.
 * Provides visual feedback during async data fetching operations.
 */
import React from 'react';

interface Props {
  /** Message displayed below the spinner */
  message?: string;
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
}

const SIZES = { sm: 24, md: 40, lg: 56 } as const;

/**
 * Animated loading spinner with accessibility support.
 * Announces loading state to screen readers via `aria-live`.
 */
export const LoadingSpinner: React.FC<Props> = ({
  message = 'Loading...',
  size = 'md',
}) => {
  const px = SIZES[size];

  return (
    <div
      className="loading-spinner-container"
      role="status"
      aria-live="polite"
      aria-busy="true"
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '3rem 1rem',
        gap: '1rem',
      }}
    >
      <svg
        className="loading-spinner"
        width={px}
        height={px}
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden="true"
      >
        <circle
          cx="12" cy="12" r="10"
          stroke="var(--faded, #8A857A)"
          strokeWidth="2"
          strokeDasharray="32"
          strokeLinecap="round"
          opacity="0.3"
        />
        <circle
          cx="12" cy="12" r="10"
          stroke="var(--stamp, #5B2E8C)"
          strokeWidth="2"
          strokeDasharray="32"
          strokeLinecap="round"
          style={{ animation: 'spinnerRotate 1s linear infinite' }}
        />
      </svg>
      <p
        className="text-faded"
        style={{ fontSize: size === 'sm' ? '0.75rem' : '0.875rem', margin: 0 }}
      >
        {message}
      </p>
    </div>
  );
};
