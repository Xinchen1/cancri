# 部署状态

## ✅ Worker 已部署

**Worker URL**: https://cancri-api.xinhalle356.workers.dev

### API 端点
- `/api/chat` - 聊天接口
- `/api/embed` - 嵌入向量生成
- `/api/admin` - 管理后台

### 下一步操作

1. **设置环境变量（Secrets）**
   ```bash
   cd worker
   wrangler secret put ENCRYPTION_KEY
   wrangler secret put ADMIN_PASSWORD_HASH
   ```

2. **更新前端环境变量**
   在 Cloudflare Pages 设置中添加：
   ```
   VITE_API_BASE_URL=https://cancri-api.xinhalle356.workers.dev
   ```

3. **加密核心提示词**
   ```bash
   export ENCRYPTION_KEY="your_secure_key"
   npm run encrypt:prompt
   # 将输出复制到 worker/src/index.ts 的 ENCRYPTED_PROMPT
   ```

## 📝 部署信息

- Worker 名称: `cancri-api`
- 部署时间: 2026-01-14
- 版本 ID: b1293448-92a6-4050-992e-cf86edd63ea8

