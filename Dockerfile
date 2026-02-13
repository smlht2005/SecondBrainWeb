FROM node:20-slim AS builder
WORKDIR /app
COPY package*.json pnpm-lock.yaml* ./
RUN npm install -g pnpm && pnpm install
COPY . .
RUN pnpm run build

FROM node:20-slim
WORKDIR /app
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/dist-server ./dist-server
COPY --from=builder /app/brain ./brain
COPY --from=builder /app/memory ./memory
COPY --from=builder /app/todos ./todos
COPY --from=builder /app/review ./review
COPY --from=builder /app/done ./done

EXPOSE 3000
ENV NODE_ENV=production
CMD ["node", "dist-server/index.js"]
