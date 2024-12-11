import {Cluster, RoutingEntity} from "./types";
import {auth} from "../../contexts/auth";
import {getApiUrl} from "../Settings/api";

export const fetchSandboxes = async (
    orgName?: string
): Promise<RoutingEntity[]> => {
  return new Promise(async (resolve, reject) => {
    auth((isAuthenticated: boolean) => {
      if (!isAuthenticated) {
        reject(new Error("Authorization failed"));
        return;
      }

      getApiUrl().then((apiUrl: string) => {
        fetch(`${apiUrl}/api/v2/orgs/${orgName}/sandboxes`)
          .then((response) => {
            if (!response.ok) {
              throw new Error("Failed to fetch sandboxes");
            }
            return response.json();
          })
          .then((data) => resolve(data))
          .catch((error) => reject(error));
      });
    });
  });
};

export const fetchRouteGroups = async (
    orgName?: string
): Promise<RoutingEntity[]> => {
  return new Promise(async (resolve, reject) => {
    auth((isAuthenticated: boolean) => {
      if (!isAuthenticated) {
        reject(new Error("Authorization failed"));
        return;
      }

      getApiUrl().then((apiUrl: string) => {
        fetch(`${apiUrl}/api/v2/orgs/${orgName}/routegroups`)
          .then((response) => {
            if (!response.ok) {
              throw new Error("Failed to fetch route groups");
            }
            return response.json();
          })
          .then((data) => resolve(data))
          .catch((error) => reject(error));
      });
    });
  });
};

export const fetchClusters = async (
    orgName: string
): Promise<Cluster[]> => {
    return new Promise(async (resolve, reject) => {
        auth((isAuthenticated: boolean) => {
            if (!isAuthenticated) {
                reject(new Error("Authorization failed"));
                return;
            }

            getApiUrl().then((apiUrl: string) => {
              fetch(`${apiUrl}/api/v2/orgs/${orgName}/clusters`)
                  .then((response) => {
                      if (!response.ok) {
                          throw new Error("Failed to fetch clusters");
                      }
                      return response.json();
                  })
                  .then((data) => resolve(data))
                  .catch((error) => reject(error));
            });
        });
    });
};
