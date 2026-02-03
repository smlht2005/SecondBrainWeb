import { useState, useEffect } from 'react';
import type { BrainFile, LogEntry } from '../types';

const API_BASE = import.meta.env.VITE_API_BASE_URL;

export const useBrainData = () => {
    const [files, setFiles] = useState<BrainFile[]>([]);
    const [logs, setLogs] = useState<LogEntry[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        try {
            const [filesRes, logsRes] = await Promise.all([
                fetch(`${API_BASE}/brain/files`),
                fetch(`${API_BASE}/memory/logs`)
            ]);
            setFiles(await filesRes.json());
            setLogs(await logsRes.json());
        } catch (e) {
            console.error("Fetch data error", e);
        } finally {
            setLoading(false);
        }
    };

    const fetchContent = async (type: 'brain' | 'memory', fileName: string) => {
        try {
            const res = await fetch(`${API_BASE}/content/${type}/${fileName}`);
            const data = await res.json();
            return data.content;
        } catch (e) {
            console.error("Fetch content error", e);
            return '讀取內容失敗';
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    return { files, logs, loading, fetchContent, refresh: fetchData };
};
