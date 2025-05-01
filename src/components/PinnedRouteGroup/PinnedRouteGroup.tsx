import React, { useMemo, useState } from "react";
import { RoutingEntity, RoutingEntityType } from "../ListRouteEntries/types";
import styles from "./PinnedRouteGroup.module.css";
import { Button, Icon, Tag, Switch, Tooltip } from "@blueprintjs/core";
import { useStorage } from "../../contexts/StorageContext/StorageContext";
import { getGroupedHeadersByKind } from "../../contexts/StorageContext/utils";

interface Props {
  routingEntity: RoutingEntity;
}

const getEntityDashboardURL = (dashboardUrl: string, routingEntity: RoutingEntity): string | undefined => {
  switch (routingEntity.type) {
    case RoutingEntityType.Sandbox:
      return new URL(`/sandbox/name/${routingEntity.name}/overview`, dashboardUrl).toString();
    case RoutingEntityType.RouteGroup:
      return new URL(`/routegroups/${routingEntity.name}`, dashboardUrl).toString();
  }
  return undefined;
};

interface Props {
  routingEntity: RoutingEntity;
  onRemove: (routingEntity: RoutingEntity) => void;
}

const PinnedRouteGroup: React.FC<Props> = ({ routingEntity, onRemove }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const { headers, settings, setSettings, setCurrentRoutingKey } = useStorage();

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
          <Tag minimal>{routingEntity.type}</Tag>
        </div>
        <div className={styles.headerActions}>
          <Tooltip content={`Header injection ${settings.enabled ? "Enabled" : "Disabled"}`}>
            <Switch
              alignIndicator={"right"}
              onChange={(e) => setSettings({ ...settings, enabled: e.target.checked })}
              checked={settings.enabled}
              className="bp3-intent-success"
            />
          </Tooltip>
          <Button
            minimal
            small
            icon="cross"
            onClick={() => {
              setCurrentRoutingKey(undefined);
              onRemove(routingEntity);
            }}
            title="Remove"
            className={styles.removeButton}
          />
        </div>
      </div>

      <div className={styles.content} style={{marginBottom: isExpanded ? undefined : 0}}>
        <div className={styles.routingKey}>
          <strong>Routing Key:</strong> {routingEntity.routingKey}
        </div>

        <Button
          minimal
          onClick={() => setIsExpanded(!isExpanded)}
          className={styles.headerButton}
          fill
          active={false}
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
