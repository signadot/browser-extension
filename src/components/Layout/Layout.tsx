import React from "react";
import styles from "./Layout.module.css";
import { Switch, Tooltip } from "@blueprintjs/core";
import { IoHomeSharp, IoSettingsSharp } from "react-icons/io5";
import { useRouteView } from "../../contexts/RouteViewContext/RouteViewContext";
import { DebugPanel } from "../DebugPanel/DebugPanel";
import { useStorage } from "../../contexts/StorageContext/StorageContext";
const logoPath = chrome.runtime.getURL("images/signadot-full-logo.png");

interface Props {
  children: React.ReactNode;
}

const Layout: React.FC<Props> = ({ children }) => {
  const { currentView, goToView } = useRouteView();
  const { init, settings, setSettings, isAuthenticated } = useStorage();

  const handleHomeChange = () => {
    return isAuthenticated ? "home" : "login";
  };

  return (
    init && (
      <div className={styles.container}>
        <div className={styles.topBar}>
          <div>
            <img src={logoPath} height={80} alt="Signadot Logo" />
          </div>
          <div className={styles.topRight}>
            <Tooltip content={`Header injection ${settings.enabled ? "Enabled" : "Disabled"}`}>
              <Switch
                alignIndicator={"right"}
                onChange={(e) => setSettings({ ...settings, enabled: e.target.checked })}
                checked={settings.enabled}
                large={true}
              />
            </Tooltip>
            <button onClick={() => goToView((prevView) => (prevView === "settings" ? handleHomeChange() : "settings"))}>
              {currentView === "settings" ? <IoHomeSharp /> : <IoSettingsSharp />}
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
