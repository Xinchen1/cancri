import React from 'react';
import ReactDOM from 'react-dom/client';
import { ErrorBoundary } from './components/ErrorBoundary';
import { LoadingProgress } from './components/LoadingProgress';

// Add global error handlers BEFORE any imports that might fail
window.addEventListener('error', (event) => {
  console.error('Global error:', event.error);
  console.error('Error stack:', event.error?.stack);
  
  // Show error to user
  const errorElement = document.createElement('div');
  errorElement.style.cssText = 'position: fixed; top: 20px; right: 20px; background: #dc2626; color: white; padding: 15px; border-radius: 5px; z-index: 9999; font-family: Inter, sans-serif; font-size: 14px; max-width: 400px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);';
  errorElement.textContent = `错误: ${event.error instanceof Error ? event.error.message : '未知错误'}`;
  document.body.appendChild(errorElement);
  
  setTimeout(() => {
    errorElement.style.opacity = '0.8';
    errorElement.style.transition = 'opacity 0.3s';
  }, 100);
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason);
  
  // Show error to user
  const errorElement = document.createElement('div');
  errorElement.style.cssText = 'position: fixed; top: 20px; right: 20px; background: #dc2626; color: white; padding: 15px; border-radius: 5px; z-index: 9999; font-family: Inter, sans-serif; font-size: 14px; max-width: 400px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);';
  errorElement.textContent = `Promise 拒绝: ${event.reason instanceof Error ? event.reason.message : String(event.reason)}`;
  document.body.appendChild(errorElement);
  
  setTimeout(() => {
    errorElement.style.opacity = '0.8';
    errorElement.style.transition = 'opacity 0.3s';
  }, 100);
});

// Add WebGL detection before app loads
const checkWebGLSupport = () => {
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    
    if (!gl) {
      console.error('WebGL not supported');
      const warningElement = document.createElement('div');
      warningElement.style.cssText = 'position: fixed; bottom: 20px; left: 50%; transform: translateX(-50%); background: #f59e0b; color: white; padding: 15px 20px; border-radius: 5px; z-index: 9999; font-family: Inter, sans-serif; font-size: 14px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);';
      warningElement.textContent = '警告: WebGL 不受支持，3D 场景将被禁用';
      document.body.appendChild(warningElement);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('WebGL detection error:', error);
    return false;
  }
};

// Check WebGL support early
const webglSupported = checkWebGLSupport();
if (!webglSupported) {
  console.warn('WebGL not supported, falling back to 2D mode');
}

// Import App component
import App from './App';

const rootElement = document.getElementById('root');
if (!rootElement) {
  document.body.innerHTML = '<div style="color: white; padding: 20px; background: #050505; width: 100vw; height: 100vh; display: flex; align-items: center; justify-content: center;">无法找到根元素。请检查 HTML 文件。</div>';
  throw new Error("Could not find root element to mount to");
}

// Add loading indicator - will be replaced by React component
const loadingDiv = document.createElement('div');
loadingDiv.id = 'loading';
loadingDiv.style.cssText = 'position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; z-index: 99999; background: #050505;';
rootElement.appendChild(loadingDiv);

// Render loading progress component immediately
try {
  const loadingRoot = ReactDOM.createRoot(loadingDiv);
  loadingRoot.render(<LoadingProgress />);
} catch (e) {
  console.error('Failed to render loading:', e);
  loadingDiv.innerHTML = '<div style="display: flex; align-items: center; justify-content: center; height: 100vh; color: white; font-family: Inter, sans-serif;">Loading...</div>';
}

try {
  console.log('[CANCRI] Initializing React app...');
  console.log('[CANCRI] Base URL:', window.location.origin + window.location.pathname);
  console.log('[CANCRI] Root element:', rootElement);
  console.log('[CANCRI] ReactDOM:', ReactDOM);
  console.log('[CANCRI] App component:', App);
  console.log('[CANCRI] Environment:', {
    VITE_API_BASE_URL: import.meta.env?.VITE_API_BASE_URL,
    MODE: import.meta.env?.MODE,
    BASE_URL: import.meta.env?.BASE_URL
  });
  
  const root = ReactDOM.createRoot(rootElement);
  console.log('[CANCRI] Root created:', root);
  
  root.render(
    <React.StrictMode>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </React.StrictMode>
  );
  
  console.log('[CANCRI] React app rendered successfully');
  
  // Remove loading indicator after render
  setTimeout(() => {
    const loader = document.getElementById('loading');
    if (loader) {
      // Complete progress to 100%
      const progressElement = loader.querySelector('[style*="width"]') as HTMLElement;
      if (progressElement) {
        progressElement.style.width = '100%';
      }
      
      // Fade out after a short delay
      setTimeout(() => {
        loader.style.opacity = '0';
        loader.style.transition = 'opacity 0.5s ease-out';
        setTimeout(() => {
          try {
            const loadingRoot = ReactDOM.createRoot(loader);
            loadingRoot.unmount();
          } catch (e) {
            // Ignore unmount errors
          }
          loader.remove();
        }, 500);
      }, 500);
    }
  }, 2000);
} catch (error) {
  console.error('Failed to render app:', error);
  rootElement.innerHTML = `
    <div style="color: white; padding: 20px; background: #050505; width: 100vw; height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center; font-family: Inter, sans-serif;">
      <h1 style="color: #f43f5e; margin-bottom: 20px;">应用加载失败</h1>
      <p style="margin-bottom: 20px;">${error instanceof Error ? error.message : '未知错误'}</p>
      ${error instanceof Error && error.stack ? `<pre style="background: #1a1a1a; padding: 15px; border-radius: 5px; overflow: auto; font-size: 12px; max-width: 800px; width: 100%; margin-bottom: 20px;">${error.stack}</pre>` : ''}
      <button onclick="window.location.reload()" style="padding: 10px 20px; background: #7e22ce; color: white; border: none; border-radius: 5px; cursor: pointer;">
        刷新页面
      </button>
    </div>
  `;
}
