/**
 * 解析 DATA_FOLDERS 字串為陣列（與 generate-manifest.js、vite 建置一致）
 * 更新時間：2026-02-06
 * 更新摘要：抽出可測試之純函數，供 useBrainData 與測試使用
 */

/**
 * 將逗號分隔的資料夾字串解析為 trim 後的非空陣列。
 * @param raw - 例如 "brain,memory,todos" 或 " brain , memory "
 * @returns 例如 ["brain", "memory", "todos"]
 */
export function parseDataFolders(raw: string): string[] {
    if (typeof raw !== 'string') return [];
    return raw
        .split(',')
        .map(s => s.trim())
        .filter(Boolean);
}
