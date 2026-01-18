# 🚀 Cloudflare 部署完成指南

## ✅ Worker 已成功部署

**Worker URL**: https://cancri-api.xinhalle356.workers.dev

### Worker 状态
- ✅ 代码已部署
- ✅ API 端点可用
- ⚠️ 需要设置环境变量（Secrets）

## 📋 下一步操作

### 1. 设置 Worker 环境变量

```bash
cd worker

# 设置加密密钥（用于解密提示词）
wrangler secret put ENCRYPTION_KEY
# 输入: your_secure_encryption_key_here

# 设置管理员密码哈希
wrangler secret put ADMIN_PASSWORD_HASH
# 输入: 0571 的 SHA-256 哈希值（可以使用在线工具生成）
```

### 2. 加密核心提示词

```bash
# 在项目根目录
export ENCRYPTION_KEY="your_secure_encryption_key_here"
npm run encrypt:prompt

# 将输出的加密字符串复制到 worker/src/index.ts
# 替换 ENCRYPTED_PROMPT 的值
# 然后重新部署: cd worker && npx wrangler deploy
```

### 3. 部署前端到 Cloudflare Pages

#### 方法一：通过 Cloudflare Dashboard（推荐）

1. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com)
2. 进入 **Pages** 部分
3. 点击 **Create a project**
4. 选择 **Upload assets**
5. 项目名称: `cancri`
6. 上传 `dist` 文件夹的内容
7. 在 **Settings** > **Environment variables** 中添加：
   ```
   VITE_API_BASE_URL=https://cancri-api.xinhalle356.workers.dev
   ```

#### 方法二：通过 CLI（需要 Git 仓库）

```bash
# 如果有 Git 仓库
cd /Users/air/Downloads/cancri\ \(1\)

# 创建 Pages 项目（需要指定生产分支）
npx wrangler pages project create cancri --production-branch=main

# 部署
npx wrangler pages deploy dist --project-name=cancri
```

### 4. 配置 CORS（如果需要）

Worker 已经配置了 CORS，允许所有来源。如果需要限制，可以修改 `worker/src/index.ts` 中的 CORS 设置。

## 🔧 验证部署

### 测试 Worker API

```bash
curl https://cancri-api.xinhalle356.workers.dev/api/chat \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Hello",
    "apiKey": "your_mistral_api_key",
    "enableDeepThinking": false
  }'
```

### 测试前端

访问 Cloudflare Pages 提供的 URL（部署后会显示）

## 📝 重要提示

1. **环境变量**: Worker 的环境变量必须通过 `wrangler secret put` 设置
2. **提示词加密**: 生产环境必须使用加密的提示词
3. **API 密钥**: 前端需要用户提供 Mistral API 密钥
4. **速率限制**: 当前设置为 10 请求/分钟/IP

## 🐛 故障排除

### Worker 部署失败
- 检查 `wrangler.toml` 配置
- 确认已登录: `wrangler login`
- 查看日志: `wrangler tail`

### 前端无法连接 Worker
- 检查 `VITE_API_BASE_URL` 环境变量
- 确认 Worker URL 正确
- 检查浏览器控制台的错误信息

### API 返回错误
- 检查环境变量是否设置
- 确认 API 密钥格式正确
- 查看 Worker 日志: `wrangler tail`

## 📞 支持

如有问题，请查看：
- [Cloudflare Workers 文档](https://developers.cloudflare.com/workers/)
- [Cloudflare Pages 文档](https://developers.cloudflare.com/pages/)


