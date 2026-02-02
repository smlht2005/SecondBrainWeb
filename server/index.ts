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

// 知識庫路徑 (指向工作目錄下的 brain 和 memory)
// 在 Zeabur 部署時，建議將這些資料夾透過 Volume 掛載到相同路徑
const BRAIN_DIR = path.resolve(__dirname, '../../brain');
const MEMORY_DIR = path.resolve(__dirname, '../../memory');

// API: 獲取所有知識分類檔案列表
app.get('/api/brain/files', (req, res) => {
    try {
        if (!fs.existsSync(BRAIN_DIR)) {
            return res.json([]);
        }
        const files = fs.readdirSync(BRAIN_DIR)
            .filter(file => file.endsWith('.md'))
            .map(file => ({
                name: file.replace('.md', '').replace('_', ' & '),
                fileName: file
            }));
        res.json(files);
    } catch (error) {
        res.status(500).json({ error: '無法讀取知識庫目錄' });
    }
});

// API: 獲取特定檔案內容
app.get('/api/brain/content/:fileName', (req, res) => {
    try {
        const filePath = path.join(BRAIN_DIR, req.params.fileName);
        if (fs.existsSync(filePath)) {
            const content = fs.readFileSync(filePath, 'utf-8');
            res.json({ content });
        } else {
            res.status(404).json({ error: '找不到該檔案' });
        }
    } catch (error) {
        res.status(500).json({ error: '讀取檔案失敗' });
    }
});

// API: 獲取對話紀錄列表
app.get('/api/memory/logs', (req, res) => {
    try {
        if (!fs.existsSync(MEMORY_DIR)) {
            return res.json([]);
        }
        const logs = fs.readdirSync(MEMORY_DIR)
            .filter(file => file.endsWith('.md'))
            .sort()
            .reverse()
            .map(file => ({
                date: file.replace('.md', ''),
                fileName: file
            }));
        res.json(logs);
    } catch (error) {
        res.status(500).json({ error: '無法讀取對話紀錄' });
    }
});

// 靜態檔案服務 (生產環境下服務 React 編譯後的 dist)
const distPath = path.resolve(__dirname, '../dist');
if (fs.existsSync(distPath)) {
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
        if (!req.path.startsWith('/api')) {
            res.sendFile(path.join(distPath, 'index.html'));
        }
    });
}

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
    console.log(`Brain Directory: ${BRAIN_DIR}`);
});
