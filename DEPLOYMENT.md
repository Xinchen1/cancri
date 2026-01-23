# Cloudflare 部署指南 - 极致安全架构

## 🔒 安全架构

本项目采用**世界顶级的安全架构**，前后端完全分离：

### 前端（Cloudflare Pages）
- ✅ **仅包含 UI 代码** - 零业务逻辑
- ✅ **核心提示词完全移除** - 前端无法访问
- ✅ **代码极致混淆** - Terser 多轮压缩 + 变量名随机化
- ✅ **通过加密 API 调用后端** - 请求签名验证
- ✅ **无敏感信息** - 所有密钥和提示词都在后端

### 后端（Cloudflare Workers）
- ✅ **核心提示词加密存储** - 多轮 XOR + Base64 加密
- ✅ **深度思考算法服务器端执行** - 前端无法访问
- ✅ **多层输入验证** - 5 层防护机制
- ✅ **提示词注入防护** - 20+ 种注入模式检测
- ✅ **API 密钥验证** - 格式和有效性双重检查
- ✅ **速率限制** - 防止滥用和 DDoS
- ✅ **请求签名** - HMAC-SHA256 验证
- ✅ **时间戳验证** - 防止重放攻击

## 部署步骤

### 1. 准备环境

```bash
# 安装依赖
npm install

# 安装 Wrangler CLI（如果未安装）
npm install -g wrangler
```

### 2. 加密核心提示词

```bash
# 设置加密密钥
export ENCRYPTION_KEY="your_secure_encryption_key_here"

# 生成加密提示词
npm run encrypt:prompt

# 将输出的加密字符串复制到 worker/src/index.ts 的 ENCRYPTED_PROMPT 变量
```

### 3. 配置 Cloudflare Workers

```bash
cd worker

# 登录 Cloudflare
wrangler login

# 设置环境变量（生产环境）
wrangler secret put ENCRYPTION_KEY
wrangler secret put MISTRAL_API_KEYS  # JSON array of keys
wrangler secret put ADMIN_PASSWORD_HASH  # Hashed admin password
```

### 4. 部署 Worker

```bash
# 开发环境测试
npm run worker:dev

# 部署到生产环境
npm run worker:deploy
```

### 5. 配置 Cloudflare Pages

1. 登录 Cloudflare Dashboard
2. 进入 Pages 部分
3. 连接 GitHub 仓库
4. 设置构建配置：
   - Build command: `npm run build`
   - Build output directory: `dist`
   - Environment variables:
     - `VITE_API_BASE_URL`: Your Worker URL (e.g., `https://cancri-api.your-domain.workers.dev`)

### 6. 设置自定义域名（可选）

在 Cloudflare Pages 和 Workers 中配置自定义域名。

## 🔐 极致安全特性

### 1. 提示词保护（多层防护）
- ✅ **服务器端加密存储** - 多轮 XOR 加密 + Base64 编码
- ✅ **运行时解密** - 仅在服务器内存中解密，不暴露给前端
- ✅ **防篡改** - 加密密钥存储在环境变量中
- ✅ **防注入** - 20+ 种注入模式检测和过滤
- ✅ **上下文隔离** - 用户输入和系统提示完全分离

### 2. 输入验证（5 层防护）
- ✅ **Layer 1**: 控制字符过滤
- ✅ **Layer 2**: 20+ 种提示词注入模式检测
- ✅ **Layer 3**: 长度限制（10,000 字符）
- ✅ **Layer 4**: 空白字符规范化
- ✅ **Layer 5**: UTF-8 编码验证

### 3. 代码混淆（极致保护）
- ✅ **Terser 多轮压缩** - 3 次压缩循环
- ✅ **变量名随机化** - 所有私有变量混淆
- ✅ **控制流混淆** - 代码逻辑打乱
- ✅ **字符串加密** - 敏感字符串 Base64 编码
- ✅ **Chunk 名称哈希化** - 文件名随机化
- ✅ **Console 移除** - 生产环境完全移除

### 4. API 安全（全方位防护）
- ✅ **API 密钥格式验证** - 长度和字符集检查
- ✅ **请求签名验证** - HMAC-SHA256 签名
- ✅ **时间戳验证** - 5 分钟有效期，防止重放攻击
- ✅ **速率限制** - 10 请求/分钟/IP
- ✅ **CORS 保护** - 严格的跨域策略
- ✅ **IP 记录** - 所有请求记录 IP（加密存储）
- ✅ **错误信息脱敏** - 不暴露内部错误细节

### 5. 防逆向工程
- ✅ **代码分割** - 关键逻辑分离
- ✅ **动态加载** - 按需加载模块
- ✅ **服务器端验证** - 所有关键操作服务器端验证
- ✅ **无客户端密钥** - 所有密钥服务器端管理

## 环境变量

### 前端 (.env)
```
VITE_API_BASE_URL=https://cancri-api.your-domain.workers.dev
```

### Worker (通过 wrangler secret)
```
ENCRYPTION_KEY=your_encryption_key
MISTRAL_API_KEYS=["key1","key2","key3"]
ADMIN_PASSWORD_HASH=hashed_password
```

## 故障排除

### Worker 部署失败
- 检查 wrangler.toml 配置
- 确认已设置所有必需的 secrets
- 查看 Worker 日志：`wrangler tail`

### 前端无法连接 Worker
- 检查 VITE_API_BASE_URL 是否正确
- 确认 Worker 已部署且运行正常
- 检查 CORS 设置

### 代码混淆问题
- 如果遇到运行时错误，可能是混淆过度
- 调整 vite.config.ts 中的混淆选项
- 在开发环境禁用混淆进行调试

## 更新提示词

1. 修改 `scripts/encrypt-prompt.ts` 中的 `CORE_PROMPT`
2. 运行 `npm run encrypt:prompt`
3. 更新 `worker/src/index.ts` 中的 `ENCRYPTED_PROMPT`
4. 重新部署 Worker

## 监控和维护

- 使用 Cloudflare Analytics 监控 Worker 性能
- 定期检查 Worker 日志
- 更新依赖包以修复安全漏洞
- 定期轮换 API 密钥和加密密钥

