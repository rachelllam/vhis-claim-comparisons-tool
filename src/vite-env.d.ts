/// <reference types="vite/client" />

interface ImportMetaEnv {
  // Optional override for the operation-data endpoint (defaults to the Drop URL in data.ts).
  readonly VITE_OPERATIONS_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
