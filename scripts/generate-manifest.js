/**
 * 生成 manifest.json 檔案列表
 * 更新時間：2026-02-06 00:10
 * 更新者：AI Assistant
 * 更新摘要：掃描 brain/ 和 memory/ 目錄，生成 manifest.json 檔案列表
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

function generateManifest(dirName, type) {
    const dirPath = path.join(rootDir, dirName);
    
    if (!fs.existsSync(dirPath)) {
        console.log(`[Manifest] Directory ${dirName} does not exist, creating empty manifest`);
        const manifest = { files: [] };
        fs.writeFileSync(
            path.join(dirPath, 'manifest.json'),
            JSON.stringify(manifest, null, 2),
            'utf-8'
        );
        return;
    }
    
    const files = fs.readdirSync(dirPath)
        .filter(file => file.endsWith('.md') && file !== 'manifest.json')
        .map(file => {
            if (type === 'brain') {
                return {
                    name: file.replace('.md', '').replace('_', ' & '),
                    fileName: file,
                    type: 'brain'
                };
            } else {
                return {
                    date: file.replace('.md', ''),
                    fileName: file,
                    type: 'memory'
                };
            }
        });
    
    if (type === 'memory') {
        files.sort((a, b) => b.date.localeCompare(a.date));
    }
    
    const manifest = { files };
    const manifestPath = path.join(dirPath, 'manifest.json');
    
    fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2), 'utf-8');
    console.log(`[Manifest] Generated ${dirName}/manifest.json with ${files.length} files`);
}

// 生成兩個 manifest
generateManifest('brain', 'brain');
generateManifest('memory', 'memory');

console.log('[Manifest] All manifests generated successfully');
