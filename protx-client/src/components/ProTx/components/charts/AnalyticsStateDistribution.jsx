import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import PropTypes from 'prop-types';
import { LoadingSpinner } from '_common';
import MainPlot from './MainPlot';
import { FigureCaption } from './FigureCaption';
import {getSelectedGeographyName} from "../shared/dataUtils";



function AnalyticsStateDistribution({geography, selectedGeographicFeature}) {
  const dispatch = useDispatch();

  const chartData = useSelector(
    state => state.protxAnalyticsStatewideDistribution
  );
  
  const plotLabel = 'Figure 1.';
  const plotCaptionText = selectedGeographicFeature ? 
  [`Distribution of projected number of cases across counties in Texas. Black vertical lines indicate thresholds used to define high, 
  medium and low risk regions for heat map on the left. The red vertical line indicates where `, `${getSelectedGeographyName(selectedGeographicFeature)}`, ` County falls on this distribution.`] 
  : `Distribution of projected number of cases across counties in Texas. 
  Black vertical lines indicate thresholds used to define high, medium and low risk regions for heat map 
  on the left.`;

  useEffect(() => {
      dispatch({
        type: 'FETCH_PROTX_ANALYTICS_STATEWIDE_DISTRIBUTION',
        payload: {
          area: geography,
          analyticsType: 'pred_per_100k',
          geoid: selectedGeographicFeature
        }
      });
    }, [geography, selectedGeographicFeature]);

  if (chartData.error) {
    return (
      <div className="data-error-message">
        There was a problem loading the data.
      </div>
    );
  }

  if (chartData.loading) {
    return (
      <div className="loading-spinner">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <>
      <MainPlot plotState={chartData.data} />
      <FigureCaption label={plotLabel} captionText={plotCaptionText} />
    </>
  );
}

AnalyticsStateDistribution.propTypes = {
  geography: PropTypes.string.isRequired,
  selectedGeographicFeature: PropTypes.string.isRequired,
};

export default AnalyticsStateDistribution;
