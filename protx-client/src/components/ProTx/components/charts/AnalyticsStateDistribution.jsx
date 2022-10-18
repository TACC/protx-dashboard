import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import PropTypes from 'prop-types';
import { LoadingSpinner } from '_common';
import MainPlot from './MainPlot';
import ChartInstructions from "./ChartInstructions";


function AnalyticsStateDistribution({geography}) {
  const dispatch = useDispatch();
  /*
      possibly need -> title or header?
      need the bakcned route
      need saga/reducer for that route
      fix instructions?
   */

  const chartData = useSelector(
    state => state.protxAnalyticsStateDistribution
  );

  useEffect(() => {
      dispatch({
        type: 'FETCH_PROTX_ANALYTICS_STATE_DISTRIBUTION',
        payload: {
          area: geography,
          analytics_type: 'pred_per_100k',
        }
      });
    }, [geography]);

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
      <MainPlot plotState={chartData.data} />
      <ChartInstructions currentReportType="analytics" />
    </div>
  );
}

AnalyticsStateDistribution.propTypes = {
  geography: PropTypes.string.isRequired,
};

export default AnalyticsStateDistribution;
