import React, {useEffect, useMemo, useState} from "react";
import styles from "./Frame.module.css";
import {RoutingEntity} from "../ListRouteEntries/types";
import ListRouteEntries from "../ListRouteEntries";
import {useFetchRoutingEntries} from "../ListRouteEntries/hooks";
import PinnedRouteGroup from "../PinnedRouteGroup";
import {Section, SectionCard} from "@blueprintjs/core";
import Footer from "../Footer";
import Settings from "../Settings/Settings";
import {useAuth} from "../../contexts/AuthContext";
import {useRouteView} from "../../contexts/RouteViewContext/RouteViewContext";
import { useStorage } from "../../contexts/StorageContext/StorageContext";

const Frame = () => {
    const {currentRoutingKey, setCurrentRoutingKey} = useStorage();

    const routingEntities: RoutingEntity[] = useFetchRoutingEntries();
    const {currentView, setCurrentView} = useRouteView();
    const {authState} = useAuth();

    const pinnedRoutingEntityData: RoutingEntity | undefined =
        useMemo(() => {
            const filteredList = routingEntities?.filter(
                (entity) => entity.routingKey === currentRoutingKey
            );
            return filteredList?.[0];
        }, [currentRoutingKey, routingEntities]);

    return (
        <div className={styles.container}>
            {currentView === "settings" ? (
                <Settings onClose={() => setCurrentView("home")}/>
            ) : (
                <>
                    {pinnedRoutingEntityData && (
                        <PinnedRouteGroup
                            routingEntity={pinnedRoutingEntityData}
                            onRemove={() => setCurrentRoutingKey(undefined)}
                        />
                    )}
                    <ListRouteEntries
                        routingEntities={routingEntities}
                        setUserSelectedRoutingEntity={(e) => setCurrentRoutingKey(e.routingKey)}
                        orgName={authState?.org.name}
                    />
                    <Footer/>
                </>
            )}
        </div>
    );
};

export default Frame;
