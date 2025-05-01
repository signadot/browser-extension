import { DEFAULT_SIGNADOT_DASHBOARD_URL, DEFAULT_SIGNADOT_API_URL, DEFAULT_SIGNADOT_PREVIEW_URL } from "./defaults";
import { Settings, Header, SignadotUrlsConfig } from "./types";

export const getGroupedHeadersByKind = (headers: Header[]): Record<"default" | "extra", Header[]> => {
  const groupedHeaders: Record<"default" | "extra", Header[]> = {
    default: [],
    extra: [],
  };

  headers.forEach((header) => {
    if (header.kind === "default") {
      groupedHeaders.default.push(header);
      return;
    }

    groupedHeaders.extra.push(header);
  });

  return groupedHeaders;
};

export const shouldInjectHeader = (
  isAuthenticated: boolean,
  routingKey: string | undefined,
  headers: Header[],
  enabled: boolean,
): boolean => {
  return enabled && isAuthenticated && typeof routingKey === "string" && headers.length > 0;
};

export const parseSignadotConfig = (settings: Settings) => {
  return {
    toJson: () => {
      return JSON.stringify(settings.signadotUrls);
    },
    fromJson: (json: string): SignadotUrlsConfig => {
      const parsed = JSON.parse(json);
      return {
        apiUrl: parsed.apiUrl || DEFAULT_SIGNADOT_API_URL,
        previewUrl: parsed.previewUrl || DEFAULT_SIGNADOT_PREVIEW_URL,
        dashboardUrl: parsed.dashboardUrl || DEFAULT_SIGNADOT_DASHBOARD_URL,
      };
    },
  };
};
