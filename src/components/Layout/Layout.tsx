import React from "react";
import styles from "./Layout.module.css";

interface Props {
  children: React.ReactNode;
}

const Layout: React.FC<Props> = ({children}) => (
    <div className={styles.container}>
      <div className={styles.topBar}>
        <div className={styles.title}>Signadot</div>
      </div>
      <div className={styles.body}>{children}</div>
    </div>
);

export default Layout;
