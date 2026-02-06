import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import { viteStaticCopy } from 'vite-plugin-static-copy'

// 由環境變數決定要複製的資料夾（與 generate-manifest.js 一致）
const DATA_FOLDERS = (process.env.DATA_FOLDERS || 'brain,memory,todos')
  .split(',')
  .map((s: string) => s.trim())
  .filter(Boolean)

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    viteStaticCopy({
      targets: DATA_FOLDERS.map(folder => ({
        src: `${folder}/**/*`,
        dest: folder
      }))
    })
  ],
  // 將 DATA_FOLDERS 注入前端，供 useBrainData 決定要請求哪些 manifest
  define: {
    'import.meta.env.VITE_DATA_FOLDERS': JSON.stringify(process.env.DATA_FOLDERS || 'brain,memory,todos')
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['tests/setup.ts'],
    include: ['tests/**/*.test.ts', 'tests/**/*.test.tsx']
  }
})
