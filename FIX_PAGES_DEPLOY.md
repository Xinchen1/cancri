# 修复 GitHub Pages 部署错误

## 🔴 错误信息

```
HttpError: Resource not accessible by integration
Create Pages site failed
Get Pages site failed
```

## 🔧 解决方案

### 步骤 1: 修复 GitHub Actions 权限（必须）

1. **访问仓库设置**
   - 打开：https://github.com/Xinchen1/cancri/settings/actions

2. **设置 Workflow permissions**
   - 找到 "Workflow permissions" 部分
   - 选择：**"Read and write permissions"**
   - ✅ 勾选：**"Allow GitHub Actions to create and approve pull requests"**
   - 点击 **"Save"**

3. **重要**：这是最关键的一步，必须完成！

### 步骤 2: 启用 GitHub Pages

1. **访问 Pages 设置**
   - 打开：https://github.com/Xinchen1/cancri/settings/pages

2. **配置 Source**
   - Source: 选择 **"GitHub Actions"**
   - 如果显示 "None" 或其他选项，改为 "GitHub Actions"
   - 点击 **"Save"**

3. **等待初始化**
   - GitHub 可能需要几分钟来初始化 Pages 环境
   - 如果第一次设置，可能需要等待 5-10 分钟

### 步骤 3: 验证 workflow 文件权限

已更新 `.github/workflows/deploy-gh-pages.yml`，添加了必要的权限：

```yaml
permissions:
  contents: write      # 从 read 改为 write
  pages: write
  id-token: write
  deployments: write  # 新增
```

### 步骤 4: 重新触发部署

1. **推送代码**（已自动完成）
   ```bash
   git push origin master
   ```

2. **或手动触发**
   - 访问：https://github.com/Xinchen1/cancri/actions
   - 点击 "Deploy to GitHub Pages"
   - 点击 "Run workflow"
   - 选择分支 "master"
   - 点击 "Run workflow"

### 步骤 5: 检查部署状态

1. **查看 Actions 日志**
   - 访问：https://github.com/Xinchen1/cancri/actions
   - 点击最新的 workflow run
   - 查看是否有错误

2. **检查 Pages 部署**
   - 访问：https://github.com/Xinchen1/cancri/settings/pages
   - 查看 "Recent deployments" 部分
   - 应该能看到部署记录

## ⚠️ 常见问题

### 问题 1: 仍然显示 "Resource not accessible"

**解决方案：**
- 确认已设置 "Read and write permissions"
- 确认已勾选 "Allow GitHub Actions to create and approve pull requests"
- 等待 5-10 分钟后重试

### 问题 2: "Create Pages site failed"

**解决方案：**
- 确认 Settings → Pages → Source 选择的是 "GitHub Actions"
- 如果是第一次设置，可能需要等待 GitHub 初始化
- 尝试手动触发一次 workflow

### 问题 3: 私有仓库限制

**重要说明：**
- ✅ GitHub Free 账户：私有仓库支持通过 GitHub Actions 部署 Pages
- ❌ 但需要正确设置权限
- ✅ 网站可以公开访问，但源码是私有的

## 📝 检查清单

完成以下所有步骤：

- [ ] Settings → Actions → General → Workflow permissions → "Read and write permissions"
- [ ] Settings → Actions → General → 勾选 "Allow GitHub Actions to create and approve pull requests"
- [ ] Settings → Pages → Source → 选择 "GitHub Actions"
- [ ] 已更新 workflow 文件权限（已自动完成）
- [ ] 已推送代码或手动触发 workflow
- [ ] 等待部署完成（通常 2-5 分钟）

## 🎯 完成后的验证

1. **检查网站是否可访问**
   - 访问：https://xinchen1.github.io/cancri/
   - 应该能看到网站正常加载

2. **检查部署记录**
   - 访问：https://github.com/Xinchen1/cancri/settings/pages
   - 应该能看到 "Recent deployments" 记录

3. **验证仓库可见性**
   - 未登录状态下访问：https://github.com/Xinchen1/cancri
   - 应该显示 404（说明仓库已私有化）

---

**如果按照以上步骤操作后仍然失败，请检查：**
1. GitHub 账户类型（Free/Pro）
2. 仓库是否真的已设置为私有
3. Actions 日志中的详细错误信息

