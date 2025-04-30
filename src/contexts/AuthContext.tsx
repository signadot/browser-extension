import React, { createContext, useContext, useEffect, useState } from "react";
import { auth } from "./auth";
import Layout from "../components/Layout/Layout";
import { useStorage } from "./StorageContext/StorageContext";

const loadingIconPath = chrome.runtime.getURL("images/loading.gif");

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
  };
}

// Define the shape of the context
interface AuthContextType {
  authState?: AuthState;
  isLoading: boolean;
  logout: () => Promise<void>;
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
  };
}

// Create the context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// AuthProvider component
export const AuthProvider: React.FC<Props> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState | undefined>(undefined);
  const [authenticated, setAuthenticated] = useState<boolean | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);
  const { settings, setIsAuthenticated } = useStorage();
  const { apiUrl, previewUrl } = settings.signadotUrls;

  const logout = async () => {
    // Clear auth state
    setAuthState(undefined);
    setAuthenticated(false);
    setIsAuthenticated(false);

    // Clear the auth cookie if we have an API URL
    if (apiUrl) {
      console.log("Clearing auth cookie for", apiUrl);
      await chrome.cookies.remove({
        url: apiUrl,
        name: "signadot-auth"
      });
    }

    // Clear any auth-related storage
    await chrome.storage.local.remove(['auth_token']);
  };

  useEffect(() => {
    if (!apiUrl || !previewUrl) return;

    auth(
      async (authenticated) => {
        if (!authenticated) {
          console.log("Not authenticated!");
          setAuthenticated(false);
          setIsLoading(false);
          return;
        }

        try {
          const response = await fetch(`${apiUrl}/api/v1/orgs`);

          if (response.status === 401 || !response.ok) {
            setAuthenticated(false);
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
            },
          });

          setAuthenticated(true);
          setIsAuthenticated(true);
          setIsLoading(false);
        } catch (error) {
          console.error("Error fetching org:", error);
          setAuthenticated(false);
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
    <AuthContext.Provider value={{ authState, isLoading, logout }}>
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
