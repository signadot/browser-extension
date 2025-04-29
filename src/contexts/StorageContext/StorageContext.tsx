import React, { useEffect, useState, createContext, useContext } from "react";
import { Header, Settings, StorageContextType, StorageState, TraceparentConfig } from "./types";
import { defaultTraceparent, defaultSettings } from "./defaults";
import { StorageBrowserKeys } from "./browserKeys";
import { setBrowserStoreValue } from "./browserKeys";
import { shouldInjectHeader } from "./utils";
import { HEADER_VALUE_TEMPLATE } from "./headerNames";

const StorageContext = createContext<StorageContextType | undefined>(undefined);

interface StorageProviderProps {
  children: React.ReactNode;
}

const populateRoutingKey = (input: string, routingKey: string): string => {
  const regex = new RegExp(HEADER_VALUE_TEMPLATE, "g");
  return input.replace(regex, routingKey);
};

const getHeaders = (
  currentRoutingKey: string,
  headers: Header[],
  traceparent: TraceparentConfig,
): Array<[string, string]> => {
  const headersToInject = headers.map((header) => {
    return [header.key, header.value];
  });

  if (traceparent.inject) {
    headersToInject.push(["traceparent", traceparent.value]);
  }

  return headersToInject.map((header) => {
    return [header[0], populateRoutingKey(header[1], currentRoutingKey)];
  });
};

export const StorageProvider: React.FC<StorageProviderProps> = ({ children }) => {
  const [state, setState] = useState<StorageState>({
    isAuthenticated: false,
    settings: defaultSettings,
    traceparent: defaultTraceparent,
    headers: [],
    currentRoutingKey: undefined,
  });

  const [isStorageLoaded, setIsStorageLoaded] = useState(false);

  useEffect(() => {
    setIsStorageLoaded(true);
  }, []);

  // Load initial values from browser storage
  useEffect(() => {
    const loadInitialValues = async () => {
      const storedValues = await chrome.storage.local.get([
        StorageBrowserKeys.enabled,
        StorageBrowserKeys.debugMode,
        StorageBrowserKeys.signadotUrls,
        StorageBrowserKeys.traceparentHeader,
        StorageBrowserKeys.routingKey,
        StorageBrowserKeys.headers,
      ]);

      setState((prev) => {
        const newState = { ...prev };

        // Enabled
        if (storedValues[StorageBrowserKeys.enabled] !== undefined) {
          newState.settings = {
            ...newState.settings,
            enabled: Boolean(storedValues[StorageBrowserKeys.enabled]),
          };
        }

        // Debug mode
        if (storedValues[StorageBrowserKeys.debugMode] !== undefined) {
          try {
            newState.settings = {
              ...newState.settings,
              debugMode: JSON.parse(storedValues[StorageBrowserKeys.debugMode]),
            };
          } catch {
            newState.settings = {
              ...newState.settings,
              debugMode: defaultSettings.debugMode,
            };
          }
        }

        // Signadot URLs
        if (storedValues[StorageBrowserKeys.signadotUrls] !== undefined) {
          try {
            const urls = JSON.parse(storedValues[StorageBrowserKeys.signadotUrls]);
            newState.settings = {
              ...newState.settings,
              signadotUrls: {
                apiUrl: urls.apiUrl || defaultSettings.signadotUrls.apiUrl,
                previewUrl: urls.previewUrl || defaultSettings.signadotUrls.previewUrl,
                dashboardUrl: urls.dashboardUrl || defaultSettings.signadotUrls.dashboardUrl,
              },
            };
          } catch {
            newState.settings = {
              ...newState.settings,
              signadotUrls: defaultSettings.signadotUrls,
            };
          }
        }

        // Traceparent
        if (storedValues[StorageBrowserKeys.traceparentHeader] !== undefined) {
          try {
            const traceparent = JSON.parse(storedValues[StorageBrowserKeys.traceparentHeader]);
            newState.traceparent = {
              inject: Boolean(traceparent.inject),
              value: traceparent.value || defaultTraceparent.value,
            };
          } catch {
            newState.traceparent = defaultTraceparent;
          }
        }

        // Routing key
        if (storedValues[StorageBrowserKeys.routingKey] !== undefined) {
          newState.currentRoutingKey = storedValues[StorageBrowserKeys.routingKey] || undefined;
        }

        return newState;
      });
    };

    loadInitialValues();
  }, []);

  useEffect(() => {
    const { isAuthenticated, currentRoutingKey, headers, traceparent } = state;

    if (
      shouldInjectHeader(isAuthenticated, currentRoutingKey, headers) &&
      currentRoutingKey !== undefined &&
      currentRoutingKey !== ""
    ) {
      const headersToInject = getHeaders(currentRoutingKey, headers, traceparent);
      setBrowserStoreValue(StorageBrowserKeys.headers, JSON.stringify(headersToInject));
    } else {
      setBrowserStoreValue(StorageBrowserKeys.headers, JSON.stringify([]));
    }
  }, [state]);

  const handleSetRoutingKey = (value: string | undefined) => {
    setBrowserStoreValue(StorageBrowserKeys.routingKey, value, () => {
      setState((prev) => ({ ...prev, currentRoutingKey: value }));
    });
  };

  const handleSetTraceparent = (inject: boolean, value: undefined | string) => {
    const valueToSet = value || defaultTraceparent.value;

    setBrowserStoreValue(StorageBrowserKeys.traceparentHeader, JSON.stringify({ value: valueToSet, inject }), () => {
      setState((prev) => ({
        ...prev,
        traceparent: { value: valueToSet, inject },
      }));
    });
  };

  const handleUpdateSettings = (settings: Settings) => {
    setState((prev) => ({ ...prev, settings }));

    setBrowserStoreValue(StorageBrowserKeys.enabled, settings.enabled);
    setBrowserStoreValue(StorageBrowserKeys.traceparentHeader, JSON.stringify(state.traceparent));
    setBrowserStoreValue(StorageBrowserKeys.signadotUrls, JSON.stringify(settings.signadotUrls));
    setBrowserStoreValue(StorageBrowserKeys.debugMode, JSON.stringify(settings.debugMode));
  };

  const value = {
    init: isStorageLoaded,
    isAuthenticated: state.isAuthenticated,
    settings: state.settings,
    traceparent: state.traceparent,
    headers: state.headers,
    currentRoutingKey: state.currentRoutingKey,
    setIsAuthenticated: (value: boolean) => setState((prev) => ({ ...prev, isAuthenticated: value })),
    setCurrentRoutingKey: handleSetRoutingKey,
    setTraceparent: (inject: boolean, value: undefined | string) => handleSetTraceparent(inject, value),
    setSettings: (value: Settings) => handleUpdateSettings(value),
    setHeaders: (value: Header[]) => setState((prev) => ({ ...prev, headers: value })),
  };

  return <StorageContext.Provider value={value}>{children}</StorageContext.Provider>;
};

export const useStorage = (): StorageContextType => {
  const context = useContext(StorageContext);
  if (context === undefined) {
    throw new Error("useStorage must be used within a StorageProvider");
  }
  return context;
};
