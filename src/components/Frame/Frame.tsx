import React from "react";
import styles from "./Frame.module.css";
import {Switch} from "@blueprintjs/core";
import {RoutingEntity} from "../ListRouteEntries/types";
import ListRouteEntries from "../ListRouteEntries";
import {useFetchRoutingEntries} from "../ListRouteEntries/hooks";
import PinnedRouteGroup from "../PinnedRouteGroup";
import {useChromeStorage} from "../../hooks/storage";

const Frame = () => {
  const [debug, setDebug] = React.useState<boolean>(false);
  const [routingKey, setRoutingKeyFn, enabled, setEnabledFn] = useChromeStorage();
  const routingEntities: RoutingEntity[] = useFetchRoutingEntries();
  const [userSelectedEntity, setUserSelectedEntity] = React.useState<RoutingEntity | undefined>(undefined);

  React.useEffect(() => {
    setRoutingKeyFn(userSelectedEntity?.routingKey)
  }, [userSelectedEntity]);
  const pinnedRoutingEntityData: RoutingEntity | undefined =
      React.useMemo(() => {
        const filteredList = routingEntities?.filter(
            (entity) => entity.routingKey === routingKey
        );
        return filteredList?.[0];
      }, [routingKey, routingEntities]);

  return (
      <div>
        <div className={styles.switchPanel}>
          <Switch
              alignIndicator={"right"}
              label={`Setting Routing Key header is ${
                  enabled ? "ENABLED" : "DISABLED"
              }`}
              onChange={(e) => setEnabledFn(e.target.checked)}
              className={styles.switch}
              checked={enabled}
          />
        </div>
        {debug && (
            <div>
              <div>Enabled: {enabled ? "true" : "false"}</div>
              <div>Selected entity: {JSON.stringify(userSelectedEntity)}</div>
              <div>Stored RoutingKey: {routingKey}</div>
            </div>
        )}
        {enabled && (
            <div className={styles.content}>
              <ListRouteEntries
                  routingEntities={routingEntities}
                  setUserSelectedRoutingEntity={setUserSelectedEntity}
              />
              {pinnedRoutingEntityData && (
                  <PinnedRouteGroup routingEntity={pinnedRoutingEntityData}/>
              )}
            </div>
        )}
      </div>
  );
};

export default Frame;
