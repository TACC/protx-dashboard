import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import PropTypes from 'prop-types';
import { LoadingSpinner } from '_common';
import ChartInstructions from './ChartInstructions';
import AnalyticsDetails from './AnalyticsDetails';
import PredictiveFeaturesTable from './PredictiveFeaturesTable';
import DemographicsDetails from './DemographicsDetails';
import MaltreatmentDetails from './MaltreatmentDetails';
import MainPlot from './MainPlot';
import './MainChart.css';

function MainChart({
  chartType,
  geography,
  maltreatmentTypes,
  observedFeature,
  selectedGeographicFeature,
  data,
  unit,
  showInstructions
}) {
  // ANALYTICS PLOT.
  if (chartType === 'analytics') {
    if (selectedGeographicFeature && observedFeature) {
      const showPlot = false; // Hide the plot while in dev.

      const plotState = {
        data: [{ type: 'bar', x: [1, 2, 3], y: [1, 3, 2] }],
        layout: { title: { text: 'Analytics' } }
      };

      return (
        <div className="predictive-features-chart">
          <div className="predictive-features-plot">
            <div className="predictive-features-plot-layout">
              <PredictiveFeaturesTable
                selectedGeographicFeature={selectedGeographicFeature}
              />
              {showPlot && (
                <>
                  <AnalyticsDetails
                    geography={geography}
                    observedFeature={observedFeature}
                    selectedGeographicFeature={selectedGeographicFeature}
                    data={data}
                  />
                  <MainPlot plotState={plotState} />
                </>
              )}
              <ChartInstructions currentReportType="hidden" />
            </div>
          </div>
        </div>
      );
    }
  }

  // DEMOGRAPHICS PLOT.
  if (chartType === 'demographics') {
    const protxDemographicsDistribution = useSelector(
      state => state.protxDemographicsDistribution
    );

    const dispatch = useDispatch();

    useEffect(() => {
      if (observedFeature === 'maltreatment') {
        return;
      }
      if (selectedGeographicFeature) {
        dispatch({
          type: 'FETCH_PROTX_DEMOGRAPHICS_DISTRIBUTION',
          payload: {
            area: geography,
            selectedArea: selectedGeographicFeature,
            variable: observedFeature,
            unit
          }
        });
      }
    }, [geography, observedFeature, selectedGeographicFeature, unit]);

    if (selectedGeographicFeature && observedFeature) {
      if (protxDemographicsDistribution.error) {
        return (
          <div className="data-error-message">
            There was a problem loading the data.
          </div>
        );
      }

      if (protxDemographicsDistribution.loading) {
        return (
          <div className="loading-spinner">
            <LoadingSpinner />
          </div>
        );
      }

      const plotState = protxDemographicsDistribution.data;

      return (
        <div className="observed-features-plot-layout">
          <DemographicsDetails
            geography={geography}
            observedFeature={observedFeature}
            selectedGeographicFeature={selectedGeographicFeature}
            data={data}
          />
          <MainPlot plotState={plotState} />
          {!protxDemographicsDistribution.loading && (
            <ChartInstructions currentReportType="hidden" />
          )}
        </div>
      );
    }
  }

  // MALTEATMENT PLOT.
  if (chartType === 'maltreatment') {
    if (selectedGeographicFeature && maltreatmentTypes.length !== 0) {
      const protxMaltreatmentDistribution = useSelector(
        state => state.protxMaltreatmentDistribution
      );
  
      const dispatch = useDispatch();
  
      useEffect(() => {
        if (selectedGeographicFeature && maltreatmentTypes.length !== 0) {
          dispatch({
            type: 'FETCH_PROTX_MALTREATMENT_DISTRIBUTION',
            payload: {
              area: geography,
              geoid: selectedGeographicFeature,
              unit,
              variables: maltreatmentTypes
            }
          });
        }
      }, [
        geography,
        selectedGeographicFeature,
        unit,
        maltreatmentTypes
      ]);
      
      if (protxMaltreatmentDistribution.error) {
        return (
          <div className="data-error-message">
            There was a problem loading the data.
          </div>
        );
      }

      if (protxMaltreatmentDistribution.loading) {
        return (
          <div className="loading-spinner">
            <LoadingSpinner />
          </div>
        );
      }

      const plotState = protxMaltreatmentDistribution.data;

      return (
        <div className="maltreatment-chart">
          <div className="maltreatment-types-plot">
            <div className="maltreatment-types-plot-layout">
              <MaltreatmentDetails
                geography={geography}
                selectedGeographicFeature={selectedGeographicFeature}
                maltreatmentTypes={maltreatmentTypes}
                data={data}
              />
              <MainPlot plotState={plotState} />
              <ChartInstructions currentReportType="hidden" />
            </div>
          </div>
        </div>
      );
    }
  }

  // PLOT INSTRUCTIONS.
  return (
    <div className="main-chart">
      {showInstructions && <ChartInstructions currentReportType={chartType} />}
    </div>
  );
}

MainChart.propTypes = {
  chartType: PropTypes.string.isRequired,
  geography: PropTypes.string.isRequired,
  maltreatmentTypes: PropTypes.arrayOf(PropTypes.string).isRequired,
  observedFeature: PropTypes.string.isRequired,
  selectedGeographicFeature: PropTypes.string.isRequired,
  // eslint-disable-next-line react/forbid-prop-types
  data: PropTypes.object.isRequired,
  unit: PropTypes.string.isRequired,
  showInstructions: PropTypes.bool
};

MainChart.defaultProps = {
  showInstructions: false
};

export default MainChart;
