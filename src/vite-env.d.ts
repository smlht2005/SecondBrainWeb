/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL?: string;
  /** 靜態資料夾列表，逗號分隔，例如 brain,memory,todos。建置時由 vite.config 注入。 */
  readonly VITE_DATA_FOLDERS?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
