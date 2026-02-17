# 📐 Ruler - 格式規範

> OpenClaw 工作區格式規範與標準作業流程

---

## ⏰ 時區規範

**所有時間必須使用台北時間 (UTC+8)**
```
格式: YYYY-MM-DD HH:MM (台北)
例如: 2026-02-17 14:00 (台北)
```

---

## 📝 報告格式

### Scrum 報告
```
### ✅ 今日完成
### 📋 待辦事項
### 💡 技術心得
### 📊 Token 使用量
```

### 不使用表格
- 優先使用 emoji 和列表
- 適合手機閱讀
- 數字使用千分位 (例: 53,350)

---

## 🎯 任務狀態

| 狀態 | 標記 | 說明 |
|------|------|------|
| Backlog | 📋 | 尚未開始 |
| Todo | 🟡 | 待處理 |
| In Progress | 🔄 | 進行中 |
| Review | 🔍 | 待檢視 |
| Done | ✅ | 已完成 |
| Pending | ⏸️ | 暫停/阻塞 |

---

## 🏷️ 優先級

| 等級 | 標記 | 意義 |
|------|------|------|
| P1 | 🔴 | 緊急重要 |
| P2 | 🟡 | 重要 |
| P3 | 🟢 | 普通 |
| P4 | ⚪ | 低優先級 |

---

## 📁 資料夾結構

```
/home/node/.openclaw/workspace/
├── backlog/          # Pending 任務存放
├── memory/           # 每日日誌
├── todos/            # 待辦任務
├── review/           # 待審查
├── archive/          # 已完成
├── skills/           # 技能模組
└── reports/          # 報告輸出
```

---

## ⚡ 常用指令

```bash
# Scrum
python scrum.py board

# Pending to Backlog
python skills/pending-to-backlog/pending_to_backlog.py T001
```

---

*最後更新: 2026-02-17*
