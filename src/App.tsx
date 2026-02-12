import { useState, useEffect } from 'react';
import { Box, CssBaseline, ThemeProvider, Drawer, useMediaQuery, CircularProgress, Button, Stack } from '@mui/material';
import { theme } from './theme/theme';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { MainContent } from './components/MainContent';
import { useBrainData } from './hooks/useBrainData';
import { RateReview as ReviewIcon, TaskAlt as DoneIcon, Replay as ResetIcon } from '@mui/icons-material';

const drawerWidth = 280;

function App() {
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<{ name: string, fileName: string, type: string } | null>(null);
  const [content, setContent] = useState('');
  
  const { files, logs, todos, review, done, loading, fetchContent, moveNote } = useBrainData();

  const handleSelect = async (item: { name: string, fileName: string, type: string }) => {
    setSelectedItem(item);
    setContent('讀取中...');
    if (isMobile) setMobileOpen(false);
    const data = await fetchContent(item.type, item.fileName);
    setContent(data);
  };

  const handleMove = async (target: string) => {
    if (!selectedItem) return;
    const sourceId = `${selectedItem.type}/${selectedItem.fileName}`;
    const success = await moveNote(sourceId, target);
    if (success) {
      setSelectedItem(null);
      setContent('項目已移動。');
    }
  };

  useEffect(() => {
    if (!selectedItem && files.length > 0) {
      handleSelect({ name: files[0].title, fileName: files[0].id.split('/').pop() || '', type: 'brain' });
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
                review={review}
                done={done}
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
              <Box sx={{ position: 'relative', height: '100%' }}>
                <MainContent selectedItem={selectedItem} content={content} />
                
                {/* 工作流操作按鈕 */}
                {selectedItem && (selectedItem.type === 'todos' || selectedItem.type === 'review' || selectedItem.type === 'done') && (
                  <Box sx={{ position: 'fixed', bottom: 24, right: 24, zIndex: 1000 }}>
                    <Stack direction="row" spacing={2}>
                      {selectedItem.type === 'todos' && (
                        <Button 
                          variant="contained" 
                          color="primary" 
                          startIcon={<ReviewIcon />}
                          onClick={() => handleMove('review')}
                          sx={{ borderRadius: 4, px: 3, boxShadow: 10 }}
                        >
                          送至審核 (Review)
                        </Button>
                      )}
                      {selectedItem.type === 'review' && (
                        <>
                          <Button 
                            variant="outlined" 
                            color="inherit" 
                            startIcon={<ResetIcon />}
                            onClick={() => handleMove('todos')}
                            sx={{ borderRadius: 4, px: 3, bgcolor: 'background.paper' }}
                          >
                            退回待辦
                          </Button>
                          <Button 
                            variant="contained" 
                            color="success" 
                            startIcon={<DoneIcon />}
                            onClick={() => handleMove('done')}
                            sx={{ borderRadius: 4, px: 3, boxShadow: 10 }}
                          >
                            完成任務 (Done)
                          </Button>
                        </>
                      )}
                      {selectedItem.type === 'done' && (
                        <Button 
                          variant="outlined" 
                          color="warning" 
                          startIcon={<ResetIcon />}
                          onClick={() => handleMove('review')}
                          sx={{ borderRadius: 4, px: 3, bgcolor: 'background.paper' }}
                        >
                          重啟審核
                        </Button>
                      )}
                    </Stack>
                  </Box>
                )}
              </Box>
          )}
        </Box>
      </Box>
    </ThemeProvider>
  );
}

export default App;
