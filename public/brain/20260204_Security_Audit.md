# OpenClaw & SecondBrainWeb 安全性審計報告

**日期**: 2026-02-04
**類型**: 安全審計 (Security Audit)
**標籤**: #Security #Zeabur #OpenClaw #Vulnerability

## 🔍 1. 已發現的安全漏洞 (Vulnerabilities Found)

### A. [中風險] 敏感資訊洩漏 (Information Disclosure)
*   **位置**: `SecondBrainWeb` 的 `/api/debug/paths` 路由。
*   **問題**: 該 API 會回傳伺服器的內部絕對路徑 (如 `/home/node/.openclaw/...`)、環境變數狀態等。
*   **風險**: 駭客可利用此資訊規劃進一步攻擊 (如 LFI, Path Traversal)。
*   **建議行動**: 移除此除錯用路由，或限制僅能由特定來源存取。

### B. [低風險] CORS 設定過於寬鬆
*   **位置**: `SecondBrainWeb/server/index.ts`
*   **問題**: 使用 `app.use(cors())` 允許所有來源 (Wildcard `*`)。
*   **風險**: 惡意網站可透過瀏覽器呼叫 API。
*   **建議行動**: 限制 CORS Origin 為自身網域 (`https://clawbrain.zeabur.app`)。

---

## 🛡️ 2. OpenClaw (Port 18789) 防護狀態

### A. 網路層 (Network Layer)
*   **狀態**: 🟢 **安全 (外部不可見)**
*   **檢測**: Port 18789 雖然在容器內監聽 (`0.0.0.0:18789`)，但 Zeabur 平台的防火牆預設未開放此 Port 的 Public Access。
*   **驗證**: 外部 Port Scanner 顯示為 "Closed"。

### B. 應用層 (Application Layer)
*   **防護**: 🟢 **強固 (Token Auth)**
*   **機制**: 所有對 Gateway API 的請求皆需攜帶 `GATEWAY_TOKEN`。
*   **Token**: `5Wm0jVT...` (儲存於環境變數 `OPENCLAW_GATEWAY_TOKEN`)。
*   **結論**: 即使網路層被突破，無 Token 攻擊者仍無法控制系統。

---

## 📝 3. 攻擊面盤點 (Attack Surface)

| 服務 | Port | 對外狀態 | 控制權驗證 | 風險等級 |
| :--- | :--- | :--- | :--- | :--- |
| **OpenClaw Gateway** | `18789` | **關閉** (Blocked) | `GATEWAY_TOKEN` | 🟢 安全 |
| **SecondBrainWeb** | `80/443` | **開放** (HTTPS) | 無 (公開唯讀) | 🟡 中 (上述漏洞) |
| **SSH (System)** | `22` | **關閉** | N/A | 🟢 安全 |

## 🚀 待執行修復計畫
1.  移除 `server/index.ts` 中的 `/api/debug/paths`。
2.  修改 CORS 設定，鎖定 Origin。
