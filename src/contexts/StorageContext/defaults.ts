import { Settings, TraceparentConfig } from "./types";

export const DEFAULT_SIGNADOT_PREVIEW_URL = "https://browser-extension-auth-redirect.preview.signadot.com";
export const DEFAULT_SIGNADOT_DASHBOARD_URL = "https://app.signadot.com";
export const DEFAULT_SIGNADOT_API_URL = "https://api.signadot.com";
export const DEFAULT_TRACEPARENT_VALUE = "00-abcdef0123456789-abcdef01-00";

export const defaultSettings: Settings = {
  debugMode: false,
  enabled: false,
  signadotUrls: {
    apiUrl: DEFAULT_SIGNADOT_API_URL,
    previewUrl: DEFAULT_SIGNADOT_PREVIEW_URL,
    dashboardUrl: DEFAULT_SIGNADOT_DASHBOARD_URL,
  },
};

export const defaultTraceparent: TraceparentConfig = {
  inject: false,
  value: DEFAULT_TRACEPARENT_VALUE,
};
