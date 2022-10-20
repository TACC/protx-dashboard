import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { LoadingSpinner } from '_common';
import PredictiveFeaturesTable from './PredictiveFeaturesTable';
import AnalyticsDetails from './AnalyticsDetails';
import MainPlot from './MainPlot';
import ChartInstructions from './ChartInstructions';


function AnalyticsPredictiveTable({geography, selectedGeographicFeature}) {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch({
        type: 'FETCH_PROTX_ANALYTICS',
        payload: {
          area: geography,
          selectedArea: selectedGeographicFeature,
        }
      }
    );
  }, [geography, selectedGeographicFeature]);

  const analytics = useSelector(
    state => state.protxAnalytics
  );
  const showPlot = false; // Hide the plot while in dev.

  if(analytics.error) {
    return (
      <div>something went wrong</div>
    )
  }

  if(analytics.loading) {
    return (
      <div className="loading-spinner">
        <LoadingSpinner />
      </div>
    );
  }

  /*
  const message =  "top 3 features are: " + analytics.data.demographic_feature_1 + " " + analytics.data.demographic_feature_2 + " " + analytics.data.demographic_feature_3;

  return (
    <div className="predictive-features-chart">
      <div className="predictive-features-plot">
        <div className="predictive-features-plot-layout">
          <div>{message}</div>);
        </div>
      </div>
    </div>
  );
  */
  console.log(analytics.chartData)
  return (
    <div className="predictive-features-chart">
      <div className="predictive-features-plot">
        <div className="predictive-features-plot-layout">
          <PredictiveFeaturesTable
            selectedGeographicFeature={selectedGeographicFeature}
          />
          <MainPlot plotState={analytics.chartData} />
          <ChartInstructions currentReportType="hidden" />
        </div>
      </div>
    </div>
  );


AnalyticsPredictiveTable.propTypes = {
  geography: PropTypes.string.isRequired,
  selectedGeographicFeature: PropTypes.string.isRequired
}}

export default AnalyticsPredictiveTable;
