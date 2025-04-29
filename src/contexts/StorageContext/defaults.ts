import { Settings, TraceparentConfig } from "./types";

// Production environment URLs
export const PROD_SIGNADOT_PREVIEW_URL = "https://browser-extension-auth-redirect.preview.signadot.com";
export const PROD_SIGNADOT_DASHBOARD_URL = "https://app.signadot.com";
export const PROD_SIGNADOT_API_URL = "https://api.signadot.com";

// Staging environment URLs
export const STAGING_SIGNADOT_PREVIEW_URL = "https://browser-extension-auth-redirect.preview.staging.signadot.com";
export const STAGING_SIGNADOT_DASHBOARD_URL = "https://app.staging.signadot.com";
export const STAGING_SIGNADOT_API_URL = "https://api.staging.signadot.com";

// Default URLs (using production)
export const DEFAULT_SIGNADOT_PREVIEW_URL = PROD_SIGNADOT_PREVIEW_URL;
export const DEFAULT_SIGNADOT_DASHBOARD_URL = PROD_SIGNADOT_DASHBOARD_URL;
export const DEFAULT_SIGNADOT_API_URL = PROD_SIGNADOT_API_URL;

export const DEFAULT_TRACEPARENT_VALUE = "00-0af7651916cd43dd8448eb211c80319c-b7ad6b7169203331-01";

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
