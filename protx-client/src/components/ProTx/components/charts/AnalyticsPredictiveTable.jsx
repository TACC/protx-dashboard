import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import { LoadingSpinner } from '_common';
import {
  getSelectedGeographyName,
  capitalizeString,
  getObservedFeaturesLabel,
} from '../shared/dataUtils';
import './PredictiveFeaturesTable.css';
import { FigureCaption } from './FigureCaption';

function AnalyticsPredictiveTable({ geography, selectedGeographicFeature }) {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch({
      type: 'FETCH_PROTX_ANALYTICS',
      payload: {
        area: geography,
        selectedArea: selectedGeographicFeature,
      },
    });
  }, [geography, selectedGeographicFeature]);

  const analytics = useSelector((state) => state.protxAnalytics);

  const data = useSelector((state) => state.protx.data);

  if (analytics.error) {
    return <div>something went wrong</div>;
  }

  if (analytics.loading) {
    return (
      <div className="loading-spinner">
        <LoadingSpinner />
      </div>
    );
  }

  //Gets human-readable string from DB
  const countyName = getSelectedGeographyName(
    geography,
    analytics.data.GEOID.toString()
  );

  const observedFeaturesLabel_1 = analytics.data.demographic_feature_1
    ? getObservedFeaturesLabel(analytics.data.demographic_feature_1, data)
    : '--No Data--';
  const observedFeaturesLabel_2 = analytics.data.demographic_feature_2
    ? getObservedFeaturesLabel(analytics.data.demographic_feature_2, data)
    : '--No Data--';
  const observedFeaturesLabel_3 = analytics.data.demographic_feature_3
    ? getObservedFeaturesLabel(analytics.data.demographic_feature_3, data)
    : '--No Data--';

  const correlation_1 = analytics.data.correlation_1
    ? capitalizeString(analytics.data.correlation_1) + ' correlation'
    : '--No Data--';
  const correlation_2 = analytics.data.correlation_2
    ? capitalizeString(analytics.data.correlation_2) + ' correlation'
    : '--No Data--';
  const correlation_3 = analytics.data.correlation_3
    ? capitalizeString(analytics.data.correlation_3) + ' correlation'
    : '--No Data--';

  const chartSubtitle = 'Table 1';

  const analyticsFeatureTitle = () => {
    return (
      <div className="feature-table-chart-title">
        {' '}
        Top Three Maltreatment Factors for {countyName} County
        <span className="feature-table-chart-subtitle">({chartSubtitle})</span>
      </div>
    );
  };

  const analyticsChartTitle = analyticsFeatureTitle();

  const analyticsFeatureHeaderRow = () => {
    return (
      <tr>
        <th className="feature-table-chart-cell">Rank</th>
        <th className="feature-table-chart-label">Demographic Feature</th>
        <th className="feature-table-chart-label">
          Correlation to Increased Maltreatment
        </th>
      </tr>
    );
  };

  const analyticsFeatureTableHeader = analyticsFeatureHeaderRow();

  const tableAnnotationText = `Top three demographic features related to changes in the county-level child 
        total maltreatment counts. Ranking indicates features that are most influential. 
        Correlation indicates the nature of the relationship between the demographic 
        feature and total maltreatment counts. A positive correlation implies that an 
        increase in the demographic feature results in an increase in total maltreatment 
        counts and vice versa. A negative correlation means an increase in the demographic 
        feature results in a decrease in total maltreatment counts.`;

  return (
    <>
      <div className="feature-table-chart-selection">
        <div className="feature-table">
          {' '}
          {analyticsChartTitle}
          <table className="feature-table">
            <thead>{analyticsFeatureTableHeader}</thead>
            <tbody>
              <tr>
                <td>{'1'}</td>
                <td className="ensemble-rank-value">
                  {observedFeaturesLabel_1}
                </td>
                <td>{correlation_1}</td>
              </tr>
              <tr>
                <td>{'2'}</td>
                <td className="ensemble-rank-value">
                  {observedFeaturesLabel_2}
                </td>
                <td>{correlation_2}</td>
              </tr>
              <tr>
                <td>{'3'}</td>
                <td className="ensemble-rank-value">
                  {observedFeaturesLabel_3}
                </td>
                <td>{correlation_3}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      <FigureCaption label={'Table 1.'} className={'table-annotation'}>
        {tableAnnotationText}
      </FigureCaption>
    </>
  );
}

AnalyticsPredictiveTable.propTypes = {
  geography: PropTypes.string.isRequired,
  selectedGeographicFeature: PropTypes.string.isRequired,
};

export default AnalyticsPredictiveTable;
