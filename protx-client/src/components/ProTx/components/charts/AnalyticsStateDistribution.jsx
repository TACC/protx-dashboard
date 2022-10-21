import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import PropTypes from 'prop-types';
import { LoadingSpinner } from '_common';
import MainPlot from './MainPlot';
import ChartInstructions from "./ChartInstructions";
import './PlotDetails.css';


function AnalyticsStateDistribution({geography, selectedGeographicFeature}) {
  const dispatch = useDispatch();

  const chartData = useSelector(
    state => state.protxAnalyticsStatewideDistribution
  );

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
    <div>
      <div className="plot-details-section">
        <div className="plot-details-section-selected">
          <span className="plot-details-section-selected-value">
            Texas Statewide Data
          </span>
        </div>
      </div>
      <MainPlot plotState={chartData.data} />
      <ChartInstructions currentReportType="analytics" />
    </div>
  );
}

AnalyticsStateDistribution.propTypes = {
  geography: PropTypes.string.isRequired,
  selectedGeographicFeature: PropTypes.string.isRequired,
};

export default AnalyticsStateDistribution;
