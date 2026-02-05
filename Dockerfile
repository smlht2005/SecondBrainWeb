# Dockerfile for Second Brain Web
# 更新時間：2026-02-05 18:40
# 更新者：AI Assistant
# 更新摘要：更新 Dockerfile 包含驗證資料（brain/ 和 memory/）

FROM node:23-alpine AS builder

WORKDIR /app

# 複製依賴文件
COPY package*.json ./
# 建置階段需要 devDependencies（vite, typescript 等）
RUN npm ci

# 複製源碼（包含驗證資料 brain/ 和 memory/）
COPY . .

# 建置前後端
RUN npm run build

# 生產環境映像
FROM node:23-alpine

WORKDIR /app

# 複製建置產物和依賴
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/dist-server ./dist-server
COPY --from=builder /app/package*.json ./

# 複製驗證資料（用於功能驗證）
COPY --from=builder /app/brain ./brain
COPY --from=builder /app/memory ./memory

# 建立資料目錄（可掛載 Volume，用於額外的生產資料）
RUN mkdir -p /home/node/.openclaw/workspace/brain /home/node/.openclaw/workspace/memory

# 暴露端口
EXPOSE 3000

# 啟動伺服器
CMD ["npm", "start"]
