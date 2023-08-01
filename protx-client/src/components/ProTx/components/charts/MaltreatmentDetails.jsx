import React from 'react';
import PropTypes from 'prop-types';
import {
  getSelectedGeographyName,
  capitalizeString,
  getMaltreatmentTypeNames,
} from '../shared/dataUtils';
import './PlotDetails.css';

function MaltreatmentDetails({
  geography,
  selectedGeographicFeature,
  maltreatmentTypes,
  data,
}) {
  const fipsIdValue = getSelectedGeographyName(
    geography,
    selectedGeographicFeature
  );
  const geographyLabel = capitalizeString(geography);
  const maltreatmentTypesList = getMaltreatmentTypeNames(
    maltreatmentTypes,
    data
  );

  return (
    <>
      <div className="plot-details">
        <div className="plot-details-section">
          <div className="plot-details-section-selected">
            <span className="plot-details-section-selected-label">
              Current Aggregation:{'  '}
            </span>
            <span className="plot-details-section-selected-value-list">
              {maltreatmentTypesList.map((type) => (
                <span className="details-list-item" key={type}>
                  {type}
                </span>
              ))}
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

MaltreatmentDetails.propTypes = {
  geography: PropTypes.string.isRequired,
  selectedGeographicFeature: PropTypes.string.isRequired,
  maltreatmentTypes: PropTypes.arrayOf(PropTypes.string).isRequired,
  // eslint-disable-next-line react/forbid-prop-types
  data: PropTypes.object.isRequired,
};

export default MaltreatmentDetails;
