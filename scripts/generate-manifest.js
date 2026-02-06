/**
 * 生成 manifest.json 檔案列表（依環境變數 DATA_FOLDERS 決定要處理的資料夾）
 * 更新時間：2026-02-06 00:50
 * 更新者：AI Assistant
 * 更新摘要：支援 DATA_FOLDERS 環境變數，新增 todos 類型，若資料夾不存在則自動建立
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

// 由環境變數決定要處理的資料夾，預設 brain,memory,todos
const DATA_FOLDERS = (process.env.DATA_FOLDERS || 'brain,memory,todos')
    .split(',')
    .map(s => s.trim())
    .filter(Boolean);

function ensureDir(dirPath) {
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
        console.log(`[Manifest] Created directory: ${path.relative(rootDir, dirPath)}`);
    }
}

function generateManifest(dirName, type) {
    const dirPath = path.join(rootDir, dirName);
    ensureDir(dirPath);

    const entries = fs.readdirSync(dirPath)
        .filter(file => file.endsWith('.md') && file !== 'manifest.json');

    const files = entries.map(file => {
        if (type === 'brain' || type === 'todos') {
            return {
                name: file.replace(/\.md$/, '').replace(/_/g, ' & '),
                fileName: file,
                type
            };
        }
        if (type === 'memory') {
            return {
                date: file.replace('.md', ''),
                fileName: file,
                type: 'memory'
            };
        }
        return { name: file, fileName: file, type };
    });

    if (type === 'memory') {
        files.sort((a, b) => b.date.localeCompare(a.date));
    }

    const manifest = { files };
    const manifestPath = path.join(dirPath, 'manifest.json');
    fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2), 'utf-8');
    console.log(`[Manifest] Generated ${dirName}/manifest.json with ${files.length} files`);
}

console.log(`[Manifest] DATA_FOLDERS env: ${process.env.DATA_FOLDERS || '(default: brain,memory,todos)'}`);
DATA_FOLDERS.forEach(folder => {
    const type = folder === 'memory' ? 'memory' : folder === 'todos' ? 'todos' : 'brain';
    generateManifest(folder, type);
});
console.log('[Manifest] All manifests generated successfully');
