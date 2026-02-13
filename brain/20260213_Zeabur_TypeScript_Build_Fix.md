# Zeabur 部署與 TypeScript 編譯修復經驗 (2026-02-13)

## 1. 問題背景
在將 `SecondBrainWeb` 部署至 Zeabur 時，`npm run build` 階段失敗。雖然本地運行（dev mode）正常，但生產環境編譯（TSC）對型別檢查更為嚴格，揭露了隱藏的型別不匹配問題。

## 2. 核心錯誤與修復方案

### A. 型別導向語法 (verbatimModuleSyntax)
*   **錯誤日誌**：`'Note' is a type and must be imported using a type-only import when 'verbatimModuleSyntax' is enabled.`
*   **原因**：`tsconfig.json` 設定了嚴格的模組語法規範，要求純型別的導入必須明確標註。
*   **解決方法**：將導入語句修改為 `import type`。
    ```typescript
    import type { Note } from '../api/client';
    ```

### B. Union Type 嚴格賦值
*   **錯誤日誌**：`Type 'string' is not assignable to type '"todos" | "brain" | "memory"'...`
*   **原因**：當物件屬性被定義為特定的 Union Type 時，直接賦予一般字串會被判定為不安全，因為 `string` 可能包含這三者之外的值。
*   **解決方法**：使用 `as const` 或明確的型別斷言。
    ```typescript
    type: "todos" as const,
    ```

### C. 缺失的型別宣告 (@types)
*   **錯誤日誌**：`Could not find a declaration file for module 'react-syntax-highlighter'...`
*   **原因**：部分套件本身不包含型別檔，且未在 `devDependencies` 中安裝對應的 `@types` 依賴。
*   **解決方法**：手動安裝必要的型別定義：
    ```bash
    pnpm add -D @types/react-syntax-highlighter @types/react-dom
    ```

### D. 未使用的變數 (Unused Variables)
*   **錯誤日誌**：`'allFolders' is declared but its value is never read.`
*   **原因**：啟用了 `noUnusedLocals` 檢查。
*   **解決方法**：移除未使用的變數或使用 `_` 前綴。

## 3. 部署最佳實務
*   **預檢指令**：在 Push 代碼前，務必在本地執行 `npm run build` 或 `pnpm run build`。
*   **依賴一致性**：若專案中混用不同套件管理工具（npm/pnpm），可能導致依賴解析異常。本次修復改用 `pnpm` 重新構建 `node_modules` 以確保一致性。
*   **型別先行**：在定義組件 Props 時，優先引用集中管理的 `types/index.ts`，避免重複定義導致的型別不一致。

---
**分類**：#Coding #TypeScript #Zeabur #DevOps
**建立時間**：2026-02-13 06:58 (UTC)
