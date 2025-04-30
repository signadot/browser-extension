export enum StorageBrowserKeys {
  routingKey = "routingKey",
  signadotUrls = "signadotUrls",
  enabled = "enabled",
  traceparentHeader = "traceparentHeader",
  headers = "headers",
  debugMode = "debugMode",

  apiUrl = "apiUrl",
  previewUrl = "previewUrl",
  dashboardUrl = "dashboardUrl",
}

export const getBrowserStoreValues = async (keys: StorageBrowserKeys[]) => {
  const result = await chrome.storage.local.get(keys);
  return result;
};

export const getBrowserStoreValue = async (key: StorageBrowserKeys, onResult: (result: any) => void) => {
  const result = await chrome.storage.local.get([key]);
  onResult(result[key]);
};

export const setBrowserStoreValue = async (key: StorageBrowserKeys, value: any, onSet?: (result: any) => void) => {
  if (value === undefined) {
    await chrome.storage.local.remove([key]);
    onSet?.(value);
    return;
  }

  await chrome.storage.local.set({ [key]: value }, () => {
    onSet?.(value);
  });
};

export const setBrowserStoreValues = async (values: Record<StorageBrowserKeys, any>) => {
  await chrome.storage.local.set(values);
};
