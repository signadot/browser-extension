import React from "react";
import styles from "./Frame.module.css";
import {RoutingEntity} from "../ListRouteEntries/types";
import ListRouteEntries from "../ListRouteEntries";
import {useFetchRoutingEntries} from "../ListRouteEntries/hooks";
import PinnedRouteGroup from "../PinnedRouteGroup";
import {useChromeStorage} from "../../hooks/storage";
import {Section, SectionCard} from "@blueprintjs/core";
import Footer from "../Footer";

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
                  <Section
                      compact
                      className={styles.pinned}
                  >
                    <SectionCard>
                      Headers are being set for:
                      <PinnedRouteGroup routingEntity={pinnedRoutingEntityData}/>
                    </SectionCard>
                  </Section>
              )}
              <Footer/>
            </div>
        )}
      </div>
  );
};

export default Frame;
