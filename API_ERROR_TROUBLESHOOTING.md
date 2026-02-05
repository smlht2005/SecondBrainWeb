/**
 * API 錯誤故障排除指南
 * 更新時間：2026-02-05 23:01
 * 更新者：AI Assistant
 * 更新摘要：API JSON 解析錯誤的故障排除指南
 */

# API 錯誤故障排除指南

## 錯誤症狀

```
Fetch data error SyntaxError: Unexpected token '<', "<!doctype "... is not valid JSON
```

這表示前端期望收到 JSON 響應，但實際收到了 HTML（`<!doctype` 開頭）。

---

## 已實施的修復

### 1. 前端錯誤處理改進

**文件**: `src/hooks/useBrainData.ts`

- ✅ 檢查響應狀態碼（`res.ok`）
- ✅ 檢查 Content-Type header
- ✅ 詳細的錯誤日誌（顯示響應的前 200 字符）
- ✅ 優雅降級（返回空陣列而不是崩潰）

### 2. 後端日誌記錄

**文件**: `server/index.ts`

- ✅ API 路由日誌（記錄每個請求）
- ✅ 目錄路徑日誌（顯示實際使用的路徑）
- ✅ CORS 日誌（記錄允許/阻擋的來源）
- ✅ 錯誤日誌（詳細的錯誤信息）

---

## 故障排除步驟

### 步驟 1: 檢查 Zeabur 部署日誌

1. 登入 Zeabur Dashboard
2. 選擇您的服務
3. 點擊 **Logs** 標籤
4. 查找以下日誌：

**預期看到的日誌**：
```
Server started on port 3000
Serving static files from: /app/dist
[API] GET /api/brain/files - BRAIN_DIR: /app/brain
[API] Found X brain files
[CORS] Request from origin: https://clawbrain.zeabur.app
[CORS] Allowed request from: https://clawbrain.zeabur.app
```

**如果看到錯誤**：
- `BRAIN_DIR does not exist` - 驗證資料目錄不存在
- `CORS Blocked` - CORS 配置問題
- `Error reading brain directory` - 文件系統權限問題

### 步驟 2: 檢查瀏覽器控制台

打開瀏覽器開發者工具（F12），查看 Console 標籤：

**新的錯誤信息會顯示**：
```
Brain API error (404): <!doctype html>...
Brain API returned non-JSON: <!doctype html>...
```

這會幫助識別：
- HTTP 狀態碼（404, 500 等）
- 實際返回的內容（HTML 頁面）

### 步驟 3: 測試 API 端點

在瀏覽器中直接訪問：

```
https://clawbrain.zeabur.app/api/brain/files
https://clawbrain.zeabur.app/api/memory/logs
https://clawbrain.zeabur.app/health
```

**預期回應**：
- `/api/brain/files` - JSON 陣列
- `/api/memory/logs` - JSON 陣列
- `/health` - JSON 健康狀態

**如果返回 HTML**：
- 檢查 URL 是否正確
- 檢查後端服務器是否運行
- 檢查路由配置

### 步驟 4: 檢查驗證資料

確認 `brain/` 和 `memory/` 目錄存在於部署中：

1. 檢查 Zeabur 建置日誌，確認源代碼已正確拉取
2. 檢查日誌中的 `BRAIN_DIR` 和 `MEMORY_DIR` 路徑
3. 確認這些路徑存在且可讀取

---

## 常見問題和解決方案

### 問題 1: API 返回 404

**原因**：
- API 路由沒有正確掛載
- 路徑不匹配

**解決方案**：
- 檢查 `server/index.ts` 中的路由配置
- 確認 `/api` 前綴正確
- 檢查 Zeabur 日誌中的路由匹配

### 問題 2: API 返回 HTML（SPA 路由攔截）

**原因**：
- SPA catch-all 路由在 API 路由之前
- 路由順序錯誤

**解決方案**：
- 確認 API 路由在靜態文件服務之前
- 檢查 `app.use('/api', ...)` 的位置
- 確認 SPA catch-all 路由正確排除 `/api`

### 問題 3: CORS 錯誤

**原因**：
- Origin 不在允許列表中
- CORS 配置錯誤

**解決方案**：
- 檢查 Zeabur 日誌中的 CORS 日誌
- 確認 `allowedOrigins` 包含您的域名
- 檢查請求的 Origin header

### 問題 4: 驗證資料不存在

**原因**：
- `brain/` 和 `memory/` 目錄未包含在部署中
- 路徑探測失敗

**解決方案**：
- 確認驗證資料已提交到 Git
- 檢查 `git ls-files brain/ memory/`
- 確認 Zeabur 建置包含這些目錄
- 檢查日誌中的 `BRAIN_DIR` 和 `MEMORY_DIR` 路徑

---

## 驗證修復

### 本地測試

```bash
# 建置專案
npm run build

# 啟動服務器
npm run server

# 在另一個終端測試 API
curl http://localhost:3000/api/brain/files
curl http://localhost:3000/api/memory/logs
curl http://localhost:3000/health
```

### Zeabur 部署後測試

```bash
# 替換為您的實際 URL
export APP_URL="https://clawbrain.zeabur.app"

# 測試 API
curl $APP_URL/api/brain/files
curl $APP_URL/api/memory/logs
curl $APP_URL/health
```

**預期結果**：
- 所有端點返回 JSON
- 沒有 HTML 響應
- 狀態碼為 200

---

## 下一步

1. **等待 Zeabur 重新部署**
   - 推送變更後，Zeabur 會自動觸發重新部署
   - 等待建置完成（3-5 分鐘）

2. **檢查日誌**
   - 查看 Zeabur Dashboard → Logs
   - 查找新的日誌信息

3. **測試 API**
   - 在瀏覽器中訪問 API 端點
   - 檢查瀏覽器控制台的新錯誤信息

4. **如果問題持續**
   - 分享 Zeabur 日誌中的錯誤信息
   - 分享瀏覽器控制台的詳細錯誤
   - 檢查驗證資料是否正確包含在部署中

---

**更新時間**: 2026-02-05 23:01  
**Commit**: c94dedd  
**狀態**: 已修復並推送
