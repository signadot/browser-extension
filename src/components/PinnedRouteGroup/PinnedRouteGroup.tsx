import React from "react";
import {RoutingEntity, RoutingEntityType} from "../ListRouteEntries/types";
import styles from "./PinnedRouteGroup.module.css";
import {Icon} from "@blueprintjs/core";
import {DASHBOARD_ENDPOINT} from "../../contexts/auth";

interface Props {
  routingEntity: RoutingEntity;
}

const getDashboardURL = (routingEntity: RoutingEntity): string | undefined => {
  switch (routingEntity.type) {
    case RoutingEntityType.Sandbox:
      return DASHBOARD_ENDPOINT +`/sandbox/name/${routingEntity.name}/overview`;
    case RoutingEntityType.RouteGroup:
      return DASHBOARD_ENDPOINT+ `/routegroups/${routingEntity.name}`;
  }
  return undefined;
};

const PinnedRouteGroup: React.FC<Props> = ({routingEntity}) => {
  const dashboardURL = getDashboardURL(routingEntity);
  return (
    <div className={styles.container}>
        <div className={styles.header}>
          <div className={styles.title}>
            {dashboardURL ? (
                <a href={dashboardURL} target="_blank">
                  <div className={styles.link}>
                    <div>{routingEntity.name}</div>
                    <Icon icon="link" />
                  </div>
                </a>
            ) : routingEntity.name}
          </div>
          <div className={styles.type}>{routingEntity.type}</div>
        </div>
        <div>Routing Key: {routingEntity.routingKey}</div>
      </div>
  );
};

export default PinnedRouteGroup;
