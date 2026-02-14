import { useState, useEffect } from 'react';
import { Box, CssBaseline, ThemeProvider, Drawer, useMediaQuery, CircularProgress, Button, Stack } from '@mui/material';
import { theme } from './theme/theme';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { MainContent } from './components/MainContent';
import { useBrainData } from './hooks/useBrainData';
import { 
  TaskAlt as DoneIcon, 
  DeleteOutline as DeleteIcon,
  ArrowBack as BackIcon,
  ArrowForward as ForwardIcon
} from '@mui/icons-material';
import type { SelectedItem } from './types';

const drawerWidth = 280;

// 定義工作流配置
const WORKFLOW_CONFIG: Record<string, { 
  prev?: SelectedItem['type'], 
  prevLabel?: string,
  next?: SelectedItem['type'],
  nextLabel?: string,
  showDelete?: boolean
}> = {
  'todos': {
    next: 'review',
    nextLabel: '送至審核',
    showDelete: true
  },
  'review': {
    prev: 'todos',
    prevLabel: '退回待辦',
    next: 'done',
    nextLabel: '完成任務'
  },
  'done': {
    prev: 'review',
    prevLabel: '重啟審核'
  }
};

function App() {
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<SelectedItem | null>(null);
  const [content, setContent] = useState('');
  
  const { files, logs, todos, review, done, allFolders, loading, fetchContent, moveNote, deleteNote, addFolder } = useBrainData();

  const handleSelect = async (item: SelectedItem) => {
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
                allFolders={allFolders}
                selectedItem={selectedItem}
                onSelect={handleSelect}
                onAddFolder={addFolder}
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
                
                {/* 工作流操作按鈕 (參數化配置) */}
                {selectedItem && WORKFLOW_CONFIG[selectedItem.type] && (
                  <Box sx={{ position: 'fixed', bottom: 24, right: 24, zIndex: 1000 }}>
                    <Stack direction="row" spacing={2}>
                      {/* 刪除按鈕 */}
                      {WORKFLOW_CONFIG[selectedItem.type].showDelete && (
                        <Button 
                          variant="outlined" 
                          color="error" 
                          startIcon={<DeleteIcon />}
                          onClick={() => deleteNote(`${selectedItem.type}/${selectedItem.fileName}`)}
                          sx={{ borderRadius: 4, px: 3, bgcolor: 'background.paper' }}
                        >
                          刪除待辦
                        </Button>
                      )}

                      {/* 返回前一步 */}
                      {WORKFLOW_CONFIG[selectedItem.type].prev && (
                        <Button 
                          variant="outlined" 
                          color="inherit" 
                          startIcon={<BackIcon />}
                          onClick={() => handleMove(WORKFLOW_CONFIG[selectedItem.type].prev!)}
                          sx={{ borderRadius: 4, px: 3, bgcolor: 'background.paper' }}
                        >
                          {WORKFLOW_CONFIG[selectedItem.type].prevLabel}
                        </Button>
                      )}

                      {/* 前進下一步 */}
                      {WORKFLOW_CONFIG[selectedItem.type].next && (
                        <Button 
                          variant="contained" 
                          color={selectedItem.type === 'review' ? 'success' : 'primary'} 
                          startIcon={selectedItem.type === 'review' ? <DoneIcon /> : <ForwardIcon />}
                          onClick={() => handleMove(WORKFLOW_CONFIG[selectedItem.type].next!)}
                          sx={{ borderRadius: 4, px: 3, boxShadow: 10 }}
                        >
                          {WORKFLOW_CONFIG[selectedItem.type].nextLabel}
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
