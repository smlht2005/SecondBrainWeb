const API_BASE_URL = (import.meta as any).env.VITE_API_BASE_URL || '';

export interface Note {
  id: string;
  title: string;
  content: string;
  tags: string[];
  updatedAt: string;
  category: string;
}

export const apiClient = {
  async getNotes(): Promise<Note[]> {
    // 優先使用真正的 API 獲取動態清單
    try {
      const apiPath = API_BASE_URL ? `${API_BASE_URL}/notes` : '/api/notes';
      const res = await fetch(apiPath);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) return data;
      }
    } catch (e) {
      console.warn('[API] Dynamic fetch failed, falling back to static manifests', e);
    }

    // 靜態檔案架構 Fallback：請求各目錄的 manifest.json 並彙整
    const folders = ['brain', 'memory', 'todos', 'review', 'done'];
    try {
      const results = await Promise.all(folders.map(async (folder) => {
        try {
          const res = await fetch(`/${folder}/manifest.json`);
          if (!res.ok) return [];
          const data = await res.json();
          return (data.files || []).map((f: any) => ({
            id: `${f.type}/${f.fileName}`,
            title: f.name || f.date || f.fileName,
            content: '',
            tags: [],
            updatedAt: f.date || '',
            category: f.type
          }));
        } catch (e) {
          return [];
        }
      }));
      return results.flat();
    } catch (e) {
      console.error('[API] getNotes failed', e);
      return [];
    }
  },

  async getNoteContent(folder: string, file: string): Promise<Note> {
    // 優先使用 API 獲取內容，確保讀取的是最新檔案
    try {
      const apiPath = API_BASE_URL ? `${API_BASE_URL}/notes/${folder}/${file}` : `/api/notes/${folder}/${file}`;
      const res = await fetch(apiPath);
      if (res.ok) {
        const data = await res.json();
        if (data && data.content) return data;
      }
    } catch (e) {
      console.warn('[API] Content fetch via API failed', e);
    }

    // Fallback: 直接抓取靜態檔案
    const res = await fetch(`/${folder}/${file}`);
    if (!res.ok) throw new Error('Failed to fetch note content');
    const content = await res.text();
    return {
      id: `${folder}/${file}`,
      title: file,
      content,
      tags: [],
      updatedAt: '',
      category: folder
    };
  },

  async getFolders(): Promise<string[]> {
    return ['brain', 'memory', 'todos', 'review', 'done'];
  },

  async addFolder(_name: string): Promise<string[]> {
    return this.getFolders();
  },

  async moveNote(id: string, targetFolder: string): Promise<any> {
    const apiPath = API_BASE_URL ? `${API_BASE_URL}/notes/move` : '/api/notes/move';
    const res = await fetch(apiPath, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, targetFolder })
    });
    
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({ error: 'Unknown server error' }));
      throw new Error(errorData.error || `Server responded with ${res.status}`);
    }
    return await res.json();
  }
};
