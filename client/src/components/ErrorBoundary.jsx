import { Component } from 'react';
import { HiOutlineExclamationCircle, HiOutlineRefresh, HiOutlineHome } from 'react-icons/hi';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('[ErrorBoundary caught error]:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[50vh] flex items-center justify-center p-6">
          <div className="max-w-md w-full admin-card p-8 text-center space-y-4 border border-danger/30">
            <div className="w-14 h-14 rounded-full bg-danger/10 border border-danger/30 flex items-center justify-center mx-auto text-danger">
              <HiOutlineExclamationCircle className="w-8 h-8" />
            </div>

            <h3 className="text-lg font-display font-bold text-text-primary">
              Section Render Interrupted
            </h3>

            <p className="text-xs text-text-muted">
              An unexpected render error occurred in this view.
            </p>

            {this.state.error?.message && (
              <div className="bg-surface rounded-lg p-3 text-[11px] font-mono text-danger/80 break-words text-left border border-border">
                {this.state.error.message}
              </div>
            )}

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={this.handleReset}
                className="admin-btn-secondary text-xs flex items-center gap-1.5"
              >
                <HiOutlineRefresh className="w-3.5 h-3.5" />
                <span>Retry</span>
              </button>
              <a
                href="/admin"
                className="admin-btn-primary text-xs flex items-center gap-1.5"
              >
                <HiOutlineHome className="w-3.5 h-3.5" />
                <span>Dashboard</span>
              </a>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
