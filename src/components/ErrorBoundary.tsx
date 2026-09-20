/**
 * @module ErrorBoundary
 * @description React error boundary component that catches rendering errors
 * and displays a user-friendly fallback UI instead of a blank screen.
 */
import React from 'react';

interface Props {
  children: React.ReactNode;
  /** Optional fallback UI; defaults to a styled error message */
  fallback?: React.ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * Catches JavaScript errors anywhere in the child component tree,
 * logs them, and renders a fallback UI.
 *
 * @example
 * ```tsx
 * <ErrorBoundary>
 *   <MyComponent />
 * </ErrorBoundary>
 * ```
 */
export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo): void {
    console.error('[ErrorBoundary] Caught error:', error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <div
          role="alert"
          style={{
            padding: '2rem',
            textAlign: 'center',
            fontFamily: "'IBM Plex Mono', monospace",
            color: 'var(--ink, #1B1A17)',
          }}
        >
          <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>
            Something went wrong
          </h2>
          <p style={{ color: 'var(--faded, #8A857A)', marginBottom: '1.5rem' }}>
            {this.state.error?.message ?? 'An unexpected error occurred.'}
          </p>
          <button
            onClick={() => window.location.reload()}
            style={{
              padding: '0.75rem 1.5rem',
              background: 'var(--stamp, #5B2E8C)',
              color: '#fff',
              border: 'none',
              cursor: 'pointer',
              fontFamily: 'inherit',
              fontSize: '1rem',
              borderRadius: '4px',
            }}
          >
            Reload Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
