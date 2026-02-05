import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;

// JSON 解析中間件
app.use(express.json());

// CORS 配置（僅應用於 API 路由）
const allowedOrigins = ['https://clawbrain.zeabur.app'];
// 本地開發時允許 localhost
if (process.env.NODE_ENV !== 'production') {
    allowedOrigins.push('http://localhost:5173');
}

const corsOptions = {
    origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
        // 允許沒有 origin 的請求 (如 curl, postman 或同源請求)
        if (!origin) {
            console.log('[CORS] Request without origin header (same-origin or direct request)');
            return callback(null, true);
        }
        console.log(`[CORS] Request from origin: ${origin}`);
        if (allowedOrigins.indexOf(origin) === -1) {
            console.warn(`[CORS] Blocked request from: ${origin} (not in allowed list: ${allowedOrigins.join(', ')})`);
            return callback(new Error('CORS policy violation'), false);
        }
        console.log(`[CORS] Allowed request from: ${origin}`);
        return callback(null, true);
    }
};

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
        console.log(`[API] GET /api/brain/files - BRAIN_DIR: ${BRAIN_DIR}`);
        if (!fs.existsSync(BRAIN_DIR)) {
            console.log(`[API] BRAIN_DIR does not exist: ${BRAIN_DIR}`);
            return res.json([]);
        }
        const files = fs.readdirSync(BRAIN_DIR)
            .filter(file => file.endsWith('.md'))
            .map(file => ({
                name: file.replace('.md', '').replace('_', ' & '),
                fileName: file,
                type: 'brain'
            }));
        console.log(`[API] Found ${files.length} brain files`);
        res.json(files);
    } catch (error) {
        console.error('[API] Error reading brain directory:', error);
        res.status(500).json({ error: '無法讀取知識庫目錄', details: error instanceof Error ? error.message : String(error) });
    }
});

apiRouter.get('/memory/logs', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    try {
        console.log(`[API] GET /api/memory/logs - MEMORY_DIR: ${MEMORY_DIR}`);
        if (!fs.existsSync(MEMORY_DIR)) {
            console.log(`[API] MEMORY_DIR does not exist: ${MEMORY_DIR}`);
            return res.json([]);
        }
        const logs = fs.readdirSync(MEMORY_DIR)
            .filter(file => file.endsWith('.md'))
            .sort().reverse()
            .map(file => ({
                date: file.replace('.md', ''),
                fileName: file,
                type: 'memory'
            }));
        console.log(`[API] Found ${logs.length} memory files`);
        res.json(logs);
    } catch (error) {
        console.error('[API] Error reading memory directory:', error);
        res.status(500).json({ error: '無法讀取對話紀錄', details: error instanceof Error ? error.message : String(error) });
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
        console.error('[API] Error reading content file:', error);
        res.status(500).json({ error: '讀取失敗', details: error instanceof Error ? error.message : String(error) });
    }
});

// API 路由錯誤處理中間件（確保錯誤也返回 JSON）
apiRouter.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error('[API] Error in API route:', err);
    res.status(err.status || 500).json({ 
        error: err.message || 'Internal server error',
        path: req.path 
    });
});

// [Security] 移除 /debug/paths 路由以防止資訊洩漏

// 掛載 API（套用 CORS 保護）
// 確保 API 路由在靜態文件之前
app.use('/api', cors(corsOptions), apiRouter);

// 健康檢查端點（必須在靜態文件服務之前）
app.get('/health', (req, res) => {
    console.log(`[Health] GET /health`);
    res.setHeader('Content-Type', 'application/json');
    res.json({
        status: 'healthy',
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
        storage: {
            brain: fs.existsSync(BRAIN_DIR),
            memory: fs.existsSync(MEMORY_DIR)
        }
    });
});

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
    
    // 明確排除 API 路由和健康檢查，確保靜態文件服務不會攔截這些請求
    app.use((req, res, next) => {
        if (req.path.startsWith('/api') || req.path === '/health') {
            console.log(`[Static] Skipping static file service for: ${req.path}`);
            return next(); // 交給 API 路由處理
        }
        next();
    });
    
    app.use(express.static(distPath));
    
    // 處理 SPA 路由：除了 API 和靜態資源以外的所有請求都導向 index.html
    app.use((req, res, next) => {
        // 排除 API 路由、健康檢查和靜態資源
        if (req.path.startsWith('/api') || req.path === '/health' || req.path.startsWith('/assets/') || req.path.startsWith('/vite.svg')) {
            console.log(`[Static] Skipping SPA route for: ${req.path}`);
            return next();
        }
        console.log(`[Static] Serving index.html for: ${req.path}`);
        res.sendFile(path.join(distPath, 'index.html'));
    });
} else {
    console.log("Static files (dist) not found. API mode only.");
}

app.listen(port, () => {
    console.log(`Server started on port ${port}`);
});
