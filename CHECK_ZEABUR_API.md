# 檢查 Zeabur API 狀態指南

**Zeabur URL**: https://clawbrain.zeabur.app  
**檢查時間**: 2026-02-05

---

## 可用的 API 端點

根據 [`server/index.ts`](server/index.ts) 配置，以下端點應該可用：

1. **健康檢查**: `GET /health`
2. **Brain API**: `GET /api/brain/files`
3. **Memory API**: `GET /api/memory/logs`
4. **內容 API**: `GET /api/content/:type/:fileName`

---

## 檢查方法

### 方法 1: 使用瀏覽器直接訪問

在瀏覽器中打開以下 URL：

```
https://clawbrain.zeabur.app/health
https://clawbrain.zeabur.app/api/brain/files
https://clawbrain.zeabur.app/api/memory/logs
```

**預期結果**：
- `/health` - 返回 JSON: `{"status":"healthy","uptime":...,"timestamp":...,"storage":{...}}`
- `/api/brain/files` - 返回 JSON 陣列: `[{name:"...",fileName:"...",type:"brain"},...]`
- `/api/memory/logs` - 返回 JSON 陣列: `[{date:"...",fileName:"...",type:"memory"},...]`

**如果返回 HTML**：
- 表示 API 路由沒有正確處理
- 可能是路由順序問題或靜態文件服務攔截了請求

### 方法 2: 使用 PowerShell (Windows)

```powershell
# 檢查健康檢查端點
$response = Invoke-WebRequest -Uri "https://clawbrain.zeabur.app/health" -UseBasicParsing
Write-Host "Status: $($response.StatusCode)"
Write-Host "Content-Type: $($response.Headers.'Content-Type')"
$response.Content

# 檢查 Brain API
$response = Invoke-WebRequest -Uri "https://clawbrain.zeabur.app/api/brain/files" -UseBasicParsing
Write-Host "Status: $($response.StatusCode)"
Write-Host "Content-Type: $($response.Headers.'Content-Type')"
$response.Content

# 檢查 Memory API
$response = Invoke-WebRequest -Uri "https://clawbrain.zeabur.app/api/memory/logs" -UseBasicParsing
Write-Host "Status: $($response.StatusCode)"
Write-Host "Content-Type: $($response.Headers.'Content-Type')"
$response.Content
```

### 方法 3: 使用 curl (macOS/Linux)

```bash
# 檢查健康檢查端點
curl -v https://clawbrain.zeabur.app/health

# 檢查 Brain API
curl -v https://clawbrain.zeabur.app/api/brain/files

# 檢查 Memory API
curl -v https://clawbrain.zeabur.app/api/memory/logs
```

### 方法 4: 檢查 Zeabur 日誌

1. 登入 [Zeabur Dashboard](https://zeabur.com)
2. 選擇您的服務（SecondBrainWeb）
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
- `Static files (dist) not found` - 建置失敗或 dist 目錄不存在
- `BRAIN_DIR does not exist` - 驗證資料目錄不存在
- `CORS Blocked` - CORS 配置問題
- 沒有 `[API]` 日誌 - API 路由沒有被調用

---

## 診斷檢查清單

### ✅ 服務器是否運行？

**檢查**: Zeabur Dashboard → Logs → 查找 "Server started on port"

**如果沒有**：
- 服務器可能沒有啟動
- 檢查建置日誌是否有錯誤
- 檢查 `npm start` 是否正確執行

### ✅ API 路由是否正確掛載？

**檢查**: Zeabur Logs → 查找 `[API] GET /api/brain/files`

**如果沒有**：
- API 路由可能沒有被調用
- 請求可能被靜態文件服務攔截
- 需要修復路由順序

### ✅ 靜態文件是否正確服務？

**檢查**: Zeabur Logs → 查找 "Serving static files from"

**如果沒有**：
- `dist` 目錄可能不存在
- 建置可能失敗
- 路徑探測可能失敗

### ✅ CORS 是否正確配置？

**檢查**: Zeabur Logs → 查找 `[CORS]` 日誌

**如果看到 "Blocked"**：
- Origin 不在允許列表中
- 需要更新 `allowedOrigins`

### ✅ 驗證資料是否存在？

**檢查**: Zeabur Logs → 查找 `BRAIN_DIR` 和 `MEMORY_DIR` 路徑

**如果看到 "does not exist"**：
- 驗證資料可能沒有包含在部署中
- 路徑探測可能失敗
- 需要檢查 Git 中是否包含 `brain/` 和 `memory/`

---

## 快速診斷命令

### PowerShell 一鍵檢查腳本

```powershell
$baseUrl = "https://clawbrain.zeabur.app"

Write-Host "`n=== 檢查 Zeabur API 狀態 ===" -ForegroundColor Green

# 1. 健康檢查
Write-Host "`n1. 健康檢查端點:" -ForegroundColor Cyan
try {
    $health = Invoke-WebRequest -Uri "$baseUrl/health" -UseBasicParsing
    Write-Host "   Status: $($health.StatusCode)" -ForegroundColor Green
    Write-Host "   Content-Type: $($health.Headers.'Content-Type')" -ForegroundColor Green
    $healthJson = $health.Content | ConvertFrom-Json
    Write-Host "   Status: $($healthJson.status)" -ForegroundColor Green
    Write-Host "   Uptime: $([math]::Round($healthJson.uptime, 2)) seconds" -ForegroundColor Green
} catch {
    Write-Host "   ❌ 錯誤: $_" -ForegroundColor Red
}

# 2. Brain API
Write-Host "`n2. Brain API:" -ForegroundColor Cyan
try {
    $brain = Invoke-WebRequest -Uri "$baseUrl/api/brain/files" -UseBasicParsing
    Write-Host "   Status: $($brain.StatusCode)" -ForegroundColor Green
    Write-Host "   Content-Type: $($brain.Headers.'Content-Type')" -ForegroundColor Green
    if ($brain.Headers.'Content-Type' -like '*json*') {
        $brainJson = $brain.Content | ConvertFrom-Json
        Write-Host "   ✅ 返回 JSON，找到 $($brainJson.Count) 個文件" -ForegroundColor Green
    } else {
        Write-Host "   ❌ 返回非 JSON: $($brain.Content.Substring(0, [Math]::Min(100, $brain.Content.Length)))" -ForegroundColor Red
    }
} catch {
    Write-Host "   ❌ 錯誤: $_" -ForegroundColor Red
}

# 3. Memory API
Write-Host "`n3. Memory API:" -ForegroundColor Cyan
try {
    $memory = Invoke-WebRequest -Uri "$baseUrl/api/memory/logs" -UseBasicParsing
    Write-Host "   Status: $($memory.StatusCode)" -ForegroundColor Green
    Write-Host "   Content-Type: $($memory.Headers.'Content-Type')" -ForegroundColor Green
    if ($memory.Headers.'Content-Type' -like '*json*') {
        $memoryJson = $memory.Content | ConvertFrom-Json
        Write-Host "   ✅ 返回 JSON，找到 $($memoryJson.Count) 個文件" -ForegroundColor Green
    } else {
        Write-Host "   ❌ 返回非 JSON: $($memory.Content.Substring(0, [Math]::Min(100, $memory.Content.Length)))" -ForegroundColor Red
    }
} catch {
    Write-Host "   ❌ 錯誤: $_" -ForegroundColor Red
}

Write-Host "`n=== 檢查完成 ===" -ForegroundColor Green
```

---

## 預期結果

### ✅ API 正常運行

**健康檢查** (`/health`):
```json
{
  "status": "healthy",
  "uptime": 1234.56,
  "timestamp": "2026-02-05T23:00:00.000Z",
  "storage": {
    "brain": true,
    "memory": true
  }
}
```

**Brain API** (`/api/brain/files`):
```json
[
  {
    "name": "測試文件",
    "fileName": "測試文件.md",
    "type": "brain"
  },
  ...
]
```

**Memory API** (`/api/memory/logs`):
```json
[
  {
    "date": "2026-02-05",
    "fileName": "2026-02-05.md",
    "type": "memory"
  },
  ...
]
```

### ❌ API 返回 HTML（當前問題）

如果返回 HTML（`<!doctype html>`），表示：
- API 路由沒有正確處理請求
- 請求被靜態文件服務或 SPA catch-all 路由攔截
- 需要修復路由順序問題

---

## 下一步

根據檢查結果：

1. **如果 API 返回 HTML**：
   - 需要實施計劃中的修復方案
   - 確保 API 路由在靜態文件服務之前

2. **如果 API 返回 404**：
   - 檢查路由配置
   - 確認服務器正在運行

3. **如果 API 返回 500**：
   - 檢查 Zeabur 日誌中的錯誤信息
   - 檢查驗證資料是否存在

4. **如果 API 正常但返回空陣列**：
   - 檢查驗證資料是否包含在部署中
   - 檢查目錄路徑是否正確

---

**檢查完成後，請分享結果以便進一步診斷！**
