// service-worker.ts

import { StorageBrowserKeys } from "./contexts/StorageContext/browserKeys";
// import {getClusters} from "./components/ListRouteEntries/queries";

export type Header = { value: string, kind: 'always' | 'extra' | 'defaultBeforeV191' }

const ROUTING_KEY = "routingKey";
const ROUTING_KEY_PLACEHOLDER = `{${ROUTING_KEY}}`;
export const ROUTING_HEADERS: Record<string, Header> = {
  "baggage": { value: `sd-routing-key=${ROUTING_KEY_PLACEHOLDER},sd-sandbox=${ROUTING_KEY_PLACEHOLDER}`, kind: 'always' },
  "ot-baggage-sd-routing-key": { value: `${ROUTING_KEY_PLACEHOLDER}`, kind: 'defaultBeforeV191' },
  "ot-baggage-sd-sandbox": { value: `${ROUTING_KEY_PLACEHOLDER}`, kind: 'defaultBeforeV191' },
  "tracestate": { value: `sd-routing-key=${ROUTING_KEY_PLACEHOLDER},sd-sandbox=${ROUTING_KEY_PLACEHOLDER}`, kind: 'always' },
  "uberctx-sd-routing-key": { value: `${ROUTING_KEY_PLACEHOLDER}`, kind: 'defaultBeforeV191' },
  "uberctx-sd-sandbox": { value: `${ROUTING_KEY_PLACEHOLDER}`, kind: 'defaultBeforeV191' },
};
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

const populateRoutingKey = (input: string, routingKey: string): string => {
  const regex = new RegExp(ROUTING_KEY_PLACEHOLDER, 'g');
  return input.replace(regex, routingKey);
}


export const getHeaders = (extraHeaders: string[] | null | undefined, traceparentHeader: string | undefined): Record<string, Header> => {
  const traceparentMap: Record<string, Header> = traceparentHeader ? { "traceparent": {value: traceparentHeader, kind: "always" }} : {};

  // This means cluster is using an old operator version
  if (!extraHeaders) {
    return Object.entries(ROUTING_HEADERS)
        .reduce((acc, [key, header]) => ({ ...acc, [key]: header }), traceparentMap);
  }

  const defaultHeaders = Object.entries(ROUTING_HEADERS)
      .filter(([_, header]) => header.kind === "always")
      .reduce((acc, [key, header]) => ({ ...acc, [key]: header }), traceparentMap);

  const extraHeadersObj = extraHeaders.reduce((acc, header) => ({ ...acc, [header]: { value: `${ROUTING_KEY_PLACEHOLDER}`, kind: "extra" } }), {});

  return { ...defaultHeaders, ...extraHeadersObj };
}


const getRules = (
  headerKeys: Record<string, Header>,
  routingKey: string
): chrome.declarativeNetRequest.Rule[] => {
  let id = 1;
  return Object.keys(headerKeys).map(
    (key, idx) => ({
      id: id++,
      priority: 1,
      action: {
        type: chrome.declarativeNetRequest.RuleActionType.MODIFY_HEADERS,
        requestHeaders: [
          {
            header: key,
            operation: chrome.declarativeNetRequest.HeaderOperation.SET,
            value: populateRoutingKey(headerKeys[key].value, routingKey),
          },
        ],
      },
      condition: {
        urlFilter: "*",
        excludedRequestDomains: ["preview.signadot.com", "preview.staging.signadot.com", "localhost.signadot.com"],
        resourceTypes: MODIFY_HEADER_IN_RESOURCE_TYPES,
      },
    } as chrome.declarativeNetRequest.Rule)
  );
}

async function updateDynamicRules() {
  chrome.storage.local.get([
    StorageBrowserKeys.routingKey,
    StorageBrowserKeys.enabled,
    StorageBrowserKeys.headers,
    StorageBrowserKeys.traceparentHeader,
  ], async (result) => {


    console.log({ result })
    // const currentRoutingKey = result[StorageBrowserKeys.routingKey];
    // const currentFeatureEnabled = !!result[StorageBrowserKeys.enabled];
    // const currentTraceparentHeader = result[StorageBrowserKeys.traceparentHeader];
    // const currentTraceparentHeaderEnabled = result[StorageBrowserKeys.traceparentHeaderEnabled];
    // const isAuthenticated = result[StorageBrowserKeys.authenticated];

    // console.log("isAuthenticated 2: ", currentFeatureEnabled && currentRoutingKey && isAuthenticated);
    // console.log({ currentRoutingKey, isAuthenticated, currentFeatureEnabled })
    // if (currentFeatureEnabled && currentRoutingKey && isAuthenticated) {
    //   try {
    //     const traceparentHeaderValue = currentTraceparentHeader === undefined ? defaultTraceparent.value : currentTraceparentHeader;
    //     const traceparentHeader = currentTraceparentHeaderEnabled ? traceparentHeaderValue : undefined;

    //     console.log("Traceparent header: ", traceparentHeader, currentTraceparentHeader);
    //     const headerKeys = getHeaders(currentExtraHeaders, traceparentHeader);
    //     const rules = getRules(headerKeys, currentRoutingKey);
    //     const existingRules = await chrome.declarativeNetRequest.getDynamicRules();

    //     await chrome.storage.local.set({[StorageKey.InjectedHeaders]: headerKeys});

    //     await chrome.storage.local.set({[StorageKey.InjectedHeaders]: headerKeys});
    //     await chrome.declarativeNetRequest.updateDynamicRules({
    //       removeRuleIds: existingRules.map(rule => rule.id),
    //     });

    //     console.log("Removing rules: ", existingRules.map(rule => rule.id));
    //     console.log("Adding rules: ", rules.map(rule => rule.id));

    //     await chrome.declarativeNetRequest.updateDynamicRules({
    //       addRules: rules,
    //     });

    //     console.log("Dynamic rules updated successfully.");
    //   } catch (error) {
    //     console.error("Error updating dynamic rules: ", error);
    //   }
    // } else {
    //   try {
    //     const existingRules = await chrome.declarativeNetRequest.getDynamicRules();
    //     await chrome.declarativeNetRequest.updateDynamicRules({
    //       removeRuleIds: existingRules.map(rule => rule.id),
    //     });

    //     console.log("Dynamic rules cleared.");
    //   } catch (error) {
    //     console.error("Error clearing dynamic rules: ", error);
    //   }
    // }
  });
}


chrome.runtime.onInstalled.addListener(updateDynamicRules);
chrome.runtime.onStartup.addListener(updateDynamicRules);
chrome.storage.onChanged.addListener((changes, areaName) => {
  if (areaName === "local" && (
    changes[StorageBrowserKeys.headers]
  )) {
    updateDynamicRules();
  }
});
