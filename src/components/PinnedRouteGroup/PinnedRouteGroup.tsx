import React, { useMemo, useState } from "react";
import {RoutingEntity, RoutingEntityType} from "../ListRouteEntries/types";
import styles from "./PinnedRouteGroup.module.css";
import {Button, Icon, Card, Tag} from "@blueprintjs/core";
import { useChromeStorage } from "../../hooks/storage";

interface Props {
  routingEntity: RoutingEntity;
}

const getEntityDashboardURL = (dashboardUrl: string, routingEntity: RoutingEntity): string | undefined => {
  switch (routingEntity.type) {
    case RoutingEntityType.Sandbox:
      return dashboardUrl +`/sandbox/name/${routingEntity.name}/overview`;
    case RoutingEntityType.RouteGroup:
      return dashboardUrl+ `/routegroups/${routingEntity.name}`;
  }
  return undefined;
};

interface Props {
  routingEntity: RoutingEntity;
  onRemove: (routingEntity: RoutingEntity) => void;
}

const PinnedRouteGroup: React.FC<Props> = ({routingEntity, onRemove}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const {extraHeaders, injectedHeaders, setRoutingKeyFn, dashboardUrl} = useChromeStorage();

  if (dashboardUrl) {
    var entityDashboardURL = getEntityDashboardURL(dashboardUrl, routingEntity);
  }  

  const defaultHeaders = useMemo(() => {
    return Object.entries(injectedHeaders || {})
      .filter(([_, header]) => header.kind !== "extra")
      .map(([key]) => key);
  }, [injectedHeaders]);

  return (
    <Card className={styles.container} elevation={1}>
      <div className={styles.header}>
        <div className={styles.title}>
          {entityDashboardURL ? (
            <a href={entityDashboardURL} target="_blank" rel="noopener noreferrer">
              <div className={styles.link}>
                <div>{routingEntity.name}</div>
                <Icon icon="share" size={12} />
              </div>
            </a>
          ) : routingEntity.name}
        </div>
        <div className={styles.headerActions}>
          <Tag minimal>{routingEntity.type}</Tag>
          <Button
            minimal
            small
            icon="cross"
            onClick={() => {
              setRoutingKeyFn(undefined);
              onRemove(routingEntity);
            }}
            title="Remove"
          />
        </div>
      </div>

      <div className={styles.content}>
        <div className={styles.routingKey}>
          <strong>Routing Key:</strong> {routingEntity.routingKey}
        </div>

        <Button
          minimal
          small
          icon={isExpanded ? "chevron-down" : "chevron-right"}
          onClick={() => setIsExpanded(!isExpanded)}
          className={styles.headerButton}
        >
          {isExpanded ? 'Hide Details' : 'Show Details'}
        </Button>

        {isExpanded && (
          <div className={styles.headersList}>

            <h4>Injected Headers</h4>
            <div>
              <h5>Default Headers</h5>
              {defaultHeaders.length > 0 ? (
                <ul className={styles.headerItems}>
                  {defaultHeaders.map((header, index) => (
                    <li key={index}>
                      <Tag minimal intent="primary">{header}</Tag>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className={styles.noHeaders}>No default headers</div>
              )}

              {Array.isArray(extraHeaders) && extraHeaders.length > 0 && (
                <>
                  <h5>Custom Headers</h5>
                  <ul className={styles.headerItems}>
                    {extraHeaders.map((header, index) => (
                    <li key={index}>
                      <Tag minimal>{header}</Tag>
                    </li>
                    ))}
                  </ul>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};

export default PinnedRouteGroup;
