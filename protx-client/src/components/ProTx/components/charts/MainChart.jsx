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
import { getSelectedGeographyName, capitalizeString } from '../shared/dataUtils';
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
    const dispatch = useDispatch();

  // ANALYTICS PLOT.
  if (chartType === 'analytics') {
    if (selectedGeographicFeature && observedFeature) {
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
    /**
     * TODO: Use geoid value instead of selectedArea string value on backend.
     * Description: The python maltreatment code on the backend renders the plot off the selectedArea string value instead of the geoid value.
     * Note: we are passing the geoid to the back end already.
     * Currently we pass along a munged string for the selectedArea (by looking up the geoid and appending the capitalized geogrpahy type with a space) to be used as the key value in the plotly rendering code.
     * This is the way Kelly coded it.
     * We should review the plotly server-side code and identify a way to use the geoid value rather than pass the munged string value for selectedArea.
     * NOTE: We should identify a phased process for integrating a new plot from jupyter into the portal api so it is less intensive per sprint, makes more manageable PRs and helps WMA manage development  expectations better.
     **/
    const selectedGeographicFeatureName = getSelectedGeographyName(
      geography, selectedGeographicFeature
    );

    const selectedGeographicFeatureNameComplete = `${selectedGeographicFeatureName} ${capitalizeString(
      geography
    )}`;

    const protxMaltreatmentDistribution = useSelector(
      state => state.protxMaltreatmentDistribution
    );

    useEffect(() => {
      if (selectedGeographicFeature && maltreatmentTypes.length !== 0) {
        dispatch({
          type: 'FETCH_PROTX_MALTREATMENT_DISTRIBUTION',
          payload: {
            area: geography,
            selectedArea: selectedGeographicFeatureNameComplete,
            geoid: selectedGeographicFeature,
            unit,
            variables: maltreatmentTypes
          }
        });
      }
    }, [
      geography,
      selectedGeographicFeatureNameComplete,
      selectedGeographicFeature,
      unit,
      maltreatmentTypes
    ]);

    if (selectedGeographicFeature && maltreatmentTypes.length !== 0) {
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
