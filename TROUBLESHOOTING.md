# 黑屏问题排查指南

## 🔍 调试步骤

### 1. 访问调试页面

部署后访问：
- **调试页面**: `https://xinchen1.github.io/cancri/debug.html`
- **主页面**: `https://xinchen1.github.io/cancri/`

### 2. 检查浏览器控制台（F12）

#### 查看 `[CANCRI]` 日志：
应该看到以下日志序列：
```
[CANCRI] Pre-import diagnostics
[CANCRI] Window location: ...
[CANCRI] Document ready state: ...
[CANCRI] Root element exists: true
[CANCRI] Loading indicator added
[CANCRI] Initializing React app...
[CANCRI] Base URL: ...
[CANCRI] Root element: ...
[CANCRI] Module scripts found: ...
[CANCRI] Stylesheets found: ...
[CANCRI] React app rendered successfully
```

#### 如果日志中断：
- 检查最后一条 `[CANCRI]` 日志
- 查看是否有错误信息
- 检查错误堆栈

### 3. 检查 Network 标签

刷新页面（Ctrl+Shift+R），检查：

#### 必须成功加载的资源：
- `/cancri/assets/[hash].js` (主入口) - 状态码 200
- `/cancri/assets/B9JRvYXw.js` (Three.js) - 状态码 200
- `/cancri/assets/B_TDy491.css` (样式) - 状态码 200
- `/cancri/assets/_r8BErep.js` (vendor) - 状态码 200

#### 如果资源 404：
- 检查 base path 是否正确（应该是 `/cancri/`）
- 检查 GitHub Pages 构建日志
- 确认 `dist` 目录包含所有文件

### 4. 检查 HTML 结构

在控制台运行：
```javascript
// 检查根元素
const root = document.getElementById('root');
console.log('Root:', root);
console.log('Root children:', root?.children.length);
console.log('Root innerHTML length:', root?.innerHTML.length);

// 检查脚本
const scripts = document.querySelectorAll('script[type="module"]');
console.log('Scripts:', Array.from(scripts).map(s => ({
  src: s.src,
  loaded: s.dataset.loaded || 'unknown'
})));

// 检查样式
const styles = document.querySelectorAll('link[rel="stylesheet"]');
console.log('Styles:', Array.from(styles).map(s => s.href));
```

### 5. 检查环境变量

在控制台运行：
```javascript
console.log('Environment:', {
  VITE_API_BASE_URL: import.meta.env.VITE_API_BASE_URL,
  MODE: import.meta.env.MODE,
  PROD: import.meta.env.PROD,
  BASE_URL: import.meta.env.BASE_URL
});
```

## 🐛 常见问题

### 问题 1: 资源路径错误

**症状**: Network 标签显示 404

**原因**: Base path 配置错误

**解决**:
1. 检查 `dist/index.html` 中的资源路径
2. GitHub Pages 应该是 `/cancri/assets/...`
3. 确认 `.github/workflows/deploy-gh-pages.yml` 中设置了 `BASE_PATH=/cancri/`

### 问题 2: JavaScript 执行错误

**症状**: 控制台有红色错误

**检查**:
- 错误消息
- 错误堆栈
- 错误发生的文件位置

**常见错误**:
- `Cannot read properties of undefined (reading 'd')` - 代码压缩问题
- `Failed to fetch` - API 连接问题
- `Module not found` - 导入路径问题

### 问题 3: React 未渲染

**症状**: Root element 存在但没有 children

**检查**:
- ErrorBoundary 是否捕获了错误
- App 组件是否有错误
- 检查 `[CANCRI] React app rendered successfully` 日志

### 问题 4: 样式未加载

**症状**: 页面结构存在但样式丢失

**检查**:
- CSS 文件是否加载（Network 标签）
- Tailwind CSS 是否正确配置
- 浏览器是否阻止了样式加载

### 问题 5: 加载指示器一直显示

**症状**: 页面一直显示 "Loading..."

**原因**: React 应用未成功渲染

**检查**:
- 查看控制台错误
- 检查 React 是否成功挂载
- 检查是否有无限循环或阻塞

## 🔧 快速修复

### 修复 1: 清除缓存并强制刷新
- Windows/Linux: `Ctrl + Shift + R`
- Mac: `Cmd + Shift + R`

### 修复 2: 检查 GitHub Pages 设置
1. 访问仓库 Settings > Pages
2. Source 应设置为 "GitHub Actions"
3. 如果显示 "Deploy from a branch"，需要改为 "GitHub Actions"

### 修复 3: 重新部署
```bash
# 本地测试构建
BASE_PATH=/cancri/ npm run build

# 检查 dist/index.html 中的资源路径
cat dist/index.html | grep -E "(script|link)"

# 推送到 GitHub 触发重新部署
git add .
git commit -m "Fix deployment"
git push origin master
```

## 📊 诊断信息收集

如果问题仍然存在，请提供：

1. **调试页面截图**: 访问 `/debug.html` 的完整截图
2. **控制台日志**: 所有 `[CANCRI]` 开头的日志
3. **错误信息**: 任何红色错误消息（完整堆栈）
4. **Network 标签**: 失败的资源请求（状态码和 URL）
5. **HTML 检查结果**: 运行上述检查命令的输出

## 🆘 紧急回退方案

如果所有方法都失败，可以：

1. **使用简化版本**: 创建一个最小化的 HTML 文件测试基本功能
2. **禁用 3D 场景**: 临时禁用 Three.js 相关代码
3. **使用本地构建**: 在本地构建后手动上传到 GitHub Pages

