const API_BASE_URL = (import.meta as any).env.VITE_API_BASE_URL || 'http://localhost:3000/api';

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
    const res = await fetch(`${API_BASE_URL}/notes`);
    if (!res.ok) throw new Error('Failed to fetch notes');
    return res.json();
  },

  async getNoteContent(folder: string, file: string): Promise<Note> {
    const res = await fetch(`${API_BASE_URL}/notes/${folder}/${file}`);
    if (!res.ok) throw new Error('Failed to fetch note content');
    return res.json();
  },

  async moveNote(id: string, targetFolder: string): Promise<Note> {
    const res = await fetch(`${API_BASE_URL}/notes/move`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, targetFolder })
    });
    if (!res.ok) throw new Error('Failed to move note');
    return res.json();
  }
};
