import React from 'react';
import PropTypes from 'prop-types';
import {
  getFipsIdName,
  capitalizeString,
  getObservedFeaturesLabel
} from '../shared/dataUtils';
import './PlotDetails.css';

function DemographicsDetails({
  geography,
  observedFeature,
  selectedGeographicFeature,
  data
}) {
  const observedFeaturesLabel = getObservedFeaturesLabel(observedFeature, data);
  const selectedGeographicFeatureName = getFipsIdName(
    selectedGeographicFeature
  );
  const geographyType = capitalizeString(geography);

  // TODO: Replace the getFipsIdName() FIPS specific method with a universal method to populate label for all geography types.
  // TODO: Handle types: County, Tract, Dfps_region
  // TODO: Place this logic in the dataUtils.js file, replacing use of getFipsIdName().
  // TODO: Replicate use across other Chart *Details component views (or refactor *Details into a single component).
  console.log(geographyType, observedFeaturesLabel, selectedGeographicFeatureName);

  return (
    <>
      <div className="plot-details">
        <div className="plot-details-section">
          <div className="plot-details-section-selected">
            <span className="plot-details-section-selected-label">
              FIPS: {selectedGeographicFeature}
            </span>
            <span className="plot-details-section-selected-value">
              {selectedGeographicFeatureName} {geographyType}
            </span>
          </div>
        </div>
        <div className="plot-details-section">
          <div className="plot-details-section-selected">
            <span className="plot-details-section-selected-label">
              Selected Feature:
            </span>
            <span className="plot-details-section-selected-value">
              {observedFeaturesLabel}
            </span>
          </div>
        </div>
      </div>
      <div className="plot-details-summary">
        All graphs are showing data for calendar years 2011-2020, not fiscal or
        academic years.
      </div>
    </>
  );
}

DemographicsDetails.propTypes = {
  geography: PropTypes.string.isRequired,
  observedFeature: PropTypes.string.isRequired,
  selectedGeographicFeature: PropTypes.string.isRequired,
  // eslint-disable-next-line react/forbid-prop-types
  data: PropTypes.object.isRequired
};

export default DemographicsDetails;
