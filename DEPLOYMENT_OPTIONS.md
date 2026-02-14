# SecondBrainWeb 與 OpenClaw 數據共享方案

## 問題描述
- **OpenClaw** 在 `/home/node/.openclaw/workspace` 維護實時數據
- **SecondBrainWeb (Zeabur)** 使用部署時的靜態快照
- 兩者數據無法同步

## 解決方案比較

### ✅ 方案 1：本地部署 SecondBrainWeb（推薦）
**優點**：
- 直接訪問 OpenClaw 工作區的實時數據
- 無需額外同步機制
- 零延遲，數據即時更新

**實施步驟**：
```bash
# 1. 在 OpenClaw 運行的伺服器上克隆專案
cd /home/node/.openclaw/workspace
git clone https://github.com/smlht2005/SecondBrainWeb.git

# 2. 配置後端指向 OpenClaw 工作區
cd SecondBrainWeb
# 編輯 server/index.ts，設定 DATA_DIR = '/home/node/.openclaw/workspace'

# 3. 安裝依賴並啟動
pnpm install
pnpm run build
pnpm start

# 4. 使用 Nginx 反向代理 (可選)
# 或使用 OpenClaw 的內建 HTTP 伺服器
```

**存取方式**：
- 本地：`http://localhost:3000`
- 外部：透過 Nginx/Caddy 反向代理設定域名

---

### 🔄 方案 2：API 橋接（適合雲端部署）
**原理**：
- Zeabur 上的 SecondBrainWeb 透過 API 連接到 OpenClaw 伺服器
- OpenClaw 提供 RESTful API 暴露工作區數據

**實施步驟**：

#### Step 1: 在 OpenClaw 伺服器上建立 API 服務
```bash
# 創建簡單的 Express API 服務
cd /home/node/.openclaw/workspace
mkdir brain-api && cd brain-api
npm init -y
npm install express cors fs-extra
```

```javascript
// server.js
const express = require('express');
const cors = require('cors');
const fs = require('fs-extra');
const path = require('path');

const app = express();
const PORT = 4000;
const WORKSPACE = '/home/node/.openclaw/workspace';

app.use(cors());
app.use(express.json());

// 列出所有資料夾檔案
app.get('/api/files/:folder', async (req, res) => {
  const folder = req.params.folder;
  const folderPath = path.join(WORKSPACE, folder);
  
  try {
    const files = await fs.readdir(folderPath);
    const markdownFiles = files.filter(f => f.endsWith('.md'));
    res.json({ files: markdownFiles });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 讀取檔案內容
app.get('/api/content/:folder/:file', async (req, res) => {
  const { folder, file } = req.params;
  const filePath = path.join(WORKSPACE, folder, file);
  
  try {
    const content = await fs.readFile(filePath, 'utf-8');
    res.json({ content });
  } catch (err) {
    res.status(404).json({ error: 'File not found' });
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Brain API running on port ${PORT}`);
});
```

#### Step 2: 啟用防火牆端口
```bash
# 允許外部訪問 API (以 UFW 為例)
sudo ufw allow 4000/tcp
```

#### Step 3: 修改 Zeabur 上的 SecondBrainWeb
在 `src/utils/apiClient.ts` 中：
```typescript
// 改為使用遠端 API
const API_BASE = import.meta.env.VITE_API_URL || 'https://your-openclaw-server.com:4000';
```

在 Zeabur 環境變數中設定：
```
VITE_API_URL=https://your-openclaw-server.com:4000
```

**缺點**：
- 需要暴露 OpenClaw 伺服器到公網
- 需要處理安全性（API Token、HTTPS）
- 增加複雜度

---

### 📦 方案 3：定期同步（最簡單但有延遲）
**原理**：
- OpenClaw 定期將數據推送到 GitHub
- Zeabur 自動重新部署

**實施步驟**：
```bash
# 在 OpenClaw 伺服器上建立同步腳本
cd /home/node/.openclaw/workspace
cat > sync-to-github.sh << 'EOF'
#!/bin/bash
cd /home/node/.openclaw/workspace/SecondBrainWeb
cp -r ../brain ./
cp -r ../memory ./
cp -r ../todos ./
cp -r ../review ./
cp -r ../done ./
git add .
git commit -m "Auto-sync: $(date)"
git push origin main
EOF

chmod +x sync-to-github.sh
```

使用 OpenClaw Cron Job 每小時執行：
```bash
# 透過 OpenClaw 的 cron 功能設定
# 每小時同步一次
```

**缺點**：
- 數據有延遲（最多 1 小時）
- 會產生大量 Git commits

---

## 🎯 推薦選擇

| 方案 | 適用場景 | 數據即時性 | 複雜度 |
|------|----------|-----------|--------|
| 方案 1 | 有固定 IP 的伺服器 | ⭐⭐⭐⭐⭐ | ⭐⭐ |
| 方案 2 | 多地訪問 | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| 方案 3 | 低頻查看 | ⭐⭐ | ⭐ |

**我的建議**：
- 如果您的 OpenClaw 運行在有固定 IP 的 VPS/伺服器 → **方案 1**
- 如果需要多人/多地訪問 → **方案 2**
- 如果只是偶爾查看 → **方案 3**

---

*Created by Tao on 2026-02-14*
