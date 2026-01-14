#!/bin/bash

# Cloudflare Pages 部署脚本
# 使用方法: ./deploy-pages.sh

echo "🚀 开始部署到 Cloudflare Pages..."

# 检查是否已登录
echo "检查 Wrangler 登录状态..."
if ! npx wrangler whoami &>/dev/null; then
    echo "⚠️  请先登录 Cloudflare:"
    echo "   npx wrangler login"
    exit 1
fi

# 构建前端
echo ""
echo "📦 构建前端..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ 构建失败！"
    exit 1
fi

# 检查 dist 目录
if [ ! -d "dist" ]; then
    echo "❌ dist 目录不存在！"
    exit 1
fi

echo ""
echo "✅ 构建完成！"
echo ""
echo "📋 部署选项："
echo ""
echo "选项 1: 通过 CLI 部署（推荐）"
echo "  npx wrangler pages deploy dist --project-name=cancri"
echo ""
echo "选项 2: 通过 Dashboard 部署"
echo "  1. 访问 https://dash.cloudflare.com"
echo "  2. 进入 Pages > Create a project"
echo "  3. 选择 'Upload assets'"
echo "  4. 上传 dist 文件夹内容"
echo "  5. 项目名称: cancri"
echo "  6. 在 Settings > Environment variables 添加:"
echo "     VITE_API_BASE_URL=https://cancri-api.xinhalle356.workers.dev"
echo ""
echo "选项 3: 通过 Git 连接（如果已连接 GitHub）"
echo "  1. 在 Cloudflare Dashboard 中连接 GitHub 仓库"
echo "  2. 设置构建命令: npm run build"
echo "  3. 设置输出目录: dist"
echo "  4. 添加环境变量: VITE_API_BASE_URL=https://cancri-api.xinhalle356.workers.dev"
echo ""

# 询问是否立即部署
read -p "是否立即通过 CLI 部署？(y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo ""
    echo "🚀 开始部署..."
    npx wrangler pages deploy dist --project-name=cancri
else
    echo ""
    echo "📝 请按照上述选项手动部署"
fi

