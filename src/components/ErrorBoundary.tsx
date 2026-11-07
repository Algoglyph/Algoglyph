import { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';
import { isPrivateAnalyticsPath } from '../lib/analytics';

interface Props {
  children: ReactNode;
}

interface State {
  error: Error | null;
}

/**
 * Top-level error boundary. A render-time throw anywhere below this would
 * otherwise leave a blank white screen; here we show a recoverable fallback and
 * reassure the user their work is safe (it lives in IndexedDB, untouched by a UI
 * crash). Errors are logged to the console and, if PostHog is loaded, captured.
 */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[ErrorBoundary] uncaught render error:', error, info.componentStack);
    const ph = (window as unknown as { posthog?: { captureException?: (e: unknown) => void } }).posthog;
    if (!isPrivateAnalyticsPath(window.location.pathname)) ph?.captureException?.(error);
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.error) {
      return (
        <div className="flex h-screen w-screen items-center justify-center bg-canvas-soft text-ink p-6">
          <div className="flex max-w-md flex-col items-center gap-5 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full border border-hairline bg-canvas text-2xl">
              ⚠️
            </div>
            <div className="flex flex-col gap-2">
              <h1 className="text-xl font-semibold tracking-tight">Something went wrong</h1>
              <p className="text-[14px] leading-relaxed text-body">
                The interface hit an unexpected error. Your work is saved locally and was
                not affected — reloading should recover the workspace.
              </p>
            </div>
            <button
              onClick={this.handleReload}
              className="rounded-full bg-ink px-5 py-2.5 text-[13px] font-semibold text-canvas transition-colors hover:opacity-90 cursor-pointer"
            >
              Reload workspace
            </button>
            {import.meta.env.DEV && (
              <pre className="mt-2 max-h-40 w-full overflow-auto rounded-lg border border-hairline bg-canvas p-3 text-left font-mono text-[11px] text-body">
                {this.state.error.message}
              </pre>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
