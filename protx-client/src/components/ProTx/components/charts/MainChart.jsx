import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import PropTypes from 'prop-types';
import { LoadingSpinner } from '_common';
import ChartInstructions from './ChartInstructions';
import AnalyticsPredictiveTable from './AnalyticsPredictiveTable';
import AnalyticsStateDistribution from './AnalyticsStateDistribution';
import DemographicsDetails from './DemographicsDetails';
import MaltreatmentDetails from './MaltreatmentDetails';
import MainPlot from './MainPlot';
import styles from './MainChart.module.scss';
import { getSelectedGeographyName } from '../shared/dataUtils';

function MainChart({ data, showInstructions }) {
  const selection = useSelector((state) => state.protxSelection);
  const dispatch = useDispatch();

  // TODO refactor into components; current workaround is placing different hooks with conditions at
  //  the top of this component
  const protxMaltreatmentDistribution = useSelector(
    (state) => state.protxMaltreatmentDistribution
  );
  useEffect(() => {
    if (
      selection.type === 'maltreatment' &&
      selection.selectedGeographicFeature &&
      selection.maltreatmentTypes.length !== 0
    ) {
      dispatch({
        type: 'FETCH_PROTX_MALTREATMENT_DISTRIBUTION',
        payload: {
          area: selection.geography,
          geoid: selection.selectedGeographicFeature,
          unit: selection.unit,
          variables: selection.maltreatmentTypes,
        },
      });
    }
  }, [
    selection.type,
    selection.geography,
    selection.selectedGeographicFeature,
    selection.unit,
    selection.maltreatmentTypes,
  ]);
  const protxDemographicsDistribution = useSelector(
    (state) => state.protxDemographicsDistribution
  );

  useEffect(() => {
    if (
      selection.type === 'observedFeatures' &&
      selection.selectedGeographicFeature
    ) {
      dispatch({
        type: 'FETCH_PROTX_DEMOGRAPHICS_DISTRIBUTION',
        payload: {
          area: selection.geography,
          selectedArea: selection.selectedGeographicFeature,
          variable: selection.observedFeature,
          unit: selection.unit,
        },
      });
    }
  }, [
    selection.type,
    selection.geography,
    selection.observedFeature,
    selection.selectedGeographicFeature,
    selection.unit,
  ]);

  // ANALYTICS PLOT.
  if (selection.type === 'analytics') {
    const plotDetailSectionTitle = selection.selectedGeographicFeature
      ? `${getSelectedGeographyName(
          selection.geography,
          selection.selectedGeographicFeature
        )}  County`
      : 'Texas Statewide Data';
    return (

      <div className={styles["main-chart"]}>
        <span className={styles['main-chart-title']}>
          <span className={styles['main-chart-title-text']}>
              {plotDetailSectionTitle}</span></span>
        <AnalyticsStateDistribution
          geography={selection.geography}
          selectedGeographicFeature={selection.selectedGeographicFeature}
        />
        {selection.selectedGeographicFeature && (
          <AnalyticsPredictiveTable
            geography={selection.geography}
            selectedGeographicFeature={selection.selectedGeographicFeature}
          />
        )}

        <ChartInstructions
          currentReportType={
            selection.selectedGeographicFeature ? 'hidden' : 'analytics'
          }
        />
      </div>
    );
  }

  // DEMOGRAPHICS PLOT.
  if (selection.type === 'observedFeatures') {
    if (selection.selectedGeographicFeature && selection.observedFeature) {
      if (protxDemographicsDistribution.error) {
        return (
          <div className={styles['data-error-message']}>
            There was a problem loading the data.
          </div>
        );
      }

      if (protxDemographicsDistribution.loading) {
        return <LoadingSpinner />;
      }

      const plotState = protxDemographicsDistribution.data;

      return (
        <div className="observed-features-plot-layout">
          <DemographicsDetails
            geography={selection.geography}
            observedFeature={selection.observedFeature}
            selectedGeographicFeature={selection.selectedGeographicFeature}
            data={data}
          />
          <MainPlot
            plotState={plotState}
            className={styles['demographics-plot']}
          />
          {!protxDemographicsDistribution.loading && (
            <ChartInstructions currentReportType="hidden" />
          )}
        </div>
      );
    }
  }

  // MALTEATMENT PLOT.
  if (selection.type === 'maltreatment') {
    if (
      selection.selectedGeographicFeature &&
      selection.maltreatmentTypes.length !== 0
    ) {
      if (protxMaltreatmentDistribution.error) {
        return (
          <div className={styles['data-error-message']}>
            There was a problem loading the data.
          </div>
        );
      }

      if (protxMaltreatmentDistribution.loading) {
        return <LoadingSpinner />;
      }

      const plotState = protxMaltreatmentDistribution.data;

      return (
        <div className="maltreatment-chart">
          <div className="maltreatment-types-plot">
            <div className="maltreatment-types-plot-layout">
              <MaltreatmentDetails
                geography={selection.geography}
                selectedGeographicFeature={selection.selectedGeographicFeature}
                maltreatmentTypes={selection.maltreatmentTypes}
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
      {showInstructions && (
        <ChartInstructions currentReportType={selection.type} />
      )}
    </div>
  );
}

MainChart.propTypes = {
  // eslint-disable-next-line react/forbid-prop-types
  data: PropTypes.object.isRequired,
  showInstructions: PropTypes.bool,
};

MainChart.defaultProps = {
  showInstructions: false,
};

export default MainChart;
