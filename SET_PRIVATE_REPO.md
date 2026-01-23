# 将仓库设置为私有并保持 GitHub Pages 正常工作

## 📋 步骤 1: 将仓库设置为私有

### 方法一：通过 GitHub 网页（推荐）

1. **访问仓库设置页面**
   - 打开：https://github.com/Xinchen1/cancri/settings
   - 或者：进入仓库 → 点击右上角 "Settings"

2. **找到 Danger Zone**
   - 滚动到页面最下方
   - 找到红色的 "Danger Zone" 区域

3. **更改可见性**
   - 点击 "Change visibility" 按钮
   - 选择 "Make private"
   - 在弹出的确认对话框中：
     - 输入仓库名称 `cancri` 确认
     - 阅读警告信息
     - 点击 "I understand, change repository visibility"

4. **等待处理**
   - 等待几秒钟，GitHub 会处理可见性更改
   - 仓库状态会从 Public 变为 Private

### 方法二：使用 GitHub CLI（如果已安装）

```bash
# 安装 GitHub CLI（如果未安装）
# macOS: brew install gh
# 然后登录: gh auth login

# 将仓库设置为私有
gh repo edit Xinchen1/cancri --visibility private
```

---

## 📋 步骤 2: 确保 GitHub Pages 正常工作

### 私有仓库的 GitHub Pages 限制

**重要说明：**
- ✅ **GitHub Free 账户**：私有仓库的 GitHub Pages 只能通过 **GitHub Actions** 部署
- ❌ **GitHub Free 账户**：私有仓库不支持传统的 GitHub Pages（直接发布分支）
- ✅ **GitHub Pro/Team/Enterprise**：私有仓库支持所有 GitHub Pages 功能

### 当前项目配置检查

你的项目已经配置了 GitHub Actions 部署（`.github/workflows/deploy-gh-pages.yml`），所以：

1. **确认 GitHub Actions 权限**
   - 进入仓库 Settings → Actions → General
   - 确保 "Workflow permissions" 设置为：
     - ✅ "Read and write permissions"
     - ✅ "Allow GitHub Actions to create and approve pull requests"

2. **确认 GitHub Pages 设置**
   - 进入仓库 Settings → Pages
   - Source 应该选择：**"GitHub Actions"**
   - 如果显示其他选项，改为 "GitHub Actions"

3. **测试部署**
   - 推送一个小的更改到仓库
   - 或者手动触发：Actions → "Deploy to GitHub Pages" → "Run workflow"
   - 等待部署完成，检查网站是否正常访问

---

## 📋 步骤 3: 验证设置

### 验证仓库可见性

```bash
# 使用 API 检查（需要认证）
curl -H "Authorization: token YOUR_TOKEN" \
  https://api.github.com/repos/Xinchen1/cancri | grep '"private"'

# 应该返回: "private": true
```

### 验证 GitHub Pages 访问

1. **检查部署状态**
   - 访问：https://github.com/Xinchen1/cancri/actions
   - 查看 "Deploy to GitHub Pages" workflow 是否成功运行

2. **访问网站**
   - 如果部署成功，网站应该可以正常访问
   - 通常地址：`https://xinchen1.github.io/cancri/`

3. **检查源码访问**
   - 未登录状态下访问：https://github.com/Xinchen1/cancri
   - 应该显示 404 或要求登录（说明仓库已私有化）

---

## ⚠️ 注意事项

### 1. 私有仓库的 GitHub Pages 访问

- ✅ **网站本身是公开的**：即使仓库是私有的，GitHub Pages 网站仍然可以公开访问
- ❌ **源码是私有的**：未授权用户无法访问仓库源码
- ✅ **这是正常行为**：GitHub Pages 的设计就是让网站公开，但源码可以私有

### 2. 如果不想让网站也公开

如果你希望网站也私有，需要：

1. **使用 GitHub Enterprise**（付费）
2. **或者使用其他托管服务**：
   - Cloudflare Pages（支持私有部署）
   - Vercel（支持私有部署）
   - Netlify（支持私有部署）

### 3. 当前项目使用 Cloudflare Pages

你的项目已经配置了 Cloudflare Pages 部署（`.github/workflows/deploy.yml`），所以：

- ✅ 即使 GitHub 仓库是私有的，Cloudflare Pages 仍然可以正常工作
- ✅ Cloudflare Pages 的部署不依赖于 GitHub Pages
- ✅ 你可以选择只使用 Cloudflare Pages，而不使用 GitHub Pages

---

## 🔧 故障排除

### 问题 1: GitHub Actions 无法部署

**解决方案：**
- 检查 Settings → Actions → General → Workflow permissions
- 确保设置为 "Read and write permissions"

### 问题 2: GitHub Pages 显示 404

**解决方案：**
- 确认 Settings → Pages → Source 选择的是 "GitHub Actions"
- 检查 Actions 中是否有成功的部署记录
- 等待几分钟，GitHub Pages 可能需要时间更新

### 问题 3: 网站无法访问

**解决方案：**
- 检查 Actions 部署日志
- 确认构建是否成功
- 检查 `dist` 目录是否正确生成

---

## 📝 总结

1. ✅ 将仓库设置为私有：Settings → Danger Zone → Change visibility → Make private
2. ✅ 确认 GitHub Pages 使用 GitHub Actions 部署（已配置）
3. ✅ 验证部署是否正常工作
4. ✅ 注意：网站公开，源码私有（这是正常行为）

完成这些步骤后，你的仓库就是私有的，但 GitHub Pages 仍然可以正常工作！

