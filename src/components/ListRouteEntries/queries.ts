import {RoutingEntity} from "./types";
import {auth} from "../../contexts/auth";

export const useFetchSandboxes = async (
    orgName?: string
): Promise<RoutingEntity[]> => {
  // Wrap the auth and fetch logic inside a new Promise
  return new Promise((resolve, reject) => {
    auth((authenticated) => {
      if (!authenticated) {
        reject(new Error("Authorization failed"));
        return;
      }

      fetch(`https://api.signadot.com/api/v2/orgs/${orgName}/sandboxes`)
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
};

export const useFetchRouteGroups = async (
    orgName?: string
): Promise<RoutingEntity[]> => {
  // Wrap the auth and fetch logic inside a new Promise
  return new Promise((resolve, reject) => {
    auth((authenticated) => {
      if (!authenticated) {
        reject(new Error("Authorization failed"));
        return;
      }

      fetch(`https://api.signadot.com/api/v2/orgs/${orgName}/routegroups`)
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
};
