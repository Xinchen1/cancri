# 🚀 快速部署到 GitHub Pages（加密版本）

## 一键部署步骤

### 1. 确保代码已提交

```bash
git add .
git commit -m "Add code obfuscation for GitHub Pages deployment"
git push origin master
```

### 2. 触发 GitHub Actions 部署

有两种方式：

**方式一：自动触发（推荐）**
- 推送到 `master` 或 `main` 分支会自动触发部署

**方式二：手动触发**
1. 访问 GitHub 仓库
2. 点击 "Actions" 标签
3. 选择 "Deploy to GitHub Pages (Obfuscated)" 工作流
4. 点击 "Run workflow"

### 3. 等待部署完成

- 查看 Actions 日志确认构建和混淆成功
- 部署完成后访问：`https://你的用户名.github.io/cancri/`

## 🔒 代码保护说明

### 本地开发
- ✅ 源代码保持原样，方便开发
- ✅ 使用 `npm run dev` 进行开发

### GitHub 部署
- ✅ 构建后的 JavaScript 文件自动混淆
- ✅ 混淆后的代码仍可正常运行
- ✅ 即使下载源代码，混淆后的代码也无法直接使用

### 保护措施
1. **控制流扁平化** - 代码逻辑难以理解
2. **字符串编码** - Base64 编码所有字符串
3. **标识符混淆** - 变量名使用十六进制
4. **死代码注入** - 添加无用代码干扰逆向
5. **自防御机制** - 防止代码被修改

## ⚠️ 重要提示

1. **仓库必须公开**：GitHub Pages 免费版要求仓库公开
2. **源代码会被看到**：虽然构建文件混淆了，但源代码是可见的
3. **敏感信息**：确保 API 密钥等敏感信息使用环境变量，不要硬编码

## 🛠️ 本地测试混淆效果

```bash
# 构建并混淆
npm run build:obfuscated

# 预览
npm run preview

# 查看混淆后的文件
cat dist/assets/*.js | head -50
```

## 📝 文件说明

- `.github/workflows/deploy-gh-pages.yml` - 自动部署工作流
- `scripts/obfuscate-build.ts` - 混淆脚本
- `package.json` - 包含 `build:obfuscated` 命令

## 🔗 相关文档

- [详细部署指南](./DEPLOY_OBFUSCATED.md)
- [故障排除](./TROUBLESHOOTING.md)

