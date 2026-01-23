# 🔄 重新部署指南

## ✅ 环境变量已设置

环境变量 `VITE_API_BASE_URL` 已成功设置：
- **值**: https://cancri-api.xinhalle356.workers.dev
- **状态**: ✅ 已加密存储

## 🚀 重新部署方法

### 方法一：通过 Dashboard（推荐）

1. **访问 Cloudflare Dashboard**
   - 打开 https://dash.cloudflare.com
   - 登录您的账户

2. **进入 Pages 项目**
   - 点击左侧菜单的 **Pages**
   - 找到并点击 **cancri** 项目

3. **重新部署**
   - 点击 **Deployments** 标签
   - 点击 **Upload assets** 按钮
   - 选择 `dist` 文件夹中的所有文件
   - 点击 **Deploy site**

4. **验证环境变量**
   - 进入 **Settings** > **Environment variables**
   - 确认 `VITE_API_BASE_URL` 已存在
   - 值应为: `https://cancri-api.xinhalle356.workers.dev`

### 方法二：通过 CLI（如果认证正常）

```bash
# 重新登录（如果需要）
npx wrangler login

# 构建
npm run build

# 部署
npx wrangler pages deploy dist --project-name=cancri
```

### 方法三：使用更新的 Wrangler

```bash
# 更新 Wrangler
npm install --save-dev wrangler@latest

# 重新部署
npx wrangler pages deploy dist --project-name=cancri
```

## 📋 部署检查清单

- [x] 环境变量已设置
- [ ] 前端代码已构建（dist 目录）
- [ ] 已重新部署到 Cloudflare Pages
- [ ] 页面可以正常访问
- [ ] API 连接正常

## 🔍 验证部署

部署完成后：

1. **访问页面**
   - 预览 URL: https://50ae2c84.cancri.pages.dev
   - 生产 URL: https://cancri.pages.dev

2. **检查功能**
   - 打开浏览器开发者工具（F12）
   - 查看 Console 标签
   - 确认没有 API 连接错误
   - 测试发送消息功能

3. **检查环境变量**
   - 在浏览器控制台运行：
     ```javascript
     console.log(import.meta.env.VITE_API_BASE_URL)
     ```
   - 应该显示: `https://cancri-api.xinhalle356.workers.dev`

## ⚡ 快速命令

```bash
# 构建
npm run build

# 查看环境变量
npx wrangler pages secret list --project-name=cancri

# 部署（如果 CLI 可用）
npx wrangler pages deploy dist --project-name=cancri
```

## 📝 注意事项

- 环境变量已设置，但需要在部署时生效
- 如果通过 Dashboard 部署，环境变量会自动应用
- 如果通过 CLI 部署遇到认证问题，建议使用 Dashboard



