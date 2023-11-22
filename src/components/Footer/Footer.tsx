import React from "react";
import {AnchorButton, Section, SectionCard} from "@blueprintjs/core";
import {FaGithub, FaSlack} from "react-icons/fa";
import styles from "./Footer.module.css";

interface Props {
}

const Footer: React.FC<Props> = () => (
    <Section
        icon="document"
        className={styles.container}
    >
      <SectionCard>
        <div className={styles.links}>
          <a href="https://signadotcommunity.slack.com/join/shared_invite/zt-1estxm8pv-qfiaNfiFFCaW~eUlXsVoEQ"
             target="_blank">
            <AnchorButton minimal icon={<FaSlack/>}>
              Slack
            </AnchorButton>
          </a>
          <a href="https://github.com/signadot" target="_blank">
            <AnchorButton minimal icon={<FaGithub/>}>
              GitHub
            </AnchorButton>
          </a>
          <a href="https://www.signadot.com/docs/" target="_blank">
            <AnchorButton minimal icon="document">
              Documentation
            </AnchorButton>
          </a>
        </div>

      </SectionCard>
    </Section>
);

export default Footer;