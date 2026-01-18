# 部署到 GitHub Pages

## 📋 前置要求

1. GitHub 仓库已创建
2. 仓库已启用 GitHub Pages（Settings > Pages）
3. 已设置 GitHub Actions 权限

## 🚀 快速部署步骤

### 方法 1: 使用 GitHub Actions（推荐）

1. **推送代码到 GitHub**
   ```bash
   git add .
   git commit -m "准备部署到 GitHub Pages"
   git push origin main
   ```

2. **设置 GitHub Secrets（可选）**
   - 进入仓库 Settings > Secrets and variables > Actions
   - 添加 Secret：
     - Name: `VITE_API_BASE_URL`
     - Value: `https://cancri-api.xinhalle356.workers.dev`
   - 如果不设置，将使用默认值

3. **启用 GitHub Pages**
   - 进入仓库 Settings > Pages
   - Source: 选择 "GitHub Actions"
   - 保存

4. **触发部署**
   - 推送代码后，GitHub Actions 会自动运行
   - 或手动触发：Actions > Deploy to GitHub Pages > Run workflow

### 方法 2: 手动部署（直接推送 dist）

1. **构建项目**
   ```bash
   npm run build
   ```

2. **切换到 gh-pages 分支**
   ```bash
   git checkout -b gh-pages
   git rm -rf .
   cp -r dist/* .
   git add .
   git commit -m "Deploy to GitHub Pages"
   git push origin gh-pages
   ```

3. **配置 Pages**
   - 进入仓库 Settings > Pages
   - Source: 选择 "gh-pages" 分支
   - 保存

## ⚙️ 配置说明

### 环境变量

如果使用 GitHub Actions，可以在 Secrets 中设置：
- `VITE_API_BASE_URL`: API 后端地址（默认: `https://cancri-api.xinhalle356.workers.dev`）

### Base Path

如果部署到子目录（如 `username.github.io/repo-name`），需要修改 `vite.config.ts`：

```typescript
base: '/repo-name/'
```

当前配置会根据 `GITHUB_PAGES` 环境变量自动调整。

## 🔍 验证部署

部署完成后，访问：
- `https://username.github.io/repo-name/`（如果使用子目录）
- `https://username.github.io/`（如果使用根目录）

## 📝 注意事项

1. **API 后端**: 确保 Cloudflare Worker 已部署并可访问
2. **CORS**: Worker 需要允许 GitHub Pages 域名的请求
3. **构建时间**: GitHub Actions 构建可能需要几分钟
4. **更新**: 每次 push 到 main 分支会自动触发重新部署

## 🐛 故障排除

### 页面 404
- 检查 base path 配置
- 确认 dist 文件夹内容正确

### API 连接失败
- 检查 Worker CORS 设置
- 确认环境变量已正确设置

### 构建失败
- 查看 GitHub Actions 日志
- 检查 Node.js 版本兼容性


