import React, {createContext, useContext, useState} from "react";
import {auth} from "./auth";
import Layout from "../components/Layout/Layout";
import { useChromeStorage } from "../hooks/storage";

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
export const AuthProvider: React.FC<Props> = ({children}) => {
  const [authState, setAuthState] = useState<AuthState | undefined>(undefined);
  const [authenticated, setAuthenticated] = React.useState<boolean | undefined>(undefined);
  const { apiUrl, previewUrl } = useChromeStorage();

  React.useEffect(() => {
    if (!apiUrl || !previewUrl) return;

    auth(async (authenticated) => {
      if (!authenticated) {
        console.log("Not authenticated!");
        setAuthenticated(false);
        return;
      }

      try {
        const response = await fetch(`${apiUrl}/api/v1/orgs`);
        
        if (response.status === 401 || !response.ok) {
          setAuthenticated(false);
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
      } catch (error) {
        console.error("Error fetching org:", error);
        setAuthenticated(false);
      }
    }, { apiUrl, previewUrl });
  }, [apiUrl, previewUrl]);

  if (authenticated === undefined) {
    return (
        <Layout>
          <div><img src={loadingIconPath}/></div>
        </Layout>
    );
  } else if (!authState) {
    return (
        <Layout>
          <div>Please <a href={previewUrl} target="_blank">Login to Signadot</a> to continue.</div>
        </Layout>
    );
  }

  return (
      <AuthContext.Provider value={{authState}}>
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
