// service-worker.ts

import {auth} from "./contexts/auth";
import { StorageKey } from "./hooks/storage";
import { DEFAULT_TRACEPARENT_HEADER } from "./components/Settings/Settings";
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


export const getHeaders = (extraHeaders: string[] | undefined, traceparentHeader: string | undefined): Record<string, Header> => {

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
	  	
  return Object.keys(headerKeys).map(
    (key, idx) => ({
      id: idx + 1,
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
  chrome.storage.local.get([StorageKey.RoutingKey, StorageKey.Enabled, StorageKey.ExtraHeaders, StorageKey.TraceparentHeader], async (result) => {
    const currentRoutingKey = result[StorageKey.RoutingKey];
    const currentFeatureEnabled = !!result[StorageKey.Enabled];
    const currentExtraHeaders = result[StorageKey.ExtraHeaders];
    const currentTraceparentHeader = result[StorageKey.TraceparentHeader];

    if (currentFeatureEnabled && currentRoutingKey) {
      try {
        const traceparentHeader = currentTraceparentHeader === undefined ? DEFAULT_TRACEPARENT_HEADER : currentTraceparentHeader;
        const headerKeys = getHeaders(currentExtraHeaders, traceparentHeader);
        const rules = getRules(headerKeys, currentRoutingKey);
        const existingRules = await chrome.declarativeNetRequest.getDynamicRules();

        await chrome.storage.local.set({[StorageKey.InjectedHeaders]: headerKeys});

        await chrome.declarativeNetRequest.updateDynamicRules({
          addRules: rules,
          removeRuleIds: existingRules.map(rule => rule.id),
        });

        console.log("Dynamic rules updated successfully.");
      } catch (error) {
        console.error("Error updating dynamic rules: ", error);
      }
    } else {
      try {
        const existingRules = await chrome.declarativeNetRequest.getDynamicRules();
        await chrome.declarativeNetRequest.updateDynamicRules({
          removeRuleIds: existingRules.map(rule => rule.id),
        });

        console.log("Dynamic rules cleared.");
      } catch (error) {
        console.error("Error clearing dynamic rules: ", error);
      }
    }
  });
}

chrome.runtime.onInstalled.addListener(updateDynamicRules);
chrome.runtime.onStartup.addListener(updateDynamicRules);
chrome.storage.onChanged.addListener((changes, areaName) => {
  if (areaName === "local" && (changes[StorageKey.RoutingKey] || changes[StorageKey.Enabled] || changes[StorageKey.TraceparentHeader])) {
    updateDynamicRules();
  }
});
