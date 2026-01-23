# 设置 GitHub 仓库并部署

## 📋 步骤 1: 在 GitHub 上创建仓库

1. 访问 https://github.com/new
2. 填写仓库名称（例如：`cancri`）
3. 选择 Public 或 Private
4. **不要**初始化 README、.gitignore 或 license（因为本地已有代码）
5. 点击 "Create repository"

## 📋 步骤 2: 添加远程仓库并推送

复制 GitHub 提供的仓库 URL（例如：`https://github.com/你的用户名/cancri.git`），然后运行：

```bash
# 添加远程仓库
git remote add origin https://github.com/你的用户名/仓库名.git

# 推送到 GitHub
git push -u origin master
```

## 📋 步骤 3: 启用 GitHub Pages

1. 进入仓库 Settings > Pages
2. Source 选择 "GitHub Actions"
3. 保存设置

## 📋 步骤 4: 设置环境变量（可选）

1. 进入仓库 Settings > Secrets and variables > Actions
2. 点击 "New repository secret"
3. 添加：
   - Name: `VITE_API_BASE_URL`
   - Value: `https://cancri-api.xinhalle356.workers.dev`
4. 点击 "Add secret"

## 📋 步骤 5: 触发部署

推送代码后，GitHub Actions 会自动运行部署。或者手动触发：

1. 进入仓库 Actions 标签页
2. 选择 "Deploy to GitHub Pages"
3. 点击 "Run workflow"

## 🔍 验证部署

部署完成后（通常需要几分钟），访问：
- `https://你的用户名.github.io/仓库名/`
- 或 `https://你的用户名.github.io/`（如果是 username.github.io 仓库）

## 🐛 故障排除

### 推送失败
- 检查 GitHub 仓库 URL 是否正确
- 确认有推送权限
- 检查网络连接

### Actions 未运行
- 确认已启用 GitHub Actions
- 检查仓库 Settings > Actions > General 中的权限设置

### 部署失败
- 查看 Actions 日志
- 确认环境变量已设置（如果需要）
- 检查构建日志中的错误信息



