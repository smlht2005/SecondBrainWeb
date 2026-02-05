export interface BrainFile {
    name: string;
    fileName: string;
    type: 'brain' | 'todo';
}

export interface LogEntry {
    date: string;
    fileName: string;
    type: 'memory';
}

export type SelectedItem = {
    name: string;
    fileName: string;
    type: 'brain' | 'memory' | 'todo';
};
