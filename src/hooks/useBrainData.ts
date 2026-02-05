/**
 * useBrainData Hook - 使用靜態檔案架構
 * 更新時間：2026-02-06 00:12
 * 更新者：AI Assistant
 * 更新摘要：改為直接讀取靜態 manifest.json 和 Markdown 檔案，移除 API 依賴
 */

import { useState, useEffect } from 'react';
import type { BrainFile, LogEntry } from '../types';

export const useBrainData = () => {
    const [files, setFiles] = useState<BrainFile[]>([]);
    const [logs, setLogs] = useState<LogEntry[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        try {
            console.log('[Static] Fetching manifest files...');
            const [brainRes, memoryRes] = await Promise.all([
                fetch('/brain/manifest.json'),
                fetch('/memory/manifest.json')
            ]);
            
            if (!brainRes.ok) {
                console.error(`Brain manifest error (${brainRes.status}):`, await brainRes.text());
                setFiles([]);
            } else {
                const brainData = await brainRes.json();
                console.log(`[Static] Loaded ${brainData.files?.length || 0} brain files`);
                setFiles(brainData.files || []);
            }
            
            if (!memoryRes.ok) {
                console.error(`Memory manifest error (${memoryRes.status}):`, await memoryRes.text());
                setLogs([]);
            } else {
                const memoryData = await memoryRes.json();
                console.log(`[Static] Loaded ${memoryData.files?.length || 0} memory files`);
                setLogs(memoryData.files || []);
            }
        } catch (e) {
            console.error("[Static] Fetch manifest error", e);
            setFiles([]);
            setLogs([]);
        } finally {
            setLoading(false);
        }
    };

    const fetchContent = async (type: 'brain' | 'memory', fileName: string) => {
        try {
            console.log(`[Static] Fetching content: /${type}/${fileName}`);
            const res = await fetch(`/${type}/${fileName}`);
            if (!res.ok) {
                console.error(`Content fetch error (${res.status}):`, await res.text());
                return '讀取內容失敗';
            }
            const content = await res.text();
            console.log(`[Static] Successfully loaded ${fileName} (${content.length} chars)`);
            return content;
        } catch (e) {
            console.error("[Static] Fetch content error", e);
            return '讀取內容失敗';
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    return { files, logs, loading, fetchContent, refresh: fetchData };
};
