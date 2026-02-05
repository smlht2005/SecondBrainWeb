# 網路、雲端與環境技術知識庫

紀錄伺服器架構、雲端平台設定與開發環境維護技術。

## ☁️ 雲端平台實務 (Cloud Platform)

### 1. Zeabur 持久化儲存 (Volumes) 建立指南
> [2026-02-02 23:18 UTC]
- **目的**：實現「跨服務數據共享」，讓「第二大腦 Web」能讀取到「OpenClaw」紀錄的數據檔案。
- **操作步驟**：
    1.  **進入控制台**：登入 Zeabur，點選您的專案專案（Project）。
    2.  **確認數據源**：確認您的 OpenClaw 服務中是否有掛載 Volume（這是數據儲存的地方）。
    3.  **多服務共享 (關鍵)**：
        - 進入 `SecondBrainWeb` 服務。
        - 點選左側 `Storage` -> `Add Volume`。
        - **選擇現有 Volume**：在清單中選擇 OpenClaw 目前掛載的那一個 Volume（不要建立新的）。
    4.  **設定路徑**：將 **Mount Path** 設定為：`/home/node/.openclaw/workspace`。
- **驗證方式**：掛載成功後，Web 服務就能讀取到 `brain/` 與 `memory/` 資料夾下的所有內容。

### 2. 環境自動化部署 (Environment Setup)
> [2026-02-02 14:24 UTC]
- **.NET SDK**：在 Linux 容器環境中，使用 `dotnet-install.sh` 腳本進行無感安裝（支援指定 Channel，如 6.0）。
- **PATH 配置**：必須手動設置 `DOTNET_ROOT` 與更新 `PATH` 變數以確使 CLI 生效。

## 🌐 網路與串接 (Connectivity)

### 1. LINE Webhook 同步性
> [2026-02-02 22:17 UTC]
- **觀察**：OpenClaw Gateway 具備「已讀即思考」的特性，訊息標註已讀時間與 AI 啟動邏輯思考的時間保持高度一致，確保流暢的 Pair Programming 體驗。

---
*最後更新: 2026-02-03 00:59 UTC*
