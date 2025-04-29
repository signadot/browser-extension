import React, { useEffect } from "react";
import { useQuery } from "react-query";
import { fetchClusters } from "./queries";
import { RoutingEntity } from "./types";
import { ItemListRendererProps, ItemPredicate, ItemRenderer, Suggest } from "@blueprintjs/select";
import { Menu, MenuItem } from "@blueprintjs/core";
import styles from "./ListRouteEntries.module.css";
import { useStorage } from "../../contexts/StorageContext/StorageContext";
import { BASIC_HEADERS, HEADER_VALUE_TEMPLATE } from "../../contexts/StorageContext/headerNames";
const SELECT_LIST_ITEM_COUNT = 5;

interface Props {
  routingEntities: RoutingEntity[];
  setUserSelectedRoutingEntity: (routingEntity: RoutingEntity) => void;
  orgName?: string;
}

const ListRouteEntries: React.FC<Props> = ({ routingEntities, setUserSelectedRoutingEntity, orgName }) => {
  const { settings, setHeaders, currentRoutingKey } = useStorage();

  const {
    data: clusters,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["clusters", orgName],
    queryFn: () => fetchClusters(orgName!),
    enabled: !!orgName,
  });

  useEffect(() => {
    refetch();
  }, [settings.signadotUrls.apiUrl]);

  const calculateHeaders = (routingEntity: RoutingEntity) => {
    const cluster = clusters?.find((c) => c.name === routingEntity.cluster);

    if (!cluster) return [];
    const clusterConfig = cluster.clusterConfig;

    let headers = BASIC_HEADERS;
    if (clusterConfig) {
      headers = [
        ...headers,
        ...(clusterConfig?.routing?.customHeaders?.map((header) => ({
          key: header,
          value: HEADER_VALUE_TEMPLATE,
          kind: "extra" as const,
        })) || []),
      ];
    }

    return headers;
  };

  useEffect(() => {
    if (currentRoutingKey && routingEntities.length > 0) {
      const selected = routingEntities.find((entity) => entity.routingKey === currentRoutingKey);
      if (selected) {
        const headers = calculateHeaders(selected);
        setHeaders(headers);
      }
    }
  }, [currentRoutingKey, routingEntities]);

  const handleClick = React.useCallback(
    (name: string): void => {
      const filteredEntity = routingEntities.filter((entity) => entity.name === name);
      const selected = filteredEntity?.[0];
      if (selected) {
        setUserSelectedRoutingEntity(selected);

        const headers = calculateHeaders(selected);
        setHeaders(headers);
      }
    },
    [routingEntities],
  );

  const filterFunction = (query: string, item: RoutingEntity): boolean => {
    const normalizedQuery = query.trim().toLowerCase();
    if (normalizedQuery.length === 0) {
      return true;
    }
    const keywords = normalizedQuery.split(/\s+/).filter((str) => str.length > 0);
    return keywords.every(
      (keyword) =>
        item.name.toLowerCase().includes(keyword) ||
        item.routingKey.toLowerCase().includes(keyword) ||
        item.type.toLowerCase().includes(keyword),
    );
  };

  const predicate: ItemPredicate<RoutingEntity> = (query, routingEntity, _index) => {
    return filterFunction(query, routingEntity);
  };

  const listRenderer = ({ items, itemsParentRef, renderItem, query }: ItemListRendererProps<RoutingEntity>) => {
    const filteredItems = items.filter((item) => filterFunction(query, item)).slice(0, SELECT_LIST_ITEM_COUNT);
    return <Menu ulRef={itemsParentRef}>{filteredItems.map(renderItem)}</Menu>;
  };

  const itemRenderer: ItemRenderer<RoutingEntity> = (routingEntity, { handleClick, handleFocus, modifiers, query }) => {
    if (!modifiers.matchesPredicate) {
      return null;
    }
    return (
      <MenuItem
        active={modifiers.active}
        disabled={modifiers.disabled}
        key={routingEntity.routingKey}
        label={routingEntity.routingKey}
        onClick={handleClick}
        roleStructure="listoption"
        text={`[${routingEntity.type}] ${routingEntity.name}`}
      />
    );
  };

  const renderInputValue = (re: RoutingEntity) => re.name;

  return (
    <div className={styles.container}>
      {isLoading && <div>Loading...</div>}
      {/* {error && <div>Error: {error?.message || 'An unknown error occurred'}</div>} */}
      {!isLoading && !error && (
        <Suggest<RoutingEntity>
          items={routingEntities}
          itemPredicate={predicate}
          itemRenderer={itemRenderer}
          itemListRenderer={listRenderer}
          inputValueRenderer={renderInputValue}
          popoverProps={{ minimal: true }}
          resetOnSelect
          noResults={<MenuItem disabled={true} text="No results" roleStructure="listoption" />}
          onItemSelect={(item, event) => {
            if (item) {
              handleClick(item.name);
            }
          }}
        />
      )}
    </div>
  );
};

export default ListRouteEntries;
