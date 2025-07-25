import { Cluster, RoutingEntity } from "./types";

// These function assumes the user is authenticated, otherwise we wouldn't have
// an org name (and note that on popup open, we are reloading the auth)

export const fetchSandboxes = async (apiUrl: string, orgName?: string): Promise<RoutingEntity[]> => {
  return new Promise(async (resolve, reject) => {
    fetch(new URL(`/api/v2/orgs/${orgName}/sandboxes`, apiUrl).toString())
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to fetch sandboxes");
        }
        return response.json();
      })
      .then((data) => resolve(data))
      .catch((error) => reject(error));
  });
};

export const fetchRouteGroups = async (apiUrl: string, orgName?: string): Promise<RoutingEntity[]> => {
  return new Promise(async (resolve, reject) => {
    fetch(new URL(`/api/v2/orgs/${orgName}/routegroups`, apiUrl).toString())
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to fetch route groups");
        }
        return response.json();
      })
      .then((data) => resolve(data))
      .catch((error) => reject(error));
  });
};

export const fetchClusters = async (apiUrl: string, orgName: string): Promise<Cluster[]> => {
  return new Promise(async (resolve, reject) => {
    fetch(new URL(`/api/v2/orgs/${orgName}/clusters`, apiUrl).toString())
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to fetch clusters");
        }
        return response.json();
      })
      .then((data) => resolve(data))
      .catch((error) => reject(error));
  });
}; 