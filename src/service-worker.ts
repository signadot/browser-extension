// service-worker.ts

import { getBrowserStoreValues, StorageBrowserKeys } from "./contexts/StorageContext/browserKeys";

const ResourceType = chrome.declarativeNetRequest.ResourceType;
const MODIFY_HEADER_IN_RESOURCE_TYPES: string[] = [
  ResourceType.MAIN_FRAME,
  ResourceType.SUB_FRAME,
  ResourceType.STYLESHEET,
  ResourceType.SCRIPT,
  ResourceType.IMAGE,
  ResourceType.FONT,
  ResourceType.OBJECT,
  ResourceType.XMLHTTPREQUEST,
  ResourceType.PING,
  ResourceType.CSP_REPORT,
  ResourceType.MEDIA,
  ResourceType.WEBSOCKET,
  ResourceType.OTHER,
];

const getRules = (headerKeys: Array<[string, string]>): chrome.declarativeNetRequest.Rule[] => {
  let id = 1;
  return headerKeys.map(
    ([key, value]) =>
      ({
        id: id++,
        priority: 1,
        action: {
          type: chrome.declarativeNetRequest.RuleActionType.MODIFY_HEADERS,
          requestHeaders: [
            {
              header: key,
              operation: chrome.declarativeNetRequest.HeaderOperation.SET,
              value: value,
            },
          ],
        },
        condition: {
          urlFilter: "*",
          excludedRequestDomains: ["preview.signadot.com", "preview.staging.signadot.com", "localhost.signadot.com"],
          resourceTypes: MODIFY_HEADER_IN_RESOURCE_TYPES,
        },
      }) as chrome.declarativeNetRequest.Rule,
  );
};

async function updateDynamicRules() {
  const values = await getBrowserStoreValues([
    StorageBrowserKeys.routingKey,
    StorageBrowserKeys.enabled,
    StorageBrowserKeys.headers,
    StorageBrowserKeys.traceparentHeader,
  ]);

  const { routingKey, enabled, headers, traceparentHeader } = values;
  const injectHeaders = headers && headers.length > 0 && enabled && routingKey;

  if (!injectHeaders) {
    try {
      const existingRules = await chrome.declarativeNetRequest.getDynamicRules();
      await chrome.declarativeNetRequest.updateDynamicRules({
        removeRuleIds: existingRules.map((rule) => rule.id),
      });

      console.log("Dynamic rules cleared.");
    } catch (error) {
      console.error("Error clearing dynamic rules: ", error);
    }

    return;
  }

  const parsedHeaders = JSON.parse(headers);
  const rules = getRules(parsedHeaders);

  const existingRules = await chrome.declarativeNetRequest.getDynamicRules();

  await chrome.declarativeNetRequest.updateDynamicRules({
    removeRuleIds: existingRules.map((rule) => rule.id),
    addRules: rules,
  });

  console.log("Dynamic rules updated successfully.");
}

chrome.runtime.onInstalled.addListener(updateDynamicRules);
chrome.runtime.onStartup.addListener(updateDynamicRules);
chrome.storage.onChanged.addListener((changes, areaName) => {
  console.log({ changes, areaName });

  if (
    areaName === "local" &&
    (changes[StorageBrowserKeys.headers] ||
      changes[StorageBrowserKeys.routingKey] ||
      changes[StorageBrowserKeys.enabled] ||
      changes[StorageBrowserKeys.traceparentHeader])
  ) {
    updateDynamicRules();
  }
});
