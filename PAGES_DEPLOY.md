# 📄 Cloudflare Pages 部署指南

## ✅ 前置条件

1. **Worker 已部署**: https://cancri-api.xinhalle356.workers.dev
2. **前端已构建**: `dist` 目录已生成
3. **已登录 Cloudflare**: `npx wrangler login`

## 🚀 部署步骤

### 方法一：通过 CLI 部署（最快）

```bash
# 1. 确保已构建
npm run build

# 2. 部署到 Pages
npx wrangler pages deploy dist --project-name=cancri
```

如果项目不存在，会提示创建。按照提示操作即可。

### 方法二：通过 Dashboard 部署（推荐）

1. **访问 Cloudflare Dashboard**
   - 打开 https://dash.cloudflare.com
   - 登录您的账户

2. **创建 Pages 项目**
   - 点击左侧菜单的 **Pages**
   - 点击 **Create a project**
   - 选择 **Upload assets**

3. **上传文件**
   - 项目名称: `cancri`
   - 上传 `dist` 文件夹中的所有文件
   - 点击 **Deploy site**

4. **配置环境变量**
   - 部署完成后，进入项目设置
   - 点击 **Settings** > **Environment variables**
   - 添加变量：
     ```
     变量名: VITE_API_BASE_URL
     值: https://cancri-api.xinhalle356.workers.dev
     ```
   - 选择环境: **Production** 和 **Preview**
   - 点击 **Save**

5. **重新部署**
   - 在 **Deployments** 标签页
   - 点击最新部署的 **Retry deployment** 以应用环境变量

### 方法三：通过 Git 连接（持续部署）

1. **连接 GitHub 仓库**
   - 在 Pages 中点击 **Create a project**
   - 选择 **Connect to Git**
   - 授权并选择仓库

2. **配置构建设置**
   - **Framework preset**: None 或 Vite
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
   - **Root directory**: `/` (项目根目录)

3. **添加环境变量**
   - 在项目设置中添加：
     ```
     VITE_API_BASE_URL=https://cancri-api.xinhalle356.workers.dev
     ```

4. **部署**
   - 点击 **Save and Deploy**
   - 之后每次 push 到 main 分支会自动部署

## 🔧 环境变量配置

### 必需的环境变量

```
VITE_API_BASE_URL=https://cancri-api.xinhalle356.workers.dev
```

### 设置位置

1. Cloudflare Dashboard
2. Pages > 您的项目 > Settings
3. Environment variables
4. 添加变量（Production 和 Preview 都要添加）

## ✅ 验证部署

部署完成后，访问 Cloudflare Pages 提供的 URL（格式：`https://cancri.pages.dev`）

### 检查清单

- [ ] 页面可以正常加载
- [ ] API 连接正常（检查浏览器控制台）
- [ ] 环境变量已设置
- [ ] Worker API 可访问

### 测试 API 连接

打开浏览器控制台，检查是否有 API 连接错误。如果看到 `VITE_API_BASE_URL` 相关的错误，说明环境变量未正确设置。

## 🐛 故障排除

### 问题：页面空白或 404

**解决方案**:
- 检查 `dist/index.html` 是否存在
- 确认所有文件都已上传
- 检查构建是否成功

### 问题：API 连接失败

**解决方案**:
- 确认 `VITE_API_BASE_URL` 环境变量已设置
- 检查 Worker URL 是否正确
- 确认 Worker 已部署且运行正常
- 重新部署以应用环境变量

### 问题：资源加载失败

**解决方案**:
- 检查 `dist/assets` 目录中的文件是否上传
- 确认文件路径正确
- 清除浏览器缓存

## 📝 更新部署

### 通过 CLI 更新

```bash
npm run build
npx wrangler pages deploy dist --project-name=cancri
```

### 通过 Git 更新

只需 push 代码到连接的仓库，Cloudflare 会自动构建和部署。

## 🔗 相关链接

- [Cloudflare Pages 文档](https://developers.cloudflare.com/pages/)
- [Wrangler CLI 文档](https://developers.cloudflare.com/workers/wrangler/)
- Worker URL: https://cancri-api.xinhalle356.workers.dev

## 📞 需要帮助？

如果遇到问题：
1. 检查 Cloudflare Dashboard 中的部署日志
2. 查看浏览器控制台的错误信息
3. 确认 Worker 和 Pages 都已正确配置



