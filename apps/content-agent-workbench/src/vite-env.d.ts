/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_MODE?: "demo" | "cloud";
  readonly VITE_CLOUDBASE_ENV_ID?: string;
  readonly VITE_CLOUDBASE_FUNCTION_NAME?: string;
  readonly VITE_CLOUDBASE_ACCESS_KEY?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
