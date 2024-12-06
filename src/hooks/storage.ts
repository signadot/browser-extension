import React, {useEffect} from "react";
import StorageChange = chrome.storage.StorageChange;
import { getHeaders, Header } from "../service-worker";
import { DEFAULT_API_URL, DEFAULT_PREVIEW_URL } from "../components/Settings/Settings";

export enum StorageKey {
  RoutingKey = "routingKey",
  Enabled = "enabled",
  ExtraHeaders = "extraHeaders",
  InjectedHeaders = "injectedHeaders",
  ApiUrl = "apiUrl",
  PreviewUrl = "previewUrl"
}

type ChromeStorageHookOutput = {
  routingKey: (string | undefined),
  setRoutingKeyFn: ((value: (string | undefined)) => Promise<void>),
  enabled: boolean,
  setEnabled: ((value: boolean) => Promise<void>),
  extraHeaders: string[],
  setExtraHeaders: ((value: string[]) => Promise<void>),
  injectedHeaders: Record<string, Header> | undefined,
  apiUrl: string | undefined,
  previewUrl: string | undefined,
  setApiUrl: ((value: string) => Promise<void>),
  setPreviewUrl: ((value: string) => Promise<void>)
}

export const useChromeStorage = (): ChromeStorageHookOutput => {
  const [routingKey, setRoutingKey] = React.useState<string | undefined>(undefined);
  const [enabled, setEnabled] = React.useState<boolean>(true);
  const [extraHeaders, setExtraHeaders] = React.useState<string[]>([]);
  const [injectedHeaders, setInjectedHeaders] = React.useState<Record<string, Header> | undefined>(undefined);
  const [apiUrl, setApiUrl] = React.useState<string | undefined>(undefined);
  const [previewUrl, setPreviewUrl] = React.useState<string | undefined>(undefined);

  const setRoutingKeyFn = (value: string | undefined): Promise<void> => {
    if (value) {
      return chrome.storage.local.set({[StorageKey.RoutingKey]: value});
    } else {
      return chrome.storage.local.remove(StorageKey.RoutingKey);
    }
  }
  const setEnabledFn = (value: boolean) => chrome.storage.local.set({[StorageKey.Enabled]: value})
  const setExtraHeadersFn = (value: string[]) => chrome.storage.local.set({[StorageKey.ExtraHeaders]: value})
  const setApiUrlFn = (value: string) => chrome.storage.local.set({[StorageKey.ApiUrl]: value})
  const setPreviewUrlFn = (value: string) => chrome.storage.local.set({[StorageKey.PreviewUrl]: value})

  React.useEffect(() => {
    setInjectedHeaders(getHeaders(extraHeaders));
  }, [extraHeaders]);

  React.useEffect(() => {

    chrome.storage.local.get(["apiUrl", "previewUrl"], (result) => {
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
    });
  }, []);

  React.useEffect(() => {
        // Populate value for routingKey and enabled from Chrome Storage.
        chrome.storage.local.get([StorageKey.RoutingKey, StorageKey.Enabled, StorageKey.ExtraHeaders, StorageKey.PreviewUrl, StorageKey.ApiUrl], (result) => {
          if (StorageKey.RoutingKey in result) {
            setRoutingKey(result?.[StorageKey.RoutingKey]);
          }
          setEnabled(!!result[StorageKey.Enabled]);
          if (StorageKey.ExtraHeaders in result) {
            setExtraHeaders(result[StorageKey.ExtraHeaders]);
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
        });


        // Update values for RoutingKey and enabled when the value in Google (Local) storage changes.
        const handleStorageChange = (changes: { [p: string]: StorageChange }, area: string) => {
          if (area === "local") {
            if (StorageKey.RoutingKey in changes) {
              setRoutingKey(changes[StorageKey.RoutingKey].newValue);
            }
            if (StorageKey.Enabled in changes) {
              setEnabled(!!changes[StorageKey.Enabled].newValue);
            }
            if (StorageKey.ExtraHeaders in changes) {
              setExtraHeaders(changes[StorageKey.ExtraHeaders].newValue);
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
          }
        }

        // Add event listener for changes in storage
        chrome.storage.onChanged.addListener(handleStorageChange);

        // Cleanup function to remove event listener
        return () => chrome.storage.onChanged.removeListener(handleStorageChange);
      }, []
  )

    React.useEffect(() => {
        if (!routingKey) {
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
    }, [routingKey]);

  return {
    routingKey,
    setRoutingKeyFn,
    enabled,
    setEnabled: setEnabledFn,
    extraHeaders,
    setExtraHeaders: setExtraHeadersFn,
    injectedHeaders,
    apiUrl,
    previewUrl,
    setApiUrl: setApiUrlFn,
    setPreviewUrl: setPreviewUrlFn
  };
}
