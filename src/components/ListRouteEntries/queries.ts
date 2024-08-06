import {RoutingEntity} from "./types";
import {auth} from "../../contexts/auth";
import axios from "axios";

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

      axios.get<RoutingEntity[]>(`/api/v2/orgs/${orgName}/sandboxes`)
        .then((response) => resolve(response.data))
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

      axios.get<RoutingEntity[]>(`/api/v2/orgs/${orgName}/routegroups`)
        .then((response) => resolve(response.data))
        .catch((error) => reject(error));
    });
  });
};
