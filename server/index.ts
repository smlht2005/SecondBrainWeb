import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// 智慧路徑探測：優先尋找容器根目錄下的共享空間，若無則回退至相對路徑
const getStorageDir = (dirName: string) => {
    const paths = [
        path.join('/home/node/.openclaw/workspace', dirName), // 預期 Volume 掛載點
        path.resolve(__dirname, '../../', dirName),         // 本地開發路徑
        path.join(process.cwd(), dirName)                    // 當前執行目錄
    ];
    for (const p of paths) {
        if (fs.existsSync(p)) return p;
    }
    return paths[0]; // 預設返回掛載點
};

const BRAIN_DIR = getStorageDir('brain');
const MEMORY_DIR = getStorageDir('memory');

/**
 * 安全性檢查：防止目錄遍歷攻擊 (Directory Traversal)
 */
const isSafePath = (baseDir: string, fileName: string) => {
    const fullPath = path.join(baseDir, fileName);
    return fullPath.startsWith(baseDir) && !fileName.includes('..');
};

// API: 獲取知識分類列表
app.get('/api/brain/files', (req, res) => {
    try {
        if (!fs.existsSync(BRAIN_DIR)) return res.json([]);
        const files = fs.readdirSync(BRAIN_DIR)
            .filter(file => file.endsWith('.md'))
            .map(file => ({
                name: file.replace('.md', '').replace('_', ' & '),
                fileName: file,
                type: 'brain'
            }));
        res.json(files);
    } catch (error) {
        res.status(500).json({ error: '無法讀取知識庫' });
    }
});

// API: 獲取對話紀錄列表
app.get('/api/memory/logs', (req, res) => {
    try {
        if (!fs.existsSync(MEMORY_DIR)) return res.json([]);
        const logs = fs.readdirSync(MEMORY_DIR)
            .filter(file => file.endsWith('.md'))
            .sort().reverse()
            .map(file => ({
                date: file.replace('.md', ''),
                fileName: file,
                type: 'memory'
            }));
        res.json(logs);
    } catch (error) {
        res.status(500).json({ error: '無法讀取對話紀錄' });
    }
});

/**
 * 統一內容讀取路由：區分 brain 與 memory
 */
app.get('/api/content/:type/:fileName', (req, res) => {
    const { type, fileName } = req.params;
    const baseDir = type === 'memory' ? MEMORY_DIR : BRAIN_DIR;

    if (!isSafePath(baseDir, fileName)) {
        return res.status(403).json({ error: '非法路徑存取' });
    }

    try {
        const filePath = path.join(baseDir, fileName);
        if (fs.existsSync(filePath)) {
            const content = fs.readFileSync(filePath, 'utf-8');
            res.json({ content });
        } else {
            res.status(404).json({ error: '找不到檔案' });
        }
    } catch (error) {
        res.status(500).json({ error: '讀取失敗' });
    }
});

// 靜態資源服務
const distPath = path.resolve(__dirname, '../dist');
if (fs.existsSync(distPath)) {
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
        if (!req.path.startsWith('/api')) {
            res.sendFile(path.join(distPath, 'index.html'));
        }
    });
}

// API: 系統診斷 (幫助顧問檢查路徑)
app.get('/api/debug/paths', (req, res) => {
    res.json({
        cwd: process.cwd(),
        __dirname,
        BRAIN_DIR,
        MEMORY_DIR,
        brainExists: fs.existsSync(BRAIN_DIR),
        memoryExists: fs.existsSync(MEMORY_DIR),
        brainContent: fs.existsSync(BRAIN_DIR) ? fs.readdirSync(BRAIN_DIR) : []
    });
});

app.listen(port, () => {
    console.log(`[SERVER] Running on port ${port}`);
    console.log(`[PATH] Workspace: ${WORKSPACE_DIR}`);
});
