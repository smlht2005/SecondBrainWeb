import { useState, useEffect } from 'react';
import type { BrainFile, LogEntry } from '../types';

// [Static Mode]
// 暫時移除動態 API 呼叫，改用靜態 mock data 以確保穩定顯示
// 待後端資料夾同步問題解決後，再切換回 API

const MOCK_FILES: BrainFile[] = [
    { name: 'Agent Skills Handbook', fileName: 'Agent_Skills_Handbook.md', type: 'brain' },
    { name: 'Security Audit', fileName: '20260204_Security_Audit.md', type: 'brain' },
    { name: 'NotebookLM Prompts', fileName: 'NotebookLM_Prompts_Handbook.md', type: 'brain' },
    { name: 'Zeabur Persistence', fileName: '20260204_Zeabur_Persistence_Lesson.md', type: 'brain' },
    { name: 'Scrum 2026-02-04', fileName: '20260204_2252_Scrum.md', type: 'todo' },
    { name: 'Scrum 2026-02-05', fileName: '20260205_1702_Scrum.md', type: 'todo' }
];

const MOCK_LOGS: LogEntry[] = [
    { date: '2025-05-14', fileName: '2025-05-14.md', type: 'memory' }
];

export const useBrainData = () => {
    const [files, setFiles] = useState<BrainFile[]>(MOCK_FILES);
    const [logs, setLogs] = useState<LogEntry[]>(MOCK_LOGS);
    const [loading, setLoading] = useState(false);

    // 暫時註解掉 API Fetch
    /*
    const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';
    const fetchData = async () => { ... };
    */

    const fetchContent = async (type: 'brain' | 'memory' | 'todo', fileName: string) => {
        // [Static Mode] 嘗試抓取真實靜態檔案 (若失敗則回傳 Mock)
        try {
            // 注意：API 路由 /api/brain/files 已被移除，這裡直接抓靜態檔案
            // 檔案路徑規則：
            // brain -> /brain/xxx.md
            // memory -> /memory/xxx.md
            // todo -> /TODOS/xxx.md (注意大小寫)
            
            const folder = type === 'todo' ? 'TODOS' : type;
            const res = await fetch(`/${folder}/${fileName}`);
            
            if (res.ok) {
                return await res.text();
            }
        } catch (e) {
            console.error("Fetch static content error", e);
        }
        
        return `# ${fileName}\n\n(內容讀取失敗，請確認檔案是否存在於靜態目錄)`; 
    };

    return { files, logs, loading, fetchContent, refresh: () => {} };
};