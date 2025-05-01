import React, { useMemo, useState } from "react";
import { RoutingEntity, RoutingEntityType } from "../ListRouteEntries/types";
import styles from "./PinnedRouteGroup.module.css";
import { Button, Icon, Tag } from "@blueprintjs/core";
import { useStorage } from "../../contexts/StorageContext/StorageContext";
import { getGroupedHeadersByKind } from "../../contexts/StorageContext/utils";

interface Props {
  routingEntity: RoutingEntity;
}

const getEntityDashboardURL = (dashboardUrl: string, routingEntity: RoutingEntity): string | undefined => {
  switch (routingEntity.type) {
    case RoutingEntityType.Sandbox:
      return dashboardUrl + `/sandbox/name/${routingEntity.name}/overview`;
    case RoutingEntityType.RouteGroup:
      return dashboardUrl + `/routegroups/${routingEntity.name}`;
  }
  return undefined;
};

interface Props {
  routingEntity: RoutingEntity;
  onRemove: (routingEntity: RoutingEntity) => void;
}

const PinnedRouteGroup: React.FC<Props> = ({ routingEntity, onRemove }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const { headers, settings, setCurrentRoutingKey } = useStorage();

  let entityDashboardURL: string | undefined;
  if (settings.signadotUrls.dashboardUrl) {
    entityDashboardURL = getEntityDashboardURL(settings.signadotUrls.dashboardUrl, routingEntity);
  }

  const groupedHeaders = useMemo(() => {
    return getGroupedHeadersByKind(headers);
  }, [headers]);

  return (
    <section className={styles.container}>
      <div className={styles.header}>
        <div className={styles.title}>
          {entityDashboardURL ? (
            <a href={entityDashboardURL} target="_blank" rel="noopener noreferrer">
              <div className={styles.link}>
                <div>{routingEntity.name}</div>
                <Icon icon="share" size={12} />
              </div>
            </a>
          ) : (
            routingEntity.name
          )}
        </div>
        <div className={styles.headerActions}>
          <Tag minimal>{routingEntity.type}</Tag>
          <Button
            minimal
            small
            icon="cross"
            onClick={() => {
              setCurrentRoutingKey(undefined);
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
          onClick={() => setIsExpanded(!isExpanded)}
          className={styles.headerButton}
        >
          <div className={styles.headerButtonText}>
            <span>{isExpanded ? "Show Less" : "Show Details"}</span>
            <Icon icon={isExpanded ? "chevron-up" : "chevron-down"} />
          </div>
        </Button>

        {isExpanded && (
          <div className={styles.headersList}>
            <h4 className={styles.headersTitle}>Injected Headers</h4>
            <div>
              <h5>Default Headers</h5>
              {groupedHeaders.default.length > 0 ? (
                <ul className={styles.headerItems}>
                  {groupedHeaders.default.map((header, index) => (
                    <li key={index}>
                      <Tag minimal intent="primary">
                        {header.key}
                      </Tag>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className={styles.noHeaders}>No default headers</div>
              )}

              {groupedHeaders.extra.length > 0 && (
                <>
                  <h5>Custom Headers</h5>
                  <ul className={styles.headerItems}>
                    {groupedHeaders.extra.map((header, index) => (
                      <li key={index}>
                        <Tag minimal>{header.key}</Tag>
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default PinnedRouteGroup;
