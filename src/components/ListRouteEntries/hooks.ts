import { useQuery } from "react-query";
import { ApiError, RoutingEntity, RoutingEntityType } from "./types";
import { fetchSandboxes, fetchRouteGroups } from "./queries";
import { useAuth } from "../../contexts/AuthContext";
import { useMemo } from "react";
import { useStorage } from "../../contexts/StorageContext/StorageContext";

// TODO: Move out orgName and apiKey from the function call
export const useFetchRoutingEntries = () => {
  const { authState } = useAuth();
  const { settings } = useStorage();
  const {
    data: sandboxes,
    error: sandboxesError,
    isLoading: sandboxesLoading,
  } = useQuery<RoutingEntity[], ApiError>(
    "sandboxes",
    () => {
      if (authState.status !== "authenticated") {
        throw new Error("Not authenticated");
      }
      if (!settings.signadotUrls.apiUrl) {
        throw new Error("API URL not configured");
      }
      return fetchSandboxes(settings.signadotUrls.apiUrl, authState.org.name);
    },
    {
      enabled: authState.status === "authenticated" && !!settings.signadotUrls.apiUrl
    }
  );
  const {
    data: routegroups,
    error: routegroupsError,
    isLoading: routegroupsLoading,
  } = useQuery<RoutingEntity[], ApiError>(
    "routegroups",
    () => {
      if (authState.status !== "authenticated") {
        throw new Error("Not authenticated");
      }
      if (!settings.signadotUrls.apiUrl) {
        throw new Error("API URL not configured");
      }
      return fetchRouteGroups(settings.signadotUrls.apiUrl, authState.org.name);
    },
    {
      enabled: authState.status === "authenticated" && !!settings.signadotUrls.apiUrl
    }
  );
  // TODO: Handle error and loading too.

  return useMemo(() => {
    const result: RoutingEntity[] = [];
    if (Array.isArray(sandboxes)) {
      sandboxes.forEach((sandbox) => {
        result.push({
          name: sandbox.name,
          routingKey: sandbox.routingKey,
          type: RoutingEntityType.Sandbox,
          cluster: (sandbox as any).spec.cluster,
        } as RoutingEntity);
      });
    }
    if (Array.isArray(routegroups)) {
      routegroups.forEach((routeGroup) => {
        result.push({
          name: routeGroup.name,
          routingKey: routeGroup.routingKey,
          type: RoutingEntityType.RouteGroup,
          cluster: (routeGroup as any).spec.cluster,
        } as RoutingEntity);
      });
    }
    return result;
  }, [sandboxes, routegroups]);
};