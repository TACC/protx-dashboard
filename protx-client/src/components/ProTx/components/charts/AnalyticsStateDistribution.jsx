import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import PropTypes from 'prop-types';
import { LoadingSpinner } from '_common';
import MainPlot from './MainPlot';
import { FigureCaption } from './FigureCaption';
import {getSelectedGeographyName} from "../shared/dataUtils";
import './PlotDetails.css';



function AnalyticsStateDistribution({geography, selectedGeographicFeature}) {
  const dispatch = useDispatch();

  const chartData = useSelector(
    state => state.protxAnalyticsStatewideDistribution
  );

  const analytics = useSelector(
    state => state.protxAnalytics
  );

  let countyName;
  if (selectedGeographicFeature) {
    countyName = getSelectedGeographyName(geography, selectedGeographicFeature)
  }

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

  if (chartData.error || analytics.error) {
    return (
      <div className="data-error-message">
        There was a problem loading the data.
      </div>
    );
  }

  if (chartData.loading || (selectedGeographicFeature && analytics.loading)) {
    return (
      <div className="loading-spinner">
        <LoadingSpinner />
      </div>
    );
  }

  let conditionalCaptionJSX;

  if (selectedGeographicFeature) {
    if (analytics.data.pred_per_100k) {
      conditionalCaptionJSX = (
        <>
          {' '}
          The red vertical line indicates where{' '}
          <span className='annotation-text-bold'>{countyName} County</span>{' '}
          falls on this distribution.
        </>
      );
    } else {
      conditionalCaptionJSX = (
        <span className='annotation-text-bold'>
          {' '}
          Note: There is no data for {countyName} County.
        </span>
      );
    }
  }

  const plotCaptionJSX = (
    <>
      Distribution of projected number of cases across counties in Texas. Black
      vertical lines indicate thresholds used to define high, medium and low
      risk regions for heat map on the left.
      {conditionalCaptionJSX}
    </>
  );

  return (
    <div class="maltreatment-types-plot-layout">
      <div className="feature-table">
          <div className="feature-table-chart-selection">
            <div className="feature-table-chart-title">
            Definition of Risk Levels
              <span className="feature-table-chart-subtitle">
              (Figure 1)
              </span>
          </div>
        </div>
      </div>
      <MainPlot plotState={chartData.data} />
      <FigureCaption label={'Figure 1.'} className={'chart-annotation'}>
        {plotCaptionJSX}
      </FigureCaption>
    </div>
  );
}

AnalyticsStateDistribution.propTypes = {
  geography: PropTypes.string.isRequired,
  selectedGeographicFeature: PropTypes.string.isRequired,
};

export default AnalyticsStateDistribution;
