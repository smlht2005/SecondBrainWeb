# Zeabur 容器生命週期與持久化陷阱：以 GitHub CLI 為例

**日期**: 2026-02-04
**標籤**: #DevOps #Zeabur #Troubleshooting #Linux

## 📝 發生背景
在將 Zeabur 服務方案從 **Free** 升級至 **Developer** 版，或手動重啟服務 (Restart/Redeploy) 後，發現原本可以正常使用的 `gh` (GitHub CLI) 指令失效，出現 `command not found` 錯誤。

## 🔍 原因分析
這是容器化 (Containerization) 環境的標準特性，特別是在 PaaS (如 Zeabur, Heroku, Render) 平台上的運作機制：

1.  **短暫的系統層 (Ephemeral System Layer)**:
    *   容器內的 `/usr`, `/bin`, `/etc` 等系統目錄是**暫時的**。
    *   當服務重啟、部署或升級方案時，Zeabur 會銷毀舊容器，並基於原始 Image 啟動一個全新的乾淨容器。
    *   **結果**: 我們先前透過 `apt-get` 手動安裝的工具 (如 `gh`, `vim`, `curl` 更新) 都會**隨之消失**。

2.  **持久的數據層 (Persistent Volume)**:
    *   我們在 Zeabur 掛載了 Volume (ID: `data`) 到 `/home/node/.openclaw/workspace`。
    *   **結果**: 存放在此路徑下的專案代碼、Git 設定 (`.gitconfig`)、OpenClaw 記憶 (`MEMORY.md`) 都能**完美保存**。

## 💡 解決方案與驗證
本次案例中，雖然 `gh` 工具消失了，但因為 Git 憑證 (Credentials) 儲存在持久化的 Volume 中，修復過程非常快速：

1.  **重新安裝工具**: 在新容器中再次執行 `apt install gh`。
2.  **直接使用**: 由於 `.gitconfig` 和憑證未遺失，安裝完 `gh` 後**無須重新登入**，直接即可執行 `git push`。

## 🚀 最佳實踐 (Best Practices)
*   **認知**: 任何「非 Volume 路徑」的修改（安裝軟體、修改系統設定）在重啟後都會還原。
*   **自動化 (進階)**: 若特定工具是必須的，建議在專案的 `Dockerfile` 中宣告安裝，或使用啟動腳本 (Start Script) 自動檢測並安裝，確保每次部署都有完整環境。
