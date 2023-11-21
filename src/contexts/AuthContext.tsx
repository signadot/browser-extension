import React, { createContext, useContext, useState } from "react";
import { auth } from "./auth";
import Layout from "../components/Layout/Layout";

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
  React.useEffect(() => {
    auth((authenticated: boolean) => {
      if (authenticated) {
        fetch("https://api.signadot.com/api/v1/orgs")
          .then((response) => response.json())
          .then((data: GetOrgsResponse) => {
            setAuthState({
              org: data.orgs[0], // TODO: Ensure safe access
              user: {
                firstName: data.user.firstName?.String,
                lastName: data.user.lastName?.String,
              },
            } as AuthState);
          })
          .catch((error) => console.log("Error fetching org:", error));
      } else {
        console.log("Not authenticated!");
      }
    });
  }, []);

  if (!authState) {
    return (
      <Layout>
        <div>You are not logged in!</div>
      </Layout>
    );
  }

  return (
    <AuthContext.Provider value={{ authState }}>
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
