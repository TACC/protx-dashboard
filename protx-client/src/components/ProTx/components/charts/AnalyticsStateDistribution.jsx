import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import PropTypes from 'prop-types';
import { LoadingSpinner } from '_common';
import MainPlot from './MainPlot';
import { FigureCaption } from './FigureCaption';
import ChartInstructions from "./ChartInstructions";
import './PlotDetails.css';


function AnalyticsStateDistribution({geography, analyticsType}) {
  const dispatch = useDispatch();

  const chartData = useSelector(
    state => state.protxAnalyticsStatewideDistribution
  );
  
  const plotLabel = 'Figure 1.';
  const plotCaptionText = `Distribution of projected number of cases across counties in Texas. 
  Black vertical lines indicate thresholds used to define high, medium and low risk regions for heat map 
  on the left.`;

  useEffect(() => {
      dispatch({
        type: 'FETCH_PROTX_ANALYTICS_STATEWIDE_DISTRIBUTION',
        payload: {
          area: geography,
          analyticsType: analyticsType,
        }
      });
    }, [geography, analyticsType]);

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
      <FigureCaption label={plotLabel} captionText={plotCaptionText} />
      <ChartInstructions currentReportType="analytics" />
    </div>
  );
}

AnalyticsStateDistribution.propTypes = {
  geography: PropTypes.string.isRequired,
  analyticsType: PropTypes.string.isRequired
};

export default AnalyticsStateDistribution;
