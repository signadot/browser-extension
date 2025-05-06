import React, { createContext, useContext, useEffect, useState } from "react";
import { auth } from "./auth";
import Layout from "../components/Layout/Layout";
import { useStorage } from "./StorageContext/StorageContext";

interface Props {
  children: React.ReactNode;
}

interface User {
  firstName?: string;
  lastName?: string;
  email?: string;
}

interface Org {
  name: string;
  displayName?: string;
}

type AuthState =
  | { status: "loading"; user: undefined; org: undefined }
  | { status: "unauthenticated"; user: undefined; org: undefined }
  | { status: "authenticated"; user: User; org: Org };

// Define the shape of the context
interface AuthContextType {
  authState: AuthState;
  resetAuth: () => void;
}

interface GetOrgsResponse {
  orgs: {
    name: string;
    displayName: string;
  }[];
  user: {
    firstName?: string;
    lastName?: string;
    email?: string;
  };
}

// Create the context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// AuthProvider component
export const AuthProvider: React.FC<Props> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>({
    status: "loading",
    user: undefined,
    org: undefined,
  });
  const { settings, isStoreLoaded, setIsAuthenticated } = useStorage();
  const { apiUrl, previewUrl } = settings.signadotUrls;

  const resetAuth = () => {
    setAuthState({
      status: "unauthenticated",
      user: undefined,
      org: undefined,
    });
    setIsAuthenticated(false);
  };

  useEffect(() => {
    if (!apiUrl || !previewUrl || !isStoreLoaded) return;

    setAuthState({
      status: "loading",
      user: undefined,
      org: undefined,
    });

    auth(
      async (authenticated) => {
        if (!authenticated) {
          console.log("Not authenticated!");
          setAuthState({
            status: "unauthenticated",
            user: undefined,
            org: undefined,
          });
          return;
        }

        try {
          const response = await fetch(new URL("/api/v2/orgs", apiUrl).toString());

          if (response.status === 401 || !response.ok) {
            setIsAuthenticated(false);
            setAuthState({
              status: "unauthenticated",
              user: undefined,
              org: undefined,
            });
            return;
          }

          const data: GetOrgsResponse = await response.json();

          // Ensure we have orgs before accessing first item
          if (!data.orgs?.length) {
            throw new Error("No organizations found");
          }

          setAuthState({
            status: "authenticated",
            org: data.orgs[0],
            user: {
              firstName: data.user.firstName,
              lastName: data.user.lastName,
              email: data.user.email,
            },
          });

          setIsAuthenticated(true);
        } catch (error) {
          console.error("Error fetching org:", error);
          setIsAuthenticated(false);
          setAuthState({
            status: "unauthenticated",
            user: undefined,
            org: undefined,
          });
        }
      },
      { apiUrl, previewUrl },
    );
  }, [apiUrl, previewUrl, isStoreLoaded]);

  useEffect(() => {
    if (authState.status === "unauthenticated") {
      setIsAuthenticated(false);
    }

    if (authState.status === "authenticated") {
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
