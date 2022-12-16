import React from 'react';
import { SectionMessage } from '_common';
import styles from './Onboarding.module.scss';

function Onboarding() {
  return (
    <div className={styles.root}>
      <div className={styles.message}>
        <SectionMessage type="warning">
          Your account has not be configured. Please check status by clicking
          <a
            href="/workbench/onboarding"
            className="wb-link"
            target="_blank" // opening in new tab as protx dashboard in iframe
          >
            &nbsp;here.
          </a>
        </SectionMessage>
      </div>
    </div>
  );
}

export default Onboarding;
