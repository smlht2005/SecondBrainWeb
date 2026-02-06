import React from 'react';
import { Box, Toolbar, Typography, List, ListItem, ListItemButton, ListItemIcon, ListItemText } from '@mui/material';
import {
    Code as CodeIcon,
    CloudQueue as CloudIcon,
    TrendingUp as InvestmentIcon,
    Person as GrowthIcon,
    History as HistoryIcon,
    Description as FileIcon,
    CheckCircleOutline as TodoIcon
} from '@mui/icons-material';
import type { BrainFile, LogEntry, TodoEntry, SelectedItem } from '../types';

interface SidebarProps {
    files: BrainFile[];
    logs: LogEntry[];
    todos: TodoEntry[];
    selectedItem: SelectedItem | null;
    onSelect: (item: SelectedItem) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ files, logs, todos, selectedItem, onSelect }) => {
    const getIcon = (name: string) => {
        if (name.includes('Coding')) return <CodeIcon />;
        if (name.includes('Cloud')) return <CloudIcon />;
        if (name.includes('Growth')) return <GrowthIcon />;
        if (name.includes('Investment')) return <InvestmentIcon />;
        return <FileIcon />;
    };

    return (
        <Box sx={{ p: 2 }}>
            <Toolbar />
            <Typography variant="overline" sx={{ px: 2, color: 'gray', fontWeight: 700 }}>知識分類</Typography>
            <List>
                {files.map((file) => (
                    <ListItem key={file.fileName} disablePadding>
                        <ListItemButton
                            selected={selectedItem?.fileName === file.fileName && selectedItem?.type === 'brain'}
                            onClick={() => onSelect({ name: file.name, fileName: file.fileName, type: 'brain' })}
                            sx={{ borderRadius: 2, mb: 0.5, '&.Mui-selected': { bgcolor: 'rgba(0, 229, 255, 0.1)' } }}
                        >
                            <ListItemIcon sx={{ color: selectedItem?.fileName === file.fileName ? 'primary.main' : 'inherit' }}>
                                {getIcon(file.name)}
                            </ListItemIcon>
                            <ListItemText primary={file.name} />
                        </ListItemButton>
                    </ListItem>
                ))}
            </List>

            {todos.length > 0 && (
                <>
                    <Typography variant="overline" sx={{ px: 2, color: 'gray', mt: 4, display: 'block', fontWeight: 700 }}>待辦</Typography>
                    <List>
                        {todos.map((todo) => (
                            <ListItem key={todo.fileName} disablePadding>
                                <ListItemButton
                                    selected={selectedItem?.fileName === todo.fileName && selectedItem?.type === 'todos'}
                                    onClick={() => onSelect({ name: todo.name, fileName: todo.fileName, type: 'todos' })}
                                    sx={{ borderRadius: 2, mb: 0.5 }}
                                >
                                    <ListItemIcon><TodoIcon fontSize="small" /></ListItemIcon>
                                    <ListItemText primary={todo.name} />
                                </ListItemButton>
                            </ListItem>
                        ))}
                    </List>
                </>
            )}

            <Typography variant="overline" sx={{ px: 2, color: 'gray', mt: 4, display: 'block', fontWeight: 700 }}>最近對話</Typography>
            <List>
                {logs.map((log) => (
                    <ListItem key={log.fileName} disablePadding>
                        <ListItemButton
                            selected={selectedItem?.fileName === log.fileName && selectedItem?.type === 'memory'}
                            onClick={() => onSelect({ name: `日誌: ${log.date}`, fileName: log.fileName, type: 'memory' })}
                            sx={{ borderRadius: 2, mb: 0.5 }}
                        >
                            <ListItemIcon><HistoryIcon fontSize="small" /></ListItemIcon>
                            <ListItemText primary={log.date} secondaryTypographyProps={{ noWrap: true, variant: 'caption' }} />
                        </ListItemButton>
                    </ListItem>
                ))}
            </List>
        </Box>
    );
};
