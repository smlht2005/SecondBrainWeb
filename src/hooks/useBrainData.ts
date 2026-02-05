import { useState, useEffect } from 'react';
import type { BrainFile, LogEntry } from '../types';

const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';

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
            
            // 檢查響應狀態和 Content-Type
            if (!filesRes.ok) {
                const text = await filesRes.text();
                console.error(`Brain API error (${filesRes.status}):`, text.substring(0, 200));
                setFiles([]);
            } else {
                const contentType = filesRes.headers.get('content-type');
                if (contentType && contentType.includes('application/json')) {
                    setFiles(await filesRes.json());
                } else {
                    const text = await filesRes.text();
                    console.error('Brain API returned non-JSON:', text.substring(0, 200));
                    setFiles([]);
                }
            }
            
            if (!logsRes.ok) {
                const text = await logsRes.text();
                console.error(`Memory API error (${logsRes.status}):`, text.substring(0, 200));
                setLogs([]);
            } else {
                const contentType = logsRes.headers.get('content-type');
                if (contentType && contentType.includes('application/json')) {
                    setLogs(await logsRes.json());
                } else {
                    const text = await logsRes.text();
                    console.error('Memory API returned non-JSON:', text.substring(0, 200));
                    setLogs([]);
                }
            }
        } catch (e) {
            console.error("Fetch data error", e);
            setFiles([]);
            setLogs([]);
        } finally {
            setLoading(false);
        }
    };

    const fetchContent = async (type: 'brain' | 'memory', fileName: string) => {
        try {
            const res = await fetch(`${API_BASE}/content/${type}/${fileName}`);
            if (!res.ok) {
                const text = await res.text();
                console.error(`Content API error (${res.status}):`, text.substring(0, 200));
                return '讀取內容失敗';
            }
            const contentType = res.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
                const data = await res.json();
                return data.content;
            } else {
                const text = await res.text();
                console.error('Content API returned non-JSON:', text.substring(0, 200));
                return '讀取內容失敗';
            }
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
