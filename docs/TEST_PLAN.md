# Second Brain Web 測試計劃

**建立時間**：2026-02-06  
**摘要**：定義建置與 manifest、靜態服務、前端資料、環境變數及部署的測試範圍與執行方式。

---

## 1. 測試層級與範圍

| 層級 | 範圍 | 方式 |
|------|------|------|
| 建置與 Manifest | `scripts/generate-manifest.js`、`DATA_FOLDERS`、產出 `manifest.json` 與目錄 | 腳本/CLI 或單元測試（隔離 temp 目錄） |
| 靜態服務 | `server/index.ts`：`/health`、`/brain/`、`/memory/`、`/todos/`、SPA fallback | 手動或 HTTP 請求 |
| 前端資料 | `useBrainData`、`parseDataFolders`：manifest 請求、fetchContent、資料夾解析 | 單元測試 + mock fetch |
| UI | Sidebar / App 在 mock 資料下顯示與選取 | 元件測試（可選）或手動 |
| 環境變數 | `DATA_FOLDERS` / `VITE_DATA_FOLDERS` 對建置與前端的影響 | 文件 + 建置/手動驗證 |
| 部署 | 本地 `npm run build` + `npm start`、Zeabur 部署後可達性 | 手動檢查清單 |

---

## 2. 測試案例

### 2.1 建置與 Manifest

- 預設 `DATA_FOLDERS` 時產生 brain、memory、todos 三個 manifest，且 todos 目錄被建立。
- `DATA_FOLDERS=brain,memory` 時僅產生 brain、memory，不處理 todos。
- 僅 `.md` 檔被列入 manifest；manifest 結構符合 [src/types/index.ts](src/types/index.ts)（brain/todos: `name`, `fileName`, `type`；memory: `date`, `fileName`, `type`）。

### 2.2 Server

- `GET /health` 回傳 200 與 JSON。
- `GET /brain/manifest.json`、`/memory/manifest.json`、`/todos/manifest.json` 回傳 200 與 JSON。
- `GET /brain/某檔案.md` 回傳 200 與可讀內容。
- SPA 路徑回傳 index.html；不存在的靜態檔由伺服器回傳 404。

### 2.3 前端（useBrainData / parseDataFolders）

- `parseDataFolders(raw)` 依字串回傳正確陣列；空字串或僅空白時為空陣列；缺省字串 `brain,memory,todos` 得 `['brain','memory','todos']`。
- fetch 失敗時 files/logs/todos 為空、loading 最終為 false。
- `fetchContent(type, fileName)` 對應 `/${type}/${fileName}`，成功回傳文字、失敗回傳「讀取內容失敗」。

### 2.4 UI（手動或元件測試）

- 有 brain 時側欄顯示知識分類；有 memory 時顯示最近對話；有 todos 時顯示待辦區塊。
- 點選項目後主內容顯示對應 Markdown 內容。

### 2.5 環境與部署

- 建置前設定 `DATA_FOLDERS=brain,memory` 後建置，dist 僅含 brain、memory。
- 部署後首頁可開、`/health` 與靜態 manifest/md 可達（見下方檢查清單）。

---

## 3. 執行策略

- **手動**：建置、啟動 server、瀏覽器操作、部署後驗證（見下方檢查清單）。
- **自動**：使用 Vitest，測試置於 `tests/`，與正式程式分離。`npm run test` 僅跑自動化測試。
- **CI**：可於 CI 中執行 `npm run test`，手動項目不納入。

---

## 4. 手動測試檢查清單

### 建置

- [ ] `npm run build` 成功完成。
- [ ] `dist/brain/manifest.json`、`dist/memory/manifest.json`、`dist/todos/manifest.json` 存在（預設 DATA_FOLDERS）。
- [ ] `dist/brain/`、`dist/memory/`、`dist/todos/` 內有對應 .md 或空目錄。

### 本機 Server

- [ ] `npm start` 啟動後，`GET http://localhost:3000/health` 回傳 200 與 JSON。
- [ ] `GET http://localhost:3000/brain/manifest.json` 回傳 200 與 JSON。
- [ ] `GET http://localhost:3000/memory/manifest.json` 回傳 200 與 JSON。
- [ ] `GET http://localhost:3000/todos/manifest.json` 回傳 200 與 JSON。
- [ ] 任選一存在之 `.md`，如 `GET http://localhost:3000/brain/coding_tech.md` 回傳 200 與內容。

### SPA 與 UI

- [ ] 開啟 `http://localhost:3000/`，首頁載入無誤。
- [ ] 側欄顯示知識分類、最近對話、待辦（若有資料）。
- [ ] 點選一項後主內容顯示對應 Markdown 內容。

### 部署（Zeabur）

- [ ] 部署完成後首頁可開。
- [ ] 部署環境上 `/health` 可達且回傳 JSON。
- [ ] 部署環境上 `/brain/manifest.json`（或實際存在之 manifest）可達。

---

## 5. 環境變數驗證

- **預設**：不設定 `DATA_FOLDERS` 時，建置應包含 brain、memory、todos；前端 `VITE_DATA_FOLDERS` 由 Vite 注入為 `brain,memory,todos`。
- **僅 brain,memory**：建置前設定 `DATA_FOLDERS=brain,memory`，建置後 dist 僅含 brain、memory；前端僅請求此二 manifest。
- 詳細說明見 [docs/DATA_FOLDERS_ENV.md](DATA_FOLDERS_ENV.md)。

---

## 6. 自動化測試位置與用途

- **`tests/utils/dataFolders.test.ts`**：測試 `parseDataFolders(raw)` 之解析邏輯（逗號分隔、trim、空值），供前端 `getDataFolders` 使用之邏輯一致。
- 後續可擴充：manifest 腳本於 temp 目錄之輸出驗證、useBrainData 之 mock fetch 測試等。

---

## 7. 注意事項

- 測試與正式程式分離；異常情境使用 mock/fake，fake 須完整實作介面。
- 介面變更時，需同步檢查所有實作與測試用 fake。
