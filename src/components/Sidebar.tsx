import React from 'react';
import { Box, Toolbar, Typography, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Divider, IconButton, TextField, Dialog, DialogTitle, DialogContent, DialogActions, Button } from '@mui/material';
import {
    Code as CodeIcon,
    CloudQueue as CloudIcon,
    TrendingUp as InvestmentIcon,
    Person as GrowthIcon,
    History as HistoryIcon,
    Description as FileIcon,
    CheckCircleOutline as TodoIcon,
    RateReview as ReviewIcon,
    TaskAlt as DoneIcon,
    Add as AddIcon
} from '@mui/icons-material';
import { Note } from '../api/client';

interface SidebarProps {
    files: Note[];
    logs: Note[];
    todos: Note[];
    review: Note[];
    done: Note[];
    allFolders: string[];
    selectedItem: { type: string, fileName: string } | null;
    onSelect: (item: { name: string, fileName: string, type: string }) => void;
    onAddFolder: (name: string) => Promise<boolean>;
}

export const Sidebar: React.FC<SidebarProps> = ({ files, logs, todos, review, done, allFolders, selectedItem, onSelect, onAddFolder }) => {
    const [open, setOpen] = React.useState(false);
    const [newFolderName, setNewFolderName] = React.useState('');

    const handleAdd = async () => {
        if (newFolderName.trim()) {
            const success = await onAddFolder(newFolderName.trim());
            if (success) {
                setOpen(false);
                setNewFolderName('');
            }
        }
    };

    const getIcon = (name: string) => {
        if (name.includes('Coding')) return <CodeIcon />;
        if (name.includes('Cloud')) return <CloudIcon />;
        if (name.includes('Growth')) return <GrowthIcon />;
        if (name.includes('Investment')) return <InvestmentIcon />;
        return <FileIcon />;
    };

    const renderList = (items: Note[], type: string, label: string, Icon: any) => {
        return (
            <>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 2, px: 2 }}>
                    <Typography variant="overline" sx={{ color: 'gray', fontWeight: 700 }}>{label}</Typography>
                    {type === 'brain' && (
                        <IconButton size="small" onClick={() => setOpen(true)}>
                            <AddIcon fontSize="inherit" />
                        </IconButton>
                    )}
                </Box>
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

            {/* 新增目錄對話框 */}
            <Dialog open={open} onClose={() => setOpen(false)}>
                <DialogTitle>新增目錄</DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        margin="dense"
                        label="目錄名稱"
                        fullWidth
                        variant="standard"
                        value={newFolderName}
                        onChange={(e) => setNewFolderName(e.target.value)}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpen(false)}>取消</Button>
                    <Button onClick={handleAdd}>新增</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};
