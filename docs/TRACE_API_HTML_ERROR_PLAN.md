# 追蹤 API 返回 HTML 錯誤的計劃

**建立時間**: 2026-02-05 23:53
**問題**: API 端點返回 HTML 而非 JSON

## 問題描述
- API 端點 `/api/brain/files` 和 `/api/memory/logs` 返回 `<!doctype html>` 而非 JSON
- 這表明 SPA catch-all 中間件正在處理這些 API 請求

## 根本原因假設

| 假設 | 描述 | 驗證方式 |
|------|------|----------|
| A | CORS 中間件失敗，請求跳過 apiRouter | 檢查 CORS 日誌 |
| B | apiRouter 未匹配路由 | 檢查 API handler 日誌 |
| C | req.path 值異常 | 追蹤每個中間件的 req.path |
| D | 響應被錯誤的中間件發送 | 使用響應攔截器 |

## 修改計劃

### 1. 添加全局響應攔截器

在所有中間件之前，攔截 `res.send` 和 `res.sendFile`，追蹤哪個中間件發送了響應。

### 2. 添加中間件序號追蹤

為每個中間件添加序號，清楚顯示執行順序。

### 3. 添加 CORS 錯誤處理日誌

在 corsOptions 中添加更詳細的錯誤追蹤。

### 4. 添加全局錯誤處理器

捕獲所有未處理的錯誤，防止錯誤導致意外行為。

### 5. 添加 404 兜底處理器

在所有中間件之後，添加 404 處理器追蹤未匹配的請求。

## 預期日誌輸出

成功的 API 請求應該顯示：
```
[MW-1] Global Logger - Path: /api/brain/files
[MW-2] JSON Parser
[MW-3] API Mount - Path: /brain/files (stripped)
[CORS-TRACE] Origin: https://clawbrain.zeabur.app - ALLOWED
[MW-4] API Router - /brain/files
[API-DEBUG] Brain API Handler CALLED
[RESPONSE-TRACE] res.send() called - Content-Type: application/json
```

失敗的請求（返回 HTML）應該顯示：
```
[MW-1] Global Logger - Path: /api/brain/files
...
[RESPONSE-TRACE] ⚠️ res.sendFile() called for: /api/brain/files
[RESPONSE-TRACE] File: /app/dist/index.html
[RESPONSE-TRACE] Stack trace: ... (顯示哪個中間件調用了 sendFile)
```

## 部署步驟

1. 修改 `server/index.ts` 添加上述日誌
2. 執行 `npm run build` 編譯
3. `git add . && git commit -m "debug: Add response tracing and middleware sequence logging"`
4. `git push origin main`
5. 等待 Zeabur 重新部署
6. 查看 Zeabur Logs 面板中的日誌輸出
7. 根據日誌確認根本原因
