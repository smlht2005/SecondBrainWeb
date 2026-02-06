# 如何新增新的資料夾類型

**更新時間**：2026-02-06 14:55  
**摘要**：說明如何新增新的資料夾類型（例如 `notes/`、`projects/` 等），讓系統支援更多資料來源。

---

## 範例：新增 `notes/` 資料夾

以下步驟以新增 `notes/` 資料夾為例，您可以依此模式新增其他資料夾類型。

---

## 步驟 1：新增類型定義

**檔案**：`src/types/index.ts`

```typescript
// 新增 NoteEntry 介面
export interface NoteEntry {
    name: string;
    fileName: string;
    type: 'notes';
}

// 更新 SelectedItem 類型，加入 'notes'
export type SelectedItem = {
    name: string;
    fileName: string;
    type: 'brain' | 'memory' | 'todos' | 'notes';  // 加入 'notes'
};
```

---

## 步驟 2：更新 useBrainData Hook

**檔案**：`src/hooks/useBrainData.ts`

```typescript
import type { BrainFile, LogEntry, TodoEntry, NoteEntry } from '../types';  // 新增 NoteEntry

const DEFAULT_DATA_FOLDERS = 'brain,memory,todos,notes';  // 加入 'notes'

export const useBrainData = () => {
    const [files, setFiles] = useState<BrainFile[]>([]);
    const [logs, setLogs] = useState<LogEntry[]>([]);
    const [todos, setTodos] = useState<TodoEntry[]>([]);
    const [notes, setNotes] = useState<NoteEntry[]>([]);  // 新增 notes state
    
    const fetchData = async () => {
        const folders = getDataFolders();
        try {
            const results = await Promise.all(
                folders.map(async (folder) => {
                    const res = await fetch(`/${folder}/manifest.json`);
                    if (!res.ok) return { folder, files: [] };
                    const data = await res.json();
                    return { folder, files: data.files ?? [] };
                })
            );
            setFiles(results.find(r => r.folder === 'brain')?.files ?? []);
            setLogs(results.find(r => r.folder === 'memory')?.files ?? []);
            setTodos(results.find(r => r.folder === 'todos')?.files ?? []);
            setNotes(results.find(r => r.folder === 'notes')?.files ?? []);  // 新增
        } catch (e) {
            // ... 錯誤處理
            setNotes([]);  // 新增
        } finally {
            setLoading(false);
        }
    };

    const fetchContent = async (type: 'brain' | 'memory' | 'todos' | 'notes', fileName: string) => {
        // type 已包含 'notes'，無需修改邏輯
        // ...
    };

    return { files, logs, todos, notes, loading, fetchContent, refresh: fetchData };  // 新增 notes
};
```

---

## 步驟 3：更新 Sidebar 組件

**檔案**：`src/components/Sidebar.tsx`

```typescript
import type { BrainFile, LogEntry, TodoEntry, NoteEntry, SelectedItem } from '../types';  // 新增 NoteEntry

interface SidebarProps {
    files: BrainFile[];
    logs: LogEntry[];
    todos: TodoEntry[];
    notes: NoteEntry[];  // 新增
    selectedItem: SelectedItem | null;
    onSelect: (item: SelectedItem) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ files, logs, todos, notes, selectedItem, onSelect }) => {
    // ... 現有代碼 ...

    return (
        <Box sx={{ p: 2 }}>
            {/* ... 知識分類區塊 ... */}
            
            {/* ... 待辦區塊 ... */}

            {/* 新增：筆記區塊 */}
            {notes.length > 0 && (
                <>
                    <Typography variant="overline" sx={{ px: 2, color: 'gray', mt: 4, display: 'block', fontWeight: 700 }}>
                        筆記
                    </Typography>
                    <List>
                        {notes.map((note) => (
                            <ListItem key={note.fileName} disablePadding>
                                <ListItemButton
                                    selected={selectedItem?.fileName === note.fileName && selectedItem?.type === 'notes'}
                                    onClick={() => onSelect({ name: note.name, fileName: note.fileName, type: 'notes' })}
                                    sx={{ borderRadius: 2, mb: 0.5 }}
                                >
                                    <ListItemIcon>
                                        <DescriptionIcon fontSize="small" />  {/* 或使用其他圖示 */}
                                    </ListItemIcon>
                                    <ListItemText primary={note.name} />
                                </ListItemButton>
                            </ListItem>
                        ))}
                    </List>
                </>
            )}

            {/* ... 最近對話區塊 ... */}
        </Box>
    );
};
```

**注意**：記得在檔案頂部 import 圖示：
```typescript
import { Description as DescriptionIcon } from '@mui/icons-material';
```

---

## 步驟 4：更新 App.tsx

**檔案**：`src/App.tsx`

```typescript
const { files, logs, todos, notes, loading, fetchContent } = useBrainData();  // 新增 notes

// ...

<Sidebar
    files={files}
    logs={logs}
    todos={todos}
    notes={notes}  // 新增
    selectedItem={selectedItem}
    onSelect={handleSelect}
/>
```

---

## 步驟 5：更新 manifest 生成腳本

**檔案**：`scripts/generate-manifest.js`

```javascript
// 更新預設值（可選，或透過環境變數控制）
const DATA_FOLDERS = (process.env.DATA_FOLDERS || 'brain,memory,todos,notes')
    .split(',')
    .map(s => s.trim())
    .filter(Boolean);

function generateManifest(dirName, type) {
    // ...
    const files = entries.map(file => {
        if (type === 'brain' || type === 'todos' || type === 'notes') {  // 加入 'notes'
            return {
                name: file.replace(/\.md$/, '').replace(/_/g, ' & '),
                fileName: file,
                type
            };
        }
        // ... memory 處理 ...
    });
    // ...
}

// 在最後的迴圈中，確保 'notes' 被正確處理
DATA_FOLDERS.forEach(folder => {
    const type = folder === 'memory' ? 'memory' 
                 : folder === 'todos' ? 'todos'
                 : folder === 'notes' ? 'notes'  // 新增
                 : 'brain';
    generateManifest(folder, type);
});
```

---

## 步驟 6：更新 Vite 配置（自動處理）

**檔案**：`vite.config.ts`

**無需修改**！`vite.config.ts` 會自動從 `DATA_FOLDERS` 環境變數讀取並複製所有資料夾。

但如果您想更新預設值：

```typescript
const DATA_FOLDERS = (process.env.DATA_FOLDERS || 'brain,memory,todos,notes')  // 加入 'notes'
  .split(',')
  .map((s: string) => s.trim())
  .filter(Boolean)

// define 也會自動更新
define: {
  'import.meta.env.VITE_DATA_FOLDERS': JSON.stringify(process.env.DATA_FOLDERS || 'brain,memory,todos,notes')
}
```

---

## 步驟 7：更新 Server 路由（自動處理）

**檔案**：`server/index.ts`

**無需修改**！`express.static(distPath)` 會自動服務所有 `dist/` 下的資料夾。

但如果您想明確排除（可選）：

```typescript
if (req.path.startsWith('/assets/') ||
    req.path.startsWith('/brain/') ||
    req.path.startsWith('/memory/') ||
    req.path.startsWith('/todos/') ||
    req.path.startsWith('/notes/') ||  // 新增
    req.path.startsWith('/vite.svg')) {
    return next();
}
```

---

## 步驟 8：建立資料夾並測試

```bash
# 1. 建立 notes 資料夾
mkdir notes  # 或 New-Item -ItemType Directory -Path notes (PowerShell)

# 2. 新增測試檔案
echo "# 我的筆記" > notes/測試筆記.md

# 3. 建置（會自動生成 manifest.json）
npm run build

# 4. 啟動伺服器
npm start

# 5. 訪問 http://localhost:3000
# 側邊欄應該會顯示「筆記」區塊，包含「測試筆記」項目
```

---

## 步驟 9：更新環境變數（可選）

如果您想讓 `notes` 成為預設包含的資料夾：

**`.env.development`** 和 **`.env.production`**：
```
DATA_FOLDERS=brain,memory,todos,notes
```

或僅在特定環境使用：
```bash
# 僅包含 notes（不包含其他）
DATA_FOLDERS=notes npm run build
```

---

## 檢查清單

新增新資料夾類型時，確認以下項目：

- [ ] `src/types/index.ts` - 新增 Entry 介面並更新 SelectedItem
- [ ] `src/hooks/useBrainData.ts` - 新增 state、更新 fetchData、更新 return
- [ ] `src/components/Sidebar.tsx` - 新增 props、新增顯示區塊
- [ ] `src/App.tsx` - 傳遞新的 props
- [ ] `scripts/generate-manifest.js` - 更新類型判斷邏輯（如需要）
- [ ] `vite.config.ts` - 更新預設值（可選）
- [ ] `server/index.ts` - 更新排除路徑（可選，建議保留）
- [ ] 建立資料夾並新增測試檔案
- [ ] 執行 `npm run build` 驗證 manifest 生成
- [ ] 執行 `npm start` 驗證顯示正常

---

## 常見問題

### Q: 新資料夾的 manifest 格式應該是什麼？

**A**: 根據類型而定：
- **brain/todos/notes** 類型：`{ name, fileName, type }`
- **memory** 類型：`{ date, fileName, type }`

### Q: 如何自訂新資料夾的 manifest 格式？

**A**: 修改 `scripts/generate-manifest.js` 中的 `generateManifest` 函數，為新類型新增特殊處理邏輯。

### Q: 新資料夾會自動包含在建置中嗎？

**A**: 是的，只要在 `DATA_FOLDERS` 環境變數中包含新資料夾名稱，Vite 會自動複製。

### Q: 如何讓新資料夾只在特定環境使用？

**A**: 使用環境變數：
```bash
# 開發環境：包含 notes
DATA_FOLDERS=brain,memory,todos,notes npm run build

# 生產環境：不包含 notes
DATA_FOLDERS=brain,memory,todos npm run build
```

---

## 參考範例

完整的實作範例請參考：
- `todos/` 資料夾的實作（已包含在專案中）
- `src/types/index.ts` - TodoEntry 定義
- `src/hooks/useBrainData.ts` - todos state 處理
- `src/components/Sidebar.tsx` - 待辦區塊顯示
