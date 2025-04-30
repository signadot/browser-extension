import React from "react";
import { FaGithub, FaSlack, FaBook } from "react-icons/fa";
import styles from "./Footer.module.css";
import { useAuth } from "../../contexts/AuthContext";
import { useStorage } from "../../contexts/StorageContext/StorageContext";

const Footer: React.FC = () => {
  const { authState } = useAuth();
  const { settings } = useStorage();

  const handleLogout = () => {
    const signoutUrl = `${settings.signadotUrls.dashboardUrl}/signout`;
    window.open(signoutUrl, '_blank');
  };

  return (
    <footer className={styles.container}>
      <div className={styles.links}>
        <a
          href="https://signadotcommunity.slack.com/join/shared_invite/zt-1estxm8pv-qfiaNfiFFCaW~eUlXsVoEQ"
          target="_blank"
          className={styles.link}
          rel="noopener noreferrer"
        >
          <FaSlack />
          <span>Slack</span>
        </a>
        <a
          href="https://github.com/signadot"
          target="_blank"
          className={styles.link}
          rel="noopener noreferrer"
        >
          <FaGithub />
          <span>GitHub</span>
        </a>
        <a
          href="https://www.signadot.com/docs/"
          target="_blank"
          className={styles.link}
          rel="noopener noreferrer"
        >
          <FaBook />
          <span>Documentation</span>
        </a>
      </div>
    </footer>
  );
};

export default Footer;
