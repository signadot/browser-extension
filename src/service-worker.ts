// service-worker.ts

const ROUTING_KEY = "routingKey";
const ENABLED_KEY = "enabled";
const ROUTING_KEY_PLACEHOLDER = `{${ROUTING_KEY}}`;
const ROUTING_HEADERS: Record<string, string> = {
  "baggage": `sd-routing-key=${ROUTING_KEY_PLACEHOLDER},sd-sandbox=${ROUTING_KEY_PLACEHOLDER}`,
  "ot-baggage-sd-routing-key": `${ROUTING_KEY_PLACEHOLDER}`,
  "ot-baggage-sd-sandbox": `${ROUTING_KEY_PLACEHOLDER}`,
  "tracestate": `sd-routing-key=${ROUTING_KEY_PLACEHOLDER},sd-sandbox=${ROUTING_KEY_PLACEHOLDER}`,
  "uberctx-sd-routing-key": `${ROUTING_KEY_PLACEHOLDER}`,
  "uberctx-sd-sandbox": `${ROUTING_KEY_PLACEHOLDER}`,
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

const getRules = (
  headerKeys: Record<string, string>,
  routingKey: string
): chrome.declarativeNetRequest.Rule[] =>
  Object.keys(headerKeys).map(
    (key, idx) => ({
      id: idx + 1,
      priority: 1,
      action: {
        type: chrome.declarativeNetRequest.RuleActionType.MODIFY_HEADERS,
        requestHeaders: [
          {
            header: key,
            operation: chrome.declarativeNetRequest.HeaderOperation.SET,
            value: populateRoutingKey(headerKeys[key], routingKey),
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

async function updateDynamicRules() {
  chrome.storage.local.get([ROUTING_KEY, ENABLED_KEY], async (result) => {
    const currentRoutingKey = result[ROUTING_KEY];
    const currentFeatureEnabled = !!result[ENABLED_KEY];

    if (currentFeatureEnabled && currentRoutingKey) {
      try {
        const rules = getRules(ROUTING_HEADERS, currentRoutingKey);
        const existingRules = await chrome.declarativeNetRequest.getDynamicRules();

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
  if (areaName === "local" && (changes[ROUTING_KEY] || changes[ENABLED_KEY])) {
    updateDynamicRules();
  }
});
