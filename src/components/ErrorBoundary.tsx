import { Component, type ErrorInfo, type ReactNode } from 'react';
import { theme } from '@/config/theme';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * Global Error Boundary — catches any unhandled JS error in the React tree
 * and renders a premium-styled fallback screen with Refresh & Logout buttons.
 */
class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[ErrorBoundary] Caught error:', error, errorInfo);
  }

  handleRefresh = () => {
    window.location.reload();
  };

  handleLogout = () => {
    // Clear persisted Redux state & tokens
    try {
      localStorage.clear();
      sessionStorage.clear();
    } catch (_) {
      /* ignore */
    }
    window.location.href = '/login';
  };

  render() {
    if (!this.state.hasError) {
      return this.props.children;
    }

    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: `linear-gradient(135deg, ${theme.background} 0%, ${theme.surfaceMuted} 100%)`,
          fontFamily:
            "'Inter', 'Segoe UI', -apple-system, BlinkMacSystemFont, sans-serif",
          padding: '24px',
        }}
      >
        <div
          style={{
            maxWidth: 520,
            width: '100%',
            background: theme.surface,
            borderRadius: 24,
            border: `1px solid ${theme.border}`,
            boxShadow:
              '0 25px 50px -12px rgba(0,0,0,0.08), 0 0 0 1px rgba(0,0,0,0.03)',
            padding: '48px 40px',
            textAlign: 'center',
          }}
        >
          {/* Icon */}
          <div
            style={{
              width: 80,
              height: 80,
              borderRadius: '50%',
              background: theme.destructiveSoft,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 28px',
              border: `2px solid ${theme.destructive}30`,
            }}
          >
            <svg
              width="36"
              height="36"
              viewBox="0 0 24 24"
              fill="none"
              stroke={theme.destructive}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          </div>

          {/* Title */}
          <h1
            style={{
              fontSize: 28,
              fontWeight: 800,
              color: theme.textPrimary,
              margin: '0 0 12px',
              letterSpacing: '-0.02em',
            }}
          >
            Something went wrong
          </h1>

          {/* Description */}
          <p
            style={{
              fontSize: 15,
              color: theme.textSecondary,
              margin: '0 0 32px',
              lineHeight: 1.6,
            }}
          >
            An unexpected error occurred while rendering this page.
            <br />
            Try refreshing, or log out and sign back in.
          </p>

          {/* Error detail (collapsible-ish) */}
          {this.state.error && (
            <div
              style={{
                background: theme.surfaceMuted,
                borderRadius: 12,
                padding: '14px 18px',
                marginBottom: 32,
                textAlign: 'left',
                border: `1px solid ${theme.border}`,
                maxHeight: 120,
                overflowY: 'auto',
              }}
            >
              <p
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: theme.destructive,
                  margin: '0 0 4px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                }}
              >
                Error Details
              </p>
              <code
                style={{
                  fontSize: 12,
                  color: theme.textMuted,
                  wordBreak: 'break-word',
                  lineHeight: 1.5,
                }}
              >
                {this.state.error.message}
              </code>
            </div>
          )}

          {/* Buttons */}
          <div
            style={{
              display: 'flex',
              gap: 14,
              justifyContent: 'center',
            }}
          >
            <button
              onClick={this.handleRefresh}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '12px 28px',
                borderRadius: 12,
                border: 'none',
                background: theme.accent,
                color: theme.accentForeground,
                fontSize: 14,
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 150ms ease',
                boxShadow: `0 4px 14px ${theme.accent}40`,
              }}
              onMouseEnter={(e) => {
                (e.target as HTMLButtonElement).style.background = theme.accentHover;
                (e.target as HTMLButtonElement).style.transform = 'translateY(-1px)';
              }}
              onMouseLeave={(e) => {
                (e.target as HTMLButtonElement).style.background = theme.accent;
                (e.target as HTMLButtonElement).style.transform = 'translateY(0)';
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="23 4 23 10 17 10" />
                <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
              </svg>
              Refresh Page
            </button>

            <button
              onClick={this.handleLogout}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '12px 28px',
                borderRadius: 12,
                border: `1.5px solid ${theme.border}`,
                background: theme.surface,
                color: theme.destructive,
                fontSize: 14,
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 150ms ease',
              }}
              onMouseEnter={(e) => {
                (e.target as HTMLButtonElement).style.background = theme.destructiveSoft;
                (e.target as HTMLButtonElement).style.borderColor = theme.destructive;
                (e.target as HTMLButtonElement).style.transform = 'translateY(-1px)';
              }}
              onMouseLeave={(e) => {
                (e.target as HTMLButtonElement).style.background = theme.surface;
                (e.target as HTMLButtonElement).style.borderColor = theme.border;
                (e.target as HTMLButtonElement).style.transform = 'translateY(0)';
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
              Logout
            </button>
          </div>
        </div>
      </div>
    );
  }
}

export default ErrorBoundary;
