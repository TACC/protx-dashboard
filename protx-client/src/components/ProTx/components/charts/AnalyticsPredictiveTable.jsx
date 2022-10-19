import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import { LoadingSpinner } from '_common';
import {
  getSelectedGeographyName,
  capitalizeString,
  getObservedFeaturesLabel,
} from '../shared/dataUtils';
import ChartInstructions from './ChartInstructions';
import './PredictiveFeaturesTable.css';



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
  }, [geography, selectedGeographicFeature]
  );

  const analytics = useSelector(
    state => state.protxAnalytics
  );

  const data = useSelector(
    state => state.protx.data
  );

  const showPlot = true; // Hide the plot while in dev.

  const plotState = {
    data: [{ type: 'bar', x: [1, 2, 3], y: [1, 3, 2] }],
    layout: { title: { text: 'Analytics' } }
  };

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

  const countyName = getSelectedGeographyName(geography, analytics.data.GEOID.toString());
  const observedFeaturesLabel_1 = analytics.data.demographic_feature_1? getObservedFeaturesLabel(analytics.data.demographic_feature_1, data) : '--No Data--'
  const observedFeaturesLabel_2 = analytics.data.demographic_feature_2 ? getObservedFeaturesLabel(analytics.data.demographic_feature_2, data) : '--No Data--'
  const observedFeaturesLabel_3 = analytics.data.demographic_feature_3 ? getObservedFeaturesLabel(analytics.data.demographic_feature_3, data) : '--No Data--'
  const correlation_1 = analytics.data.correlation_1 ? capitalizeString(analytics.data.correlation_1) : '--No Data--';
  const correlation_2 = analytics.data.correlation_2 ? capitalizeString(analytics.data.correlation_2) : '--No Data--';
  const correlation_3 = analytics.data.correlation_3 ? capitalizeString(analytics.data.correlation_3) : '--No Data--';

  const chartSubtitle = 'Table 1';
  const chartTitle = "Top 3 Demographic Risk Factors for " + countyName + " County";          
  const noteText = 'Top three demographic features related to changes in the county-level child total maltreatment counts. Ranking indicates features that are most influential. Correlation indicates the nature of the relationship between the demographic feature and total maltreatment counts. A positive correlation implies that an increase in the demographic feature results in an increase in total maltreatment counts and vice versa. A negative correlation means an increase in the demographic feature results in a decrease in total maltreatment counts.';
  
  const analyticsFeatureHeaderRow  = () => {
    return (
      <tr>
        <th className="feature-table-chart-cell">
          Rank</th>
        <th className="feature-table-chart-label">
          Demographic Feature</th>
        <th className="feature-table-chart-label">
          Correlation to Increased Maltreatment</th>  
      </tr>
    );
    };

  const analyticsFeatureTableHeader = analyticsFeatureHeaderRow();

  const analyticsFeatureTableAnnotations = () => {
    const notePrefix = 'Table 1'
    const noteText = 'Top three demographic features related to changes in the county-level child total maltreatment counts. Ranking indicates features that are most influential. Correlation indicates the nature of the relationship between the demographic feature and total maltreatment counts. A positive correlation implies that an increase in the demographic feature results in an increase in total maltreatment counts and vice versa. A negative correlation means an increase in the demographic feature results in a decrease in total maltreatment counts.';
    return (
      <div className="feature-table-annotation">
        <span className="feature-table-annotation-prefix">
          {notePrefix}
        </span>
        <span className="feature-table-annotation-text">
          {noteText}
        </span>
      </div>
    );
  };

  const analyticsFeatureAnnotation = analyticsFeatureTableAnnotations();

    return (
        <div className="feature-table">
          <div className="feature-table-chart-selection">
            <div className="feature-table-chart-title">
              {chartTitle}
              <span className="feature-table-chart-subtitle">
                ({chartSubtitle})
              </span>
            </div>
            <table>
              <thead>{analyticsFeatureTableHeader}</thead>
              <tbody>
                <tr>
                  <td>{"1"}</td>
                  <td className="ensemble-rank-value">
                    {observedFeaturesLabel_1}
                  </td>
                  <td>{correlation_1}</td>
                </tr>
                <tr>
                  <td>{"2"}</td>
                  <td className="ensemble-rank-value">
                    {observedFeaturesLabel_2}
                  </td>
                  <td>{correlation_2}</td>
                </tr>
                <tr>
                  <td>{"3"}</td>
                  <td className="ensemble-rank-value">
                    {observedFeaturesLabel_3}
                  </td>
                  <td>{correlation_3}</td>
                </tr>
              </tbody>
            </table>
            </div>
          <div>{analyticsFeatureAnnotation}</div>
          <ChartInstructions currentReportType="hidden"></ChartInstructions>
        </div>
      );

  };


AnalyticsPredictiveTable.propTypes = {
  geography: PropTypes.string.isRequired,
  selectedGeographicFeature: PropTypes.string.isRequired
};

export default AnalyticsPredictiveTable;
