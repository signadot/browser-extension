import type { Cluster, RoutingEntity } from "./types";

// These function assumes the user is authenticated, otherwise we wouldn't have
// an org name (and note that on popup open, we are reloading the auth)

interface PaginatedRoutingEntities {
  items: RoutingEntity[];
  nextCursor?: string | null;
  hasMore: boolean;
}

export const fetchSandboxes = async (apiUrl: string, orgName?: string): Promise<RoutingEntity[]> => {
  const sandboxes: RoutingEntity[] = [];
  let cursor: string | undefined;

  for (;;) {
    const url = new URL(`/api/v2/orgs/${orgName}/sandboxes`, apiUrl);
    url.searchParams.set("pageSize", "500");
    if (cursor) {
      url.searchParams.set("cursor", cursor);
    }

    const response = await fetch(url.toString(), {
      headers: {
        "signadot-api-opt-in": "pagination",
      },
    });
    if (!response.ok) {
      throw new Error("Failed to fetch sandboxes");
    }

    const data = (await response.json()) as PaginatedRoutingEntities | RoutingEntity[];
    // Keep the extension usable while an older API server still returns the
    // legacy bare array. That response already contains the complete list.
    if (Array.isArray(data)) {
      return sandboxes.concat(data);
    }
    sandboxes.push(...data.items);

    if (!data.hasMore) {
      return sandboxes;
    }
    if (!data.nextCursor) {
      throw new Error("Failed to fetch sandboxes");
    }
    cursor = data.nextCursor;
  }
};

export const fetchRouteGroups = async (apiUrl: string, orgName?: string): Promise<RoutingEntity[]> => {
  const response = await fetch(new URL(`/api/v2/orgs/${orgName}/routegroups`, apiUrl).toString());
  if (!response.ok) {
    throw new Error("Failed to fetch route groups");
  }
  return (await response.json()) as RoutingEntity[];
};

export const fetchClusters = async (apiUrl: string, orgName: string): Promise<Cluster[]> => {
  const response = await fetch(new URL(`/api/v2/orgs/${orgName}/clusters`, apiUrl).toString());
  if (!response.ok) {
    throw new Error("Failed to fetch clusters");
  }
  return (await response.json()) as Cluster[];
};
