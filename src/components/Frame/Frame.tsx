import React from "react";
import styles from "./Frame.module.css";
import {RoutingEntity} from "../ListRouteEntries/types";
import ListRouteEntries from "../ListRouteEntries";
import {useFetchRoutingEntries} from "../ListRouteEntries/hooks";
import PinnedRouteGroup from "../PinnedRouteGroup";
import {useChromeStorage} from "../../hooks/storage";
import {Section, SectionCard} from "@blueprintjs/core";
import Footer from "../Footer";
import Settings from "../Settings/Settings";
import {useAuth} from "../../contexts/AuthContext";
import {useRouteView} from "../../contexts/RouteViewContext/RouteViewContext";
import { DebugPanel } from "../DebugPanel";

const Frame = () => {
    const [debug, setDebug] = React.useState<boolean>(false);
    const {routingKey, setRoutingKeyFn, enabled, extraHeaders} = useChromeStorage();
    const routingEntities: RoutingEntity[] = useFetchRoutingEntries();
    const [userSelectedEntity, setUserSelectedEntity] = React.useState<RoutingEntity | undefined>(undefined);
    const {currentView, setCurrentView} = useRouteView();
    const {authState} = useAuth();

    React.useEffect(() => {
        if (userSelectedEntity) {
            setRoutingKeyFn(userSelectedEntity.routingKey)
        }
    }, [userSelectedEntity]);

    const pinnedRoutingEntityData: RoutingEntity | undefined =
        React.useMemo(() => {
            const filteredList = routingEntities?.filter(
                (entity) => entity.routingKey === routingKey
            );
            return filteredList?.[0];
        }, [routingKey, routingEntities]);

    return (
        <div className={styles.container}>
            {currentView === "settings" ? (
                <Settings onClose={() => setCurrentView("home")}/>
            ) : (
                <>
                    {pinnedRoutingEntityData && (
                        <PinnedRouteGroup
                            routingEntity={pinnedRoutingEntityData}
                            onRemove={() => setUserSelectedEntity(undefined)}
                        />
                    )}
                    <ListRouteEntries
                        routingEntities={routingEntities}
                        setUserSelectedRoutingEntity={setUserSelectedEntity}
                        orgName={authState?.org.name}
                    />
                    <Footer/>
                    <DebugPanel/>
                </>
            )}
        </div>
    );
};

export default Frame;
