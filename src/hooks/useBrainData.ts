/**
 * useBrainData Hook - 使用靜態檔案架構（依 VITE_DATA_FOLDERS 決定資料來源）
 * 更新時間：2026-02-06 00:55
 * 更新者：AI Assistant
 * 更新摘要：支援 todos 與環境變數 VITE_DATA_FOLDERS，動態請求對應 manifest
 */

import { useState, useEffect } from 'react';
import type { BrainFile, LogEntry, TodoEntry } from '../types';
import { parseDataFolders } from '../utils/dataFolders';

const DEFAULT_DATA_FOLDERS = 'brain,memory,todos';

function getDataFolders(): string[] {
    const raw = (import.meta as unknown as { env: { VITE_DATA_FOLDERS?: string } }).env?.VITE_DATA_FOLDERS ?? DEFAULT_DATA_FOLDERS;
    return parseDataFolders(raw);
}

export const useBrainData = () => {
    const [files, setFiles] = useState<BrainFile[]>([]);
    const [logs, setLogs] = useState<LogEntry[]>([]);
    const [todos, setTodos] = useState<TodoEntry[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        const folders = getDataFolders();
        try {
            const results = await Promise.all(
                folders.map(async (folder) => {
                    const res = await fetch(`/${folder}/manifest.json`);
                    if (!res.ok) return { folder, files: [] };
                    const data = await res.json();
                    return { folder, files: data.files ?? [] };
                })
            );
            setFiles(results.find(r => r.folder === 'brain')?.files ?? []);
            setLogs(results.find(r => r.folder === 'memory')?.files ?? []);
            setTodos(results.find(r => r.folder === 'todos')?.files ?? []);
        } catch (e) {
            console.error('[Static] Fetch manifest error', e);
            setFiles([]);
            setLogs([]);
            setTodos([]);
        } finally {
            setLoading(false);
        }
    };

    const fetchContent = async (type: 'brain' | 'memory' | 'todos', fileName: string) => {
        try {
            const res = await fetch(`/${type}/${fileName}`);
            if (!res.ok) return '讀取內容失敗';
            return await res.text();
        } catch (e) {
            console.error('[Static] Fetch content error', e);
            return '讀取內容失敗';
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    return { files, logs, todos, loading, fetchContent, refresh: fetchData };
};
