import React from "react";
import {createRoot} from "react-dom/client";
import Frame from "./components/Frame";
import "@blueprintjs/core/lib/css/blueprint.css";
import {AuthProvider} from "./contexts/AuthContext";
import {QueryClient, QueryClientProvider} from "react-query";
import {RouteViewProvider} from "./contexts/RouteViewContext/RouteViewContext";

const queryClient = new QueryClient();
const root = createRoot(document.getElementById("root")!);

root.render(
    <QueryClientProvider client={queryClient}>
        <RouteViewProvider>
            <AuthProvider>
                <React.StrictMode>
                    <Frame/>
                </React.StrictMode>
            </AuthProvider>
        </RouteViewProvider>
    </QueryClientProvider>
);
