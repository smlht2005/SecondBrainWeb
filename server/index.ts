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
        index: false, // 不自動返回 index.html
        fallthrough: true // 如果檔案不存在，繼續到下一個中間件
    }));
    
    // ============================================================
    // API 路由 (相容 Fastify V2 結構)
    // ============================================================
    app.get('/api/notes', (req, res) => {
        const folders = ['brain', 'memory', 'todos'];
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
            res.json(allNotes);
        } catch (e: any) {
            res.status(500).json({ error: e.message });
        }
    });

    app.get('/api/notes/:folder/:file', (req, res) => {
        const { folder, file } = req.params;
        const filePath = path.join(distPath, folder, file);
        
        if (fs.existsSync(filePath)) {
            const content = fs.readFileSync(filePath, 'utf-8');
            res.json({
                id: `${folder}/${file}`,
                title: file,
                content: content,
                category: folder
            });
        } else {
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
