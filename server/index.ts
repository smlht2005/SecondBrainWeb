/**
 * Second Brain Web - Server
 * 更新時間：2026-02-05 23:55
 * 更新者：AI Assistant
 * 更新摘要：添加響應攔截器和中間件序號追蹤，用於診斷 API 返回 HTML 問題
 */

import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;

// ============================================================
// 全局響應攔截器 - 追蹤哪個中間件發送了響應
// ============================================================
app.use((req, res, next) => {
    const originalSend = res.send.bind(res);
    const originalSendFile = res.sendFile.bind(res);
    const originalJson = res.json.bind(res);
    
    (res as any).send = function(body: any) {
        console.log(`\n[RESPONSE-TRACE] ========== res.send() called ==========`);
        console.log(`[RESPONSE-TRACE] Path: ${req.path}`);
        console.log(`[RESPONSE-TRACE] OriginalURL: ${req.originalUrl}`);
        console.log(`[RESPONSE-TRACE] Content-Type: ${res.getHeader('Content-Type')}`);
        console.log(`[RESPONSE-TRACE] Body type: ${typeof body}`);
        if (typeof body === 'string') {
            console.log(`[RESPONSE-TRACE] Body preview: ${body.substring(0, 150)}`);
        }
        console.log(`[RESPONSE-TRACE] Stack trace:\n${new Error().stack}`);
        console.log(`[RESPONSE-TRACE] ================================================`);
        return originalSend(body);
    };
    
    (res as any).sendFile = function(filePath: string, ...args: any[]) {
        console.log(`\n[RESPONSE-TRACE] ⚠️ ========== res.sendFile() called ==========`);
        console.log(`[RESPONSE-TRACE] Path: ${req.path}`);
        console.log(`[RESPONSE-TRACE] OriginalURL: ${req.originalUrl}`);
        console.log(`[RESPONSE-TRACE] File being sent: ${filePath}`);
        console.log(`[RESPONSE-TRACE] Stack trace:\n${new Error().stack}`);
        console.log(`[RESPONSE-TRACE] ================================================`);
        return originalSendFile(filePath, ...args);
    };
    
    (res as any).json = function(body: any) {
        console.log(`\n[RESPONSE-TRACE] ========== res.json() called ==========`);
        console.log(`[RESPONSE-TRACE] Path: ${req.path}`);
        console.log(`[RESPONSE-TRACE] OriginalURL: ${req.originalUrl}`);
        console.log(`[RESPONSE-TRACE] Content-Type: ${res.getHeader('Content-Type')}`);
        console.log(`[RESPONSE-TRACE] Body: ${JSON.stringify(body).substring(0, 200)}`);
        console.log(`[RESPONSE-TRACE] ================================================`);
        return originalJson(body);
    };
    
    next();
});

// ============================================================
// [MW-1] 全局請求日誌中間件
// ============================================================
app.use((req, res, next) => {
    console.log(`\n[MW-1] ========== NEW REQUEST ==========`);
    console.log(`[MW-1] Method: ${req.method}`);
    console.log(`[MW-1] Path: ${req.path}`);
    console.log(`[MW-1] URL: ${req.url}`);
    console.log(`[MW-1] OriginalURL: ${req.originalUrl}`);
    console.log(`[MW-1] Host: ${req.headers.host}`);
    console.log(`[MW-1] Origin: ${req.headers.origin || 'none'}`);
    console.log(`[MW-1] ====================================`);
    next();
});

// ============================================================
// [MW-2] JSON 解析中間件
// ============================================================
app.use((req, res, next) => {
    console.log(`[MW-2] JSON Parser middleware`);
    next();
});
app.use(express.json());

// ============================================================
// CORS 配置（僅應用於 API 路由）
// ============================================================
const allowedOrigins = ['https://clawbrain.zeabur.app'];
// 本地開發時允許 localhost
if (process.env.NODE_ENV !== 'production') {
    allowedOrigins.push('http://localhost:5173');
}
console.log(`[CORS-CONFIG] Allowed origins: ${allowedOrigins.join(', ')}`);
console.log(`[CORS-CONFIG] NODE_ENV: ${process.env.NODE_ENV || 'undefined'}`);

const corsOptions = {
    origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
        console.log(`\n[CORS-TRACE] ========== CORS Check ==========`);
        console.log(`[CORS-TRACE] Origin header: ${origin || 'null (same-origin or direct request)'}`);
        console.log(`[CORS-TRACE] Allowed origins: ${allowedOrigins.join(', ')}`);
        
        // 允許沒有 origin 的請求 (如 curl, postman 或同源請求)
        if (!origin) {
            console.log(`[CORS-TRACE] ✅ ALLOWED - No origin header (same-origin or direct request)`);
            console.log(`[CORS-TRACE] =====================================`);
            return callback(null, true);
        }
        
        if (allowedOrigins.indexOf(origin) === -1) {
            console.warn(`[CORS-TRACE] ❌ BLOCKED - Origin not in allowed list`);
            console.log(`[CORS-TRACE] =====================================`);
            return callback(new Error('CORS policy violation'), false);
        }
        
        console.log(`[CORS-TRACE] ✅ ALLOWED - Origin in allowed list`);
        console.log(`[CORS-TRACE] =====================================`);
        return callback(null, true);
    }
};

// ============================================================
// 智慧路徑探測
// ============================================================
const getStorageDir = (dirName: string) => {
    const paths = [
        path.join('/home/node/.openclaw/workspace', dirName),
        path.resolve(__dirname, '../../', dirName),
        path.join(process.cwd(), dirName),
        path.join(process.cwd(), '..', dirName)
    ];
    for (const p of paths) {
        if (fs.existsSync(p)) {
            console.log(`[STORAGE] Found ${dirName} at: ${p}`);
            return p;
        }
    }
    console.log(`[STORAGE] ${dirName} not found, using default: ${paths[0]}`);
    return paths[0];
};

const BRAIN_DIR = getStorageDir('brain');
const MEMORY_DIR = getStorageDir('memory');
console.log(`[STORAGE] BRAIN_DIR: ${BRAIN_DIR}`);
console.log(`[STORAGE] MEMORY_DIR: ${MEMORY_DIR}`);

// ============================================================
// API 路由定義 (必須在靜態檔案與 Catch-All 之前)
// ============================================================
const apiRouter = express.Router();

apiRouter.get('/brain/files', (req, res) => {
    console.log(`\n[API-HANDLER] ========== Brain API Handler CALLED ==========`);
    console.log(`[API-HANDLER] Path: ${req.path}`);
    console.log(`[API-HANDLER] URL: ${req.url}`);
    console.log(`[API-HANDLER] OriginalURL: ${req.originalUrl}`);
    console.log(`[API-HANDLER] BRAIN_DIR: ${BRAIN_DIR}`);
    
    // 強制回傳 JSON Header
    res.setHeader('Content-Type', 'application/json');
    
    try {
        if (!fs.existsSync(BRAIN_DIR)) {
            console.log(`[API-HANDLER] BRAIN_DIR does not exist, returning []`);
            return res.json([]);
        }
        const files = fs.readdirSync(BRAIN_DIR)
            .filter(file => file.endsWith('.md'))
            .map(file => ({
                name: file.replace('.md', '').replace('_', ' & '),
                fileName: file,
                type: 'brain'
            }));
        console.log(`[API-HANDLER] Found ${files.length} brain files`);
        console.log(`[API-HANDLER] ==============================================`);
        return res.json(files);
    } catch (error) {
        console.error('[API-HANDLER] Error:', error);
        return res.status(500).json({ error: '無法讀取知識庫目錄', details: error instanceof Error ? error.message : String(error) });
    }
});

apiRouter.get('/memory/logs', (req, res) => {
    console.log(`\n[API-HANDLER] ========== Memory API Handler CALLED ==========`);
    console.log(`[API-HANDLER] Path: ${req.path}`);
    console.log(`[API-HANDLER] URL: ${req.url}`);
    console.log(`[API-HANDLER] OriginalURL: ${req.originalUrl}`);
    console.log(`[API-HANDLER] MEMORY_DIR: ${MEMORY_DIR}`);
    
    res.setHeader('Content-Type', 'application/json');
    
    try {
        if (!fs.existsSync(MEMORY_DIR)) {
            console.log(`[API-HANDLER] MEMORY_DIR does not exist, returning []`);
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
        console.log(`[API-HANDLER] Found ${logs.length} memory files`);
        console.log(`[API-HANDLER] ==============================================`);
        return res.json(logs);
    } catch (error) {
        console.error('[API-HANDLER] Error:', error);
        return res.status(500).json({ error: '無法讀取對話紀錄', details: error instanceof Error ? error.message : String(error) });
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
        console.error('[API-HANDLER] Error reading content file:', error);
        res.status(500).json({ error: '讀取失敗', details: error instanceof Error ? error.message : String(error) });
    }
});

// API 路由錯誤處理中間件
apiRouter.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error(`[API-ERROR] Error in API route: ${err.message}`);
    console.error(`[API-ERROR] Stack: ${err.stack}`);
    res.status(err.status || 500).json({ 
        error: err.message || 'Internal server error',
        path: req.path 
    });
});

// ============================================================
// [MW-3] 掛載 API（套用 CORS 保護）
// ============================================================
app.use('/api', (req, res, next) => {
    console.log(`\n[MW-3] ========== API Mount Point Matched ==========`);
    console.log(`[MW-3] Method: ${req.method}`);
    console.log(`[MW-3] Path (stripped): ${req.path}`);
    console.log(`[MW-3] URL: ${req.url}`);
    console.log(`[MW-3] OriginalURL: ${req.originalUrl}`);
    console.log(`[MW-3] ================================================`);
    next();
}, cors(corsOptions), apiRouter);

// ============================================================
// [MW-4] 健康檢查端點
// ============================================================
app.get('/health', (req, res) => {
    console.log(`\n[MW-4] ========== Health Check Endpoint ==========`);
    console.log(`[MW-4] Path: ${req.path}`);
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

// ============================================================
// 靜態檔案區 (必須在 API 之後)
// ============================================================
const possibleDistPaths = [
    path.resolve(__dirname, '../dist'),
    path.resolve(__dirname, 'dist'),
    path.join(process.cwd(), 'dist')
];

let distPath = '';
for (const p of possibleDistPaths) {
    if (fs.existsSync(p)) {
        distPath = p;
        console.log(`[STATIC] Found dist at: ${p}`);
        break;
    }
}

if (distPath) {
    console.log(`[STATIC] Serving static files from: ${distPath}`);
    
    // [MW-5] 靜態文件中間件
    app.use((req, res, next) => {
        console.log(`\n[MW-5] ========== Static File Middleware ==========`);
        console.log(`[MW-5] Path: ${req.path}`);
        console.log(`[MW-5] Starts with /api: ${req.path.startsWith('/api')}`);
        console.log(`[MW-5] Equals /health: ${req.path === '/health'}`);
        
        // 關鍵：如果路徑是 API 或 health，直接跳過
        if (req.path.startsWith('/api') || req.path === '/health') {
            console.log(`[MW-5] ✅ SKIPPING static - API/health path`);
            console.log(`[MW-5] ================================================`);
            return next();
        }
        
        console.log(`[MW-5] ➡️ Proceeding to express.static for: ${req.path}`);
        console.log(`[MW-5] ================================================`);
        express.static(distPath, {
            index: false,
            fallthrough: true
        })(req, res, next);
    });
    
    // [MW-6] SPA Catch-All 中間件
    app.use((req, res, next) => {
        console.log(`\n[MW-6] ========== SPA Catch-All Middleware ==========`);
        console.log(`[MW-6] Path: ${req.path}`);
        console.log(`[MW-6] OriginalURL: ${req.originalUrl}`);
        
        const shouldSkip = req.path.startsWith('/api') || 
                          req.path === '/health' || 
                          req.path.startsWith('/assets/') || 
                          req.path.startsWith('/vite.svg');
        
        console.log(`[MW-6] Should skip SPA: ${shouldSkip}`);
        
        if (shouldSkip) {
            console.log(`[MW-6] ✅ SKIPPING SPA - Excluded path`);
            console.log(`[MW-6] ================================================`);
            return next();
        }
        
        console.log(`[MW-6] ⚠️ SERVING index.html for: ${req.path}`);
        console.log(`[MW-6] Index file: ${path.join(distPath, 'index.html')}`);
        console.log(`[MW-6] ================================================`);
        res.sendFile(path.join(distPath, 'index.html'));
    });
} else {
    console.log("[STATIC] Static files (dist) not found. API mode only.");
}

// ============================================================
// [MW-7] 404 兜底處理器
// ============================================================
app.use((req, res) => {
    console.log(`\n[MW-7] ========== 404 Fallback ==========`);
    console.log(`[MW-7] Path: ${req.path}`);
    console.log(`[MW-7] Method: ${req.method}`);
    console.log(`[MW-7] OriginalURL: ${req.originalUrl}`);
    console.log(`[MW-7] This request was not handled by any middleware!`);
    console.log(`[MW-7] =====================================`);
    res.status(404).json({ 
        error: 'Not found', 
        path: req.path,
        originalUrl: req.originalUrl 
    });
});

// ============================================================
// 全局錯誤處理器
// ============================================================
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error(`\n[GLOBAL-ERROR] ========== Unhandled Error ==========`);
    console.error(`[GLOBAL-ERROR] Path: ${req.path}`);
    console.error(`[GLOBAL-ERROR] OriginalURL: ${req.originalUrl}`);
    console.error(`[GLOBAL-ERROR] Error: ${err.message}`);
    console.error(`[GLOBAL-ERROR] Stack: ${err.stack}`);
    console.error(`[GLOBAL-ERROR] =====================================`);
    res.status(500).json({ 
        error: 'Internal server error', 
        details: err.message,
        path: req.path 
    });
});

// ============================================================
// 啟動伺服器
// ============================================================
app.listen(port, () => {
    console.log(`\n========================================`);
    console.log(`Server started on port ${port}`);
    console.log(`NODE_ENV: ${process.env.NODE_ENV || 'undefined'}`);
    console.log(`BRAIN_DIR: ${BRAIN_DIR}`);
    console.log(`MEMORY_DIR: ${MEMORY_DIR}`);
    console.log(`Dist path: ${distPath || 'not found'}`);
    console.log(`========================================\n`);
});
