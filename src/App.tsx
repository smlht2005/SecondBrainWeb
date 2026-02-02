import React, { useState, useEffect } from 'react';
import { 
  Box, CssBaseline, ThemeProvider, AppBar, Toolbar, Typography, 
  Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText, 
  Container, Paper, InputBase, IconButton, Chip, Stack, useMediaQuery, CircularProgress
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
  Assessment as AssessmentIcon,
  Description as FileIcon
} from '@mui/icons-material';
import ReactMarkdown from 'react-markdown';
import { theme } from './theme/theme';

const drawerWidth = 280;

interface BrainFile {
    name: string;
    fileName: string;
}

interface LogEntry {
    date: string;
    fileName: string;
}

function App() {
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<BrainFile | null>(null);
  const [content, setContent] = useState('');
  const [files, setFiles] = useState<BrainFile[]>([]);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const API_BASE = window.location.hostname === 'localhost' ? 'http://localhost:3000/api' : '/api';

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [filesRes, logsRes] = await Promise.all([
          fetch(`${API_BASE}/brain/files`),
          fetch(`${API_BASE}/memory/logs`)
        ]);
        const filesData = await filesRes.json();
        const logsData = await logsRes.json();
        setFiles(filesData);
        setLogs(logsData);
        if (filesData.length > 0) {
            handleSelectFile(filesData[0]);
        }
      } catch (e) {
        console.error("Fetch error", e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleSelectFile = async (file: BrainFile) => {
    setSelectedFile(file);
    setContent('讀取中...');
    if (isMobile) setMobileOpen(false);
    try {
        const res = await fetch(`${API_BASE}/brain/content/${file.fileName}`);
        const data = await res.json();
        setContent(data.content);
    } catch (e) {
        setContent('讀取失敗');
    }
  };

  const handleSelectLog = async (log: LogEntry) => {
    setSelectedFile({ name: `日誌: ${log.date}`, fileName: log.fileName });
    setContent('讀取中...');
    if (isMobile) setMobileOpen(false);
    try {
        // 日誌存放在另一個目錄，後端需要支援。暫時透過 API 路由處理。
        const res = await fetch(`${API_BASE}/brain/content/../memory/${log.fileName}`); // 注意：這需要後端路徑安全處理，僅供 MVP 測試
        const data = await res.json();
        setContent(data.content);
    } catch (e) {
        setContent('讀取失敗');
    }
  };

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const getIcon = (name: string) => {
    if (name.includes('Coding')) return <CodeIcon />;
    if (name.includes('Cloud')) return <CloudIcon />;
    if (name.includes('Growth')) return <GrowthIcon />;
    if (name.includes('Investment')) return <InvestmentIcon />;
    return <FileIcon />;
  };

  const drawerContent = (
    <Box sx={{ p: 2 }}>
      <Toolbar />
      <Typography variant="overline" sx={{ px: 2, color: 'gray', fontWeight: 700 }}>知識分類</Typography>
      <List>
        {files.map((file) => (
          <ListItem key={file.fileName} disablePadding>
            <ListItemButton 
              selected={selectedFile?.fileName === file.fileName}
              onClick={() => handleSelectFile(file)}
              sx={{ borderRadius: 2, mb: 1, '&.Mui-selected': { bgcolor: 'rgba(0, 229, 255, 0.1)' } }}
            >
              <ListItemIcon sx={{ color: selectedFile?.fileName === file.fileName ? 'primary.main' : 'inherit' }}>
                {getIcon(file.name)}
              </ListItemIcon>
              <ListItemText primary={file.name} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      
      <Typography variant="overline" sx={{ px: 2, color: 'gray', mt: 4, display: 'block', fontWeight: 700 }}>最近對話</Typography>
      <List>
        {logs.map((log) => (
          <ListItem key={log.fileName} disablePadding>
            <ListItemButton 
                selected={selectedFile?.fileName === log.fileName}
                onClick={() => handleSelectLog(log)}
                sx={{ borderRadius: 2 }}
            >
              <ListItemIcon><HistoryIcon fontSize="small" /></ListItemIcon>
              <ListItemText primary={log.date} secondaryTypographyProps={{ noWrap: true, variant: 'caption' }} />
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
              position: 'relative', borderRadius: 2, bgcolor: 'rgba(255,255,255,0.05)', 
              ml: { xs: 1, sm: 3 }, flexGrow: { xs: 1, sm: 0 },
              width: { xs: 'auto', sm: '300px', md: '400px' }, display: 'flex', alignItems: 'center', px: { xs: 1, sm: 2 } 
            }}>
              <SearchIcon sx={{ color: 'gray', mr: 1, fontSize: '1.2rem' }} />
              <InputBase placeholder="搜尋..." sx={{ color: 'white', width: '100%', fontSize: '0.9rem' }} />
            </Box>
          </Toolbar>
        </AppBar>

        <Box component="nav" sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}>
          {isMobile ? (
            <Drawer
              variant="temporary" open={mobileOpen} onClose={handleDrawerToggle}
              ModalProps={{ keepMounted: true }}
              sx={{ display: { xs: 'block', md: 'none' }, '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth, bgcolor: 'background.paper' } }}
            >
              {drawerContent}
            </Drawer>
          ) : (
            <Drawer
              variant="permanent" open
              sx={{ display: { xs: 'none', md: 'block' }, '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth, bgcolor: 'background.paper', borderRight: '1px solid rgba(255,255,255,0.1)' } }}
            >
              {drawerContent}
            </Drawer>
          )}
        </Box>

        <Box component="main" sx={{ flexGrow: 1, p: { xs: 2, sm: 3 }, width: { xs: '100%', md: `calc(100% - ${drawerWidth}px)` } }}>
          <Toolbar />
          <Container maxWidth="lg" sx={{ px: { xs: 0, sm: 2 } }}>
            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}><CircularProgress /></Box>
            ) : (
                <>
                <Stack direction="row" spacing={1} sx={{ mb: 2, overflowX: 'auto', pb: 1 }}>
                    <Chip label="#Insight" color="primary" variant="outlined" size="small" />
                    <Chip label="#Rule" color="secondary" variant="outlined" size="small" />
                    <Chip label="#HIS" variant="outlined" size="small" />
                </Stack>
                
                <Paper sx={{ p: { xs: 2, sm: 4 }, borderRadius: { xs: 2, sm: 3 }, minHeight: '70vh', boxShadow: '0 8px 32px rgba(0,0,0,0.2)' }}>
                    <Typography variant="h4" gutterBottom sx={{ fontWeight: 700, color: 'primary.main', fontSize: { xs: '1.5rem', sm: '2.125rem' } }}>
                    {selectedFile?.name || '請選擇檔案'}
                    </Typography>
                    <Box sx={{ mt: 3, color: 'rgba(255,255,255,0.8)', lineHeight: 1.6, '& pre': { overflowX: 'auto', bgcolor: 'rgba(0,0,0,0.2)', p: 2, borderRadius: 1 } }}>
                    <ReactMarkdown>{content}</ReactMarkdown>
                    </Box>
                </Paper>
                </>
            )}
          </Container>
        </Box>
      </Box>
    </ThemeProvider>
  );
}

export default App;
