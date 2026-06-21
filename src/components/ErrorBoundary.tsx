import React from 'react';

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('Uncaught error in React tree:', error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex h-screen w-screen items-center justify-center bg-canvas text-ink font-mono">
          <div className="flex flex-col items-center gap-4 max-w-md text-center px-6">
            <div className="text-2xl">⚠️</div>
            <h1 className="text-sm font-semibold">Something went wrong</h1>
            <p className="text-xs text-mute leading-relaxed">
              {this.state.error?.message || 'An unexpected error occurred.'}
            </p>
            <button
              onClick={() => {
                this.setState({ hasError: false, error: null });
              }}
              className="px-4 py-2 text-xs rounded-md bg-link text-white hover:bg-link-deep transition-colors cursor-pointer"
            >
              Try Again
            </button>
            <button
              onClick={() => window.location.reload()}
              className="text-[11px] text-mute hover:text-ink cursor-pointer"
            >
              Reload the app
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
