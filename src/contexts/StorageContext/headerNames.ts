
export type Header = {
    key: string;
    value: string;
    kind: 'basic' | 'extra';
}

export const BASIC_HEADERS: Header[] = [
    { key: "baggage", value: "sd-routing-key={routingKey},sd-sandbox={routingKey}", kind: 'basic' },
    { key: "tracestate", value: "sd-routing-key={routingKey},sd-sandbox={routingKey}", kind: 'basic' },
];

export const HEADERS_BEFORE_V191: Header[] = [
    { key: "ot-baggage-sd-routing-key", value: "{routingKey}", kind: 'extra' },
    { key: "ot-baggage-sd-sandbox", value: "{routingKey}", kind: 'extra' },
    { key: "uberctx-sd-routing-key", value: "{routingKey}", kind: 'extra' },
    { key: "uberctx-sd-sandbox", value: "{routingKey}", kind: 'extra' },
];
