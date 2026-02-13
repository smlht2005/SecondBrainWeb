export interface BrainFile {
    name: string;
    fileName: string;
    type: 'brain';
}

export interface LogEntry {
    date: string;
    fileName: string;
    type: 'memory';
}

export interface TodoEntry {
    name: string;
    fileName: string;
    type: 'todos';
}

export type SelectedItem = {
    name: string;
    fileName: string;
    type: 'brain' | 'memory' | 'todos' | 'review' | 'done';
};
