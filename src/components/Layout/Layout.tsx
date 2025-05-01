import React from "react";
import styles from "./Layout.module.css";
import { IoHomeSharp, IoSettingsSharp } from "react-icons/io5";
import { useRouteView } from "../../contexts/RouteViewContext/RouteViewContext";
import { DebugPanel } from "../DebugPanel/DebugPanel";
import { useStorage } from "../../contexts/StorageContext/StorageContext";
import { useAuth } from "../../contexts/AuthContext";
const logoPath = chrome.runtime.getURL("images/signadot-full-logo.svg");

interface Props {
  children: React.ReactNode;
}

const Layout: React.FC<Props> = ({ children }) => {
  const { currentView, goToView } = useRouteView();
  const { isStoreLoaded, isAuthenticated } = useStorage();
  const { authState } = useAuth();

  const handleHomeChange = () => {
    return isAuthenticated ? "home" : "login";
  };

  return (
    isStoreLoaded && (
      <div className={styles.container}>
        <div className={styles.topBar}>
          <div className={styles.logoContainer}>
            <img 
              src={logoPath} 
              style={{ height: '30px', width: 'auto', maxWidth: '100%', display: 'block' }}
              alt="Signadot Logo"
            />
            <div className={styles.divider}></div>
            {authState?.org && (
              <div className={styles.orgName}>
                {authState.org.displayName || ""}
              </div>
            )}
          </div>
          <div className={styles.topRight}>
            <button onClick={() => goToView((prevView) => (prevView === "settings" ? handleHomeChange() : "settings"))}>
              {currentView === "settings" ? 
                <IoHomeSharp size={20} /> : 
                <IoSettingsSharp size={20} />
              }
            </button>
          </div>
        </div>
        <div className={styles.body}>{children}</div>
        <DebugPanel />
      </div>
    )
  );
};

export default Layout;
