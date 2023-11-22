import {useQuery} from "react-query";
import {ApiError, RoutingEntity, RoutingEntityType} from "./types";
import {useFetchRouteGroups, useFetchSandboxes} from "./queries";
import {useAuth} from "../../contexts/AuthContext";
import {useMemo} from "react";

// TODO: Move out orgName and apiKey from the function call
export const useFetchRoutingEntries = () => {
  const {authState} = useAuth();
  const {
    data: sandboxes,
    error: sandboxesError,
    isLoading: sandboxesLoading,
  } = useQuery<RoutingEntity[], ApiError>("sandboxes", () =>
      useFetchSandboxes(authState?.org.name)
  );
  const {
    data: routegroups,
    error: routegroupsError,
    isLoading: routegroupsLoading,
  } = useQuery<RoutingEntity[], ApiError>("routegroups", () =>
      useFetchRouteGroups(authState?.org.name)
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
        } as RoutingEntity);
      });
    }
    if (Array.isArray(routegroups)) {
      routegroups.forEach((routeGroup) => {
        result.push({
          name: routeGroup.name,
          routingKey: routeGroup.routingKey,
          type: RoutingEntityType.RouteGroup,
        } as RoutingEntity);
      });
    }
    return result;
  }, [sandboxes, routegroups]);
};
