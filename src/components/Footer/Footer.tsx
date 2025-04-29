import React from "react";
import { AnchorButton, Section, SectionCard } from "@blueprintjs/core";
import { FaGithub, FaSlack } from "react-icons/fa";
import styles from "./Footer.module.css";

interface Props {}

const Footer: React.FC<Props> = () => (
  <Section icon="document" className={styles.container}>
    <SectionCard>
      <div className={styles.links}>
        <AnchorButton
          href="https://signadotcommunity.slack.com/join/shared_invite/zt-1estxm8pv-qfiaNfiFFCaW~eUlXsVoEQ"
          target="_blank"
          minimal
          icon={<FaSlack />}
          rel="noopener noreferrer" // Best practice for opening links in new tabs
        >
          Slack
        </AnchorButton>
        <AnchorButton
          href="https://github.com/signadot"
          target="_blank"
          minimal
          icon={<FaGithub />}
          rel="noopener noreferrer" // Best practice for opening links in new tabs
        >
          GitHub
        </AnchorButton>
        <AnchorButton
          href="https://www.signadot.com/docs/"
          target="_blank"
          minimal
          icon="document"
          rel="noopener noreferrer" // Best practice for opening links in new tabs
        >
          Documentation
        </AnchorButton>
      </div>
    </SectionCard>
  </Section>
);

export default Footer;
