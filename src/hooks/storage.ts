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

type ChromeStorageHookOutput = {
  init: boolean,
  enabled: boolean,
  setEnabled: ((value: boolean) => Promise<void>),
  routingKey: (string | undefined),
  setRoutingKeyFn: ((value: (string | undefined)) => Promise<void>),
  extraHeaders: string[] | undefined,
  setExtraHeaders: ((value: string[] | null) => Promise<void>),
  traceparentHeader: (string | undefined),
  setTraceparentHeader: ((value: string) => Promise<void>),
  traceparentHeaderEnabled: boolean,
  setTraceparentHeaderEnabled: (value: boolean) => void,
  injectedHeaders: Record<string, Header> | undefined,
  apiUrl: string | undefined,
  previewUrl: string | undefined,
  dashboardUrl: string | undefined,
  setApiUrl: ((value: string) => Promise<void>),
  setPreviewUrl: ((value: string) => Promise<void>)
  setDashboardUrl: ((value: string) => Promise<void>)
}

export const useChromeStorage = (): ChromeStorageHookOutput => {

  const [init, setInit] = React.useState<boolean>(false);
  const [enabled, setEnabled] = React.useState<boolean>(true);
  const [routingKey, setRoutingKey] = React.useState<string | undefined>(undefined);
  const [extraHeaders, setExtraHeaders] = React.useState<string[] | undefined>(undefined);
  const [traceparentHeader, setTraceparentHeader] = React.useState<string>(DEFAULT_TRACEPARENT_HEADER);
  const [injectedHeaders, setInjectedHeaders] = React.useState<Record<string, Header> | undefined>(undefined);
  const [apiUrl, setApiUrl] = React.useState<string | undefined>(undefined);
  const [previewUrl, setPreviewUrl] = React.useState<string | undefined>(undefined);
  const [dashboardUrl, setDashboardUrl] = React.useState<string | undefined>(undefined);
  const [traceparentHeaderEnabled, setTraceparentHeaderEnabled] = React.useState(false);

  const setRoutingKeyFn = (value: string | undefined): Promise<void> => {
    if (value) {
      return chrome.storage.local.set({[StorageKey.RoutingKey]: value});
    } else {
      return chrome.storage.local.remove(StorageKey.RoutingKey);
    }
  }
  const setEnabledFn = (value: boolean) => chrome.storage.local.set({[StorageKey.Enabled]: value})
  const setTraceparentHeaderEnabledFn = (value: boolean) => {
    chrome.storage.local.set({[StorageKey.TraceparentHeaderEnabled]: value})
  }
  const setExtraHeadersFn = (value: string[] | null) => {
    if (value) {
      return chrome.storage.local.set({[StorageKey.ExtraHeaders]: value})
    } {
      return chrome.storage.local.remove(StorageKey.ExtraHeaders)
    }
  }
  const setTraceparentHeaderFn = (value: string) => {
    return chrome.storage.local.set({[StorageKey.TraceparentHeader]: value})
  }
  const setApiUrlFn = (value: string) => chrome.storage.local.set({[StorageKey.ApiUrl]: value})
  const setPreviewUrlFn = (value: string) => chrome.storage.local.set({[StorageKey.PreviewUrl]: value})
  const setDashboardUrlFn = (value: string) => chrome.storage.local.set({[StorageKey.DashboardUrl]: value})

  React.useEffect(() => {
    const headers = getHeaders(extraHeaders, traceparentHeaderEnabled ? traceparentHeader : undefined);
    setInjectedHeaders(headers);
  }, [extraHeaders, traceparentHeader, traceparentHeaderEnabled]);

  React.useEffect(() => {
    chrome.storage.local.get([StorageKey.ApiUrl, StorageKey.PreviewUrl, StorageKey.DashboardUrl], (result) => {
      if (!result.apiUrl) {
        setApiUrlFn(DEFAULT_API_URL);
        setApiUrl(DEFAULT_API_URL)
      } else {
        setApiUrlFn(result.apiUrl);
        setApiUrl(result.apiUrl)
      }

      if (!result.previewUrl) {
        setPreviewUrlFn(DEFAULT_PREVIEW_URL);
        setPreviewUrl(DEFAULT_PREVIEW_URL)
      } else {
        setPreviewUrlFn(result.previewUrl);
        setPreviewUrl(result.previewUrl)
      }

      if (!result.dashboardUrl) {
        setDashboardUrlFn(DEFAULT_DASHBOARD_URL);
        setDashboardUrl(DEFAULT_DASHBOARD_URL)
      } else {
        setDashboardUrlFn(result.dashboardUrl);
        setDashboardUrl(result.dashboardUrl)
      }
    });
  }, []);

  React.useEffect(() => {
        // Populate value for routingKey and enabled from Chrome Storage.
        chrome.storage.local.get([StorageKey.RoutingKey, StorageKey.Enabled, StorageKey.ExtraHeaders, StorageKey.TraceparentHeader, StorageKey.ApiUrl, StorageKey.PreviewUrl, StorageKey.DashboardUrl, StorageKey.TraceparentHeaderEnabled], (result) => {
          setEnabled(!!result[StorageKey.Enabled]);

          if (StorageKey.RoutingKey in result) {
            setRoutingKey(result?.[StorageKey.RoutingKey]);
          }
          if (StorageKey.ExtraHeaders in result) {
            setExtraHeaders(result[StorageKey.ExtraHeaders]);
          }
	      if (StorageKey.TraceparentHeader in result) {
            setTraceparentHeader(result[StorageKey.TraceparentHeader]);
          }
          if (StorageKey.TraceparentHeaderEnabled in result) {
            setTraceparentHeaderEnabled(!!result[StorageKey.TraceparentHeaderEnabled]);
          }
          if (StorageKey.InjectedHeaders in result) {
            setInjectedHeaders(result[StorageKey.InjectedHeaders]);
          }
          if (StorageKey.ApiUrl in result) {
            setApiUrl(result[StorageKey.ApiUrl]);
          }
          if (StorageKey.PreviewUrl in result) {
            setPreviewUrl(result[StorageKey.PreviewUrl]);
          }
          if (StorageKey.DashboardUrl in result) {
            setDashboardUrl(result[StorageKey.DashboardUrl]);
          }
          setInit(true);
        });

        // Update values for RoutingKey and enabled when the value in Google (Local) storage changes.
        const handleStorageChange = (changes: { [p: string]: StorageChange }, area: string) => {

          if (area === "local") {
            if (StorageKey.Enabled in changes) {
              setEnabled(!!changes[StorageKey.Enabled].newValue);
            }
            if (StorageKey.RoutingKey in changes) {
              setRoutingKey(changes[StorageKey.RoutingKey].newValue);
            }
            if (StorageKey.ExtraHeaders in changes) {
              setExtraHeaders(changes[StorageKey.ExtraHeaders].newValue);
            }
            if (StorageKey.TraceparentHeader in changes) {
              setTraceparentHeader(changes[StorageKey.TraceparentHeader].newValue);
            }
            if (StorageKey.TraceparentHeaderEnabled in changes) {
              setTraceparentHeaderEnabled(!!changes[StorageKey.TraceparentHeaderEnabled].newValue);
            }
            if (StorageKey.InjectedHeaders in changes) {
              setInjectedHeaders(changes[StorageKey.InjectedHeaders].newValue);
            }
            if (StorageKey.ApiUrl in changes) {
              setApiUrl(changes[StorageKey.ApiUrl].newValue);
            }
            if (StorageKey.PreviewUrl in changes) {
              setPreviewUrl(changes[StorageKey.PreviewUrl].newValue);
            }
            if (StorageKey.DashboardUrl in changes) {
              setDashboardUrl(changes[StorageKey.DashboardUrl].newValue);
            }
          }
        }

        // Add event listener for changes in storage
        chrome.storage.onChanged.addListener(handleStorageChange);

        // Cleanup function to remove event listener
        return () => chrome.storage.onChanged.removeListener(handleStorageChange);
      }, []
  )

    React.useEffect(() => {
        if (!enabled || !routingKey) {
            chrome.action.setIcon({ path: {
                    "16": "images/icons/icon16_inactive.png",
                    "48": "images/icons/icon48_inactive.png",
                    "128": "images/icons/icon128_inactive.png"
                }});
        } else {
            chrome.action.setIcon({ path: {
                    "16": "images/icons/icon16_active.png",
                    "48": "images/icons/icon48_active.png",
                    "128": "images/icons/icon128_active.png"
                }});
        }
    }, [enabled, routingKey]);

  return {
    init,
    enabled,
    setEnabled: setEnabledFn,
    routingKey,
    setRoutingKeyFn,
    extraHeaders,
    setExtraHeaders: setExtraHeadersFn,
    traceparentHeader,
    setTraceparentHeader: setTraceparentHeaderFn,
    traceparentHeaderEnabled,
    setTraceparentHeaderEnabled: setTraceparentHeaderEnabledFn,
    injectedHeaders,
    apiUrl,
    previewUrl,
    dashboardUrl,
    setApiUrl: setApiUrlFn,
    setPreviewUrl: setPreviewUrlFn,
    setDashboardUrl: setDashboardUrlFn
  };
}
