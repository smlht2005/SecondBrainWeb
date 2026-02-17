# 🦞 OpenClaw Workspace

> 濤哥的 OpenClaw 工作環境

---

## 📁 專案結構

```
/home/node/.openclaw/workspace/
├── AGENTS.md          # AI 行為準則
├── SOUL.md            # AI 人格設定
├── USER.md            # 使用者資訊
├── IDENTITY.md        # AI 身份設定
├── MEMORY.md          # 長期記憶
├── ruler.md           # 格式規範
├── kanban.md          # 任務看板
├── HEARTBEAT.md       # 心跳檢查清單
│
├── skills/            # 技能模組
│   └── pending-to-backlog/   # Pending 任務移至 Backlog
│
├── backlog/           # Pending 任務存放
├── memory/            # 每日工作日誌
├── todos/             # 任務清單
├── review/            # 待審查項目
└── archive/           # 已完成任務
```

---

## ⚡ 常用指令

### Scrum 看板
```bash
python scrum.py board          # 查看看板
python scrum.py add "標題"      # 新增任務
python scrum.py move T001 todo # 移動任務
```

### Pending to Backlog
```bash
python skills/pending-to-backlog/pending_to_backlog.py T001
```

### Git 操作
```bash
git add -A && git commit -m "feat: 描述" && git push
```

---

## 📊 Sprint 狀態

查看 `kanban.md` 或執行 `python scrum.py board`

---

## 📝 格式規範

詳見 `ruler.md`

---

*最後更新: 2026-02-17*
