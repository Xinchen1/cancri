# 🚀 自动部署状态

## ✅ 部署配置已完成

项目已配置为自动部署到 **https://cancri.pages.dev**

### 当前配置

- ✅ **部署目标**: Cloudflare Pages (`cancri.pages.dev`)
- ✅ **自动触发**: 推送代码到 `master` 分支自动部署
- ✅ **部署内容**: 前端 Pages + 后端 Worker
- ✅ **配置文件**: `.github/workflows/deploy.yml`

### 部署流程

1. **检出代码** - 从 GitHub 获取最新代码
2. **安装依赖** - 运行 `npm ci`
3. **构建项目** - 运行 `npm run build`
4. **部署 Pages** - 部署到 `cancri.pages.dev`
5. **部署 Worker** - 部署后端 API

---

## ⚠️ 重要：需要设置 GitHub Secrets

部署需要以下 Secrets 才能正常工作：

### 必需的 Secrets

1. **CLOUDFLARE_API_TOKEN**
   - 获取方式：https://dash.cloudflare.com/profile/api-tokens
   - 使用 "Edit Cloudflare Workers" 模板创建

2. **CLOUDFLARE_ACCOUNT_ID**
   - 获取方式：https://dash.cloudflare.com
   - 在右侧边栏可以看到 Account ID

### 设置 Secrets

1. 访问：https://github.com/Xinchen1/cancri/settings/secrets/actions
2. 点击 "New repository secret"
3. 添加上述两个 Secrets

### 可选 Secrets

- **VITE_API_BASE_URL**: `https://cancri-api.xinhalle356.workers.dev`（已有默认值）

---

## 📍 检查部署状态

### GitHub Actions

访问：https://github.com/Xinchen1/cancri/actions

查看 "Deploy to Cloudflare" workflow 的运行状态：
- ✅ 绿色 = 部署成功
- ❌ 红色 = 部署失败（检查日志）
- 🟡 黄色 = 正在运行

### Cloudflare Dashboard

访问：https://dash.cloudflare.com → Workers & Pages → Pages → cancri

查看：
- 部署历史
- 当前部署状态
- 网站 URL

### 访问网站

部署成功后，访问：
- **主站**: https://cancri.pages.dev
- **API**: https://cancri-api.xinhalle356.workers.dev

---

## 🔄 触发部署

### 自动触发

- ✅ 推送代码到 `master` 分支 → **自动部署**
- ✅ 推送代码到 `main` 分支 → **自动部署**

### 手动触发

1. 访问：https://github.com/Xinchen1/cancri/actions
2. 点击 "Deploy to Cloudflare"
3. 点击 "Run workflow"
4. 选择分支 `master`
5. 点击 "Run workflow"

---

## 🔍 故障排除

### 问题 1: 部署失败 - "Invalid API Token"

**原因**: `CLOUDFLARE_API_TOKEN` 未设置或无效

**解决**:
1. 检查 Secrets 是否已设置
2. 重新创建 Cloudflare API Token
3. 更新 GitHub Secret

### 问题 2: 部署失败 - "Account ID not found"

**原因**: `CLOUDFLARE_ACCOUNT_ID` 未设置或错误

**解决**:
1. 检查 Account ID 是否正确
2. 更新 GitHub Secret

### 问题 3: 构建失败

**原因**: 代码或依赖问题

**解决**:
1. 查看 GitHub Actions 日志
2. 检查构建错误信息
3. 本地测试：`npm run build`

### 问题 4: 网站无法访问

**原因**: 部署未完成或 DNS 问题

**解决**:
1. 检查 Cloudflare Dashboard 中的部署状态
2. 等待几分钟让 DNS 传播
3. 清除浏览器缓存

---

## 📝 部署时间

- **构建时间**: 通常 1-3 分钟
- **部署时间**: 通常 1-2 分钟
- **总时间**: 通常 2-5 分钟

---

## ✅ 部署成功标志

1. ✅ GitHub Actions 显示绿色 ✓
2. ✅ Cloudflare Dashboard 显示部署成功
3. ✅ 网站 https://cancri.pages.dev 可以访问
4. ✅ API https://cancri-api.xinhalle356.workers.dev 可以访问

---

## 🎉 完成！

设置完成后，每次推送代码都会自动部署到 **https://cancri.pages.dev**

享受自动部署的便利吧！

