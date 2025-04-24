import React from "react";
import StorageChange = chrome.storage.StorageChange;
import { getHeaders, Header } from "../service-worker";

// Types for the storage structure
export type SignadotUrls = {
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
  signadotUrls: SignadotUrls;
};

// Chrome storage types
export type ChromeStorage = {
  headers: [string, string][];
  routingKey: string | undefined;
  traceparent: string | undefined;
  debugMode: boolean;
};

export type SignadotConfig = {
  apiUrl: string | undefined;
  previewUrl: string | undefined;
  dashboardUrl: string | undefined;
};

// React state types
export type StorageState = {
  isAuthenticated: boolean;
  settings: Settings;
  traceparent: TraceparentConfig;
  headers: Record<string, string>;
  routingKey: string | undefined;
};

const defaultSettings: Settings = {
  debugMode: false,
  signadotUrls: {
    apiUrl: undefined,
    previewUrl: undefined,
    dashboardUrl: undefined,
  },
};

const defaultTraceparent: TraceparentConfig = {
  inject: false,
  value: "",
};

const defaultState: StorageState = {
  isAuthenticated: false,
  settings: defaultSettings,
  traceparent: defaultTraceparent,
  headers: {},
  routingKey: undefined,
};

const setStorageValueFn = async <K extends keyof ChromeStorage>(
  key: K,
  value: ChromeStorage[K]
): Promise<void> => {
  await chrome.storage.local.set({ [key]: value });
}

const useStorage = () => {
  const [state, setState] = React.useState<StorageState>(defaultState);

  const setStorageValue = React.useCallback(async <K extends keyof ChromeStorage>(
    key: K,
    value: ChromeStorage[K]
  ): Promise<void> => {
    console.log("Setting storage value: ", key, value);

    if (value === undefined || value === null) {
      await chrome.storage.local.remove(key);
    } else {
      await chrome.storage.local.set({ [key]: value });
    }

    // Update local state based on chrome storage changes
    if (key === 'headers') {
      setState(prev => ({
        ...prev,
        headers: Object.fromEntries(value as [string, string][]),
      }));
    } else if (key === 'routingKey') {
      setState(prev => ({
        ...prev,
        routingKey: value as string | undefined,
      }));
    } else if (key === 'traceparent') {
      setState(prev => ({
        ...prev,
        traceparent: {
          ...prev.traceparent,
          value: value as string | undefined || '',
          inject: value !== undefined,
        },
      }));
    } else if (key === 'debugMode') {
      setState(prev => ({
        ...prev,
        settings: {
          ...prev.settings,
          debugMode: value as boolean,
        },
      }));
    }
  }, []);

  // Load initial values and set up listeners
  React.useEffect(() => {
    // Load all storage values
    chrome.storage.local.get(null, (result) => {
      const chromeStorage = result as ChromeStorage;
      const signadotConfig = result as SignadotConfig;

      setState({
        isAuthenticated: chromeStorage.headers.length > 0,
        settings: {
          ...defaultSettings,
          debugMode: chromeStorage.debugMode ?? false,
          signadotUrls: {
            apiUrl: signadotConfig.apiUrl,
            previewUrl: signadotConfig.previewUrl,
            dashboardUrl: signadotConfig.dashboardUrl,
          },
        },
        traceparent: {
          inject: chromeStorage.traceparent !== undefined,
          value: chromeStorage.traceparent || '',
        },
        headers: Object.fromEntries(chromeStorage.headers || []),
        routingKey: chromeStorage.routingKey,
      });
    });

    // Listen for changes
    const handleStorageChange = (changes: { [key: string]: StorageChange }) => {
      setState(prev => {
        const next = { ...prev };
        Object.entries(changes).forEach(([key, change]) => {
          if (key === 'headers') {
            next.headers = Object.fromEntries(change.newValue || []);
          } else if (key === 'routingKey') {
            next.routingKey = change.newValue;
          } else if (key === 'traceparent') {
            next.traceparent = {
              inject: change.newValue !== undefined,
              value: change.newValue || '',
            };
          } else if (key === 'debugMode') {
            next.settings.debugMode = change.newValue;
          } else if (key === 'apiUrl' || key === 'previewUrl' || key === 'dashboardUrl') {
            next.settings.signadotUrls[key] = change.newValue;
          }
        });
        return next;
      });
    };

    chrome.storage.onChanged.addListener(handleStorageChange);
    return () => chrome.storage.onChanged.removeListener(handleStorageChange);
  }, []);

  return [state, setStorageValue] as const;
};

type useChromeStorageReturn = {
  init: boolean;
  isAuthenticated: boolean;
  settings: Settings;
  traceparent: TraceparentConfig;
  headers: Record<string, string>;
  routingKey: string | undefined;
  setHeaders: (headers: [string, string][]) => void;
  setRoutingKey: (value: string | undefined) => void;
  setTraceparent: (value: string | undefined) => void;
  setDebugMode: (value: boolean) => void;
  setApiUrl: (value: string | undefined) => void;
  setPreviewUrl: (value: string | undefined) => void;
  setDashboardUrl: (value: string | undefined) => void;
}

export const useChromeStorage = (): useChromeStorageReturn => {
  const [init, setInit] = React.useState(false);
  const [storage, setStorage] = useStorage();

  // Set init state once storage is loaded
  React.useEffect(() => {
    setInit(true);
  }, []);

  return {
    init,
    isAuthenticated: storage.isAuthenticated,
    settings: storage.settings,
    traceparent: storage.traceparent,
    headers: storage.headers,
    routingKey: storage.routingKey,
    setHeaders: (headers: [string, string][]) => setStorage('headers', headers),
    setRoutingKey: (value: string | undefined) => setStorage('routingKey', value),
    setTraceparent: (value: string | undefined) => setStorage('traceparent', value),
    setDebugMode: (value: boolean) => setStorage('debugMode', value),
    setApiUrl: (value: string | undefined) => setStorage('apiUrl', value),
    setPreviewUrl: (value: string | undefined) => setStorage('previewUrl', value),
    setDashboardUrl: (value: string | undefined) => setStorage('dashboardUrl', value),
  };
};
