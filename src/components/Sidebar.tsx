import React from 'react';
import { Box, Toolbar, Typography, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Divider } from '@mui/material';
import {
    Code as CodeIcon,
    CloudQueue as CloudIcon,
    TrendingUp as InvestmentIcon,
    Person as GrowthIcon,
    History as HistoryIcon,
    Description as FileIcon,
    CheckCircleOutline as TodoIcon,
    RateReview as ReviewIcon,
    TaskAlt as DoneIcon
} from '@mui/icons-material';
import { Note } from '../api/client';

interface SidebarProps {
    files: Note[];
    logs: Note[];
    todos: Note[];
    review: Note[];
    done: Note[];
    selectedItem: { type: string, fileName: string } | null;
    onSelect: (item: { name: string, fileName: string, type: string }) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ files, logs, todos, review, done, selectedItem, onSelect }) => {
    const getIcon = (name: string) => {
        if (name.includes('Coding')) return <CodeIcon />;
        if (name.includes('Cloud')) return <CloudIcon />;
        if (name.includes('Growth')) return <GrowthIcon />;
        if (name.includes('Investment')) return <InvestmentIcon />;
        return <FileIcon />;
    };

    const renderList = (items: Note[], type: string, label: string, Icon: any) => {
        if (items.length === 0) return null;
        return (
            <>
                <Typography variant="overline" sx={{ px: 2, color: 'gray', mt: 2, display: 'block', fontWeight: 700 }}>{label}</Typography>
                <List>
                    {items.map((item) => {
                        const fileName = item.id.split('/').pop() || '';
                        return (
                            <ListItem key={item.id} disablePadding>
                                <ListItemButton
                                    selected={selectedItem?.fileName === fileName && selectedItem?.type === type}
                                    onClick={() => onSelect({ name: item.title, fileName: fileName, type: type })}
                                    sx={{ borderRadius: 2, mb: 0.5, '&.Mui-selected': { bgcolor: 'rgba(0, 229, 255, 0.1)' } }}
                                >
                                    <ListItemIcon sx={{ color: selectedItem?.fileName === fileName ? 'primary.main' : 'inherit' }}>
                                        {type === 'brain' ? getIcon(item.title) : <Icon fontSize="small" />}
                                    </ListItemIcon>
                                    <ListItemText primary={item.title} />
                                </ListItemButton>
                            </ListItem>
                        );
                    })}
                </List>
            </>
        );
    };

    return (
        <Box sx={{ p: 2 }}>
            <Toolbar />
            {renderList(files, 'brain', '知識分類', FileIcon)}
            
            <Divider sx={{ my: 2 }} />
            
            {renderList(todos, 'todos', '待辦項目 (TODO)', TodoIcon)}
            {renderList(review, 'review', '待審核 (REVIEW)', ReviewIcon)}
            {renderList(done, 'done', '已完成 (DONE)', DoneIcon)}

            <Divider sx={{ my: 2 }} />

            {renderList(logs, 'memory', '最近對話', HistoryIcon)}
        </Box>
    );
};
