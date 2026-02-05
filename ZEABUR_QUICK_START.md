# 🚀 Zeabur 部署快速開始

**5 分鐘部署指南** | 詳細文檔：[ZEABUR_DEPLOYMENT_GUIDE.md](ZEABUR_DEPLOYMENT_GUIDE.md)

---

## 📌 部署 URL

1. 訪問 [https://zeabur.com](https://zeabur.com)
2. 使用 GitHub 登入

---

## 🔧 配置步驟

### 1️⃣ 創建服務（30 秒）

```
Dashboard → New Project → Deploy New Service → Git
→ 選擇 smlht2005/SecondBrainWeb → main 分支 → Deploy
```

### 2️⃣ 環境變數（15 秒）

```
服務詳情 → Variables → Add Variable
```

| 變數 | 值 |
|------|-----|
| `NODE_ENV` | `production` |

### 3️⃣ Volume 配置（30 秒）

```
服務詳情 → Volumes → Add Volume
```

| 欄位 | 值 |
|------|-----|
| **Name** | `secondbrain-data` |
| **Mount Path** | `/home/node/.openclaw/workspace` |
| **Size** | `1 GB` |

### 4️⃣ 等待部署（2-4 分鐘）

```
服務詳情 → Logs → 觀察建置進度
```

---

## ✅ 驗證測試

### 獲取 URL

```
服務詳情 → Domain → 複製 URL
```

### 測試端點

```bash
# 替換為您的實際 URL
export APP_URL="https://your-app.zeabur.app"

# 健康檢查
curl $APP_URL/health

# API 測試
curl $APP_URL/api/brain/files

# 前端測試
# 在瀏覽器訪問 $APP_URL
```

---

## 📁 上傳初始資料（可選）

### 方法：Web 終端

```bash
# 在 Zeabur Dashboard → Terminal
cd /home/node/.openclaw/workspace
mkdir -p brain memory

# 建立歡迎文件
cat > brain/welcome.md << EOF
# 歡迎使用 Second Brain
這是您的知識管理系統。
EOF
```

---

## 🎯 檢查清單

部署完成後，確認：

- [ ] ✅ 健康檢查返回 `200 OK`
- [ ] ✅ 前端頁面正常載入
- [ ] ✅ CSS/JS 文件正確載入（無 MIME type 錯誤）
- [ ] ✅ Console 無 CORS 錯誤
- [ ] ✅ API 端點正常運作

---

## 🆘 遇到問題？

查看詳細文檔：[ZEABUR_DEPLOYMENT_GUIDE.md](ZEABUR_DEPLOYMENT_GUIDE.md)

常見問題：
- **靜態資源 404**: 確認建置成功
- **API 空陣列**: 正常（尚未上傳資料）
- **CORS 錯誤**: 確認 `NODE_ENV=production`

---

**更新時間**: 2026-02-05 18:30
