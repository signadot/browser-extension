import React, { createContext, useContext, useState } from "react";

export type RouteView = "home" | "settings" | "login" | "loading" | "none";

interface RouteViewContextValue {
  currentView: RouteView;
  goToView: React.Dispatch<React.SetStateAction<RouteView>>;
}

const RouteViewContext = createContext<RouteViewContextValue>({} as RouteViewContextValue);

interface RouteViewProviderProps {
  children: React.ReactNode;
}

export const RouteViewProvider: React.FC<RouteViewProviderProps> = ({ children }) => {
  const [currentView, goToView] = useState<RouteView>("loading");

  return <RouteViewContext.Provider value={{ currentView, goToView }}>{children}</RouteViewContext.Provider>;
};

export const useRouteView = (): RouteViewContextValue => {
  const context = useContext(RouteViewContext);
  if (!context) {
    throw new Error("useRouteView must be used within a RouteViewProvider");
  }
  return context;
};
