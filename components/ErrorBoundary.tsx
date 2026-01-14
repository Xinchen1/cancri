import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div style={{
          width: '100vw',
          height: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#050505',
          color: '#fff',
          padding: '20px',
          fontFamily: 'Inter, sans-serif'
        }}>
          <h1 style={{ fontSize: '24px', marginBottom: '20px', color: '#f43f5e' }}>应用加载错误</h1>
          <p style={{ marginBottom: '10px', color: '#fff' }}>应用遇到了一个错误，请刷新页面重试。</p>
          {this.state.error && (
            <details style={{ marginTop: '20px', maxWidth: '800px', width: '100%' }}>
              <summary style={{ cursor: 'pointer', color: '#a855f7', marginBottom: '10px' }}>错误详情</summary>
              <pre style={{
                backgroundColor: '#1a1a1a',
                padding: '15px',
                borderRadius: '5px',
                overflow: 'auto',
                fontSize: '12px',
                color: '#f43f5e'
              }}>
                {this.state.error.toString()}
                {this.state.error.stack && `\n\n${this.state.error.stack}`}
              </pre>
            </details>
          )}
          <button
            onClick={() => window.location.reload()}
            style={{
              marginTop: '20px',
              padding: '10px 20px',
              backgroundColor: '#7e22ce',
              color: '#fff',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            刷新页面
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

