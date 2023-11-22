// background.ts

const ROUTING_KEY = "routingKey";
const ENABLED_KEY = "enabled";
const ROUTING_KEY_PLACEHOLDER = `{${ROUTING_KEY}}`;
const ROUTING_HEADERS: Record<string, string> = {
  "Baggage": `sd-routing-key=${ROUTING_KEY_PLACEHOLDER}`,
  "Ot-Baggage-Sd-Routing-Key": `${ROUTING_KEY_PLACEHOLDER}`,
  "Ot-Baggage-Sd-Sandbox": `${ROUTING_KEY_PLACEHOLDER}`,
  "Ot-Baggage-Sd-Workspace": `${ROUTING_KEY_PLACEHOLDER}`,
  "Tracestate": `sd-routing-key=${ROUTING_KEY_PLACEHOLDER}`,
  "Uberctx-Sd-Routing-Key": `${ROUTING_KEY_PLACEHOLDER}`,
  "Uberctx-Sd-Sandbox": `${ROUTING_KEY_PLACEHOLDER}`,
  "Uberctx-Sd-Workspace": `${ROUTING_KEY_PLACEHOLDER}`,
  "sd-workspace": `${ROUTING_KEY_PLACEHOLDER}`,
  "sd-sandbox": `${ROUTING_KEY_PLACEHOLDER}`,
  "sd-routing-key": `${ROUTING_KEY_PLACEHOLDER}`,
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
  ResourceType.OTHER
]

let inMemoryHeaderValue: string | undefined = undefined;
let inMemoryFeatureEnabled: boolean = false;

const populateRoutingKey = (input: string, routingKey: string): string => {
  const regex = new RegExp(ROUTING_KEY_PLACEHOLDER, 'g');
  return input.replace(regex, routingKey);
}

const getRules = (
    headerKeys: Record<string, string>,
    routingKey: string
): chrome.declarativeNetRequest.Rule[] =>
    Object.keys(headerKeys).map(
        (key, idx) =>
            ({
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
                excludedRequestDomains: ["preview.signadot.com"],
                resourceTypes: MODIFY_HEADER_IN_RESOURCE_TYPES,
              },
            } as chrome.declarativeNetRequest.Rule)
    );

const getCurrentRuleIDs = (
    rules: chrome.declarativeNetRequest.Rule[]
): number[] => rules.map((rule) => rule.id);

async function updateDynamicRules() {
  if (inMemoryFeatureEnabled) {
    const rules = getRules(ROUTING_HEADERS, inMemoryHeaderValue || "");
    // Update the dynamic rules
    chrome.declarativeNetRequest
        .updateDynamicRules({
          // Set the new rules
          addRules: rules,

          // Remove the previous rules
          removeRuleIds: getCurrentRuleIDs(
              await chrome.declarativeNetRequest.getDynamicRules()
          ),
        })
        .then(() => {
          // Adding console.log() to help with debugging (Should be fine to retain in published script)
          chrome.declarativeNetRequest.getDynamicRules().then((rules) => {
          });
        })
        .catch(() => {
          // Error
        });
  } else {
    // Remove the previously set rule
    chrome.declarativeNetRequest.updateDynamicRules({
      removeRuleIds: getCurrentRuleIDs(
          await chrome.declarativeNetRequest.getDynamicRules()
      ),
    });
  }
}

// This function is used to update the in-memory values from local storage
function updateInMemoryValues(): void {
  chrome.storage.local.get([ROUTING_KEY, ENABLED_KEY], (result) => {
    inMemoryHeaderValue = result[ROUTING_KEY];
    inMemoryFeatureEnabled = !!result[ENABLED_KEY];
    updateDynamicRules();
  });
}

// Initialize the in-memory value when the extension is installed/updated or when Chrome is started
chrome.runtime.onInstalled.addListener(() => {
  updateInMemoryValues()
});
chrome.runtime.onStartup.addListener(() => {
  updateInMemoryValues()
});

// Keep the in-memory value in sync with changes in storage
chrome.storage.onChanged.addListener((changes, areaName) => {
  if (areaName === "local") {
    let updated = false;
    if (ROUTING_KEY in changes) {
      inMemoryHeaderValue = changes[ROUTING_KEY]?.newValue;
      updated = true;
    }
    if (ENABLED_KEY in changes) {
      inMemoryFeatureEnabled = !!changes[ENABLED_KEY]?.newValue;
      updated = true;
    }
    if (updated) {
      updateDynamicRules();
    }
  }
});

updateInMemoryValues();
