# Cloudflare Pages 自动部署设置指南

## 🚀 快速设置（5分钟完成）

### 步骤 1: 获取 Cloudflare API Token

1. **访问 Cloudflare Dashboard**
   - 打开：https://dash.cloudflare.com/profile/api-tokens
   - 登录你的 Cloudflare 账户

2. **创建 API Token**
   - 点击 "Create Token"
   - 点击 "Get started" 使用 "Edit Cloudflare Workers" 模板
   - 或者自定义权限：
     - **Account** → **Cloudflare Pages** → **Edit**
     - **Account** → **Workers Scripts** → **Edit**
   - 点击 "Continue to summary" → "Create Token"
   - **重要**：复制 Token（只显示一次！）

3. **获取 Account ID**
   - 在 Cloudflare Dashboard 右侧可以看到 Account ID
   - 或者访问：https://dash.cloudflare.com
   - Account ID 在右侧边栏显示

### 步骤 2: 设置 GitHub Secrets

1. **访问 GitHub Secrets 设置**
   - 打开：https://github.com/Xinchen1/cancri/settings/secrets/actions

2. **添加 CLOUDFLARE_API_TOKEN**
   - 点击 "New repository secret"
   - Name: `CLOUDFLARE_API_TOKEN`
   - Secret: 粘贴你刚才复制的 Cloudflare API Token
   - 点击 "Add secret"

3. **添加 CLOUDFLARE_ACCOUNT_ID**
   - 点击 "New repository secret"
   - Name: `CLOUDFLARE_ACCOUNT_ID`
   - Secret: 粘贴你的 Cloudflare Account ID
   - 点击 "Add secret"

4. **（可选）添加 VITE_API_BASE_URL**
   - 如果 API 地址不同，可以添加：
   - Name: `VITE_API_BASE_URL`
   - Secret: `https://cancri-api.xinhalle356.workers.dev`
   - 点击 "Add secret"

### 步骤 3: 触发部署

部署已配置为自动触发，当你推送代码到 `master` 分支时会自动部署。

**手动触发（可选）：**
1. 访问：https://github.com/Xinchen1/cancri/actions
2. 点击 "Deploy to Cloudflare"
3. 点击 "Run workflow"
4. 选择分支 `master`
5. 点击 "Run workflow"

### 步骤 4: 查看部署状态

1. **GitHub Actions**
   - 访问：https://github.com/Xinchen1/cancri/actions
   - 查看 "Deploy to Cloudflare" workflow 的运行状态

2. **Cloudflare Dashboard**
   - 访问：https://dash.cloudflare.com
   - 点击左侧 "Workers & Pages" → "Pages"
   - 找到 `cancri` 项目
   - 查看部署状态和 URL

3. **访问网站**
   - 部署完成后，访问 Cloudflare Pages 提供的 URL
   - 通常是：`https://cancri.pages.dev`
   - 或者自定义域名（如果已配置）

---

## ✅ 配置完成检查清单

- [ ] 已创建 Cloudflare API Token
- [ ] 已设置 `CLOUDFLARE_API_TOKEN` Secret
- [ ] 已设置 `CLOUDFLARE_ACCOUNT_ID` Secret
- [ ] （可选）已设置 `VITE_API_BASE_URL` Secret
- [ ] 已触发部署或推送代码到 master 分支
- [ ] 已检查部署状态

---

## 🔧 自动部署说明

### 触发条件

部署会在以下情况自动触发：
- ✅ 推送代码到 `master` 分支
- ✅ 推送代码到 `main` 分支
- ✅ 手动触发 workflow

### 部署流程

1. **检出代码** - 从 GitHub 获取最新代码
2. **安装依赖** - 运行 `npm ci` 安装依赖
3. **构建项目** - 运行 `npm run build` 构建前端
4. **部署 Pages** - 将 `dist` 目录部署到 Cloudflare Pages
5. **部署 Worker** - 部署后端 Worker（如果配置了）

### 部署时间

- 通常需要 2-5 分钟完成部署
- 构建时间取决于项目大小
- 部署后立即生效

---

## 🎯 自定义域名（可选）

如果你想使用自定义域名：

1. **在 Cloudflare Dashboard 中**
   - 访问：Pages → cancri → Custom domains
   - 点击 "Set up a custom domain"
   - 输入你的域名
   - 按照提示配置 DNS

2. **DNS 配置**
   - 添加 CNAME 记录指向 Cloudflare Pages
   - 或使用 Cloudflare 的自动 DNS 配置

---

## 🔍 故障排除

### 问题 1: 部署失败 - "Invalid API Token"

**解决方案：**
- 检查 `CLOUDFLARE_API_TOKEN` 是否正确
- 确认 Token 有正确的权限
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
   - 不要将 Token 提交到代码仓库
   - 只在 GitHub Secrets 中存储
   - 如果泄露，立即撤销并重新创建

2. **自动部署**
   - 每次推送到 master 分支都会自动部署
   - 确保代码测试通过后再推送

3. **环境变量**
   - 生产环境变量在构建时注入
   - 可以在 Cloudflare Dashboard 中配置 Pages 环境变量

---

## 🎉 完成！

设置完成后，你的项目将：
- ✅ 每次推送代码自动部署
- ✅ 部署到 Cloudflare Pages（全球 CDN）
- ✅ 自动部署 Worker 后端
- ✅ 完全支持私有仓库

享受自动部署的便利吧！

