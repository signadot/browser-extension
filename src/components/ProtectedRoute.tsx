import React from "react";
import type { RouteView } from "../contexts/RouteViewContext/RouteViewContext";
import { useRouteView } from "../contexts/RouteViewContext/RouteViewContext";
import { useAuth } from "../contexts/AuthContext";
import { Route } from "./Route";
import { useStorage } from "../contexts/StorageContext/StorageContext";

type ProtectedRouteProps = {
  view: RouteView;
  component: React.ComponentType | React.ReactElement;
  fallbackView: RouteView;
};

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ view, component, fallbackView }) => {
  const { authState } = useAuth();
  const { goToView } = useRouteView();
  const { isAuthenticated } = useStorage();

  React.useEffect(() => {
    if (!authState && view === "home") {
      goToView(fallbackView);
    }
  }, [authState, view, fallbackView]);

  if (!authState) {
    return null;
  }

  if (!isAuthenticated) {
    return null;
  }

  return <Route view={view} component={component} />;
};
