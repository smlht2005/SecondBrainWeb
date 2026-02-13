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
    // 靜態檔案架構：請求各目錄的 manifest.json 並彙整
    const folders = ['brain', 'memory', 'todos'];
    
    // 如果環境變數有定義 API URL，則優先使用 (可能是 Fastify 後端)
    if (API_BASE_URL && API_BASE_URL.includes('/api')) {
      try {
        const res = await fetch(`${API_BASE_URL}/notes`);
        if (res.ok) return await res.json();
      } catch (e) {
        console.warn('[API] Fastify call failed, falling back to static manifests', e);
      }
    }

    try {
      const results = await Promise.all(folders.map(async (folder) => {
        try {
          // 使用絕對路徑確保在不同路由下都能抓到 manifest
          const res = await fetch(`/${folder}/manifest.json`);
          if (!res.ok) {
              console.warn(`[API] Manifest not found for ${folder}: ${res.status}`);
              return [];
          }
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
          console.warn(`[API] Failed to parse JSON for ${folder}`, e);
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
    // 優先使用 API 獲取內容，避免 SPA fallback 拿到 HTML
    try {
      const res = await fetch(`${API_BASE_URL}/api/notes/${folder}/${file}`);
      if (res.ok) {
        const data = await res.json();
        if (data && data.content) return data;
      }
    } catch (e) {
      console.warn('[API] Fastify content call failed, falling back to static fetch', e);
    }

    // Fallback: 直接抓取靜態檔案 (如果 API 不通)
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
    // 靜態模式下回傳預設目錄
    return ['brain', 'memory', 'todos', 'review', 'done'];
  },

  async addFolder(_name: string): Promise<string[]> {
    console.warn('[API] addFolder is not supported in static mode');
    return ['brain', 'memory', 'todos', 'review', 'done'];
  },

  async moveNote(id: string, targetFolder: string): Promise<Note> {
    const res = await fetch(`${API_BASE_URL}/api/notes/move`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, targetFolder })
    });
    if (!res.ok) throw new Error('Failed to move note');
    return res.json();
  }
};
