import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import PropTypes from 'prop-types';
import { LoadingSpinner } from '_common';
import MainPlot from './MainPlot';
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
    <div class="maltreatment-types-plot-layout">
      <div className="feature-table">
        <div className="feature-table-chart-selection">
          <div className="plot-details">
            <div className="feature-table-chart-title">
              Definition of Risk Levels
              <span className="feature-table-chart-subtitle">
              (Figure 1)
          </span>
            </div>
          </div>
        </div>
      </div>
      <MainPlot plotState={chartData.data} />
    </div>
  );
}

AnalyticsStateDistribution.propTypes = {
  geography: PropTypes.string.isRequired,
  selectedGeographicFeature: PropTypes.string.isRequired,
};

export default AnalyticsStateDistribution;
