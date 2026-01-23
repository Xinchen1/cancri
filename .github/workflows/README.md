# GitHub Actions 工作流说明

## ✅ 活跃的工作流

### `deploy-gh-pages.yml`
- **用途**: 部署到 GitHub Pages（带代码混淆）
- **触发**: 自动（push 到 master/main）或手动
- **状态**: ✅ 活跃

## ⏸️ 已禁用的工作流

### `deploy.yml.disabled`
- **用途**: Cloudflare Pages 部署
- **状态**: ⏸️ 已禁用（重命名为 .disabled）
- **原因**: 需要 CLOUDFLARE_API_TOKEN，避免错误

### `secure-deploy.yml.disabled`
- **用途**: Cloudflare 安全部署
- **状态**: ⏸️ 已禁用（重命名为 .disabled）
- **原因**: 需要 CLOUDFLARE_API_TOKEN，避免错误

## 🔧 如需启用 Cloudflare 工作流

1. 重命名文件移除 `.disabled` 后缀
2. 设置 GitHub Secrets：
   - `CLOUDFLARE_API_TOKEN`
   - `CLOUDFLARE_ACCOUNT_ID`
3. 手动触发工作流

## 📝 当前部署方式

**只使用 GitHub Pages 部署**：
- 自动触发：推送代码到 master/main
- 手动触发：Actions → "Deploy to GitHub Pages (Obfuscated)"
- 包含代码混淆功能

