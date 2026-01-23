# Vercel 部署黑屏问题修复

## 问题原因

部署到 Vercel 后出现黑屏，但本地运行正常。原因是：

1. **Base Path 配置错误**：构建时无法正确检测 Vercel 环境，导致使用了 `/cancri/` 作为 base path
2. **资源路径错误**：构建后的 HTML 中资源路径是 `/cancri/assets/...`，但 Vercel 需要 `/assets/...`

## 修复方案

### 1. 更新 `vite.config.ts`

添加了 `BASE_PATH` 环境变量支持，并改进了 Vercel 环境检测：

```typescript
const isVercel = process.env.VERCEL || process.env.VERCEL_ENV || process.env.VERCEL_URL || 
                 (process.env.CI && !process.env.GITHUB_REPOSITORY);
const base = process.env.BASE_PATH || (isVercel ? '/' : '/cancri/');
```

### 2. 更新 `vercel.json`

在构建命令中设置 `BASE_PATH=/` 环境变量：

```json
{
  "buildCommand": "BASE_PATH=/ npm run build"
}
```

### 3. 增强错误日志

在 `index.tsx` 中添加了更详细的调试日志，包括：
- 环境变量检查
- 资源加载检查
- 脚本和样式表检查

## 验证

构建后检查 `dist/index.html`，确认资源路径为：
- ✅ `/assets/...` (Vercel)
- ❌ `/cancri/assets/...` (错误)

## 部署

```bash
# 本地测试构建
BASE_PATH=/ npm run build

# 部署到 Vercel
vercel --prod
```

## 如果仍然黑屏

1. **检查浏览器控制台**：查看是否有 JavaScript 错误
2. **检查 Network 标签**：确认所有资源（JS/CSS）都成功加载（状态码 200）
3. **检查资源路径**：确认路径是 `/assets/...` 而不是 `/cancri/assets/...`
4. **清除浏览器缓存**：Ctrl+Shift+R 强制刷新



