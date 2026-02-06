# Email Service Setup (Zeabur)

**狀態**: 待辦 (To-Do)
**優先級**: 高 (High)
**指派給**: Tao & User

## 🎯 目標
啟用 Zeabur Email 服務，讓 SecondBrainWeb 具備自動發送通知信件的能力（例如：每日 Scrum 報告、股價警示）。

## 📝 執行步驟

### Step 1: 申請服務 (User Action)
- [ ] 登入 Zeabur Console
- [ ] 建立 "Email" Service
- [ ] 取得 `ZEABUR_EMAIL_API_KEY`

### Step 2: 驗證網域 (User Action)
- [ ] 在 Zeabur Email 設定中新增網域 (如 `clawbrain.zeabur.app` 或自訂網域)
- [ ] 設定 DNS 紀錄 (DKIM / SPF) 以通過驗證

### Step 3: 系統整合 (Tao Action)
- [ ] 接收 API Key 並設定環境變數
- [ ] 開發 `send-email.js` 腳本 (或是整合進 Server API)
- [ ] 測試發送第一封 "Hello World" 信件

### Step 4: 自動化串接 (Tao Action)
- [ ] 將 Email 發送功能整合至每日 Cron Job
- [ ] 實現「Scrum 報告自動寄送」功能

---
*Created by Tao on 2026-02-06*
