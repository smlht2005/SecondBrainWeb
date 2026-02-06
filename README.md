<!--
更新時間：2026-02-06 14:52
更新者：AI Assistant
更新摘要：更新為靜態檔案架構，新增 todos 支援、環境變數控制、測試框架

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
*   **Backend**: Express.js + Node.js（靜態檔案服務）
*   **UI Framework**: Material UI (MUI) v7
*   **Bundler**: Vite
*   **Rendering**: react-markdown
*   **Testing**: Vitest + Testing Library
*   **Architecture**: 靜態檔案架構（直接存取 manifest.json 和 Markdown 檔案）

## 📁 專案結構

```
SecondBrainWeb/
├── brain/              # 知識庫 Markdown 文件（.md）
├── memory/             # 對話記憶日誌 Markdown 文件（.md）
├── todos/              # 待辦清單 Markdown 文件（.md）
├── scripts/            # 建置腳本
│   └── generate-manifest.js  # 自動生成 manifest.json
├── server/             # Express 後端伺服器
│   └── index.ts        # 靜態檔案服務與 SPA 路由
├── src/                # React 前端程式碼
│   ├── components/     # UI 元件
│   ├── hooks/          # React Hooks
│   ├── utils/          # 工具函數
│   └── theme/          # MUI 主題設定
├── tests/              # 測試檔案
│   ├── setup.ts        # Vitest 設定
│   └── utils/          # 單元測試
├── dist/               # 前端建置輸出（自動生成）
│   ├── brain/          # 複製的 brain/ 目錄與 manifest.json
│   ├── memory/         # 複製的 memory/ 目錄與 manifest.json
│   └── todos/          # 複製的 todos/ 目錄與 manifest.json
└── dist-server/        # 後端編譯輸出（自動生成）
```

**重要**：
- `brain/`、`memory/`、`todos/` 目錄用於存放資料，建置時會自動生成 `manifest.json`
- 若資料夾不存在，建置腳本會自動建立並產生空的 manifest
- 透過環境變數 `DATA_FOLDERS` 可控制要包含哪些資料夾（預設：`brain,memory,todos`）

## 🚀 快速啟動

### 📦 安裝依賴
```bash
npm install
```

### 🗂️ 建立資料目錄（首次執行，可選）

資料夾會在建置時自動建立，但您也可以手動建立：

```bash
# Windows PowerShell
New-Item -ItemType Directory -Path brain, memory, todos

# macOS/Linux
mkdir -p brain memory todos
```

### 🔨 建置專案
```bash
npm run build
```

此命令會：
1. 執行 `scripts/generate-manifest.js` - 掃描資料夾並生成 `manifest.json`
2. 編譯 TypeScript（前端與後端）
3. 建置前端（Vite）並複製 `brain/`、`memory/`、`todos/` 到 `dist/`

**環境變數控制**：
```bash
# 僅包含 brain 和 memory（不包含 todos）
$env:DATA_FOLDERS="brain,memory"; npm run build  # Windows PowerShell
DATA_FOLDERS=brain,memory npm run build           # Linux/macOS
```

詳細說明請參考 [docs/DATA_FOLDERS_ENV.md](docs/DATA_FOLDERS_ENV.md)。

### 🚀 開發環境啟動

#### 方法一：分別啟動（推薦）

**終端 1 - 前端開發伺服器**：
```bash
npm run dev
```
- 啟動 Vite 開發伺服器
- 地址：http://localhost:5173
- 支援熱更新（Hot Module Replacement）

**終端 2 - 後端靜態檔案伺服器**：
```bash
npm run server
```
- 啟動 Express 靜態檔案伺服器
- 地址：http://localhost:3000
- 提供靜態檔案服務：
  - `GET /brain/manifest.json` - 知識庫檔案列表
  - `GET /memory/manifest.json` - 對話日誌列表
  - `GET /todos/manifest.json` - 待辦清單列表
  - `GET /{type}/{fileName}` - 直接存取 Markdown 檔案內容
  - `GET /health` - 健康檢查端點

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

- **前端介面**：http://localhost:5173（開發模式）或 http://localhost:3000（生產模式）
- **靜態檔案測試**：http://localhost:3000/brain/manifest.json

### 🧪 執行測試

```bash
# 執行所有測試
npm run test

# 監聽模式（開發時使用）
npm run test:watch
```

測試計劃與詳細說明請參考 [docs/TEST_PLAN.md](docs/TEST_PLAN.md)。

## 📝 使用說明

### 新增內容

1. **將 Markdown 文件放入對應目錄**：
   - `brain/` - 存放知識庫文章（例如：`技術筆記.md`）
   - `memory/` - 存放對話日誌（例如：`2026-02-05.md`）
   - `todos/` - 存放待辦清單（例如：`我的待辦.md`）

2. **重新建置**：
   ```bash
   npm run build
   ```
   建置腳本會自動掃描資料夾並更新 `manifest.json`

3. **前端自動顯示**：
   - 側邊欄會顯示「知識分類」（brain）、「待辦」（todos）、「最近對話」（memory）
   - 點選項目後，主內容區域會顯示對應的 Markdown 內容

4. **支援完整 Markdown 語法**，包括代碼高亮、表格、列表等

### 架構說明

本專案採用**靜態檔案架構**：
- **建置時**：掃描資料夾生成 `manifest.json`，複製所有 `.md` 檔案到 `dist/`
- **執行時**：前端直接請求 `/brain/manifest.json`、`/memory/manifest.json`、`/todos/manifest.json` 取得檔案列表
- **內容載入**：直接請求 `/{type}/{fileName}` 取得 Markdown 內容
- **優點**：簡單、快速、可靠，無需複雜的 API 邏輯

## 🚀 生產環境部署

> 📋 **最新驗證報告**: [`FINAL_DEPLOYMENT_REPORT.md`](FINAL_DEPLOYMENT_REPORT.md)  
> ✅ **所有測試通過，已準備好部署到生產環境**

### ⚠️ 重要：資料說明

**`brain/`、`memory/`、`todos/` 目錄中的資料會包含在 Git 版本控制和 Zeabur 源代碼部署中。**

- ✅ 驗證資料：`brain/測試文件.md`、`memory/2026-02-05.md`、`todos/測試待辦.md` 用於功能驗證
- ✅ Git 追蹤：資料會被提交到 GitHub，方便協作和部署
- ✅ 源代碼部署：Zeabur 使用源代碼部署，資料自動包含（不使用 Dockerfile）
- ✅ Zeabur 部署：部署後可立即看到資料，無需手動上傳
- ✅ 環境變數：可透過 `DATA_FOLDERS` 控制要包含哪些資料夾（預設：`brain,memory,todos`）

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
     DATA_FOLDERS=brain,memory,todos  # 可選，預設為 brain,memory,todos
     ```
   - **重要**：配置 Volume
     - Service Settings → Volumes
     - Mount Path: `/home/node/.openclaw/workspace`
     - Size: 1GB（視需求調整）

3. **部署**
   - 點擊 Deploy，Zeabur 會自動：
     - 檢測 Node.js 專案（檢測到 `package.json`）
     - 執行 `npm ci`（安裝所有依賴，包括 devDependencies）
     - 執行 `npm run build`（建置前端和後端）
     - 執行 `npm start`（啟動生產伺服器）
   - 資料（`brain/`、`memory/`、`todos/`）會自動包含在部署中

4. **驗證部署**
   - 部署完成後，訪問 Zeabur 提供的 URL
   - 測試靜態檔案端點：`/brain/manifest.json`、`/memory/manifest.json`、`/todos/manifest.json`
   - 前端頁面會自動顯示所有知識庫文件、待辦清單和對話日誌

**注意**：Zeabur 使用源代碼部署（不使用 Dockerfile），所有資料會自動包含。

### 🐳 Docker 本地測試（可選）

部署前可使用 Docker 驗證配置：

**前置需求**：確保 Docker Desktop 已啟動並運行

```bash
# Windows PowerShell

# 1. 建立模擬生產環境的測試資料
New-Item -ItemType Directory -Path docker-test-data\brain, docker-test-data\memory -Force
echo "# Docker 測試文件" | Out-File -FilePath docker-test-data\brain\test.md -Encoding utf8
echo "# Docker 測試日誌" | Out-File -FilePath docker-test-data\memory\2026-02-05.md -Encoding utf8

# 2. 建置映像（使用 Dockerfile.local）
docker build -f Dockerfile.local -t secondbrainweb:latest .

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

# 2. 建置映像（使用 Dockerfile.local）
docker build -f Dockerfile.local -t secondbrainweb:latest .

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
  "timestamp": "2026-02-06T14:52:00.000Z",
  "distPath": "/app/dist",
  "staticFiles": true
}
```

### 📊 部署檢查清單

部署前確認：
- [x] `.gitignore` 已配置允許 `brain/`、`memory/`、`todos/` 資料
- [x] 驗證資料已包含在專案中（`brain/測試文件.md`、`memory/2026-02-05.md`、`todos/測試待辦.md`）
- [x] 測試通過（`npm run test`）
- [ ] 環境變數 `DATA_FOLDERS` 已設定（可選，預設為 `brain,memory,todos`）

部署後驗證：
- [ ] 前端頁面正常載入
- [ ] 靜態檔案端點正常（`/brain/manifest.json`、`/memory/manifest.json`、`/todos/manifest.json`）
- [ ] 健康檢查端點正常運作（`/health`）
- [ ] 側邊欄正確顯示「知識分類」、「待辦」、「最近對話」
- [ ] 點選項目後內容正確載入

## 📚 相關文件

- [docs/DATA_FOLDERS_ENV.md](docs/DATA_FOLDERS_ENV.md) - 環境變數 `DATA_FOLDERS` 詳細說明
- [docs/TEST_PLAN.md](docs/TEST_PLAN.md) - 測試計劃與執行方式
- [docs/ADD_NEW_FOLDER.md](docs/ADD_NEW_FOLDER.md) - **如何新增新的資料夾類型**（例如 notes、projects 等）
- [dev_readme.md](dev_readme.md) - 開發歷程記錄

---
*Developed by Tao 🍵 (AI Assistant)*
