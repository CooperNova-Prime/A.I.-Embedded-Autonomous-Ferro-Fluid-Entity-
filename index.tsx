/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { Component, ErrorInfo, ReactNode } from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  override state: ErrorBoundaryState = { hasError: false, error: null };

  constructor(props: ErrorBoundaryProps) {
    super(props);
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  override componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.warn('ErrorBoundary caught error:', error, errorInfo);
  }

  override render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-[#050608] text-white p-6 font-mono text-center select-none">
          <div className="max-w-md p-6 rounded-2xl bg-[#090b10] border border-cyan-500/30 shadow-2xl">
            <h1 className="text-xl font-bold text-cyan-400 mb-2 font-sans">Ferrofluid Arcana Simulation</h1>
            <p className="text-sm text-stone-400 mb-4">
              The 3D WebGL pipeline encountered an unexpected state. You can reload to restore the session.
            </p>
            <button
              onClick={() => {
                this.setState({ hasError: false, error: null });
                window.location.reload();
              }}
              className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-medium text-xs tracking-wider uppercase transition-all shadow-lg cursor-pointer"
            >
              Restart Simulation
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);