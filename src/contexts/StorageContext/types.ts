export type SignadotUrlsConfig = {
  apiUrl: string | undefined;
  previewUrl: string | undefined;
  dashboardUrl: string | undefined;
};

export type TraceparentConfig = {
  inject: boolean;
  value: string;
};

export type Settings = {
  debugMode: boolean;
  enabled: boolean;
  signadotUrls: SignadotUrlsConfig;
};

export type StorageState = {
  isAuthenticated: boolean;
  settings: Settings;
  traceparent: TraceparentConfig;
  headers: Header[];
  currentRoutingKey: string | undefined;
};

export type Header = {
  key: string;
  value: string;
  kind: "default" | "extra";
};

export type StorageContextType = {
  init: boolean;
  isAuthenticated: boolean;
  settings: Settings;
  traceparent: TraceparentConfig;
  headers: Header[];
  currentRoutingKey: string | undefined;
  setIsAuthenticated: (value: boolean) => void;
  setCurrentRoutingKey: (value: string | undefined) => void;
  setTraceparent: (inject: boolean, value: undefined | string) => void;
  setSettings: (value: Settings) => void;
  setHeaders: (value: Header[]) => void;
};
