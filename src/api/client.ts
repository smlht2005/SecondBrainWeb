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

    try {
      const results = await Promise.all(folders.map(async (folder) => {
        try {
          const res = await fetch(`${API_BASE_URL}/${folder}/manifest.json`);
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
          console.warn(`[API] Failed to fetch manifest for ${folder}`, e);
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
    const res = await fetch(`${API_BASE_URL}/${folder}/${file}`);
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
    return ['brain', 'memory', 'todos'];
  },

  async addFolder(_name: string): Promise<string[]> {
    console.warn('[API] addFolder is not supported in static mode');
    return ['brain', 'memory', 'todos'];
  },

  async moveNote(_id: string, _targetFolder: string): Promise<Note> {
    console.warn('[API] moveNote is not supported in static mode');
    throw new Error('Operation not supported in static mode');
  }
};
