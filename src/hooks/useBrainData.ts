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
        // [Static Mode] 暫時回傳內嵌內容 (TODO: 改為 fetch 實際靜態檔案)
        // 為了讓您看到內容，這裡先暫時 hardcode 讀取到的檔案內容
        // 實際生產環境應該 fetch `/${type}/${fileName}`
        return `# ${fileName}\n\n(內容讀取中...)`; 
    };

    return { files, logs, loading, fetchContent, refresh: () => {} };
};