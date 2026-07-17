/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** 本番ビルド時の API ベース URL */
  readonly VITE_API_BASE_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
