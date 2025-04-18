import React from "react";
import StorageChange = chrome.storage.StorageChange;
import { getHeaders, Header } from "../service-worker";
import { DEFAULT_API_URL, DEFAULT_PREVIEW_URL, DEFAULT_DASHBOARD_URL, DEFAULT_TRACEPARENT_HEADER } from "../components/Settings/Settings";

export enum StorageKey {
  RoutingKey = "routingKey",
  Enabled = "enabled",
  ExtraHeaders = "extraHeaders",
  TraceparentHeader = "traceparentHeader",
  TraceparentHeaderEnabled = "traceparentHeaderEnabled",
  InjectedHeaders = "injectedHeaders",
  ApiUrl = "apiUrl",
  PreviewUrl = "previewUrl",
  DashboardUrl = "dashboardUrl",
}

type StorageKeyToType = {
  [StorageKey.RoutingKey]: string | undefined;
  [StorageKey.Enabled]: boolean;
  [StorageKey.ExtraHeaders]: string[] | null | undefined;
  [StorageKey.TraceparentHeader]: string;
  [StorageKey.TraceparentHeaderEnabled]: boolean;
  [StorageKey.InjectedHeaders]: Record<string, Header> | undefined;
  [StorageKey.ApiUrl]: string;
  [StorageKey.PreviewUrl]: string;
  [StorageKey.DashboardUrl]: string;
}

type StorageState = StorageKeyToType;

const defaultValues: Partial<StorageState> = {
  [StorageKey.Enabled]: true,
  [StorageKey.TraceparentHeader]: DEFAULT_TRACEPARENT_HEADER,
  [StorageKey.TraceparentHeaderEnabled]: false,
  [StorageKey.ApiUrl]: DEFAULT_API_URL,
  [StorageKey.PreviewUrl]: DEFAULT_PREVIEW_URL,
  [StorageKey.DashboardUrl]: DEFAULT_DASHBOARD_URL,
};

const useStorage = () => {
  const [state, setState] = React.useState<StorageState>(() => ({
    ...defaultValues,
  } as StorageState));

  const setStorageValue = React.useCallback(async <K extends StorageKey>(
    key: K,
    value: StorageKeyToType[K]
  ): Promise<void> => {
    if (value === undefined || value === null) {
      await chrome.storage.local.remove(key);
      setState(prev => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
    } else {
      await chrome.storage.local.set({ [key]: value });
      setState(prev => {
        const next = { ...prev };
        (next[key] as StorageKeyToType[K]) = value;
        return next;
      });
    }
  }, []);

  // Load initial values and set up listeners
  React.useEffect(() => {
    // Load all storage values
    chrome.storage.local.get(null, (result) => {
      const newState = { ...defaultValues } as StorageState;
      
      // Type-safe way to handle each storage key
      (Object.values(StorageKey) as StorageKey[]).forEach((key) => {
        if (key in result) {
          (newState[key] as any) = result[key];
        }
      });

      setState(newState);
    });

    // Listen for changes
    const handleStorageChange = (changes: { [key: string]: StorageChange }) => {
      setState(prev => {
        const next = { ...prev };
        Object.entries(changes).forEach(([key, change]) => {
          if (key in StorageKey) {
            const storageKey = key as StorageKey;
            const defaultValue = defaultValues[storageKey];
            (next[storageKey] as any) = change.newValue ?? defaultValue;
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

export const useChromeStorage = () => {
  const [init, setInit] = React.useState(false);
  const [injectedHeaders, setInjectedHeaders] = React.useState<Record<string, Header> | undefined>();
  const [storage, setStorage] = useStorage();

  // Handle injected headers updates
  React.useEffect(() => {
    const headers = getHeaders(
      storage[StorageKey.ExtraHeaders],
      storage[StorageKey.TraceparentHeaderEnabled] ? storage[StorageKey.TraceparentHeader] : undefined
    );
    setInjectedHeaders(headers);
  }, [
    storage[StorageKey.ExtraHeaders],
    storage[StorageKey.TraceparentHeader],
    storage[StorageKey.TraceparentHeaderEnabled]
  ]);

  // Handle extension icon updates
  React.useEffect(() => {
    const iconState = (!storage[StorageKey.Enabled] || !storage[StorageKey.RoutingKey]) ? 'inactive' : 'active';
    chrome.action.setIcon({
      path: {
        "16": `images/icons/icon16_${iconState}.png`,
        "48": `images/icons/icon48_${iconState}.png`,
        "128": `images/icons/icon128_${iconState}.png`,
      }
    });
  }, [storage[StorageKey.Enabled], storage[StorageKey.RoutingKey]]);

  // Set init state once storage is loaded
  React.useEffect(() => {
    setInit(true);
  }, []);

  return {
    init,
    enabled: storage[StorageKey.Enabled],
    setEnabled: (value: boolean) => setStorage(StorageKey.Enabled, value),
    routingKey: storage[StorageKey.RoutingKey],
    setRoutingKeyFn: (value: string | undefined) => setStorage(StorageKey.RoutingKey, value),
    extraHeaders: storage[StorageKey.ExtraHeaders],
    setExtraHeaders: (value: string[] | null | undefined) => setStorage(StorageKey.ExtraHeaders, value),
    traceparentHeader: storage[StorageKey.TraceparentHeader],
    setTraceparentHeader: (value: string) => setStorage(StorageKey.TraceparentHeader, value),
    traceparentHeaderEnabled: storage[StorageKey.TraceparentHeaderEnabled],
    setTraceparentHeaderEnabled: (value: boolean) => setStorage(StorageKey.TraceparentHeaderEnabled, value),
    injectedHeaders,
    apiUrl: storage[StorageKey.ApiUrl],
    setApiUrl: (value: string) => setStorage(StorageKey.ApiUrl, value),
    previewUrl: storage[StorageKey.PreviewUrl],
    setPreviewUrl: (value: string) => setStorage(StorageKey.PreviewUrl, value),
    dashboardUrl: storage[StorageKey.DashboardUrl],
    setDashboardUrl: (value: string) => setStorage(StorageKey.DashboardUrl, value),
  };
};
