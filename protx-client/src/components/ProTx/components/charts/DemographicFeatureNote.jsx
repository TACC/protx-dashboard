import React from 'react';
import PropTypes from 'prop-types';
import { getObservedFeaturesNote } from '../shared/dataUtils';
import styles from './DemographicFeatureNote.module.scss';

function DemographicFeatureNote({ observedFeature, data }) {
  const observedFeaturesNote = getObservedFeaturesNote(observedFeature, data);
  return observedFeaturesNote ? (
    <div
      className={styles.root}
      dangerouslySetInnerHTML={{ __html: observedFeaturesNote }}
    ></div>
  ) : (
    <></>
  );
}

DemographicFeatureNote.propTypes = {
  observedFeature: PropTypes.string.isRequired,
  // eslint-disable-next-line react/forbid-prop-types
  data: PropTypes.object.isRequired,
};

export default DemographicFeatureNote;
