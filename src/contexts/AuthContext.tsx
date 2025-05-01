import React, { createContext, useContext, useEffect, useState } from "react";
import { auth } from "./auth";
import Layout from "../components/Layout/Layout";
import { useStorage } from "./StorageContext/StorageContext";

interface Props {
  children: React.ReactNode;
}

interface AuthState {
  org: {
    name: string;
    displayName?: string;
  };
  user: {
    firstName?: string;
    lastName?: string;
    email?: string;
  };
  isLoading: boolean;
}

// Define the shape of the context
interface AuthContextType {
  authState?: AuthState;
  resetAuth: () => void;
}

interface GetOrgsResponse {
  orgs: {
    name: string;
    displayName: string;
  }[];
  user: {
    firstName?: {
      String?: string;
      Valid: boolean;
    };
    lastName?: {
      String?: string;
      Valid: boolean;
    };
    email?: string;
  };
}

// Create the context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// AuthProvider component
export const AuthProvider: React.FC<Props> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState | undefined>(undefined);
  const { settings, isStoreLoaded, setIsAuthenticated } = useStorage();
  const { apiUrl, previewUrl } = settings.signadotUrls;

  const resetAuth = () => {
    setAuthState(undefined);
    setIsAuthenticated(false);
  };

  useEffect(() => {
    if (!apiUrl || !previewUrl || !isStoreLoaded) return;

    setAuthState((prev) => ({
      ...(prev || { org: { name: '' }, user: {} }),
      isLoading: true
    }));

    auth(
      async (authenticated) => {
        if (!authenticated) {
          console.log("Not authenticated!");
          setAuthState((prev) => ({
            ...(prev || { org: { name: '' }, user: {} }),
            isLoading: false
          }));
          return;
        }

        try {
          const response = await fetch(`${apiUrl}/api/v1/orgs`);

          if (response.status === 401 || !response.ok) {
            setIsAuthenticated(false);
            setAuthState((prev) => ({
              ...(prev || { org: { name: '' }, user: {} }),
              isLoading: false
            }));
            return;
          }

          const data: GetOrgsResponse = await response.json();

          // Ensure we have orgs before accessing first item
          if (!data.orgs?.length) {
            throw new Error("No organizations found");
          }

          setAuthState({
            org: data.orgs[0],
            user: {
              firstName: data.user.firstName?.String,
              lastName: data.user.lastName?.String,
              email: data.user.email
            },
            isLoading: false
          });

          setIsAuthenticated(true);
        } catch (error) {
          console.error("Error fetching org:", error);
          setIsAuthenticated(false);
          setAuthState((prev) => ({
            ...(prev || { org: { name: '' }, user: {} }),
            isLoading: false
          }));
        }
      },
      { apiUrl, previewUrl },
    );
  }, [apiUrl, previewUrl, isStoreLoaded]);

  useEffect(() => {
    if (authState === undefined) {
      setIsAuthenticated(false);
    }

    if (authState) {
      setIsAuthenticated(true);
    }
  }, [authState]);

  return (
    <AuthContext.Provider value={{ authState, resetAuth }}>
      <Layout>{children}</Layout>
    </AuthContext.Provider>
  );
};

// Hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
