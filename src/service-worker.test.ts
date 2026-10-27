type Rule = chrome.declarativeNetRequest.Rule;
type ChangeListener = Parameters<typeof chrome.storage.onChanged.addListener>[0];

// Every mocked call takes a macrotask, like the real async APIs, so concurrent callers interleave.
const tick = () => new Promise((resolve) => setTimeout(resolve, 0));
const settle = async () => {
  for (let i = 0; i < 20; i++) await tick();
};

let store: Record<string, unknown> = {};
let rules: Rule[] = [];
let onChanged: ChangeListener;

const updateDynamicRules = jest.fn(
  async ({ removeRuleIds = [], addRules = [] }: chrome.declarativeNetRequest.UpdateRuleOptions) => {
    await tick();
    const next = rules.filter((rule) => !removeRuleIds.includes(rule.id));
    for (const rule of addRules) {
      // Chrome rejects the whole update when an added rule's id is already taken.
      if (next.some((existing) => existing.id === rule.id)) {
        throw new Error(`Rule with id ${rule.id} does not have a unique ID.`);
      }
      next.push(rule);
    }
    rules = next;
  },
);

const chromeMock = {
  declarativeNetRequest: {
    ResourceType: new Proxy({}, { get: (_target, key) => String(key).toLowerCase() }),
    RuleActionType: { MODIFY_HEADERS: "modifyHeaders" },
    HeaderOperation: { SET: "set" },
    getDynamicRules: async () => {
      await tick();
      return rules;
    },
    updateDynamicRules,
  },
  storage: {
    local: {
      get: async (keys: string[]) => {
        await tick();
        return Object.fromEntries(keys.filter((key) => key in store).map((key) => [key, store[key]]));
      },
    },
    onChanged: {
      addListener: (listener: ChangeListener) => {
        onChanged = listener;
      },
    },
  },
  runtime: {
    onInstalled: { addListener: () => {} },
    onStartup: { addListener: () => {} },
  },
};

const basic = [
  ["baggage", "sd-routing-key=rk"],
  ["tracestate", "sd-routing-key=rk"],
];
const full = [...basic, ["x-custom-route", "rk"]];

const setHeaders = (headers: string[][]) => {
  store.headers = JSON.stringify(headers);
  onChanged({ headers: { newValue: store.headers } }, "local");
};

const injectedHeaders = () => rules.map((rule) => rule.action.requestHeaders?.[0].header);

let log: jest.SpyInstance;

beforeAll(() => {
  Object.assign(globalThis, { chrome: chromeMock });
  log = jest.spyOn(console, "log").mockImplementation(() => {});
  require("./service-worker");
});

afterAll(() => log.mockRestore());

beforeEach(() => {
  store = { routingKey: "rk", enabled: true };
  rules = [];
  updateDynamicRules.mockClear();
});

describe("service worker rule updates", () => {
  it("applies a burst of headers changes one at a time, ending on the latest headers", async () => {
    setHeaders(basic);
    setHeaders(full);
    await settle();

    const outcomes = await Promise.allSettled(updateDynamicRules.mock.results.map((result) => result.value));
    expect(outcomes.map((outcome) => outcome.status)).toEqual(["fulfilled", "fulfilled"]);
    expect(injectedHeaders()).toEqual(["baggage", "tracestate", "x-custom-route"]);
  });

  it("logs a failed update and still applies the next one", async () => {
    const error = jest.spyOn(console, "error").mockImplementation(() => {});
    updateDynamicRules.mockRejectedValueOnce(new Error("quota exceeded"));

    setHeaders(basic);
    setHeaders(full);
    await settle();

    expect(error).toHaveBeenCalledWith("Error updating dynamic rules: ", expect.any(Error));
    expect(injectedHeaders()).toEqual(["baggage", "tracestate", "x-custom-route"]);
    error.mockRestore();
  });
});
