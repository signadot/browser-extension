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
}

// Define the shape of the context
interface AuthContextType {
  authState?: AuthState;
  isLoading: boolean;
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
  const [isLoading, setIsLoading] = useState(true);
  const { settings, setIsAuthenticated } = useStorage();
  const { apiUrl, previewUrl } = settings.signadotUrls;

  const resetAuth = () => {
    setAuthState(undefined);
    setIsLoading(true);
    setIsAuthenticated(false);
  };

  useEffect(() => {
    if (!apiUrl || !previewUrl) return;

    auth(
      async (authenticated) => {
        if (!authenticated) {
          console.log("Not authenticated!");
          setIsLoading(false);
          return;
        }

        try {
          const response = await fetch(`${apiUrl}/api/v1/orgs`);

          if (response.status === 401 || !response.ok) {
            setIsAuthenticated(false);
            setIsLoading(false);
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
          });

          setIsAuthenticated(true);
          setIsLoading(false);
        } catch (error) {
          console.error("Error fetching org:", error);
          setIsAuthenticated(false);
          setIsLoading(false);
        }
      },
      { apiUrl, previewUrl },
    );
  }, [apiUrl, previewUrl]);

  useEffect(() => {
    if (authState === undefined) {
      setIsAuthenticated(false);
    }

    if (authState) {
      setIsAuthenticated(true);
    }
  }, [authState]);

  return (
    <AuthContext.Provider value={{ authState, isLoading, resetAuth }}>
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
