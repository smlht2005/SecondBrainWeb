# Zeabur 部署檢查清單

**建立時間**: 2026-02-05 18:15  
**專案**: Second Brain Web  
**部署平台**: Zeabur

## ✅ 部署前準備（已完成）

- [x] Docker 映像建置成功並測試通過
- [x] 靜態資源載入問題已修復
- [x] 所有 API 端點正常運作
- [x] 健康檢查端點可用
- [x] 資料隔離機制正確（`.gitignore` 和 `.dockerignore` 已配置）
- [x] `.env.production` 已建立
- [x] `Dockerfile` 已建立並測試
- [x] `.dockerignore` 已配置排除測試資料
- [x] 健康檢查端點 `/health` 已實作

## 📋 部署步驟

### 步驟 1: 提交變更到 Git

```bash
# 檢查變更狀態
git status

# 添加所有變更
git add .

# 提交變更
git commit -m "feat: 完成生產環境部署準備

- 新增 Dockerfile 和 .dockerignore
- 新增 .env.production 環境變數配置
- 修復靜態資源載入問題（catch-all 路由）
- 新增健康檢查端點 /health
- 更新 .gitignore 排除開發測試資料
- 更新 README.md 新增部署說明
- 完成 Docker 部署驗證"
```

### 步驟 2: 推送到 GitHub

```bash
# 推送到遠端倉庫
git push origin main

# 或推送到其他分支
git push origin <your-branch-name>
```

### 步驟 3: Zeabur 配置

#### 3.1 連接 GitHub Repository

1. 登入 [Zeabur Dashboard](https://zeabur.com)
2. 點擊 **New Project**
3. 選擇 **Import from GitHub**
4. 選擇 `SecondBrainWeb` repository
5. 確認分支（通常是 `main`）

#### 3.2 環境變數設定

在 Zeabur Dashboard → Service Settings → Environment Variables：

```
NODE_ENV=production
```

**注意**: `PORT` 變數會由 Zeabur 自動注入，無需手動設定。

#### 3.3 Volume 配置（重要！）

在 Zeabur Dashboard → Service Settings → Volumes：

- **Mount Path**: `/home/node/.openclaw/workspace`
- **Size**: 1GB（視需求調整）
- **用途**: 持久化存儲 `brain/` 和 `memory/` 目錄的資料

**重要**: 此 Volume 是生產環境資料的唯一存儲位置，開發測試資料不會被部署。

#### 3.4 部署設定確認

確認 `zeabur.yaml` 配置正確：

```yaml
build:
  command: npm run build
deploy:
  start_command: npm start
```

### 步驟 4: 執行部署

1. 在 Zeabur Dashboard 點擊 **Deploy**
2. 等待建置完成（約 2-3 分鐘）
3. Zeabur 會自動提供一個 URL（例如：`https://your-app.zeabur.app`）

### 步驟 5: 部署後驗證

#### 5.1 基本功能測試

```bash
# 測試健康檢查
curl https://your-app.zeabur.app/health

# 測試 API 端點
curl https://your-app.zeabur.app/api/brain/files
curl https://your-app.zeabur.app/api/memory/logs

# 測試前端頁面
curl https://your-app.zeabur.app/
```

#### 5.2 靜態資源測試

在瀏覽器中訪問：
- https://your-app.zeabur.app/
- 打開開發者工具（F12）
- 檢查 Network 標籤，確認 CSS 和 JS 檔案正確載入

#### 5.3 CORS 測試

```bash
# 測試 CORS（應該被阻擋）
curl -H "Origin: https://unauthorized-domain.com" \
     https://your-app.zeabur.app/api/brain/files
```

### 步驟 6: 上傳生產資料

**重要**: 本地 `brain/` 和 `memory/` 測試資料不會自動部署，需要手動上傳生產資料。

#### 方法 A: 使用 Zeabur CLI

```bash
# 安裝 Zeabur CLI
npm install -g @zeabur/cli

# 登入
zeabur login

# 準備生產資料（與開發測試資料分離）
mkdir production-data
cd production-data
mkdir brain memory

# 建立生產環境的初始文件
echo "# 生產環境知識庫" > brain/welcome.md
echo "# $(date +%Y-%m-%d) 系統上線" > memory/$(date +%Y-%m-%d).md

# 上傳到 Zeabur Volume
zeabur volume upload --service <your-service-name> \
  --path /home/node/.openclaw/workspace/brain \
  ./brain/welcome.md

zeabur volume upload --service <your-service-name> \
  --path /home/node/.openclaw/workspace/memory \
  ./memory/$(date +%Y-%m-%d).md
```

#### 方法 B: 建立管理 API（推薦）

在 `server/index.ts` 中新增檔案上傳端點（需要 API Key 認證）：

```typescript
// 檔案上傳端點（僅限管理員）
apiRouter.post('/admin/upload/:type', (req, res) => {
    const ADMIN_API_KEY = process.env.ADMIN_API_KEY;
    const apiKey = req.headers['x-api-key'];
    
    if (apiKey !== ADMIN_API_KEY) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    
    const { type } = req.params;
    const { fileName, content } = req.body;
    
    const dir = type === 'brain' ? BRAIN_DIR : MEMORY_DIR;
    fs.writeFileSync(path.join(dir, fileName), content);
    res.json({ success: true });
});
```

### 步驟 7: 綁定自訂網域（可選）

1. 在 Zeabur Dashboard → Domains → Add Custom Domain
2. 輸入您的網域名稱（例如：`clawbrain.zeabur.app`）
3. 按照指示設定 DNS CNAME 記錄
4. 更新 `server/index.ts` 中的 CORS 白名單（如需要）

## 🔍 故障排除

### 問題 1: 靜態資源無法載入

**症狀**: CSS/JS 檔案返回 500 錯誤或錯誤的 MIME type

**解決方案**: 
- 確認已包含最新的 `server/index.ts`（包含靜態資源路由修復）
- 檢查容器日誌：`docker logs <container-name>`

### 問題 2: API 返回空陣列

**原因**: Volume 尚未掛載或沒有資料

**解決方案**:
- 確認 Volume 已正確配置
- 上傳初始資料到 Volume

### 問題 3: CORS 錯誤

**解決方案**:
- 確認 `server/index.ts` 中的 `allowedOrigins` 包含您的網域
- 檢查環境變數 `NODE_ENV=production`

## 📊 部署後監控

### 健康檢查

定期檢查健康檢查端點：

```bash
curl https://your-app.zeabur.app/health
```

預期回應：
```json
{
  "status": "healthy",
  "uptime": 12345.67,
  "timestamp": "2026-02-05T18:15:00.000Z",
  "storage": {
    "brain": true,
    "memory": true
  }
}
```

### Zeabur Dashboard 監控

- CPU/Memory 使用率
- Request 數量和回應時間
- 錯誤日誌

## ✅ 部署檢查清單

部署前：
- [ ] 所有變更已提交到 Git
- [ ] 已推送到 GitHub
- [ ] Zeabur Volume 已配置
- [ ] 環境變數已設定
- [ ] 生產資料已準備

部署後：
- [ ] 健康檢查端點正常
- [ ] API 端點正常運作
- [ ] 前端頁面正常載入
- [ ] 靜態資源正確載入
- [ ] CORS 政策運作正確
- [ ] Volume 資料可正常讀寫

## 📝 重要提醒

1. **資料隔離**: 本地 `brain/` 和 `memory/` 測試資料不會被部署
2. **Volume 配置**: 必須配置 Volume 才能持久化存儲資料
3. **環境變數**: 確保 `NODE_ENV=production` 已設定
4. **CORS**: 確認允許的來源已正確配置
5. **備份**: 定期備份 Volume 資料

---

**準備完成時間**: 2026-02-05 18:15  
**準備人員**: AI Assistant
