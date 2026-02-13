/**
 * Second Brain Web - Server (Static Files Architecture)
 * 更新時間：2026-02-06 00:15
 * 更新者：AI Assistant
 * 更新摘要：簡化為靜態檔案服務，移除所有 API 路由
 */

import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

// ============================================================
// 靜態檔案服務
// ============================================================

// 探測 dist 目錄位置
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
    console.log(`[Server] Serving static files from: ${distPath}`);
    
    // 服務靜態檔案（包括 brain/, memory/, assets/, index.html）
    app.use(express.static(distPath, {
        index: false,
        fallthrough: true,
        setHeaders: (res, path) => {
            if (path.endsWith('.md') || path.endsWith('.json')) {
                res.setHeader('Content-Type', res.getHeader('Content-Type') + '; charset=utf-8');
            }
        }
    }));
    
    // ============================================================
    // API 路由 (相容 Fastify V2 結構)
    // ============================================================
    app.get('/api/notes', (req, res) => {
        const folders = ['brain', 'memory', 'todos', 'review', 'done'];
        const allNotes: any[] = [];
        
        try {
            folders.forEach(folder => {
                const dirPath = path.join(distPath, folder);
                if (fs.existsSync(dirPath)) {
                    const files = fs.readdirSync(dirPath).filter(f => f.endsWith('.md'));
                    files.forEach(file => {
                        allNotes.push({
                            id: `${folder}/${file}`,
                            title: file.replace('.md', '').replace(/_/g, ' '),
                            category: folder,
                            updatedAt: fs.statSync(path.join(dirPath, file)).mtime.toISOString()
                        });
                    });
                }
            });
            res.setHeader('Content-Type', 'application/json; charset=utf-8');
            res.json(allNotes);
        } catch (e: any) {
            res.status(500).json({ error: e.message });
        }
    });

    app.post('/api/notes/move', (req, res) => {
        const { id, targetFolder } = req.body;
        console.log(`[API] Move request: id=${id}, targetFolder=${targetFolder}`);
        if (!id || !targetFolder) {
            console.error('[API] Move failed: Missing params');
            return res.status(400).json({ error: 'Missing id or targetFolder' });
        }
        
        const [sourceFolder, fileName] = id.split('/');
        const sourcePath = path.join(distPath, sourceFolder, fileName);
        const targetPath = path.join(distPath, targetFolder, fileName);
        
        console.log(`[API] Attempting move: ${sourcePath} -> ${targetPath}`);
        
        try {
            if (!fs.existsSync(sourcePath)) {
                console.warn(`[API] Source not found in dist, checking process.cwd()...`);
                const fallbackSource = path.join(process.cwd(), sourceFolder, fileName);
                const fallbackTarget = path.join(process.cwd(), targetFolder, fileName);
                console.log(`[API] Fallback move: ${fallbackSource} -> ${fallbackTarget}`);
                
                if (fs.existsSync(fallbackSource)) {
                    if (!fs.existsSync(path.dirname(fallbackTarget))) fs.mkdirSync(path.dirname(fallbackTarget), { recursive: true });
                    fs.renameSync(fallbackSource, fallbackTarget);
                    console.log(`[API] Fallback move successful`);
                    return res.json({ id: `${targetFolder}/${fileName}`, category: targetFolder });
                }
                console.error(`[API] Source file not found anywhere: ${id}`);
                throw new Error(`Source file not found: ${id}`);
            }

            if (!fs.existsSync(path.dirname(targetPath))) fs.mkdirSync(path.dirname(targetPath), { recursive: true });
            fs.renameSync(sourcePath, targetPath);
            console.log(`[API] Move successful`);
            res.json({ id: `${targetFolder}/${fileName}`, category: targetFolder });
        } catch (e: any) {
            console.error(`[API] Move error: ${e.message}`);
            res.status(500).json({ error: e.message });
        }
    });

    app.get('/api/notes/:folder/:file', (req, res) => {
        const { folder, file } = req.params;
        const filePath = path.join(distPath, folder, file);
        
        if (fs.existsSync(filePath)) {
            const content = fs.readFileSync(filePath, 'utf-8');
            res.setHeader('Content-Type', 'application/json; charset=utf-8');
            res.json({
                id: `${folder}/${file}`,
                title: file.replace('.md', '').replace(/_/g, ' '),
                content: content,
                category: folder
            });
        } else {
            // 嘗試從當前工作目錄找 (開發環境或結構偏移)
            const fallbackPath = path.join(process.cwd(), folder, file);
            if (fs.existsSync(fallbackPath)) {
                const content = fs.readFileSync(fallbackPath, 'utf-8');
                return res.json({
                    id: `${folder}/${file}`,
                    title: file.replace('.md', '').replace(/_/g, ' '),
                    content: content,
                    category: folder
                });
            }
            res.status(404).json({ error: 'File not found' });
        }
    });

    app.get('/api/folders', (req, res) => {
        res.json(['brain', 'memory', 'todos']);
    });

    // SPA catch-all: 除了靜態資源與 API 以外的所有請求都導向 index.html
    app.use((req, res, next) => {
        // 排除靜態資源路徑與 API 路徑
        if (req.path.startsWith('/assets/') ||
            req.path.startsWith('/api/') ||
            req.path.startsWith('/brain/') ||
            req.path.startsWith('/memory/') ||
            req.path.startsWith('/todos/') ||
            req.path.startsWith('/vite.svg')) {
            return next(); // 讓 express.static 或 API 路由處理
        }
        
        // 其他所有路徑都返回 index.html（SPA 路由）
        const indexPath = path.join(distPath, 'index.html');
        if (fs.existsSync(indexPath)) {
            res.sendFile(indexPath);
        } else {
            res.status(404).send('index.html not found');
        }
    });
} else {
    console.error('[Server] ERROR: dist directory not found!');
    console.error('[Server] Searched paths:', possibleDistPaths);
    
    app.use((req, res) => {
        res.status(500).send('Server configuration error: dist directory not found');
    });
}

// ============================================================
// 健康檢查端點
// ============================================================
app.get('/health', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.json({
        status: 'healthy',
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
        distPath: distPath || 'not found',
        staticFiles: distPath ? fs.existsSync(distPath) : false
    });
});

// ============================================================
// 啟動伺服器
// ============================================================
app.listen(port, () => {
    console.log(`\n========================================`);
    console.log(`[Server] Server started on port ${port}`);
    console.log(`[Server] NODE_ENV: ${process.env.NODE_ENV || 'undefined'}`);
    console.log(`[Server] Dist path: ${distPath || 'NOT FOUND'}`);
    if (distPath) {
        const brainPath = path.join(distPath, 'brain');
        const memoryPath = path.join(distPath, 'memory');
        console.log(`[Server] Brain directory: ${fs.existsSync(brainPath) ? 'EXISTS' : 'NOT FOUND'}`);
        console.log(`[Server] Memory directory: ${fs.existsSync(memoryPath) ? 'EXISTS' : 'NOT FOUND'}`);
    }
    console.log(`========================================\n`);
});
