import React from "react";
import styles from "./Layout.module.css";
import {useChromeStorage} from "../../hooks/storage";
import {Switch, Tooltip} from "@blueprintjs/core";

const logoPath = chrome.runtime.getURL("images/signadot-full-logo.png");

interface Props {
  children: React.ReactNode;
}

const Layout: React.FC<Props> = ({children}) => {
  const {init, enabled, setEnabled} = useChromeStorage();
  return init && (
      <div className={styles.container}>
        <div className={styles.topBar}>
          <div><img src={logoPath} height={80}/></div>
          <div>
            <Tooltip content={`Header injection ${enabled ? "Enabled" : "Disabled"}`}>
              <Switch
                  alignIndicator={"right"}
                  onChange={(e) => setEnabled(e.target.checked)}
                  checked={enabled}
                  large={true}
              />
            </Tooltip>
          </div>
        </div>
        {enabled ? <div className={styles.body}>{children}</div>: null}
      </div>
  );
}

export default Layout;
