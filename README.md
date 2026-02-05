<!--
更新時間：2026-02-05 17:41
更新者：AI Assistant
更新摘要：新增生產環境部署章節，說明測試資料不部署策略

更新時間：2026-02-05 17:22
更新者：AI Assistant (Tao)
更新摘要：新增後端伺服器啟動說明與專案目錄結構
-->

# Second Brain Web 🧠

這是一個專為顧問設計的 **「第二大腦」視覺化知識庫**。透過 React.js 與 Material UI (MUI) 打造，旨在將每日對話日誌與技術心得轉化為可搜尋、可互動的 Web 介面。

## 🌟 核心特色
*   **四區塊聯動佈局**：傳承自 TTAS 系統的高效率介面，包含側邊導覽、主內容區、全局搜尋與右側統計資訊。
*   **Markdown 即時渲染**：原生支援 Markdown 格式，完美呈現技術代碼與結構化筆記。
*   **語義化搜尋介面**：頂部整合快速搜尋列，未來可擴充 AI 語義檢索。
*   **深色模式設計**：沉浸式開發體驗，符合工程師與技術顧問的作業習慣。

## 🛠️ 技術棧
*   **Frontend**: React 19 + TypeScript
*   **Backend**: Express.js + Node.js
*   **UI Framework**: Material UI (MUI) v7
*   **Bundler**: Vite
*   **Rendering**: react-markdown

## 📁 專案結構

```
SecondBrainWeb/
├── brain/          # 知識庫 Markdown 文件（.md）
├── memory/         # 對話記憶日誌 Markdown 文件（.md）
├── server/         # Express 後端伺服器
│   └── index.ts    # API 路由與靜態文件服務
├── src/            # React 前端程式碼
│   ├── components/ # UI 元件
│   ├── hooks/      # React Hooks
│   └── theme/      # MUI 主題設定
├── dist/           # 前端建置輸出（自動生成）
└── dist-server/    # 後端編譯輸出（自動生成）
```

**重要**：`brain/` 和 `memory/` 目錄用於存放資料，若不存在會自動返回空陣列。

## 🚀 快速啟動

### 📦 安裝依賴
```bash
npm install
```

### 🗂️ 建立資料目錄（首次執行）
```bash
# Windows PowerShell
New-Item -ItemType Directory -Path brain, memory

# macOS/Linux
mkdir brain memory
```

### 🔨 建置專案
```bash
npm run build
```
此命令會同時建置前端（Vite）和後端（TypeScript）。

### 🚀 開發環境啟動

#### 方法一：分別啟動（推薦）

**終端 1 - 前端開發伺服器**：
```bash
npm run dev
```
- 啟動 Vite 開發伺服器
- 地址：http://localhost:5173
- 支援熱更新（Hot Module Replacement）

**終端 2 - 後端 API 伺服器**：
```bash
npm run server
```
- 啟動 Express API 伺服器
- 地址：http://localhost:3000
- 提供 API 端點：
  - `GET /api/brain/files` - 取得知識庫文件列表
  - `GET /api/memory/logs` - 取得對話日誌列表
  - `GET /api/content/:type/:fileName` - 取得文件內容

#### 方法二：單一命令啟動（需安裝 concurrently）

```bash
# 安裝 concurrently（可選）
npm install --save-dev concurrently

# 新增 script 到 package.json
"dev:all": "concurrently \"npm run dev\" \"npm run server\""

# 執行
npm run dev:all
```

### 🌐 訪問應用

- **前端介面**：http://localhost:5173
- **API 測試**：http://localhost:3000/api/brain/files

## 📝 使用說明

1. 將 Markdown 文件放入對應目錄：
   - `brain/` - 存放知識庫文章（例如：`技術筆記.md`）
   - `memory/` - 存放對話日誌（例如：`2026-02-05.md`）

2. 前端會自動讀取並顯示這些文件

3. 支援完整 Markdown 語法，包括代碼高亮

## 🚀 生產環境部署

> 📋 **最新驗證報告**: [`FINAL_DEPLOYMENT_REPORT.md`](FINAL_DEPLOYMENT_REPORT.md)  
> ✅ **所有測試通過，已準備好部署到生產環境**

### ⚠️ 重要：開發資料 vs 生產資料

**`brain/` 和 `memory/` 目錄中的測試資料僅供本地開發使用，不會部署到生產環境。**

- ✅ 開發環境：使用本地 `brain/` 和 `memory/` 目錄進行測試
- ✅ 生產環境：使用 Zeabur Volume 持久化存儲（`/home/node/.openclaw/workspace/`）
- ✅ 資料隔離：`.gitignore` 和 `.dockerignore` 已配置排除測試資料

### 📋 部署平台：Zeabur

專案已配置 Zeabur 作為部署平台（參考 `zeabur.yaml`）。

#### 部署步驟

1. **準備 Git Repository**
   ```bash
   git add .
   git commit -m "Prepare for production deployment"
   git push origin main
   ```

2. **Zeabur 配置**
   - 登入 [Zeabur](https://zeabur.com)
   - New Project → Import from GitHub
   - 選擇 SecondBrainWeb repository
   - 設定環境變數：
     ```
     NODE_ENV=production
     ```
   - **重要**：配置 Volume
     - Service Settings → Volumes
     - Mount Path: `/home/node/.openclaw/workspace`
     - Size: 1GB（視需求調整）

3. **部署**
   - 點擊 Deploy，Zeabur 會自動執行 `npm run build` 和 `npm start`

4. **上傳生產資料**
   ```bash
   # 使用 Zeabur CLI
   npm install -g @zeabur/cli
   zeabur login
   zeabur volume upload --service secondbrainweb \
     --path /home/node/.openclaw/workspace/brain \
     ./production-data/brain/welcome.md
   ```

### 🐳 Docker 本地測試

部署前可使用 Docker 驗證配置：

**前置需求**：確保 Docker Desktop 已啟動並運行

```bash
# Windows PowerShell

# 1. 建立模擬生產環境的測試資料
New-Item -ItemType Directory -Path docker-test-data\brain, docker-test-data\memory -Force
echo "# Docker 測試文件" | Out-File -FilePath docker-test-data\brain\test.md -Encoding utf8
echo "# Docker 測試日誌" | Out-File -FilePath docker-test-data\memory\2026-02-05.md -Encoding utf8

# 2. 建置映像（.dockerignore 會排除本地 brain/ 和 memory/）
docker build -t secondbrainweb:latest .

# 3. 運行容器（掛載測試資料，模擬 Zeabur Volume）
docker run -d `
  -p 3000:3000 `
  -v ${PWD}/docker-test-data/brain:/home/node/.openclaw/workspace/brain `
  -v ${PWD}/docker-test-data/memory:/home/node/.openclaw/workspace/memory `
  -e NODE_ENV=production `
  --name secondbrain `
  secondbrainweb:latest

# 4. 等待伺服器啟動
Start-Sleep -Seconds 3

# 5. 測試 API
Invoke-WebRequest -Uri "http://localhost:3000/api/brain/files" -UseBasicParsing | Select-Object -ExpandProperty Content
Invoke-WebRequest -Uri "http://localhost:3000/health" -UseBasicParsing | Select-Object -ExpandProperty Content

# 6. 驗證資料隔離（確認容器內沒有開發測試資料）
docker exec secondbrain ls -la /home/node/.openclaw/workspace/brain

# 7. 清理
docker stop secondbrain
docker rm secondbrain
Remove-Item -Recurse -Force docker-test-data
```

**macOS/Linux**：

```bash
# 1. 建立模擬生產環境的測試資料
mkdir -p docker-test-data/brain docker-test-data/memory
echo "# Docker 測試文件" > docker-test-data/brain/test.md
echo "# Docker 測試日誌" > docker-test-data/memory/2026-02-05.md

# 2. 建置映像
docker build -t secondbrainweb:latest .

# 3. 運行容器
docker run -d \
  -p 3000:3000 \
  -v $(pwd)/docker-test-data/brain:/home/node/.openclaw/workspace/brain \
  -v $(pwd)/docker-test-data/memory:/home/node/.openclaw/workspace/memory \
  -e NODE_ENV=production \
  --name secondbrain \
  secondbrainweb:latest

# 4. 測試 API
curl http://localhost:3000/api/brain/files
curl http://localhost:3000/health

# 5. 清理
docker stop secondbrain && docker rm secondbrain
rm -rf docker-test-data
```

**驗證重點**：
- ✅ API 返回掛載的測試資料（不是本地 `brain/` 和 `memory/`）
- ✅ 容器內只有 Volume 掛載的資料
- ✅ 映像大小合理（排除測試資料後應更小）

### 🔍 健康檢查

部署後可透過健康檢查端點驗證：

```bash
curl https://your-app.zeabur.app/health
```

回應範例：
```json
{
  "status": "healthy",
  "uptime": 123.45,
  "timestamp": "2026-02-05T17:41:00.000Z",
  "storage": {
    "brain": true,
    "memory": true
  }
}
```

### 📊 部署檢查清單

部署前確認：
- [ ] `.gitignore` 已排除 `brain/` 和 `memory/` 測試資料
- [ ] `.dockerignore` 已排除 `brain/` 和 `memory/` 測試資料
- [ ] Zeabur Volume 已配置
- [ ] 生產資料已準備（獨立於開發測試資料）

部署後驗證：
- [ ] 前端頁面正常載入
- [ ] API 端點回應正常（返回 Volume 資料）
- [ ] 健康檢查端點正常運作
- [ ] Volume 資料可正常讀寫

---
*Developed by Tao 🍵 (AI Assistant)*
