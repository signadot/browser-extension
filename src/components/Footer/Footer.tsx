import React from "react";
import { AnchorButton, Section, SectionCard } from "@blueprintjs/core";
import { FaGithub, FaSlack } from "react-icons/fa";
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
    <Section icon="document" className={styles.container}>
      <SectionCard>
        <div className={styles.footerContent}>
          <div className={styles.links}>
            <AnchorButton
              href="https://signadotcommunity.slack.com/join/shared_invite/zt-1estxm8pv-qfiaNfiFFCaW~eUlXsVoEQ"
              target="_blank"
              minimal
              icon={<FaSlack />}
              rel="noopener noreferrer"
            >
              Slack
            </AnchorButton>
            <AnchorButton
              href="https://github.com/signadot"
              target="_blank"
              minimal
              icon={<FaGithub />}
              rel="noopener noreferrer"
            >
              GitHub
            </AnchorButton>
            <AnchorButton
              href="https://www.signadot.com/docs/"
              target="_blank"
              minimal
              icon="document"
              rel="noopener noreferrer"
            >
              Documentation
            </AnchorButton>
          </div>
          {authState?.user && (
            <div className={styles.userInfo}>
              {authState.user.email || ''} · <a onClick={handleLogout} className={styles.logoutLink}>Log out</a>
            </div>
          )}
        </div>
      </SectionCard>
    </Section>
  );
};

export default Footer;
