import { useState, useEffect } from 'react';
import type { BrainFile, LogEntry } from '../types';

// [Static Mode]
// 暫時移除動態 API 呼叫，改用靜態 mock data 以確保穩定顯示
// 待後端資料夾同步問題解決後，再切換回 API

const MOCK_FILES: BrainFile[] = [
    { name: 'Agent Skills Handbook', fileName: 'Agent_Skills_Handbook.md', type: 'brain' },
    { name: 'Security Audit', fileName: '20260204_Security_Audit.md', type: 'brain' },
    { name: 'NotebookLM Prompts', fileName: 'NotebookLM_Prompts_Handbook.md', type: 'brain' },
    { name: 'Zeabur Persistence', fileName: '20260204_Zeabur_Persistence_Lesson.md', type: 'brain' }
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

    const fetchContent = async (type: 'brain' | 'memory', fileName: string) => {
        // 暫時回傳假內容，證明 UI 正常
        return `# ${fileName}\n\n(此為靜態測試模式，內容尚未連結資料庫)\n\n這證明前端 Router 與 Layout 運作正常。`;
    };

    return { files, logs, loading, fetchContent, refresh: () => {} };
};