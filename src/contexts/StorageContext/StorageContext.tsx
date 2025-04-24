import React, { useEffect, useState, createContext, useContext } from "react";
import { StorageContextType, StorageState } from "./types";
import { defaultTraceparent, defaultSettings } from "./defaults";

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

    const value = {
        init: isStorageLoaded,
        isAuthenticated: state.isAuthenticated,
        settings: state.settings,
        traceparent: state.traceparent,
        headers: state.headers,
        currentRoutingKey: state.currentRoutingKey,
        setIsAuthenticated: (value: boolean) => setState({ ...state, isAuthenticated: value }),
        setCurrentRoutingKey: (value: string | undefined) => setState({ ...state, currentRoutingKey: value }),
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

