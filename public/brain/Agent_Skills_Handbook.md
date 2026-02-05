# Agent Skills 實戰手冊 (Based on 秋芝教程 & OpenClaw)

**核心概念**: Agent Skill 是 AI 的「手」，讓它能與外部世界互動（聯網、操作軟體、查詢數據），而不僅僅是說話。

## 🎯 第一章：什麼是 Skill？
Skill (技能) 本質上就是 **「API 的標準化封裝」**。
它告訴 AI 三件事：
1.  **我能做什麼？** (Description: "我可以查詢目前天氣")
2.  **我需要什麼參數？** (Input Schema: "需要 `location` (字串) 和 `unit` (攝氏/華氏)")
3.  **如何呼叫我？** (Execution: "打 `GET https://api.weather.com/...`")

## 🛠️ 第二章：Skill 的解剖學 (Structure)
一個標準的 Skill 通常包含兩個核心部分：

### 1. 介面定義 (Schema/Spec)
通常使用 JSON 或 YAML 格式 (OpenAPI/Swagger 標準)。
```json
{
  "name": "get_weather",
  "description": "取得指定城市的天氣資訊",
  "parameters": {
    "type": "object",
    "properties": {
      "city": { "type": "string", "description": "城市名稱，如 Taipei" }
    },
    "required": ["city"]
  }
}
```

### 2. 執行邏輯 (Implementation)
*   **No-Code 平台 (Coze/Dify)**: 填入 API URL 和 Key。
*   **Pro-Code (OpenClaw/LangChain)**: 撰寫一段 Python/JS 程式碼或 Shell Script。

## 🚀 第三章：實戰 - 打造你的第一個 Skill
**目標**: 做一個「股票查詢 Skill」

### Step 1: 尋找 API
*   目標: `https://mis.twse.com.tw/stock/api/getStockInfo.jsp?ex_ch=tse_2330.tw`
*   確認: 瀏覽器打開能看到 JSON 數據。

### Step 2: 定義輸入 (Prompting the Generator)
使用「技能生成器」 (或 ChatGPT/Gemini) 來寫 Schema。
**提示詞 (Prompt)**:
> "我有一個查詢台股的 API: `GET https://...`，參數是 `ex_ch` (例如 `tse_2330.tw`)。請幫我生成符合 OpenAI Function Calling 格式的 JSON Schema。"

### Step 3: 綁定與測試
1.  將生成的 JSON Schema 貼入 Agent 設定。
2.  在 Prompt 中告訴 Agent: "當使用者問股價時，請使用 `get_stock` 工具"。
3.  **測試**: 問它 "台積電現在多少錢？" -> 看它是否成功呼叫 API。

## 💡 第四章：進階技巧 (The "Qiuzhi" Way)
1.  **讓 AI 自己寫參數**: 不要在 Prompt 裡寫死 "2330"，而是讓 AI 根據使用者說 "台積電" 自動推論出 "2330"。
2.  **錯誤處理 (Self-Correction)**: 在 Skill 回傳錯誤時 (例如 "查無此股")，把錯誤訊息餵回給 AI，讓它自己嘗試修正 (例如改查 "2330.TW")。
3.  **串聯 (Workflow)**: Skill A (搜尋代碼) -> Skill B (查詢股價) -> Skill C (分析財報)。

## 🔮 OpenClaw 特有應用
在您的 OpenClaw 環境中，Skill 就是 `/app/skills/` 下的資料夾。
*   **定義**: `SKILL.md` (描述)
*   **執行**: 透過 `exec` 或 `web_fetch` 工具組合。
*   **範例**: 您現在已經有 `weather` 和 `github` skill 了！

---
*整理自秋芝視頻教程與實戰經驗*
