import React, {useEffect} from "react";
import StorageChange = chrome.storage.StorageChange;
import { getHeaders, Header } from "../service-worker";

export enum StorageKey {
  RoutingKey = "routingKey",
  Enabled = "enabled",
  ExtraHeaders = "extraHeaders",
  InjectedHeaders = "injectedHeaders"
}

type ChromeStorageHookOutput = {
  routingKey: (string | undefined),
  setRoutingKeyFn: ((value: (string | undefined)) => Promise<void>),
  enabled: boolean,
  setEnabled: ((value: boolean) => Promise<void>),
  extraHeaders: string[],
  setExtraHeaders: ((value: string[]) => Promise<void>),
  injectedHeaders: Record<string, Header> | undefined,
}

export const useChromeStorage = (): ChromeStorageHookOutput => {
  const [routingKey, setRoutingKey] = React.useState<string | undefined>(undefined);
  const [enabled, setEnabled] = React.useState<boolean>(true);
  const [extraHeaders, setExtraHeaders] = React.useState<string[]>([]);
  const [injectedHeaders, setInjectedHeaders] = React.useState<Record<string, Header> | undefined>(undefined);

  const setRoutingKeyFn = (value: string | undefined): Promise<void> => {
    if (value) {
      return chrome.storage.local.set({[StorageKey.RoutingKey]: value});
    } else {
      return chrome.storage.local.remove(StorageKey.RoutingKey);
    }
  }
  const setEnabledFn = (value: boolean) => chrome.storage.local.set({[StorageKey.Enabled]: value})
  const setExtraHeadersFn = (value: string[]) => chrome.storage.local.set({[StorageKey.ExtraHeaders]: value})

  React.useEffect(() => {
    setInjectedHeaders(getHeaders(extraHeaders));
  }, [extraHeaders]);

  React.useEffect(() => {
        // Populate value for routingKey and enabled from Chrome Storage.
        chrome.storage.local.get([StorageKey.RoutingKey, StorageKey.Enabled, StorageKey.ExtraHeaders], (result) => {
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

  return {routingKey, setRoutingKeyFn, enabled, setEnabled: setEnabledFn, extraHeaders, setExtraHeaders: setExtraHeadersFn, injectedHeaders};
}