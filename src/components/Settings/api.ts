import { auth } from "../../contexts/auth";
import { RoutingEntity } from "../ListRouteEntries/types";

export const DEFAULT_API_URL = 'https://api.signadot.com';

export const getApiUrl = async (): Promise<string> => {
  return new Promise<string>((resolve) => {
    chrome.storage.sync.get(['apiUrl'], (result: { apiUrl?: string }) => {
      const baseUrl = (result.apiUrl || DEFAULT_API_URL).replace(/\/+$/, '');
      resolve(baseUrl);
    });
  });
};

export const getClusters = async (
    orgName: string
): Promise<RoutingEntity[]> => {
    // Wrap the auth and fetch logic inside a new Promise
    return new Promise((resolve, reject) => {
        auth((isAuthenticated) => {
            if (!isAuthenticated) {
                reject(new Error("Authorization failed"));
                return;
            }

            fetch(`https://api.signadot.com/api/v2/orgs/${orgName}/clusters`)
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
