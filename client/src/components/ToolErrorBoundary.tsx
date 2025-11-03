import { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home, Calculator, FileText, Activity } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { LoadingSpinner } from './ui/loading-spinner';

interface Props {
  children: ReactNode;
  toolName?: string;
  toolCategory?: 'finance' | 'text' | 'health';
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  onRetry?: () => void;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
  isRetrying: boolean;
  retryCount: number;
}

const categoryIcons = {
  finance: Calculator,
  text: FileText,
  health: Activity,
};

const categoryColors = {
  finance: 'from-blue-500 to-purple-600',
  text: 'from-yellow-500 to-orange-600',
  health: 'from-pink-500 to-rose-600',
};

export class ToolErrorBoundary extends Component<Props, State> {
  private retryTimer?: NodeJS.Timeout;

  constructor(props: Props) {
    super(props);
    this.state = { 
      hasError: false, 
      isRetrying: false,
      retryCount: 0
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { 
      hasError: true, 
      error 
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ToolErrorBoundary caught an error:', error, errorInfo);
    
    this.setState({
      error,
      errorInfo
    });
    
    // Call optional error handler
    this.props.onError?.(error, errorInfo);
    
    // Log to analytics if available
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'tool_error', {
        tool_name: this.props.toolName || 'unknown',
        error_message: error.toString(),
        tool_category: this.props.toolCategory || 'unknown'
      });
    }
  }

  componentWillUnmount() {
    if (this.retryTimer) {
      clearTimeout(this.retryTimer);
    }
  }

  handleRetry = () => {
    const { retryCount } = this.state;
    
    if (retryCount >= 3) {
      // Max retries reached, don't retry anymore
      return;
    }

    this.setState({ isRetrying: true });
    
    // Call custom retry handler if provided
    this.props.onRetry?.();
    
    // Auto-retry after a delay
    this.retryTimer = setTimeout(() => {
      this.setState({ 
        hasError: false, 
        error: undefined, 
        errorInfo: undefined,
        isRetrying: false,
        retryCount: retryCount + 1
      });
    }, 1000);
  };

  handleGoHome = () => {
    if (typeof window !== 'undefined') {
      window.location.href = '/';
    }
  };

  handleGoToCategory = () => {
    if (typeof window !== 'undefined' && this.props.toolCategory) {
      window.location.href = `/${this.props.toolCategory}-tools`;
    }
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      if (this.state.isRetrying) {
        return (
          <div className="min-h-[400px] flex items-center justify-center" data-testid="tool-error-retrying">
            <Card className="max-w-md mx-auto">
              <CardContent className="p-8 text-center">
                <LoadingSpinner size="lg" />
                <p className="mt-4 text-gray-600 dark:text-gray-400">
                  Retrying...
                </p>
              </CardContent>
            </Card>
          </div>
        );
      }

      const { toolName, toolCategory } = this.props;
      const { retryCount } = this.state;
      const Icon = toolCategory ? categoryIcons[toolCategory] : AlertTriangle;
      const gradientClass = toolCategory ? categoryColors[toolCategory] : 'from-red-500 to-red-600';

      return (
        <div className="min-h-[400px] flex items-center justify-center px-4" data-testid="tool-error-boundary">
          <Card className="max-w-lg mx-auto">
            <CardContent className="p-8 text-center">
              <div className="mb-6">
                <div className={`w-16 h-16 bg-gradient-to-r ${gradientClass} rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg`}>
                  <Icon className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                  {toolName ? `${toolName} Error` : 'Tool Error'}
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  We encountered an issue while loading this tool. This usually resolves itself quickly.
                </p>
              </div>
              
              <div className="space-y-3">
                {retryCount < 3 && (
                  <Button 
                    onClick={this.handleRetry}
                    variant="default"
                    className="w-full flex items-center gap-2"
                    data-testid="button-retry-tool"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Try Again {retryCount > 0 && `(${retryCount}/3)`}
                  </Button>
                )}
                
                {toolCategory && (
                  <Button 
                    onClick={this.handleGoToCategory}
                    variant="outline"
                    className="w-full flex items-center gap-2"
                    data-testid="button-category"
                  >
                    <Icon className="w-4 h-4" />
                    Browse {toolCategory} tools
                  </Button>
                )}
                
                <Button 
                  onClick={this.handleGoHome}
                  variant="outline"
                  className="w-full flex items-center gap-2"
                  data-testid="button-home-from-error"
                >
                  <Home className="w-4 h-4" />
                  Go Home
                </Button>
              </div>

              {retryCount >= 3 && (
                <div className="mt-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                  <p className="text-sm text-yellow-800 dark:text-yellow-200">
                    <strong>Still having issues?</strong> This tool might be temporarily unavailable. 
                    Try browsing other tools or come back later.
                  </p>
                </div>
              )}

              {process.env.NODE_ENV === 'development' && this.state.error && (
                <details className="mt-6 text-left">
                  <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700">
                    Error Details (Development Only)
                  </summary>
                  <div className="mt-2 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg text-xs font-mono text-red-800 dark:text-red-200 overflow-auto max-h-40">
                    <p className="font-semibold mb-2">{this.state.error.toString()}</p>
                    {this.state.errorInfo?.componentStack && (
                      <pre className="whitespace-pre-wrap">{this.state.errorInfo.componentStack}</pre>
                    )}
                  </div>
                </details>
              )}
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

// Higher-order component for wrapping individual tools
export const withToolErrorBoundary = <P extends object>(
  Component: React.ComponentType<P>,
  toolConfig?: {
    name?: string;
    category?: 'finance' | 'text' | 'health';
    onError?: (error: Error, errorInfo: ErrorInfo) => void;
    onRetry?: () => void;
  }
) => {
  const ComponentWithToolErrorBoundary = (props: P) => (
    <ToolErrorBoundary 
      toolName={toolConfig?.name}
      toolCategory={toolConfig?.category}
      onError={toolConfig?.onError}
      onRetry={toolConfig?.onRetry}
    >
      <Component {...props} />
    </ToolErrorBoundary>
  );
  
  ComponentWithToolErrorBoundary.displayName = `withToolErrorBoundary(${Component.displayName || Component.name})`;
  
  return ComponentWithToolErrorBoundary;
};

export default ToolErrorBoundary;