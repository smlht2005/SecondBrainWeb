import React, { useState } from 'react';
import { 
  Box, CssBaseline, ThemeProvider, AppBar, Toolbar, Typography, 
  Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText, 
  Container, Paper, InputBase, IconButton, Chip, Stack, useMediaQuery, useTheme
} from '@mui/material';
import { 
  Search as SearchIcon, 
  Code as CodeIcon, 
  CloudQueue as CloudIcon, 
  TrendingUp as InvestmentIcon, 
  Person as GrowthIcon,
  MenuBook as BookIcon,
  History as HistoryIcon,
  Menu as MenuIcon,
  Assessment as AssessmentIcon
} from '@mui/icons-material';
import ReactMarkdown from 'react-markdown';
import { theme } from './theme/theme';

const drawerWidth = 280;

function App() {
  const muiTheme = useTheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState('Coding & Tech');

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const categories = [
    { name: 'Coding & Tech', icon: <CodeIcon />, color: '#00e5ff' },
    { name: 'Cloud & Network', icon: <CloudIcon />, color: '#76ff03' },
    { name: 'Self Growth', icon: <GrowthIcon />, color: '#ff4081' },
    { name: 'Investment', icon: <InvestmentIcon />, color: '#ffab00' },
  ];

  const drawerContent = (
    <Box sx={{ p: 2 }}>
      <Toolbar />
      <Typography variant="overline" sx={{ px: 2, color: 'gray', fontWeight: 700 }}>知識分類</Typography>
      <List>
        {categories.map((cat) => (
          <ListItem key={cat.name} disablePadding>
            <ListItemButton 
              selected={selectedFile === cat.name}
              onClick={() => {
                setSelectedFile(cat.name);
                if (isMobile) setMobileOpen(false);
              }}
              sx={{ borderRadius: 2, mb: 1, '&.Mui-selected': { bgcolor: 'rgba(0, 229, 255, 0.1)' } }}
            >
              <ListItemIcon sx={{ color: selectedFile === cat.name ? 'primary.main' : 'inherit' }}>
                {cat.icon}
              </ListItemIcon>
              <ListItemText primary={cat.name} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      
      <Typography variant="overline" sx={{ px: 2, color: 'gray', mt: 4, display: 'block', fontWeight: 700 }}>最近對話</Typography>
      <List>
        {['2026-02-02', '2026-02-01'].map((date) => (
          <ListItem key={date} disablePadding>
            <ListItemButton sx={{ borderRadius: 2 }}>
              <ListItemIcon><HistoryIcon fontSize="small" /></ListItemIcon>
              <ListItemText primary={date} secondary="COBOLFP 專案重構..." secondaryTypographyProps={{ noWrap: true, variant: 'caption' }} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  );

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
        <CssBaseline />
        
        {/* Header */}
        <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1, bgcolor: 'background.paper', backgroundImage: 'none' }}>
          <Toolbar sx={{ justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              {isMobile && (
                <IconButton color="inherit" edge="start" onClick={handleDrawerToggle} sx={{ mr: 2 }}>
                  <MenuIcon />
                </IconButton>
              )}
              <BookIcon sx={{ mr: 1, color: 'primary.main', display: { xs: 'none', sm: 'block' } }} />
              <Typography variant="h6" noWrap component="div" sx={{ fontWeight: 700, letterSpacing: 1, fontSize: { xs: '1.1rem', sm: '1.25rem' } }}>
                SECOND BRAIN <Typography component="span" sx={{ color: 'primary.main', fontWeight: 400 }}>WEB</Typography>
              </Typography>
            </Box>
            
            <Box sx={{ 
              position: 'relative', 
              borderRadius: 2, 
              bgcolor: 'rgba(255,255,255,0.05)', 
              ml: { xs: 1, sm: 3 }, 
              flexGrow: { xs: 1, sm: 0 },
              width: { xs: 'auto', sm: '300px', md: '400px' }, 
              display: 'flex', 
              alignItems: 'center', 
              px: { xs: 1, sm: 2 } 
            }}>
              <SearchIcon sx={{ color: 'gray', mr: 1, fontSize: '1.2rem' }} />
              <InputBase placeholder="搜尋..." sx={{ color: 'white', width: '100%', fontSize: '0.9rem' }} />
            </Box>
          </Toolbar>
        </AppBar>

        {/* Sidebar - Responsive Drawer */}
        <Box component="nav" sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}>
          {isMobile ? (
            <Drawer
              variant="temporary"
              open={mobileOpen}
              onClose={handleDrawerToggle}
              ModalProps={{ keepMounted: true }}
              sx={{
                display: { xs: 'block', md: 'none' },
                '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth, bgcolor: 'background.paper' },
              }}
            >
              {drawerContent}
            </Drawer>
          ) : (
            <Drawer
              variant="permanent"
              sx={{
                display: { xs: 'none', md: 'block' },
                '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth, bgcolor: 'background.paper', borderRight: '1px solid rgba(255,255,255,0.1)' },
              }}
              open
            >
              {drawerContent}
            </Drawer>
          )}
        </Box>

        {/* Main Content */}
        <Box component="main" sx={{ flexGrow: 1, p: { xs: 2, sm: 3 }, width: { xs: '100%', md: `calc(100% - ${drawerWidth}px)` } }}>
          <Toolbar />
          <Container maxWidth="lg" sx={{ px: { xs: 0, sm: 2 } }}>
            <Stack direction="row" spacing={1} sx={{ mb: 2, overflowX: 'auto', pb: 1, '&::-webkit-scrollbar': { display: 'none' } }}>
              <Chip label="#Insight" color="primary" variant="outlined" size="small" />
              <Chip label="#Rule" color="secondary" variant="outlined" size="small" />
              <Chip label="#HIS" variant="outlined" size="small" />
              <Chip label="#RWD" variant="outlined" size="small" />
            </Stack>
            
            <Paper sx={{ p: { xs: 2, sm: 4 }, borderRadius: { xs: 2, sm: 3 }, minHeight: '70vh', boxShadow: '0 8px 32px rgba(0,0,0,0.2)' }}>
              <Typography variant="h4" gutterBottom sx={{ fontWeight: 700, color: 'primary.main', fontSize: { xs: '1.5rem', sm: '2.125rem' } }}>
                {selectedFile}
              </Typography>
              <Box sx={{ mt: 3, color: 'rgba(255,255,255,0.8)', lineHeight: 1.6, fontSize: '0.95rem', '& pre': { overflowX: 'auto', bgcolor: 'rgba(0,0,0,0.2)', p: 2, borderRadius: 1 } }}>
                <ReactMarkdown>
                  {`### 🚀 核心開發準則
                  
1. **行為驅動識別 (Behavior-based Analysis)**
   - 不依據「檔案名稱」判斷功能。
   - 掃描代碼中的關鍵動詞 (\`WRITE\`, \`REWRITE\`, \`DELETE\`)。

2. **定義與使用的雙重校驗**
   - 僅在 PROCEDURE DIVISION 中被實際使用的畫面才計點。
   - 自動過濾 Dead Code。

3. **配置外部化 (JSON)**
   - 使用 \`appsettings.json\` 管理權重。`}
                </ReactMarkdown>
              </Box>
            </Paper>

            {/* Mobile-only Stats Section (appears at bottom of main on mobile) */}
            {isMobile && (
              <Box sx={{ mt: 3 }}>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, display: 'flex', alignItems: 'center' }}>
                  <AssessmentIcon sx={{ mr: 1 }} /> 知識摘要
                </Typography>
                <Stack direction="row" spacing={2}>
                  <Paper sx={{ p: 2, flex: 1, bgcolor: 'rgba(255,255,255,0.02)', borderRadius: 2 }}>
                    <Typography variant="caption" color="gray">總功能點數</Typography>
                    <Typography variant="h5" color="primary.main" sx={{ fontWeight: 700 }}>1,763</Typography>
                  </Paper>
                  <Paper sx={{ p: 2, flex: 1, bgcolor: 'rgba(255,255,255,0.02)', borderRadius: 2 }}>
                    <Typography variant="caption" color="gray">本週新增</Typography>
                    <Typography variant="h5" sx={{ fontWeight: 700 }}>12</Typography>
                  </Paper>
                </Stack>
              </Box>
            )}
          </Container>
        </Box>

        {/* Right InfoBar - Hidden on mobile, sticky on desktop */}
        {!isMobile && (
          <Box sx={{ width: 300, p: 3, borderLeft: '1px solid rgba(255,255,255,0.1)', position: 'sticky', top: 0, height: '100vh' }}>
            <Toolbar />
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>知識摘要</Typography>
            <Paper sx={{ p: 2, mb: 2, bgcolor: 'rgba(255,255,255,0.02)', borderRadius: 2 }}>
              <Typography variant="caption" color="gray">總功能點數</Typography>
              <Typography variant="h4" color="primary.main" sx={{ fontWeight: 700 }}>1,763</Typography>
            </Paper>
            <Paper sx={{ p: 2, bgcolor: 'rgba(255,255,255,0.02)', borderRadius: 2 }}>
              <Typography variant="caption" color="gray">本週新增知識點</Typography>
              <Typography variant="h4" sx={{ fontWeight: 700 }}>12</Typography>
            </Paper>
          </Box>
        )}
      </Box>
    </ThemeProvider>
  );
}

export default App;
