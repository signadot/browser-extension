import React from "react";
import styles from "./Layout.module.css";
import {useChromeStorage} from "../../hooks/storage";
import {Switch, Tooltip} from "@blueprintjs/core";
import { IoHomeSharp, IoSettingsSharp } from "react-icons/io5";
import {useRouteView} from "../../contexts/RouteViewContext/RouteViewContext";

const logoPath = chrome.runtime.getURL("images/signadot-full-logo.png");

interface Props {
  children: React.ReactNode;
}

const Layout: React.FC<Props> = ({children}) => {
  const {init, enabled, setEnabled} = useChromeStorage();
  const { currentView, setCurrentView } = useRouteView();
  return init && (
      <div className={styles.container}>
        <div className={styles.topBar}>
          <div><img src={logoPath} height={80}/></div>
            <div className={styles.topRight}>
                <Tooltip content={`Header injection ${enabled ? "Enabled" : "Disabled"}`}>
                    <Switch
                        alignIndicator={"right"}
                        onChange={(e) => setEnabled(e.target.checked)}
                        checked={enabled}
                        large={true}
                    />
                </Tooltip>
                <button
                    onClick={() =>
                        setCurrentView((prevView) => (prevView === "settings" ? "home" : "settings"))
                    }
                >
                    {currentView === "settings" ? (
                        <IoHomeSharp />
                    ) : (
                        <IoSettingsSharp />
                    )}
                </button>
            </div>
        </div>
          {enabled ? <div className={styles.body}>{children}</div> : null}
      </div>
  );
}

export default Layout;
