import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;

// 全局請求日誌中間件（用於調試）
app.use((req, res, next) => {
    console.log(`\n[REQUEST-DEBUG] ========== NEW REQUEST ==========`);
    console.log(`[REQUEST-DEBUG] Method: ${req.method}`);
    console.log(`[REQUEST-DEBUG] Path: ${req.path}`);
    console.log(`[REQUEST-DEBUG] URL: ${req.url}`);
    console.log(`[REQUEST-DEBUG] OriginalURL: ${req.originalUrl}`);
    console.log(`[REQUEST-DEBUG] ===================================`);
    next();
});

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
    console.log(`[API-DEBUG] ========== Brain API Handler CALLED ==========`);
    console.log(`[API-DEBUG] Path: ${req.path}, URL: ${req.url}`);
    console.log(`[API-DEBUG] Headers:`, JSON.stringify(req.headers, null, 2));
    
    // 強制回傳 JSON Header
    res.setHeader('Content-Type', 'application/json');
    console.log(`[API-DEBUG] Set Content-Type header to: application/json`);
    
    try {
        console.log(`[API] GET /api/brain/files - BRAIN_DIR: ${BRAIN_DIR}`);
        if (!fs.existsSync(BRAIN_DIR)) {
            console.log(`[API] BRAIN_DIR does not exist: ${BRAIN_DIR}`);
            console.log(`[API-DEBUG] Returning empty array`);
            const result = res.json([]);
            console.log(`[API-DEBUG] Response sent, Content-Type: ${res.getHeader('Content-Type')}`);
            console.log(`[API-DEBUG] ===========================================`);
            return result;
        }
        const files = fs.readdirSync(BRAIN_DIR)
            .filter(file => file.endsWith('.md'))
            .map(file => ({
                name: file.replace('.md', '').replace('_', ' & '),
                fileName: file,
                type: 'brain'
            }));
        console.log(`[API] Found ${files.length} brain files`);
        console.log(`[API-DEBUG] Returning ${files.length} files`);
        const result = res.json(files);
        console.log(`[API-DEBUG] Response sent, Content-Type: ${res.getHeader('Content-Type')}`);
        console.log(`[API-DEBUG] ===========================================`);
        return result;
    } catch (error) {
        console.error('[API] Error reading brain directory:', error);
        console.log(`[API-DEBUG] Error response sent`);
        console.log(`[API-DEBUG] ===========================================`);
        res.status(500).json({ error: '無法讀取知識庫目錄', details: error instanceof Error ? error.message : String(error) });
    }
});

apiRouter.get('/memory/logs', (req, res) => {
    console.log(`[API-DEBUG] ========== Memory API Handler CALLED ==========`);
    console.log(`[API-DEBUG] Path: ${req.path}, URL: ${req.url}`);
    console.log(`[API-DEBUG] Headers:`, JSON.stringify(req.headers, null, 2));
    
    res.setHeader('Content-Type', 'application/json');
    console.log(`[API-DEBUG] Set Content-Type header to: application/json`);
    
    try {
        console.log(`[API] GET /api/memory/logs - MEMORY_DIR: ${MEMORY_DIR}`);
        if (!fs.existsSync(MEMORY_DIR)) {
            console.log(`[API] MEMORY_DIR does not exist: ${MEMORY_DIR}`);
            console.log(`[API-DEBUG] Returning empty array`);
            const result = res.json([]);
            console.log(`[API-DEBUG] Response sent, Content-Type: ${res.getHeader('Content-Type')}`);
            console.log(`[API-DEBUG] ===========================================`);
            return result;
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
        console.log(`[API-DEBUG] Returning ${logs.length} logs`);
        const result = res.json(logs);
        console.log(`[API-DEBUG] Response sent, Content-Type: ${res.getHeader('Content-Type')}`);
        console.log(`[API-DEBUG] ===========================================`);
        return result;
    } catch (error) {
        console.error('[API] Error reading memory directory:', error);
        console.log(`[API-DEBUG] Error response sent`);
        console.log(`[API-DEBUG] ===========================================`);
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
app.use('/api', (req, res, next) => {
    console.log(`[ROUTE-DEBUG] ========== API Route Matched ==========`);
    console.log(`[ROUTE-DEBUG] Method: ${req.method}`);
    console.log(`[ROUTE-DEBUG] Path: ${req.path}`);
    console.log(`[ROUTE-DEBUG] URL: ${req.url}`);
    console.log(`[ROUTE-DEBUG] OriginalURL: ${req.originalUrl}`);
    console.log(`[ROUTE-DEBUG] Headers:`, JSON.stringify(req.headers, null, 2));
    console.log(`[ROUTE-DEBUG] =======================================`);
    next();
}, cors(corsOptions), apiRouter);

// 健康檢查端點（必須在靜態文件服務之前）
app.get('/health', (req, res) => {
    console.log(`[Health] GET /health`);
    console.log(`[Health-DEBUG] Path: ${req.path}, URL: ${req.url}`);
    res.setHeader('Content-Type', 'application/json');
    const response = {
        status: 'healthy',
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
        storage: {
            brain: fs.existsSync(BRAIN_DIR),
            memory: fs.existsSync(MEMORY_DIR)
        }
    };
    console.log(`[Health-DEBUG] Sending response:`, JSON.stringify(response));
    res.json(response);
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
    
    // 關鍵修復：使用條件中間件，確保 API 和 health 路徑永遠不會到達 express.static
    app.use((req, res, next) => {
        console.log(`[STATIC-DEBUG] ========== Pre-Static Check ==========`);
        console.log(`[STATIC-DEBUG] Path: ${req.path}`);
        console.log(`[STATIC-DEBUG] URL: ${req.url}`);
        console.log(`[STATIC-DEBUG] OriginalURL: ${req.originalUrl}`);
        console.log(`[STATIC-DEBUG] Starts with /api: ${req.path.startsWith('/api')}`);
        console.log(`[STATIC-DEBUG] Equals /health: ${req.path === '/health'}`);
        
        // 關鍵：如果路徑是 API 或 health，直接跳過，不執行 express.static
        if (req.path.startsWith('/api') || req.path === '/health') {
            console.log(`[STATIC-DEBUG] ✅ SKIPPING static file service for: ${req.path}`);
            console.log(`[STATIC-DEBUG] =========================================`);
            return next(); // 交給 API 路由處理，不執行 express.static
        }
        
        console.log(`[STATIC-DEBUG] ➡️  Proceeding to static file service for: ${req.path}`);
        console.log(`[STATIC-DEBUG] =========================================`);
        // 只有非 API/health 路徑才會執行 express.static
        express.static(distPath, {
            // 確保不會返回目錄列表
            index: false,
            // 如果文件不存在，繼續執行下一個中間件（而不是返回 404）
            fallthrough: true
        })(req, res, next);
    });
    
    // 處理 SPA 路由：除了 API 和靜態資源以外的所有請求都導向 index.html
    app.use((req, res, next) => {
        console.log(`[SPA-DEBUG] ========== SPA Catch-All Check ==========`);
        console.log(`[SPA-DEBUG] Path: ${req.path}`);
        const willSkip = req.path.startsWith('/api') || req.path === '/health' || req.path.startsWith('/assets/') || req.path.startsWith('/vite.svg');
        console.log(`[SPA-DEBUG] Will skip: ${willSkip}`);
        
        // 排除 API 路由、健康檢查和靜態資源
        if (req.path.startsWith('/api') || req.path === '/health' || req.path.startsWith('/assets/') || req.path.startsWith('/vite.svg')) {
            console.log(`[SPA-DEBUG] ✅ SKIPPING SPA route for: ${req.path}`);
            console.log(`[SPA-DEBUG] ===========================================`);
            return next();
        }
        console.log(`[SPA-DEBUG] ⚠️  SERVING index.html for: ${req.path}`);
        console.log(`[SPA-DEBUG] File path: ${path.join(distPath, 'index.html')}`);
        console.log(`[SPA-DEBUG] ===========================================`);
        res.sendFile(path.join(distPath, 'index.html'));
    });
} else {
    console.log("Static files (dist) not found. API mode only.");
}

app.listen(port, () => {
    console.log(`Server started on port ${port}`);
});
