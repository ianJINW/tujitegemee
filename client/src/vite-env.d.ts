/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_APP_LOGINURL: string;
  readonly VITE_APP_LOGOUTURL: string;
  readonly VITE_APP_REGISTERURL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
