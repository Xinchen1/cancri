# 部署到 Vercel

## 🚀 快速部署

### 方法 1: 使用 Vercel CLI（推荐）

1. **安装 Vercel CLI**（如果还没有）
   ```bash
   npm i -g vercel
   ```

2. **登录 Vercel**
   ```bash
   vercel login
   ```

3. **部署**
   ```bash
   vercel
   ```
   
   首次部署会询问：
   - Set up and deploy? **Yes**
   - Which scope? 选择你的账户
   - Link to existing project? **No**（首次部署）
   - Project name? **cancri**（或自定义）
   - Directory? **./**（当前目录）
   - Override settings? **No**

4. **生产环境部署**
   ```bash
   vercel --prod
   ```

### 方法 2: 通过 GitHub 集成（推荐）

1. **访问 Vercel Dashboard**
   - https://vercel.com/dashboard
   - 点击 "Add New Project"

2. **导入 GitHub 仓库**
   - 选择 "Xinchen1/cancri"
   - 点击 "Import"

3. **配置项目**
   - Framework Preset: **Vite**
   - Root Directory: **./**
   - Build Command: **npm run build**
   - Output Directory: **dist**
   - Install Command: **npm install**

4. **环境变量**（可选）
   - 添加环境变量：
     - `VITE_API_BASE_URL`: `https://cancri-api.xinhalle356.workers.dev`

5. **部署**
   - 点击 "Deploy"
   - 等待部署完成

## ⚙️ 配置说明

### 环境变量

在 Vercel Dashboard 中设置：
- `VITE_API_BASE_URL`: API 后端地址（默认: `https://cancri-api.xinhalle356.workers.dev`）

### 自动部署

连接到 GitHub 后，每次 push 到 `master` 分支会自动触发部署。

## 🔍 验证部署

部署完成后，Vercel 会提供一个 URL，例如：
- `https://cancri-xxx.vercel.app`
- `https://cancri.vercel.app`（如果设置了自定义域名）

## 📝 更新部署

### 通过 CLI
```bash
vercel --prod
```

### 通过 Git
```bash
git push origin master
```
（如果已连接 GitHub，会自动部署）

## 🐛 故障排除

### 构建失败
- 检查 Vercel 构建日志
- 确认 `package.json` 中的脚本正确
- 检查 Node.js 版本（Vercel 默认使用 Node.js 18）

### 页面 404
- 确认 `vercel.json` 中的 rewrites 配置正确
- 检查 `dist` 目录是否包含 `index.html`

### 环境变量问题
- 确认环境变量已在 Vercel Dashboard 中设置
- 重新部署以应用环境变量更改

## 🔗 相关链接

- [Vercel Dashboard](https://vercel.com/dashboard)
- [Vercel CLI 文档](https://vercel.com/docs/cli)
- [Vite on Vercel](https://vercel.com/docs/frameworks/vite)


