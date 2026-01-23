# Cloudflare Pages 部署设置（仅 Cloudflare）

## ✅ 当前配置

项目已配置为**只部署到 Cloudflare Pages**，不部署到 GitHub Pages。

- ✅ Cloudflare Pages 部署：已启用（自动）
- ❌ GitHub Pages 部署：已禁用

## 🚀 快速设置（只需 3 步）

### 步骤 1: 获取 Cloudflare API Token

1. **访问 Cloudflare Dashboard**
   - 打开：https://dash.cloudflare.com/profile/api-tokens
   - 登录你的 Cloudflare 账户

2. **创建 API Token**
   - 点击 "Create Token"
   - 点击 "Get started" 使用 **"Edit Cloudflare Workers"** 模板
   - 点击 "Continue to summary" → "Create Token"
   - **重要**：立即复制 Token（只显示一次！）

### 步骤 2: 获取 Account ID

1. **访问 Cloudflare Dashboard**
   - 打开：https://dash.cloudflare.com
   - 在右侧边栏可以看到 **Account ID**

### 步骤 3: 设置 GitHub Secrets

1. **访问 GitHub Secrets 设置**
   - 打开：https://github.com/Xinchen1/cancri/settings/secrets/actions

2. **添加以下 Secrets：**

   **CLOUDFLARE_API_TOKEN**
   - Name: `CLOUDFLARE_API_TOKEN`
   - Value: 粘贴你的 Cloudflare API Token
   - 点击 "Add secret"

   **CLOUDFLARE_ACCOUNT_ID**
   - Name: `CLOUDFLARE_ACCOUNT_ID`
   - Value: 粘贴你的 Cloudflare Account ID
   - 点击 "Add secret"

   **（可选）VITE_API_BASE_URL**
   - Name: `VITE_API_BASE_URL`
   - Value: `https://cancri-api.xinhalle356.workers.dev`
   - 点击 "Add secret"

### 步骤 4: 触发部署

**自动部署：**
- 每次推送代码到 `master` 分支会自动部署

**手动触发：**
1. 访问：https://github.com/Xinchen1/cancri/actions
2. 点击 "Deploy to Cloudflare"
3. 点击 "Run workflow"
4. 选择分支 `master`
5. 点击 "Run workflow"

---

## 📍 部署后访问

部署完成后，访问你的 Cloudflare Pages URL：

1. **查看部署状态**
   - 访问：https://dash.cloudflare.com
   - 点击左侧 "Workers & Pages" → "Pages"
   - 找到 `cancri` 项目

2. **获取网站 URL**
   - 通常是：`https://cancri.pages.dev`
   - 或自定义域名（如果已配置）

---

## ✅ 配置检查清单

- [ ] 已创建 Cloudflare API Token
- [ ] 已设置 `CLOUDFLARE_API_TOKEN` Secret
- [ ] 已设置 `CLOUDFLARE_ACCOUNT_ID` Secret
- [ ] （可选）已设置 `VITE_API_BASE_URL` Secret
- [ ] 已推送代码或手动触发部署
- [ ] 已检查 Cloudflare Dashboard 中的部署状态

---

## 🔧 自动部署说明

### 触发条件

- ✅ 推送代码到 `master` 分支 → **自动部署**
- ✅ 推送代码到 `main` 分支 → **自动部署**
- ✅ 手动触发 workflow → **立即部署**

### 部署内容

1. **前端（Cloudflare Pages）**
   - 构建项目 → 部署 `dist` 目录
   - 全球 CDN 加速
   - 自动 HTTPS

2. **后端（Cloudflare Worker）**
   - 部署 Worker 到 `cancri-api.xinhalle356.workers.dev`
   - API 服务

### 部署时间

- 通常需要 **2-5 分钟**完成部署
- 构建时间取决于项目大小
- 部署后立即生效

---

## 🎯 优势

使用 Cloudflare Pages 的优势：

- ✅ **全球 CDN**：快速访问，低延迟
- ✅ **自动 HTTPS**：SSL 证书自动配置
- ✅ **私有仓库支持**：完全支持私有仓库
- ✅ **免费额度充足**：适合大多数项目
- ✅ **自动部署**：推送代码即部署
- ✅ **Worker 集成**：前后端一体化部署

---

## 🔍 故障排除

### 问题 1: 部署失败 - "Invalid API Token"

**解决方案：**
- 检查 `CLOUDFLARE_API_TOKEN` 是否正确
- 确认 Token 有 "Edit Cloudflare Workers" 权限
- 重新创建 Token 并更新 Secret

### 问题 2: 部署失败 - "Account ID not found"

**解决方案：**
- 检查 `CLOUDFLARE_ACCOUNT_ID` 是否正确
- 确认 Account ID 在 Dashboard 右侧可见

### 问题 3: 构建失败

**解决方案：**
- 检查 GitHub Actions 日志
- 确认 `package.json` 中的依赖正确
- 检查构建命令是否正确

### 问题 4: 网站无法访问

**解决方案：**
- 检查 Cloudflare Dashboard 中的部署状态
- 确认部署已成功完成
- 等待几分钟让 DNS 传播

---

## 📝 重要提示

1. **API Token 安全**
   - ✅ 只在 GitHub Secrets 中存储
   - ❌ 不要提交到代码仓库
   - ⚠️ 如果泄露，立即撤销并重新创建

2. **自动部署**
   - 每次推送到 `master` 分支都会自动部署
   - 确保代码测试通过后再推送

3. **环境变量**
   - 生产环境变量在构建时注入
   - 可以在 Cloudflare Dashboard 中配置 Pages 环境变量

---

## 🎉 完成！

设置完成后，你的项目将：
- ✅ 每次推送代码自动部署到 Cloudflare Pages
- ✅ 自动部署 Worker 后端
- ✅ 全球 CDN 加速
- ✅ 完全支持私有仓库

享受自动部署的便利吧！

