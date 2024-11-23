import React, {useEffect} from "react";
import StorageChange = chrome.storage.StorageChange;

enum StorageKey {
  RoutingKey = "routingKey",
  Enabled = "enabled"
}

type ChromeStorageHookOutput = [
  routingKey: (string | undefined),
  setRoutingKeyFn: ((value: (string | undefined)) => Promise<void>),
  enabled: boolean,
  setEnabled: ((value: boolean) => Promise<void>)
]

export const useChromeStorage = (): ChromeStorageHookOutput => {
  const [routingKey, setRoutingKey] = React.useState<string | undefined>(undefined);
  const [enabled, setEnabled] = React.useState<boolean>(true);

  const setRoutingKeyFn = (value: string | undefined) => chrome.storage.local.set({[StorageKey.RoutingKey]: value})
  const setEnabledFn = (value: boolean) => chrome.storage.local.set({[StorageKey.Enabled]: value})

  React.useEffect(() => {
        // Populate value for routingKey and enabled from Chrome Storage.
        chrome.storage.local.get([StorageKey.RoutingKey, StorageKey.Enabled], (result) => {
          if (StorageKey.RoutingKey in result) {
            setRoutingKey(result?.[StorageKey.RoutingKey]);
          }
          setEnabled(!!result[StorageKey.Enabled]);
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
          }
        }

        // Add event listener for changes in storage
        chrome.storage.onChanged.addListener(handleStorageChange);

        // Cleanup function to remove event listener
        return () => chrome.storage.onChanged.removeListener(handleStorageChange);
      }, []
  )

    React.useEffect(() => {
        if (!enabled) {
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
    }, [enabled]);

  return [routingKey, setRoutingKeyFn, enabled, setEnabledFn];
}