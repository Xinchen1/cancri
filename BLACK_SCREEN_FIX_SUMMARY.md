# Cloudflare Pages 黑屏问题修复总结

## 问题描述

在部署到 Cloudflare Pages 后，应用程序出现黑屏问题。经过分析，我发现了几个关键问题并进行了修复。

## 根本原因分析

1. **importmap 冲突**：在 `index.html` 中使用了 importmap，但同时也在使用 Vite 构建。这会导致依赖管理冲突，因为 Vite 会处理所有的依赖打包，而 importmap 会尝试从 CDN 加载依赖，导致模块加载失败。

2. **WebGL 支持检测缺失**：没有检查浏览器是否支持 WebGL，在不支持 WebGL 的环境中，Three.js 场景会失败并导致黑屏。

3. **错误处理不足**：虽然有错误边界，但许多错误没有被正确捕获和显示给用户。

4. **环境变量配置问题**：在 `vite.config.ts` 中有重复的环境变量定义，可能导致环境变量混淆。

## 修复详情

### 1. 移除 importmap 冲突

**文件**：`index.html`

**修复**：完全移除了 importmap 脚本块，因为 Vite 会处理所有的依赖打包。importmap 与 Vite 的构建系统冲突，导致模块加载失败。

```html
<!-- 移除了以下代码 -->
<script type="importmap">
{
  "imports": {
    "react": "https://esm.sh/react@^19.2.3",
    ...
  }
}
</script>
```

### 2. 添加 WebGL 支持检测

**文件**：`components/Scene.tsx`

**修复**：添加了 WebGL 支持检测，并在不支持 WebGL 的情况下显示友好的错误消息，而不是黑屏。

```typescript
const [webglSupported, setWebglSupported] = React.useState<boolean | null>(null);
const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

React.useEffect(() => {
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    
    if (!gl) {
      setWebglSupported(false);
      setErrorMessage('WebGL not supported in your browser');
      return;
    }
    
    setWebglSupported(true);
  } catch (error) {
    setWebglSupported(false);
    setErrorMessage(`WebGL error: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}, []);
```

### 3. 增强 CrystalMesh 错误处理

**文件**：`components/CrystalMesh.tsx`

**修复**：添加了全面的错误处理，包括：
- 配置生成中的错误处理
- 帧更新中的错误处理
- 材质引用的安全检查
- 错误状态管理

```typescript
const [error, setError] = React.useState<string | null>(null);

// 在 useFrame 中添加了 try-catch
useFrame((state, delta) => {
  try {
    // ... 现有代码
  } catch (e) {
    console.error('Frame update error:', e);
    setError(`Frame error: ${e instanceof Error ? e.message : 'Unknown error'}`);
  }
});

if (error) {
  return null; // 不渲染如果有错误
}
```

### 4. 添加全局错误处理

**文件**：`index.tsx`

**修复**：增强了全局错误处理，包括：
- 显示用户友好的错误消息
- WebGL 支持的早期检测
- 可视化错误通知

```typescript
// 全局错误处理
window.addEventListener('error', (event) => {
  console.error('Global error:', event.error);
  
  // 显示错误给用户
  const errorElement = document.createElement('div');
  errorElement.style.cssText = 'position: fixed; top: 20px; right: 20px; background: #dc2626; color: white; padding: 15px; border-radius: 5px; z-index: 9999;';
  errorElement.textContent = `错误: ${event.error instanceof Error ? event.error.message : '未知错误'}`;
  document.body.appendChild(errorElement);
});

// WebGL 早期检测
const checkWebGLSupport = () => {
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    
    if (!gl) {
      const warningElement = document.createElement('div');
      warningElement.style.cssText = 'position: fixed; bottom: 20px; left: 50%; transform: translateX(-50%); background: #f59e0b; color: white; padding: 15px 20px; border-radius: 5px; z-index: 9999;';
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
```

### 5. 修复环境变量配置

**文件**：`vite.config.ts`

**修复**：移除了重复的环境变量定义，并统一使用 `VITE_` 前缀：

```typescript
// 之前
'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY || ''),
'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY || ''),

// 修复后
'import.meta.env.VITE_GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY || ''),
```

## 验证

1. **构建成功**：`npm run build` 现在成功完成，没有错误。

2. **输出检查**：构建输出在 `dist/` 目录中，包含正确的 HTML 和 JavaScript 文件。

3. **importmap 移除**：构建后的 HTML 不再包含 importmap，所有依赖都被正确打包。

4. **错误处理**：添加了全面的错误处理，可以捕获和显示各种错误。

## 部署建议

1. **环境变量**：在 Cloudflare Pages 中添加以下环境变量：
   - `VITE_API_BASE_URL=https://cancri-api.xinhalle356.workers.dev`
   - `GEMINI_API_KEY=your_api_key_here`

2. **构建命令**：使用 `npm run build`

3. **输出目录**：`dist`

4. **测试**：在部署后，使用提供的 `test-webgl.html` 文件测试 WebGL 支持。

## 常见问题解决

如果部署后仍然出现黑屏：

1. **检查浏览器控制台**：查看是否有 JavaScript 错误。

2. **测试 WebGL 支持**：使用 `test-webgl.html` 文件测试您的浏览器是否支持 WebGL。

3. **检查网络请求**：确保所有静态文件都被正确加载。

4. **查看错误通知**：应用程序现在会显示错误通知在屏幕右上角。

5. **检查环境变量**：确保所有必要的环境变量都已正确配置。

## 修复后的行为

- **支持 WebGL**：应用程序正常显示 3D 场景
- **不支持 WebGL**：显示友好的错误消息，而不是黑屏
- **加载错误**：显示错误通知，而不是黑屏
- **网络错误**：显示错误通知，而不是黑屏

这些修复应该解决 Cloudflare Pages 部署后的黑屏问题，并提供更好的用户体验和错误处理。