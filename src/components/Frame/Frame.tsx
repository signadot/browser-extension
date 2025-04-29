import React, { useEffect, useMemo, useState } from "react";
import styles from "./Frame.module.css";
import { RoutingEntity } from "../ListRouteEntries/types";
import ListRouteEntries from "../ListRouteEntries";
import { useFetchRoutingEntries } from "../ListRouteEntries/hooks";
import PinnedRouteGroup from "../PinnedRouteGroup";
import { Section, SectionCard } from "@blueprintjs/core";
import Footer from "../Footer";
import Settings from "../Settings/Settings";
import { useAuth } from "../../contexts/AuthContext";
import { useRouteView } from "../../contexts/RouteViewContext/RouteViewContext";
import { useStorage } from "../../contexts/StorageContext/StorageContext";

const Frame = () => {
  const { currentRoutingKey, setCurrentRoutingKey, settings } = useStorage();
  const routingEntities: RoutingEntity[] = useFetchRoutingEntries();
  const { currentView, setCurrentView } = useRouteView();

  const { authState } = useAuth();

  const { enabled } = settings;

  const pinnedRoutingEntityData: RoutingEntity | undefined = React.useMemo(() => {
    const filteredList = routingEntities?.filter((entity) => entity.routingKey === currentRoutingKey);
    return filteredList?.[0];
  }, [currentRoutingKey, routingEntities]);

  return (
    <div>
      {enabled && (
        <div className={styles.content}>
          {currentView === "settings" ? (
            <Settings onClose={() => setCurrentView("home")} />
          ) : (
            <div className={styles.home}>
              <div>
                <ListRouteEntries
                  orgName={authState?.org.name}
                  routingEntities={routingEntities}
                  setUserSelectedRoutingEntity={(routingEntity) => setCurrentRoutingKey(routingEntity.routingKey)}
                />
                {pinnedRoutingEntityData ? (
                  <Section compact className={styles.pinned}>
                    <SectionCard>
                      Headers are being set for:
                      <PinnedRouteGroup
                        routingEntity={pinnedRoutingEntityData}
                        onRemove={() => {
                          setCurrentRoutingKey(undefined);
                        }}
                      />
                    </SectionCard>
                  </Section>
                ) : (
                  <Section compact className={styles.pinned}>
                    <SectionCard className={styles.noSelectedMessage}>No Sandbox or RouteGroup selected</SectionCard>
                  </Section>
                )}
              </div>
              <Footer />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Frame;
