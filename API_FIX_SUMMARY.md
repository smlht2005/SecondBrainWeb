/**
 * API 路由修復總結
 * 更新時間：2026-02-05 23:15
 * 更新者：AI Assistant
 * 更新摘要：修復 API 返回 HTML 而非 JSON 的問題
 */

# API 路由修復總結

**問題**: API 端點返回 HTML (`<!doctype html>`) 而不是 JSON  
**Zeabur URL**: https://clawbrain.zeabur.app  
**狀態**: 修復已實施並推送

---

## 已實施的修復

### Commit 1: c13078d - 防止靜態文件服務攔截 API 路由

**修改文件**: [`server/index.ts`](server/index.ts)

**修復內容**:
1. 在 `express.static()` 之前添加中間件，明確排除 `/api` 和 `/health` 路徑
2. 改進 SPA catch-all 路由，確保排除 `/health` 端點
3. 添加 API 路由錯誤處理中間件

**關鍵代碼**:
```typescript
// 在 express.static() 之前添加
app.use((req, res, next) => {
    if (req.path.startsWith('/api') || req.path === '/health') {
        console.log(`[Static] Skipping static file service for: ${req.path}`);
        return next(); // 交給 API 路由處理
    }
    next();
});

app.use(express.static(distPath));
```

### Commit 2: 1298563 - 添加 Content-Type header 到健康檢查端點

**修改文件**: [`server/index.ts`](server/index.ts)

**修復內容**:
1. 在 `/health` 端點明確設置 `Content-Type: application/json`
2. 添加日誌記錄

**關鍵代碼**:
```typescript
app.get('/health', (req, res) => {
    console.log(`[Health] GET /health`);
    res.setHeader('Content-Type', 'application/json');
    res.json({...});
});
```

---

## 修復原理

### 問題根源

`express.static()` 中間件會自動處理所有請求，檢查文件系統中是否存在對應的文件。如果文件存在，它會返回該文件，而不會繼續執行後續的路由處理。

### 解決方案

1. **路由順序**: 確保 API 路由在靜態文件服務之前
2. **明確排除**: 在 `express.static()` 之前添加中間件，明確跳過 API 和健康檢查路徑
3. **Content-Type**: 明確設置 JSON Content-Type，確保響應格式正確

---

## 預期效果

修復後，API 端點應該：

1. **正確返回 JSON**:
   - `/health` → `application/json`
   - `/api/brain/files` → `application/json`
   - `/api/memory/logs` → `application/json`

2. **不再返回 HTML**:
   - 所有 API 請求不會被靜態文件服務攔截
   - SPA catch-all 路由不會處理 API 請求

3. **詳細日誌**:
   - Zeabur 日誌會顯示路由處理過程
   - 可以追蹤請求是否正確路由到 API

---

## 驗證步驟

### 1. 等待 Zeabur 重新部署

- 變更已推送（Commits: c13078d, 1298563）
- Zeabur 會自動觸發重新部署
- 等待 3-5 分鐘

### 2. 檢查 Zeabur 日誌

在 Zeabur Dashboard → Logs 中查找：

```
[Static] Skipping static file service for: /api/brain/files
[API] GET /api/brain/files - BRAIN_DIR: /app/brain
[API] Found X brain files
```

### 3. 測試 API 端點

在瀏覽器中訪問：

```
https://clawbrain.zeabur.app/health
https://clawbrain.zeabur.app/api/brain/files
https://clawbrain.zeabur.app/api/memory/logs
```

**預期結果**:
- 返回 JSON 格式
- Content-Type: `application/json`
- 狀態碼: `200 OK`

### 4. 檢查瀏覽器控制台

如果修復成功：
- ✅ 不再出現 "Unexpected token '<'" 錯誤
- ✅ API 請求成功返回 JSON
- ✅ 前端可以正確解析數據

---

## 如果問題持續

如果修復後問題仍然存在，可能的原因：

1. **Zeabur 緩存**: Zeabur 可能緩存了舊版本
   - 解決方案: 等待幾分鐘或手動觸發重新部署

2. **建置問題**: TypeScript 編譯或建置失敗
   - 解決方案: 檢查 Zeabur 建置日誌

3. **路由匹配問題**: Express 路由匹配機制問題
   - 解決方案: 檢查 Zeabur 日誌中的路由處理順序

4. **文件系統問題**: `dist` 目錄結構問題
   - 解決方案: 檢查建置產物是否正確

---

## 下一步

1. **等待部署完成** (3-5 分鐘)
2. **檢查 Zeabur 日誌** (確認路由處理)
3. **測試 API 端點** (確認返回 JSON)
4. **驗證前端功能** (確認數據正確載入)

---

**修復完成時間**: 2026-02-05 23:15  
**Commits**: c13078d, 1298563  
**狀態**: 已推送，等待 Zeabur 重新部署
