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

// 添加早期诊断
console.log('[CANCRI] Pre-import diagnostics');
console.log('[CANCRI] Window location:', window.location.href);
console.log('[CANCRI] Document ready state:', document.readyState);
console.log('[CANCRI] Root element exists:', !!document.getElementById('root'));

// Import App component
import App from './App';

const rootElement = document.getElementById('root');
if (!rootElement) {
  // 创建错误显示
  const errorDiv = document.createElement('div');
  errorDiv.style.cssText = 'position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: #050505; color: white; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 20px; font-family: Inter, sans-serif; z-index: 99999;';
  errorDiv.innerHTML = `
    <h1 style="color: #f43f5e; margin-bottom: 20px;">无法找到根元素</h1>
    <p style="margin-bottom: 10px;">请检查 HTML 文件是否包含 &lt;div id="root"&gt;&lt;/div&gt;</p>
    <p style="color: #a855f7; font-size: 12px;">当前 URL: ${window.location.href}</p>
    <p style="color: #a855f7; font-size: 12px;">Pathname: ${window.location.pathname}</p>
  `;
  document.body.appendChild(errorDiv);
  throw new Error("Could not find root element to mount to");
}

// Add loading indicator - will be replaced by React component
const loadingDiv = document.createElement('div');
loadingDiv.id = 'loading';
loadingDiv.style.cssText = 'position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; z-index: 99999; background: #050505; display: flex; align-items: center; justify-content: center;';
loadingDiv.innerHTML = '<div style="color: white; font-family: Inter, sans-serif; text-align: center;"><h1 style="font-size: 24px; margin-bottom: 10px;">CANCRI</h1><p style="font-size: 14px; opacity: 0.7;">Loading...</p></div>';
rootElement.appendChild(loadingDiv);
console.log('[CANCRI] Loading indicator added');

// Render loading progress component immediately
let loadingRoot: ReturnType<typeof ReactDOM.createRoot> | null = null;
try {
  loadingRoot = ReactDOM.createRoot(loadingDiv);
  loadingRoot.render(<LoadingProgress />);
} catch (e) {
  console.error('[CANCRI] Failed to render loading:', e);
  loadingDiv.innerHTML = '<div style="display: flex; align-items: center; justify-content: center; height: 100vh; color: white; font-family: Inter, sans-serif; background: #050505;">Loading...</div>';
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
    BASE_URL: import.meta.env?.BASE_URL,
    PROD: import.meta.env?.PROD,
    DEV: import.meta.env?.DEV
  });
  
  // 检查关键资源是否加载
  const scripts = document.querySelectorAll('script[type="module"]');
  console.log('[CANCRI] Module scripts found:', scripts.length);
  scripts.forEach((script, i) => {
    console.log(`[CANCRI] Script ${i}:`, script.src || script.textContent?.substring(0, 50));
  });
  
  const styles = document.querySelectorAll('link[rel="stylesheet"]');
  console.log('[CANCRI] Stylesheets found:', styles.length);
  styles.forEach((style, i) => {
    console.log(`[CANCRI] Stylesheet ${i}:`, style.href);
  });
  
  const root = ReactDOM.createRoot(rootElement);
  console.log('[CANCRI] Root created:', root);
  
  // 添加渲染前的最后检查
  console.log('[CANCRI] About to render React app...');
  console.log('[CANCRI] React version:', React.version);
  console.log('[CANCRI] ReactDOM version:', ReactDOM.version);
  
  try {
    root.render(
      <React.StrictMode>
        <ErrorBoundary>
          <App />
        </ErrorBoundary>
      </React.StrictMode>
    );
    
    console.log('[CANCRI] React app rendered successfully');
    
    // 验证渲染结果
    setTimeout(() => {
      const rootEl = document.getElementById('root');
      if (rootEl && rootEl.children.length === 0) {
        console.error('[CANCRI] WARNING: Root element is still empty after render!');
        console.error('[CANCRI] This suggests React failed to render or ErrorBoundary caught an error');
      } else {
        console.log('[CANCRI] Root element has children:', rootEl?.children.length);
      }
    }, 1000);
  } catch (renderError) {
    console.error('[CANCRI] Failed to render React app:', renderError);
    throw renderError;
  }
  
  // Remove loading indicator after render
  setTimeout(() => {
    const loader = document.getElementById('loading');
    if (loader) {
      if (loadingRoot) {
        try {
          loadingRoot.unmount();
        } catch (e) {
          console.warn('[CANCRI] Failed to unmount loading:', e);
        }
      }
      try {
        loader.remove();
      } catch (e) {
        console.warn('[CANCRI] Failed to remove loader:', e);
      }
    }
  }, 500);
  
  // 额外的安全检查：如果 3 秒后页面仍然是黑色，显示诊断信息
  setTimeout(() => {
    const rootEl = document.getElementById('root');
    if (rootEl && rootEl.children.length === 0) {
      console.error('[CANCRI] Root element is empty after 3 seconds!');
      const diagnostic = document.createElement('div');
      diagnostic.style.cssText = 'position: fixed; top: 20px; right: 20px; background: #f43f5e; color: white; padding: 15px; border-radius: 5px; z-index: 99999; max-width: 400px; font-family: monospace; font-size: 12px;';
      diagnostic.innerHTML = `
        <strong>诊断信息</strong><br>
        Root children: ${rootEl.children.length}<br>
        URL: ${window.location.href}<br>
        检查控制台获取更多信息
      `;
      document.body.appendChild(diagnostic);
    }
  }, 3000);
} catch (e) {
  console.error('[CANCRI] Failed to initialize app:', e);
  const errorDiv = document.createElement('div');
  errorDiv.style.cssText = 'position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: #050505; color: white; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 20px; font-family: Inter, sans-serif; z-index: 99999;';
  errorDiv.innerHTML = `
    <h1 style="color: #f43f5e; margin-bottom: 20px;">应用初始化失败</h1>
    <p style="margin-bottom: 10px;">${e instanceof Error ? e.message : String(e)}</p>
    ${e instanceof Error && e.stack ? `<pre style="background: #1a1a1a; padding: 10px; border-radius: 5px; overflow: auto; max-width: 800px; font-size: 11px; margin: 10px 0;">${e.stack}</pre>` : ''}
    <p style="color: #a855f7; font-size: 12px; margin-top: 10px;">URL: ${window.location.href}</p>
    <button onclick="window.location.reload()" style="margin-top: 20px; padding: 10px 20px; background: #7e22ce; color: white; border: none; border-radius: 5px; cursor: pointer; font-size: 14px;">刷新页面</button>
  `;
  document.body.appendChild(errorDiv);
}
