# 黑屏问题调试指南

## 最新部署

**URL**: https://cancri-c771l5vrk-smartmachines-projects.vercel.app

## 调试步骤

### 1. 打开浏览器控制台（F12）

查看以下信息：

#### 检查 `[CANCRI]` 开头的日志：
- `[CANCRI] Initializing React app...`
- `[CANCRI] Base URL: ...`
- `[CANCRI] Root element: ...`
- `[CANCRI] Module scripts found: ...`
- `[CANCRI] Stylesheets found: ...`
- `[CANCRI] React app rendered successfully`

#### 检查错误信息：
- 任何红色错误消息
- `ErrorBoundary caught an error`
- `Global error`
- `Unhandled promise rejection`

### 2. 检查 Network 标签

确认以下资源都成功加载（状态码 200）：
- `/assets/ClZeCKbx.js` (主入口)
- `/assets/B9JRvYXw.js` (Three.js)
- `/assets/B_TDy491.css` (样式)
- `/assets/_r8BErep.js` (vendor)

如果任何资源返回 404，说明 base path 配置有问题。

### 3. 检查 HTML 结构

在控制台运行：
```javascript
console.log('Root element:', document.getElementById('root'));
console.log('Root children:', document.getElementById('root')?.children.length);
console.log('Scripts:', document.querySelectorAll('script[type="module"]').length);
console.log('Styles:', document.querySelectorAll('link[rel="stylesheet"]').length);
```

### 4. 检查环境变量

在控制台运行：
```javascript
console.log('Environment:', {
  VITE_API_BASE_URL: import.meta.env.VITE_API_BASE_URL,
  MODE: import.meta.env.MODE,
  PROD: import.meta.env.PROD
});
```

### 5. 测试页面

访问测试页面：
- `/test-deploy.html` (如果部署了)

## 常见问题

### 问题 1: 资源路径错误

**症状**: Network 标签显示 404 错误

**解决**: 
- 检查 `dist/index.html` 中的资源路径
- 应该是 `/assets/...` 而不是 `/cancri/assets/...`
- 确认 `vercel.json` 中设置了 `BASE_PATH=/`

### 问题 2: JavaScript 错误

**症状**: 控制台有红色错误

**解决**:
- 查看错误堆栈
- 检查是否是 `Cannot read properties of undefined (reading 'd')`
- 如果是，说明代码压缩有问题

### 问题 3: React 未渲染

**症状**: Root element 存在但没有 children

**解决**:
- 检查 ErrorBoundary 是否捕获了错误
- 查看 `[CANCRI]` 日志确认渲染流程
- 检查 App 组件是否有错误

### 问题 4: 样式未加载

**症状**: 页面结构存在但样式丢失

**解决**:
- 检查 CSS 文件是否加载
- 确认 Tailwind CSS 配置正确
- 检查浏览器是否阻止了样式加载

## 快速修复

如果仍然黑屏，尝试：

1. **清除浏览器缓存**: Ctrl+Shift+R (Windows) 或 Cmd+Shift+R (Mac)
2. **检查 Vercel 构建日志**: `vercel inspect <url> --logs`
3. **本地测试构建**: `BASE_PATH=/ npm run build && npm run preview`
4. **检查 Vercel 环境变量**: 确认 `BASE_PATH` 已设置

## 联系支持

如果以上步骤都无法解决问题，请提供：
1. 浏览器控制台的完整日志
2. Network 标签的截图
3. Vercel 构建日志
4. 本地运行是否正常



