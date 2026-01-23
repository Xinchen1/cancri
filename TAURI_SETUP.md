# Tauri 文件夹选择功能配置指南

## 📋 前置要求

1. 确保已安装 Tauri API 依赖：
```bash
npm install @tauri-apps/api
# 或对于 Tauri 2.x
npm install @tauri-apps/api@next
```

## 🔧 Tauri 配置

### 1. 更新 `tauri.conf.json`

在 `tauri.conf.json` 中添加文件系统权限：

```json
{
  "tauri": {
    "allowlist": {
      "dialog": {
        "all": true,
        "open": true
      },
      "fs": {
        "all": true,
        "readDir": true,
        "readBinaryFile": true,
        "scope": ["$HOME/**", "$DOCUMENT/**", "$DESKTOP/**"]
      },
      "path": {
        "all": true
      }
    }
  }
}
```

### 2. 对于 Tauri 2.x

如果使用 Tauri 2.x，配置可能略有不同：

```json
{
  "permissions": [
    "dialog:allow-open",
    "fs:allow-read-dir",
    "fs:allow-read-binary-file",
    "fs:scope-all",
    "path:allow-basename"
  ]
}
```

## ✅ 功能说明

- **文件夹选择按钮**：点击文件夹图标可以选择本地文件夹
- **自动文件过滤**：只处理支持的文件类型（.txt, .md, .json, .doc, .docx, 图片等）
- **递归读取**：自动读取文件夹及其子文件夹中的所有文件
- **批量处理**：逐个处理文件夹中的文件，避免同时处理太多文件导致性能问题

## 🚀 使用方法

1. 点击输入框左侧的文件夹图标按钮
2. 在弹出的对话框中选择要处理的文件夹
3. 系统会自动处理文件夹中所有支持的文件
4. 处理进度会在日志中显示

## ⚠️ 注意事项

- 确保 Tauri 应用有文件系统访问权限
- 大文件夹可能需要一些时间处理
- 不支持的文件类型会被自动跳过

