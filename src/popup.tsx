import React from "react";
import {createRoot} from "react-dom/client";
import Frame from "./components/Frame";
import "@blueprintjs/core/lib/css/blueprint.css";
import {AuthProvider} from "./contexts/AuthContext";
import {QueryClient, QueryClientProvider} from "react-query";
import "./axiosSetup"; // For the extension to pick up axios setup (baseURL, headers etc)

const queryClient = new QueryClient();
const root = createRoot(document.getElementById("root")!);

root.render(
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <React.StrictMode>
          <Frame/>
        </React.StrictMode>
      </AuthProvider>
    </QueryClientProvider>
);
