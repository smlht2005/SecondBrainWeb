/**
 * useBrainData Hook - 使用靜態檔案架構（依 VITE_DATA_FOLDERS 決定資料來源）
 * 更新時間：2026-02-06 00:55
 * 更新者：AI Assistant
 * 更新摘要：支援 todos 與環境變數 VITE_DATA_FOLDERS，動態請求對應 manifest
 */

import { useState, useEffect } from 'react';
import { apiClient } from '../api/client';
import type { Note } from '../api/client';

export const useBrainData = () => {
    const [notes, setNotes] = useState<Note[]>([]);
    const [folders, setFolders] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [notesData, foldersData] = await Promise.all([
                apiClient.getNotes(),
                apiClient.getFolders()
            ]);
            setNotes(notesData);
            setFolders(foldersData);
        } catch (e) {
            console.error('[API] Fetch error', e);
        } finally {
            setLoading(false);
        }
    };

    const addFolder = async (name: string) => {
        try {
            await apiClient.addFolder(name);
            await fetchData();
            return true;
        } catch (e) {
            console.error('[API] Add folder error', e);
            return false;
        }
    };

    const fetchContent = async (category: string, fileName: string) => {
        try {
            const note = await apiClient.getNoteContent(category, fileName);
            return note.content;
        } catch (e) {
            console.error('[API] Fetch content error', e);
            return '讀取內容失敗';
        }
    };

    const moveNote = async (id: string, targetFolder: string) => {
        try {
            await apiClient.moveNote(id, targetFolder);
            await fetchData(); // 移動後重新整理列表
            return true;
        } catch (e: any) {
            console.error('[API] Move note error', e);
            alert(`移動失敗: ${e.message}`);
            return false;
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // 為了相容現有的 Component，我們過濾出不同類別的資料
    const files = notes.filter(n => n.category === 'brain');
    const logs = notes.filter(n => n.category === 'memory');
    const todos = notes.filter(n => n.category === 'todos');
    const review = notes.filter(n => n.category === 'review');
    const done = notes.filter(n => n.category === 'done');

    return { 
        files, 
        logs, 
        todos, 
        review, 
        done, 
        allFolders: folders,
        loading, 
        fetchContent, 
        moveNote, 
        addFolder,
        refresh: fetchData 
    };
};
