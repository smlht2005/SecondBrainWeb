/**
 * parseDataFolders 單元測試
 * 更新時間：2026-02-06
 * 更新摘要：驗證資料夾字串解析與 TEST_PLAN 案例一致
 */
import { describe, it, expect } from 'vitest';
import { parseDataFolders } from '../../src/utils/dataFolders';

describe('parseDataFolders', () => {
    it('default string returns brain, memory, todos', () => {
        expect(parseDataFolders('brain,memory,todos')).toEqual(['brain', 'memory', 'todos']);
    });

    it('trims whitespace around each segment', () => {
        expect(parseDataFolders(' brain , memory , todos ')).toEqual(['brain', 'memory', 'todos']);
    });

    it('empty string returns empty array', () => {
        expect(parseDataFolders('')).toEqual([]);
    });

    it('whitespace-only string returns empty array', () => {
        expect(parseDataFolders('   ,  ,  ')).toEqual([]);
    });

    it('DATA_FOLDERS=brain,memory returns only brain and memory', () => {
        expect(parseDataFolders('brain,memory')).toEqual(['brain', 'memory']);
    });

    it('single folder returns single element', () => {
        expect(parseDataFolders('todos')).toEqual(['todos']);
    });

    it('non-string input returns empty array', () => {
        expect(parseDataFolders(null as unknown as string)).toEqual([]);
        expect(parseDataFolders(undefined as unknown as string)).toEqual([]);
    });
});
