import { useState, useEffect } from 'react';
import { Box, CssBaseline, ThemeProvider, Drawer, useMediaQuery, CircularProgress } from '@mui/material';
import { theme } from './theme/theme';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { MainContent } from './components/MainContent';
import { useBrainData } from './hooks/useBrainData';
import type { SelectedItem } from './types';

const drawerWidth = 280;

function App() {
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<SelectedItem | null>(null);
  const [content, setContent] = useState('');
  
  const { files, logs, todos, loading, fetchContent } = useBrainData();

  const handleSelect = async (item: SelectedItem) => {
    setSelectedItem(item);
    setContent('讀取中...');
    if (isMobile) setMobileOpen(false);
    const data = await fetchContent(item.type, item.fileName);
    setContent(data);
  };

  useEffect(() => {
    if (!selectedItem && files.length > 0) {
      handleSelect({ name: files[0].name, fileName: files[0].fileName, type: 'brain' });
    }
  }, [files]);

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
        <CssBaseline />
        
        <Header isMobile={isMobile} onMenuClick={() => setMobileOpen(true)} />

        <Box component="nav" sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}>
          <Drawer
            variant={isMobile ? "temporary" : "permanent"}
            open={isMobile ? mobileOpen : true}
            onClose={() => setMobileOpen(false)}
            ModalProps={{ keepMounted: true }}
            sx={{
              '& .MuiDrawer-paper': { 
                boxSizing: 'border-box', 
                width: drawerWidth, 
                bgcolor: 'background.paper', 
                borderRight: isMobile ? 'none' : '1px solid rgba(255,255,255,0.1)' 
              },
            }}
          >
            <Sidebar
                files={files}
                logs={logs}
                todos={todos}
                selectedItem={selectedItem}
                onSelect={handleSelect}
            />
          </Drawer>
        </Box>

        <Box sx={{ flexGrow: 1, width: { xs: '100%', md: `calc(100% - ${drawerWidth}px)` } }}>
          {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <CircularProgress />
              </Box>
          ) : (
              <MainContent selectedItem={selectedItem} content={content} />
          )}
        </Box>
      </Box>
    </ThemeProvider>
  );
}

export default App;
