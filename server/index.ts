import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;

// 安全性設定：限制 CORS 來源
const allowedOrigins = ['https://clawbrain.zeabur.app'];
// 本地開發時允許 localhost
if (process.env.NODE_ENV !== 'production') {
    allowedOrigins.push('http://localhost:5173');
}

app.use(cors({
    origin: (origin, callback) => {
        // 允許沒有 origin 的請求 (如 curl, postman 或同源請求)
        if (!origin) return callback(null, true);
        if (allowedOrigins.indexOf(origin) === -1) {
            // 可選：記錄被阻擋的來源以供分析
            console.warn(`Blocked CORS request from: ${origin}`);
            return callback(new Error('CORS policy violation'), false);
        }
        return callback(null, true);
    }
}));

app.use(express.json());

// 智慧路徑探測
const getStorageDir = (dirName: string) => {
    const paths = [
        path.join('/home/node/.openclaw/workspace', dirName),
        path.resolve(__dirname, '../../', dirName),
        path.join(process.cwd(), dirName),
        path.join(process.cwd(), '..', dirName)
    ];
    for (const p of paths) {
        if (fs.existsSync(p)) return p;
    }
    return paths[0];
};

const BRAIN_DIR = getStorageDir('brain');
const MEMORY_DIR = getStorageDir('memory');

// --- API 路由定義 (必須在靜態檔案與 Catch-All 之前) ---
const apiRouter = express.Router();

apiRouter.get('/brain/files', (req, res) => {
    // 強制回傳 JSON Header
    res.setHeader('Content-Type', 'application/json');
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
        res.status(500).json({ error: '無法讀取知識庫目錄' });
    }
});

apiRouter.get('/memory/logs', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
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

apiRouter.get('/content/:type/:fileName', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    const { type, fileName } = req.params;
    const baseDir = type === 'memory' ? MEMORY_DIR : BRAIN_DIR;
    try {
        const filePath = path.join(baseDir, fileName);
        if (fs.existsSync(filePath)) {
            res.json({ content: fs.readFileSync(filePath, 'utf-8') });
        } else {
            res.status(404).json({ error: '找不到檔案' });
        }
    } catch (error) {
        res.status(500).json({ error: '讀取失敗' });
    }
});

// [Security] 移除 /debug/paths 路由以防止資訊洩漏

// 掛載 API
app.use('/api', apiRouter);

// --- 靜態檔案區 (必須在 API 之後) ---

const possibleDistPaths = [
    path.resolve(__dirname, '../dist'),
    path.resolve(__dirname, 'dist'),
    path.join(process.cwd(), 'dist')
];

let distPath = '';
for (const p of possibleDistPaths) {
    if (fs.existsSync(p)) {
        distPath = p;
        break;
    }
}

if (distPath) {
    console.log(`Serving static files from: ${distPath}`);
    app.use(express.static(distPath));
    // 處理 SPA 路由：除了 API 以外的所有請求都導向 index.html
    app.get('*', (req, res) => {
        res.sendFile(path.join(distPath, 'index.html'));
    });
} else {
    console.log("Static files (dist) not found. API mode only.");
}

app.listen(port, () => {
    console.log(`Server started on port ${port}`);
});
