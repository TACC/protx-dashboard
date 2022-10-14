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
   */

  const chartData = useSelector(
    state => state.protxDemographicsDistribution
  );

  useEffect(() => {
      dispatch({
        type: 'FETCH_PROTX_DEMOGRAPHICS_DISTRIBUTION',
        payload: {
          area: 'county',
          selectedArea: 48257,
          variable: 'CROWD',
          unit: 'percent'
        }
      });
    }, []);

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
      <ChartInstructions currentReportType="hidden" />
    </div>
  );
}

AnalyticsStateDistribution.propTypes = {
  geography: PropTypes.string.isRequired,
};

export default AnalyticsStateDistribution;
