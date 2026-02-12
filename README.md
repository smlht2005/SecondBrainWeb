# Second Brain Web 🧠 (V2 架構)

這是專為顧問設計的 「第二大腦」知識庫 Web 介面升級版。V2 版本實現了 **前後端分離 (Decoupled Architecture)**，透過獨立的 Fastify 後端提供動態數據處理與任務工作流管理。

## 🌟 V2 核心升級
*   **前後端分離**：前端 React 19 + 後端 Fastify 5，透過 RESTful API 溝通。
*   **動態工作流**：支援將任務在 `TODO` -> `REVIEW` -> `DONE` 之間動態移動，實現實體檔案路徑與狀態同步。
*   **即時檔案解析**：後端直接解析檔案系統中的 Markdown 檔案，無須再手動生成 `manifest.json`。
*   **API 文件化**：整合 Swagger UI，提供透明的後端介面文件與測試環境。

## 🛠️ 技術棧
### 前端 (SecondBrainWeb)
*   **Framework**: React 19 + Vite
*   **UI Component**: Material UI (MUI) v7
*   **API Connection**: Fetch API (apiClient)

### 後端 (SecondBrainServer)
*   **Framework**: Fastify 5 + TypeScript
*   **Data Validation**: TypeBox
*   **Documentation**: @fastify/swagger (OpenAPI)
*   **Persistence**: File System (Markdown based)

## 📁 專案結構
```
/home/node/data/.openclaw/workspace/
├── SecondBrainWeb/         # 前端 React 專案
├── SecondBrainServer/      # 後端 Fastify API 專案
├── brain/                  # 知識庫文章 (.md)
├── memory/                 # 對話日誌 (.md)
├── todos/                  # 待辦項目 (.md)
├── review/                 # 審核中項目 (.md)
└── done/                   # 已完成項目 (.md)
```

## 🚀 快速啟動

### 1. 啟動後端伺服器 (SecondBrainServer)
```bash
cd SecondBrainServer
npm run build
npm start
```
*   **API 地址**: http://localhost:3000
*   **API 文件**: http://localhost:3000/docs

### 2. 啟動前端介面 (SecondBrainWeb)
```bash
cd SecondBrainWeb
npm run dev
```
*   **訪問網址**: http://localhost:5173

## 📝 任務工作流 (Workflow)
在 Web 介面中，您可以透過右下角的操作按鈕管理任務狀態：
1.  **TODO**: 初始任務。點擊「送至審核」移動檔案至 `review/`。
2.  **REVIEW**: 審核中。可選擇「完成任務」移至 `done/` 或「退回待辦」。
3.  **DONE**: 已完成。可隨時「重啟審核」回流至 `review/`。

## ⚙️ 任務範本 (Template)
建立新任務時，請參考 `todos/TEMPLATE.md` 格式，以確保包含以下追蹤欄位：
*   **狀態 (Status)**：PENDING, PROGRESS, REVIEW, DONE
*   **預定/實際完成日**
*   **投入工時**
*   **問題與困難點記錄**

---
*Developed by Tao 🍵 (AI Assistant) - 2026-02-12*
