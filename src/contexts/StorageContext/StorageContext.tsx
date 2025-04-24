import React, { useEffect, useState, createContext, useContext } from "react";
import { Header, Settings, StorageContextType, StorageState } from "./types";
import { defaultTraceparent, defaultSettings } from "./defaults";
import { StorageBrowserKeys } from "./browserKeys";
import { setBrowserStoreValue } from "./browserKeys";
import { shouldInjectHeader } from "./utils";

const StorageContext = createContext<StorageContextType | undefined>(undefined);

interface StorageProviderProps {
    children: React.ReactNode;
}

export const StorageProvider: React.FC<StorageProviderProps> = ({ children }) => {
    const [state, setState] = useState<StorageState>({ 
        isAuthenticated: false,
        settings: defaultSettings,
        traceparent: defaultTraceparent,
        headers: [],
        currentRoutingKey: undefined,
    });
    
    const [isStorageLoaded, setIsStorageLoaded] = useState(false);

    useEffect(() => {
        setIsStorageLoaded(true);
    }, []);

    useEffect(() => {
        const { isAuthenticated, currentRoutingKey, headers } = state;

        if (shouldInjectHeader(isAuthenticated, currentRoutingKey, headers)) {
            setBrowserStoreValue(StorageBrowserKeys.headers, JSON.stringify(headers));
        } else {
            setBrowserStoreValue(StorageBrowserKeys.headers, []);
        }
    }, [state])
    

    const handleSetRoutingKey = (value: string | undefined) => {
        setState({ ...state, currentRoutingKey: value });
        setBrowserStoreValue(StorageBrowserKeys.routingKey, value);
    }

    const handleSetTraceparent = (inject: boolean, value: undefined | string) => {
        const valueToSet = value || defaultTraceparent.value;

        setState({ ...state, traceparent: { value: valueToSet, inject } });
    }

    const handleUpdateSettings = (settings: Settings) => {
        setState({ ...state, settings });

        setBrowserStoreValue(StorageBrowserKeys.enabled, settings.enabled);
        setBrowserStoreValue(StorageBrowserKeys.traceparentHeader, JSON.stringify(state.traceparent));
        setBrowserStoreValue(StorageBrowserKeys.signadotUrls, JSON.stringify(settings.signadotUrls));
        setBrowserStoreValue(StorageBrowserKeys.debugMode, JSON.stringify(settings.debugMode));
    }

    const value = {
        init: isStorageLoaded,
        isAuthenticated: state.isAuthenticated,
        settings: state.settings,
        traceparent: state.traceparent,
        headers: state.headers,
        currentRoutingKey: state.currentRoutingKey,
        setIsAuthenticated: (value: boolean) => setState({ ...state, isAuthenticated: value }),
        setCurrentRoutingKey: handleSetRoutingKey,
        setTraceparent: (inject: boolean, value: undefined | string) => handleSetTraceparent(inject, value),
        setSettings: (value: Settings) => handleUpdateSettings(value),
        setHeaders: (value: Header[]) => setState({ ...state, headers: value }),
    };

    return (
        <StorageContext.Provider value={value}>
            {children}
        </StorageContext.Provider>
    );
};

export const useStorage = (): StorageContextType => {
    const context = useContext(StorageContext);
    if (context === undefined) {
        throw new Error('useStorage must be used within a StorageProvider');
    }
    return context;
};

