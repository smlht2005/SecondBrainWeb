import React, { useState } from 'react';
import { 
  Box, CssBaseline, ThemeProvider, AppBar, Toolbar, Typography, 
  Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText, 
  Container, Paper, InputBase, IconButton, Chip, Stack
} from '@mui/material';
import { 
  Search as SearchIcon, 
  Code as CodeIcon, 
  CloudQueue as CloudIcon, 
  TrendingUp as InvestmentIcon, 
  Person as GrowthIcon,
  MenuBook as BookIcon,
  History as HistoryIcon
} from '@mui/icons-material';
import ReactMarkdown from 'react-markdown';
import { theme } from './theme/theme';

const drawerWidth = 280;

function App() {
  const [selectedFile, setSelectedFile] = useState('Coding & Tech');

  const categories = [
    { name: 'Coding & Tech', icon: <CodeIcon />, color: '#00e5ff' },
    { name: 'Cloud & Network', icon: <CloudIcon />, color: '#76ff03' },
    { name: 'Self Growth', icon: <GrowthIcon />, color: '#ff4081' },
    { name: 'Investment', icon: <InvestmentIcon />, color: '#ffab00' },
  ];

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
        <CssBaseline />
        
        {/* Header */}
        <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1, bgcolor: 'background.paper', backgroundImage: 'none' }}>
          <Toolbar>
            <BookIcon sx={{ mr: 2, color: 'primary.main' }} />
            <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1, fontWeight: 700, letterSpacing: 1 }}>
              SECOND BRAIN <Typography component="span" sx={{ color: 'primary.main', fontWeight: 400 }}>WEB</Typography>
            </Typography>
            
            <Box sx={{ position: 'relative', borderRadius: 2, bgcolor: 'rgba(255,255,255,0.05)', ml: 3, width: '400px', display: 'flex', alignItems: 'center', px: 2 }}>
              <SearchIcon sx={{ color: 'gray', mr: 1 }} />
              <InputBase placeholder="搜尋知識庫或對話紀錄..." sx={{ color: 'white', width: '100%' }} />
            </Box>
          </Toolbar>
        </AppBar>

        {/* Sidebar */}
        <Drawer
          variant="permanent"
          sx={{
            width: drawerWidth,
            flexShrink: 0,
            [`& .MuiDrawer-paper`]: { width: drawerWidth, boxSizing: 'border-box', bgcolor: 'background.paper', borderRight: '1px solid rgba(255,255,255,0.1)' },
          }}
        >
          <Toolbar />
          <Box sx={{ overflow: 'auto', p: 2 }}>
            <Typography variant="overline" sx={{ px: 2, color: 'gray', fontWeight: 700 }}>知識分類</Typography>
            <List>
              {categories.map((cat) => (
                <ListItem key={cat.name} disablePadding>
                  <ListItemButton 
                    selected={selectedFile === cat.name}
                    onClick={() => setSelectedFile(cat.name)}
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
        </Drawer>

        {/* Main Content */}
        <Box component="main" sx={{ flexGrow: 1, p: 3, display: 'flex', flexDirection: 'column' }}>
          <Toolbar />
          <Container maxWidth="lg">
            <Stack direction="row" spacing={1} sx={{ mb: 3 }}>
              <Chip label="#Insight" color="primary" variant="outlined" size="small" />
              <Chip label="#Rule" color="secondary" variant="outlined" size="small" />
              <Chip label="#HIS" variant="outlined" size="small" />
            </Stack>
            
            <Paper sx={{ p: 4, borderRadius: 3, minHeight: '70vh', boxShadow: '0 8px 32px rgba(0,0,0,0.2)' }}>
              <Typography variant="h4" gutterBottom sx={{ fontWeight: 700, color: 'primary.main' }}>
                {selectedFile}
              </Typography>
              <Box sx={{ mt: 4, color: 'rgba(255,255,255,0.8)', lineHeight: 1.8 }}>
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
          </Container>
        </Box>

        {/* Right InfoBar (Quick Stats) */}
        <Box sx={{ width: 300, p: 3, borderLeft: '1px solid rgba(255,255,255,0.1)', display: { xs: 'none', lg: 'block' } }}>
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
      </Box>
    </ThemeProvider>
  );
}

export default App;
