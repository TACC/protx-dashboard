import React from 'react';
import PropTypes from 'prop-types';
import {
  PREDICTIVE_FEATURES_TABLE_DATA,
  PREDICTIVE_FEATURES_TABLE_NOTES
} from './predictiveFeaturesTableData';
import './PredictiveFeaturesTable.css';

/**
 * TODO: Pass in the selectedFeature object with its associated data.
 * TODO: Use object for conditional rendering in the table.
 */

const tableData = PREDICTIVE_FEATURES_TABLE_DATA;
const tableNotes = PREDICTIVE_FEATURES_TABLE_NOTES;

function PredictiveFeaturesTable({ selectedGeographicFeature }) {
  let selectedFeatureCheck = false;
  const chartSubtitle = 'Table 1';
  const chartTitle = 'Texas Statewide Data';

  const selectedFeature = {
    Demographic_Feature: 'SF_NAME',
    Rank_By_Causal_Strength: 'SF_RBCS',
    Rank_By_Random_Forest_Feature_Importance: 'SF_RBRFFI',
    Average_Rank: 'SF_AR',
    Ensemble_Rank: 'SF_ER'
  };

  const featuresTableHeaderRow = () => {
    return (
      <tr>
        <th className="feature-table-chart-label">Demographic Feature</th>
        <th className="feature-table-chart-cell ensemble-rank-label">
          Ensemble Rank
        </th>
        <th className="feature-table-chart-cell">
          Rank by Causal Strength <sup>a</sup>
        </th>
        <th className="feature-table-chart-cell">
          Rank by Random Forest Feature Importance <sup>b</sup>
        </th>
        <th className="feature-table-chart-cell">Average Rank</th>
      </tr>
    );
  };

  const featureTableHeader = featuresTableHeaderRow();

  const featureTableData = tableData.map((data, index) => {
    const i = index;
    return (
      <tr key={i}>
        <td>{data.Demographic_Feature}</td>
        <td className="ensemble-rank-value">{data.Ensemble_Rank}</td>
        <td>{data.Rank_By_Causal_Strength}</td>
        <td>{data.Rank_By_Random_Forest_Feature_Importance}</td>
        <td>{data.Average_Rank}</td>
      </tr>
    );
  });

  const featureTableAnnotations = tableNotes.map((noteRow, index) => {
    const i = index;
    return (
      <div className="feature-table-annotation" key={i}>
        <span className="feature-table-annotation-prefix">
          {noteRow.Note_Prefix}
        </span>
        <span className="feature-table-annotation-text">
          {noteRow.Note_Text}
        </span>
      </div>
    );
  });

  const getFeatureTable = () => {
    if (selectedFeatureCheck) {
      const getSelectedFeatureTableData = feature => {
        const currentSelectedFeature = feature;
        return (
          <tr className="feature-table-selected-feature">
            <td>{currentSelectedFeature.Demographic_Feature}</td>
            <td className="ensemble-rank-value">
              {currentSelectedFeature.Ensemble_Rank}
            </td>
            <td>{currentSelectedFeature.Rank_By_Causal_Strength}</td>
            <td>
              {currentSelectedFeature.Rank_By_Random_Forest_Feature_Importance}
            </td>
            <td>{currentSelectedFeature.Average_Rank}</td>
          </tr>
        );
      };

      const selectedFeatureTableData = getSelectedFeatureTableData(
        selectedFeature
      );

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
              <thead>{featureTableHeader}</thead>
              <tbody>
                {featureTableData}
                {selectedFeatureTableData}
              </tbody>
            </table>
          </div>
          <div className="feature-table-info">{featureTableAnnotations}</div>
        </div>
      );
    }
    return (
      <div className="feature-table">
        <div className="feature-table-chart">
          <div className="feature-table-chart-title">
            {chartTitle}
            <span className="feature-table-chart-subtitle">
              ({chartSubtitle})
            </span>
          </div>
          <table>
            <thead>{featureTableHeader}</thead>
            <tbody>{featureTableData}</tbody>
          </table>
        </div>
        <div className="feature-table-info">{featureTableAnnotations}</div>
      </div>
    );
  };

  if (selectedGeographicFeature && selectedGeographicFeature !== ' ') {
    selectedFeatureCheck = false; // Make true to enable extra table row.
  }

  const featureTable = getFeatureTable();
  return featureTable;
}

PredictiveFeaturesTable.propTypes = {
  selectedGeographicFeature: PropTypes.string.isRequired
};

export default PredictiveFeaturesTable;
