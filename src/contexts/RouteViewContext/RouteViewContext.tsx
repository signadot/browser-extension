import React, { createContext, useContext, useState } from 'react';

type RouteView = 'home' | 'settings';

interface RouteViewContextValue {
    currentView: RouteView;
    setCurrentView: React.Dispatch<React.SetStateAction<RouteView>>;
}

const RouteViewContext = createContext<RouteViewContextValue>({ } as RouteViewContextValue);

interface RouteViewProviderProps {
    children: React.ReactNode;
}

export const RouteViewProvider: React.FC<RouteViewProviderProps> = ({ children }) => {
    const [currentView, setCurrentView] = useState<RouteView>('home');

    return (
        <RouteViewContext.Provider value={{ currentView, setCurrentView }}>
            {children}
        </RouteViewContext.Provider>
    );
};

export const useRouteView = (): RouteViewContextValue => {
    const context = useContext(RouteViewContext);
    if (!context) {
        throw new Error('useRouteView must be used within a RouteViewProvider');
    }
    return context;
};
