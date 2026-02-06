# 靜態資料夾與環境變數 DATA_FOLDERS

**更新時間**：2026-02-06 00:55  
**摘要**：如何透過環境變數 `DATA_FOLDERS` 控制要建立與使用的靜態資料夾（含 `todos`）。

## 資料夾說明

| 資料夾 | 說明 | manifest 內容 |
|--------|------|----------------|
| `brain/` | 知識分類 Markdown | `name`, `fileName`, `type: 'brain'` |
| `memory/` | 最近對話日誌 | `date`, `fileName`, `type: 'memory'` |
| `todos/` | 待辦清單 Markdown | `name`, `fileName`, `type: 'todos'` |

## 環境變數 DATA_FOLDERS

- **建置時**（Node）：`process.env.DATA_FOLDERS`
- **前端**（Vite 建置注入）：`import.meta.env.VITE_DATA_FOLDERS`

**格式**：逗號分隔，例如 `brain,memory,todos`  
**預設**：`brain,memory,todos`（未設定時會建立並包含 `todos`）

### 如何設定

1. **僅使用 brain 與 memory（不建立 / 不包含 todos）**
   ```bash
   # Windows PowerShell
   $env:DATA_FOLDERS="brain,memory"; npm run build

   # Linux / macOS
   DATA_FOLDERS=brain,memory npm run build
   ```

2. **在 .env 中設定（需在執行 build 的環境中生效）**
   - 建置腳本 `scripts/generate-manifest.js` 與 `vite.config.ts` 讀取 `process.env.DATA_FOLDERS`。
   - 若在 Zeabur 等平台建置，在專案設定中新增環境變數：  
     `DATA_FOLDERS` = `brain,memory,todos` 或 `brain,memory`。

3. **讓 todos 資料夾被建立且納入建置**
   - 預設即為 `brain,memory,todos`，無需設定。
   - 若目錄不存在，`generate-manifest.js` 會自動建立該目錄並寫入空的 `manifest.json`。

## 新增 todos 內容

1. 在專案根目錄下確保有 `todos/` 資料夾（預設建置會建立）。
2. 在 `todos/` 內新增 `.md` 檔案，例如 `todos/我的待辦.md`。
3. 重新執行 `npm run build`，manifest 會重新產生，前端即可顯示並直接存取 `/todos/我的待辦.md`。

## 相關檔案

- `scripts/generate-manifest.js`：依 `DATA_FOLDERS` 建立目錄並產生各資料夾的 `manifest.json`。
- `vite.config.ts`：依 `DATA_FOLDERS` 複製對應資料夾到 `dist/`，並注入 `VITE_DATA_FOLDERS`。
- `src/hooks/useBrainData.ts`：依 `VITE_DATA_FOLDERS` 請求對應 manifest 與內容。
