import React from "react";
import { useRouteView } from "../contexts/RouteViewContext/RouteViewContext";
import type { RouteView } from "../contexts/RouteViewContext/RouteViewContext";

type RouteProps = {
  view: RouteView;
  component: React.ComponentType | React.ReactElement;
};

export const Route: React.FC<RouteProps> = ({ view, component }) => {
  const { currentView } = useRouteView();

  if (currentView !== view) {
    return null;
  }

  if (React.isValidElement(component)) {
    return component;
  }

  const Component = component as React.ComponentType;
  return <Component />;
};
