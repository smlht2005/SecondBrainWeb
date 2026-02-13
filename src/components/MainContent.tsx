import React from 'react';
import { Box, Toolbar, Container, Stack, Chip, Paper, Typography, IconButton, Tooltip } from '@mui/material';
import { Download as DownloadIcon } from '@mui/icons-material';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import type { SelectedItem } from '../types';

interface MainContentProps {
    selectedItem: SelectedItem | null;
    content: string;
}

export const MainContent: React.FC<MainContentProps> = ({ selectedItem, content }) => {
    const handleDownload = () => {
        if (!selectedItem || !content) return;
        // 加入 UTF-8 BOM (\uFEFF) 確保 Windows 記事本等軟體能正確識別中文編碼
        const blob = new Blob(['\uFEFF', content], { type: 'text/markdown;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = selectedItem.fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    return (
        <Box component="main" sx={{ flexGrow: 1, p: { xs: 2, sm: 3 }, width: '100%' }}>
            <Toolbar />
            <Container maxWidth="lg" sx={{ px: { xs: 0, sm: 2 } }}>
                <Stack direction="row" spacing={1} sx={{ mb: 2, overflowX: 'auto', pb: 1, '&::-webkit-scrollbar': { display: 'none' } }}>
                    <Chip label="#Insight" color="primary" variant="outlined" size="small" />
                    <Chip label="#Rule" color="secondary" variant="outlined" size="small" />
                    <Chip label="#HIS" variant="outlined" size="small" />
                    <Chip label="#Refactored" color="success" variant="outlined" size="small" />
                    <Chip label="#SyntaxHighlight" color="info" variant="outlined" size="small" />
                </Stack>

                <Paper sx={{ p: { xs: 2, sm: 4 }, borderRadius: { xs: 2, sm: 3 }, minHeight: '70vh', boxShadow: '0 8px 32px rgba(0,0,0,0.2)' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <Typography variant="h4" gutterBottom sx={{ fontWeight: 700, color: 'primary.main', fontSize: { xs: '1.5rem', sm: '2.125rem' } }}>
                            {selectedItem?.name || '請選擇檔案'}
                        </Typography>
                        {selectedItem && (
                            <Tooltip title="下載 Markdown 檔案">
                                <IconButton onClick={handleDownload} color="primary" sx={{ mt: -1 }}>
                                    <DownloadIcon />
                                </IconButton>
                            </Tooltip>
                        )}
                    </Box>
                    <Box sx={{ 
                        mt: 3, color: 'rgba(255,255,255,0.8)', lineHeight: 1.6, 
                        '& blockquote': { borderLeft: '4px solid #00e5ff', pl: 2, ml: 0, bgcolor: 'rgba(0, 229, 255, 0.05)', py: 1 },
                        '& code': { bgcolor: 'rgba(255,255,255,0.1)', px: 0.5, borderRadius: 0.5, fontFamily: 'monospace' }
                    }}>
                        <ReactMarkdown
                            components={{
                                code({ node, inline, className, children, ...props }: any) {
                                    const match = /language-(\w+)/.exec(className || '');
                                    return !inline && match ? (
                                        <SyntaxHighlighter
                                            style={vscDarkPlus as any}
                                            language={match[1]}
                                            PreTag="div"
                                            {...props}
                                        >
                                            {String(children).replace(/\n$/, '')}
                                        </SyntaxHighlighter>
                                    ) : (
                                        <code className={className} {...props}>
                                            {children}
                                        </code>
                                    );
                                }
                            }}
                        >
                            {content}
                        </ReactMarkdown>
                    </Box>
                </Paper>
            </Container>
        </Box>
    );
};
