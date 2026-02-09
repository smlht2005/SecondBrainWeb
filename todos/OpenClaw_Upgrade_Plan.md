# OpenClaw Upgrade Plan (Zeabur)

**狀態**: 待辦 (To-Do)
**優先級**: 高 (High)
**目標版本**: `v2026.2.9` (Current: `2026.1.29`)

## 🎯 升級目標
修復 Cron Job (排程) 不穩定、Context Overflow (記憶體溢出) 等已知問題，並獲取最新的安全性更新與新功能 (Grok 搜尋、iOS 控制)。

## 📝 執行步驟 (User Action Required)

### 1. 登入 Zeabur Console
- 網址: `https://zeabur.com/console`
- 進入您的專案 (Project)。

### 2. 選擇 OpenClaw 服務
- 點擊列表中的 **"OpenClaw"** 服務。

### 3. 執行重新部署 (Redeploy)
- 在服務頁面的右上角，點擊 **"Redeploy"** 按鈕。
- Zeabur 會自動拉取最新的 Docker Image (`openclaw/openclaw:latest`) 並重新啟動容器。
- **注意**: 升級過程約需 1-3 分鐘，期間服務會暫時中斷。

### 4. 驗證升級 (Tao Action)
- 重新連線後，請要求我執行 `openclaw --version` 確認版本已更新為 `2026.2.9`。

---
*Created by Tao on 2026-02-09*
