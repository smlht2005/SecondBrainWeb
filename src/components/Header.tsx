import React from 'react';
import { AppBar, Toolbar, Typography, Box, InputBase } from '@mui/material';
import { MenuBook as BookIcon, Search as SearchIcon, Menu as MenuIcon } from '@mui/icons-material';
import { IconButton } from '@mui/material';

interface HeaderProps {
    isMobile: boolean;
    onMenuClick: () => void;
}

export const Header: React.FC<HeaderProps> = ({ isMobile, onMenuClick }) => (
    <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1, bgcolor: 'background.paper', backgroundImage: 'none' }}>
        <Toolbar sx={{ justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                {isMobile && (
                    <IconButton color="inherit" edge="start" onClick={onMenuClick} sx={{ mr: 2 }}>
                        <MenuIcon />
                    </IconButton>
                )}
                <BookIcon sx={{ mr: 1, color: 'primary.main', display: { xs: 'none', sm: 'block' } }} />
                <Typography variant="h6" noWrap component="div" sx={{ fontWeight: 700, letterSpacing: 1, fontSize: { xs: '1.1rem', sm: '1.25rem' } }}>
                    SECOND BRAIN <Typography component="span" sx={{ color: 'primary.main', fontWeight: 400 }}>WEB</Typography>
                </Typography>
            </Box>

            <Box sx={{
                position: 'relative', borderRadius: 2, bgcolor: 'rgba(255,255,255,0.05)',
                ml: { xs: 1, sm: 3 }, flexGrow: { xs: 1, sm: 0 },
                width: { xs: 'auto', sm: '300px', md: '400px' }, display: 'flex', alignItems: 'center', px: { xs: 1, sm: 2 }
            }}>
                <SearchIcon sx={{ color: 'gray', mr: 1, fontSize: '1.2rem' }} />
                <InputBase placeholder="搜尋..." sx={{ color: 'white', width: '100%', fontSize: '0.9rem' }} />
            </Box>
        </Toolbar>
    </AppBar>
);
