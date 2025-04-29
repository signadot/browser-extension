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
import { Route } from "../Route";
import { ProtectedRoute } from "../ProtectedRoute";

const Login = () => {
  const { settings } = useStorage();
  const { previewUrl } = settings.signadotUrls;

  return (
    <div>
      Please{" "}
      <a href={previewUrl} target="_blank">
        Login to Signadot
      </a>{" "}
      to continue.
    </div>
  );
};

const Loading = () => {
  return <div>Loading...</div>;
};

const Home = () => {
  const { currentRoutingKey, setCurrentRoutingKey } = useStorage();
  const routingEntities: RoutingEntity[] = useFetchRoutingEntries();
  const { authState } = useAuth();

  const pinnedRoutingEntityData: RoutingEntity | undefined = useMemo(() => {
    const filteredList = routingEntities?.filter((entity) => entity.routingKey === currentRoutingKey);
    return filteredList?.[0];
  }, [currentRoutingKey, routingEntities]);

  return (
    <>
      {pinnedRoutingEntityData && (
        <PinnedRouteGroup routingEntity={pinnedRoutingEntityData} onRemove={() => setCurrentRoutingKey(undefined)} />
      )}
      <ListRouteEntries
        routingEntities={routingEntities}
        setUserSelectedRoutingEntity={(e) => setCurrentRoutingKey(e.routingKey)}
        orgName={authState?.org.name}
      />
      <Footer />
    </>
  );
};

const Frame = () => {
  const { authState, isLoading } = useAuth();
  const { goToView } = useRouteView();

  useEffect(() => {
    if (isLoading) {
      goToView("loading");
    } else if (authState) {
      goToView("home");
    } else {
      goToView("login");
    }
  }, [authState, isLoading]);

  return (
    <div className={styles.container}>
      <Route view="loading" component={Loading} />
      <Route view="login" component={Login} />
      <ProtectedRoute view="home" component={Home} fallbackView="login" />
      <Route view="settings" component={<Settings onClose={() => goToView("home")} />} />
    </div>
  );
};

export default Frame;
