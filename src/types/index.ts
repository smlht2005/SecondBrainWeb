export interface BrainFile {
    id: string;
    name: string;
    category: 'coding' | 'tech' | 'growth' | 'investment' | 'cloud';
    content: string;
    lastUpdated: string;
}

export interface ConversationLog {
    id: string;
    date: string;
    summary: string;
    tags: string[];
}
