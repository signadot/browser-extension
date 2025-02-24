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
                    {currentView === "settings" ? (
                        <Settings onClose={() => setCurrentView("home")}/>
                    ) : (
                        <div className={styles.home}>
                            <div>
                                <ListRouteEntries
                                    orgName={authState?.org.name}
                                    routingEntities={routingEntities}
                                    setUserSelectedRoutingEntity={setUserSelectedEntity}
                                />
                                {pinnedRoutingEntityData ? (
                                    <Section
                                        compact
                                        className={styles.pinned}
                                    >
                                        <SectionCard>
                                            Headers are being set for:
                                            <PinnedRouteGroup routingEntity={pinnedRoutingEntityData} onRemove={() => {
                                                setUserSelectedEntity(undefined);
                                                setRoutingKeyFn(undefined);
                                            }}/>
                                        </SectionCard>
                                    </Section>
                                ) : <Section
                                    compact
                                    className={styles.pinned}
                                >
                                    <SectionCard>
                                        No Sandbox or RouteGroup selected
                                    </SectionCard>
                                </Section>}
                            </div>
                            <Footer/>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default Frame;
