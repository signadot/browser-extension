import { Header } from "./types";

export const HEADER_VALUE_TEMPLATE = "{routingKey}";

export const BASIC_HEADERS: Header[] = [
    { key: "baggage", value: "sd-routing-key={routingKey},sd-sandbox={routingKey}", kind: 'basic' },
    { key: "tracestate", value: "sd-routing-key={routingKey},sd-sandbox={routingKey}", kind: 'basic' },
];

export const HEADERS_BEFORE_V191: Header[] = [
    { key: "ot-baggage-sd-routing-key", value: HEADER_VALUE_TEMPLATE, kind: 'extra' },
    { key: "ot-baggage-sd-sandbox", value: HEADER_VALUE_TEMPLATE, kind: 'extra' },
    { key: "uberctx-sd-routing-key", value: HEADER_VALUE_TEMPLATE, kind: 'extra' },
    { key: "uberctx-sd-sandbox", value: HEADER_VALUE_TEMPLATE, kind: 'extra' },
];
