import React from 'react';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';
import { DropdownSelector } from '_common';
import { Button } from 'reactstrap';
import MaltreatmentSelector from './MaltreatmentSelector';
import { OBSERVED_FEATURES_TOP_FIELDS, SUPPORTED_YEARS } from '../data/meta';
import styles from './DisplaySelectors.module.scss';

/* Radio buttons for types of values to display in dropdown (see COOKS-110 for next steps). */
function RateSelector({
  valueLabelRadioBtn0,
  valueLabelRadioBtn1,
  valueRadioBtn0,
  valueRadioBtn1,
  value,
  setValue
}) {
  const isButton0Selected = value === valueRadioBtn0;
  const isButton1Selected = value === valueRadioBtn1;
  return (
    <div className={styles["radio-container"]}>
      <div className="radio-container-element">
        {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
        <label>
          <input
            className={`radio-button ${styles["radio-button"]}`}
            type="radio"
            value={valueRadioBtn0}
            styleName="radio-button"
            checked={isButton0Selected}
            onChange={() => setValue(valueRadioBtn0)}
          />
          {valueLabelRadioBtn0}
        </label>
      </div>
      <div className="radio">
        {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
        <label>
          <input
            className={`radio-button ${styles["radio-button"]}`}
            type="radio"
            value={valueRadioBtn1}
            styleName="radio-button"
            checked={isButton1Selected}
            onChange={() => setValue(valueRadioBtn1)}
          />
          {valueLabelRadioBtn1}
        </label>
      </div>
    </div>
  );
}

RateSelector.propTypes = {
  valueLabelRadioBtn0: PropTypes.string.isRequired,
  valueLabelRadioBtn1: PropTypes.string.isRequired,
  valueRadioBtn0: PropTypes.string.isRequired,
  valueRadioBtn1: PropTypes.string.isRequired,
  setValue: PropTypes.func.isRequired,
  value: PropTypes.string.isRequired
};

/**
 * Selectors (i.e. dropdowns) to allow users to select what to display on maps/charts
 *
 * Customizations:
 * - if `setGeography` or `setYear` are not set then the associated dropdown is disabled
 * - if 'limitToTopObservedFeatureFields' then a limited set of demographic data is selectable
 *    (and user can't switch between value types like between percent/total)
 * Note:
 * Maltreatment data is available at the county level.
 * Demographic Features only has 2019 data.
 *
 */
function DisplaySelectors({
  mapType,
  geography,
  maltreatmentTypes,
  observedFeature,
  analyticsType,
  year,
  unit,
  selectedGeographicFeature,
  setGeography,
  setMaltreatmentTypes,
  setObservedFeature,
  setAnalyticsType,
  setYear,
  setUnit,
  limitToTopObservedFeatureFields,
  downloadResources
}) {
  const disableGeography = mapType === 'maltreatment' || setGeography === null;
  const disabledYear = mapType === 'observedFeatures' || setYear == null;
  const valueLabelRadioBtn0 = 'Percentages';
  const valueLabelRadioBtn1 =
    mapType === 'maltreatment' ? 'Rate per 100K children' : 'Totals';
  const valueRadioBtn0 = 'percent';
  const valueRadioBtn1 =
    mapType === 'maltreatment' ? 'rate_per_100k_under17' : 'count';
  const display = useSelector(state => state.protx.data.display);
  const analyticsCategories = [{name: 'risk', display_text: 'Relative Risk'}, {name: 'pred_per_100k', display_text: 'Predicted Number of Cases'}]

  const changeUnit = newUnit => {
    if (mapType === 'observedFeatures') {
      // check to see if we also need to switch the variable if it doesn't a count or percentage
      // that would be needed.
      const current = display.variables.find(f => f.NAME === observedFeature);
      if (newUnit && current.DISPLAY_DEMOGRAPHIC_RATE === 0) {
        setObservedFeature(
          display.variables.find(f => f.DISPLAY_DEMOGRAPHIC_RATE === 1).NAME
        );
      }
      if (!newUnit && current.DISPLAY_DEMOGRAPHIC_COUNT === 0) {
        setObservedFeature(
          display.variables.find(f => f.DISPLAY_DEMOGRAPHIC_COUNT === 1).NAME
        );
      }
    }
    setUnit(newUnit);
  };

  return (
    <div className={styles["display-selectors"]}>
      <div className={styles["control"]}>
        <span className={styles["label"]}>Area</span>
        <DropdownSelector
          value={geography}
          onChange={(event) => setGeography(event.target.value)}
          disabled={disableGeography}>
          <optgroup label="Select Areas">
            <option value="dfps_region">
              DFPS Regions
            </option>
            <option
              value="tract"
            >
              Census Tracts
            </option>
            <option value="county">Counties</option>
          </optgroup>
        </DropdownSelector>
      </div>
      {setUnit && (
        <div className={styles["control"]}>
          <span className={styles["label"]}>Value</span>
          <RateSelector
            value={unit}
            valueLabelRadioBtn0={valueLabelRadioBtn0}
            valueLabelRadioBtn1={valueLabelRadioBtn1}
            valueRadioBtn0={valueRadioBtn0}
            valueRadioBtn1={valueRadioBtn1}
            setValue={changeUnit}
          />
        </div>
      )}
      {mapType === 'maltreatment' && (
        <div className={styles["control"]}>
          <span className={styles["label"]}>Type</span>
          <MaltreatmentSelector
            unit={unit}
            variables={display.variables}
            selectedTypes={maltreatmentTypes}
            setSelectedTypes={setMaltreatmentTypes}
          />
        </div>
      )}
      {(mapType === 'observedFeatures' || mapType === 'predictiveFeatures') && (
        <>
          <div className={styles["control"]}>
            <span className={styles["label"]}>Demographic</span>
            <DropdownSelector
              value={observedFeature}
              onChange={(event) => setObservedFeature(event.target.value)}>
              <optgroup label="Select demographic feature">
                {display.variables
                  .sort((a, b) => {
                    if (a.DISPLAY_TEXT < b.DISPLAY_TEXT) {
                      return -1;
                    }
                    if (a.DISPLAY_TEXT > b.DISPLAY_TEXT) {
                      return 1;
                    }
                    return 0;
                  })
                  .filter((f) => {
                    if (limitToTopObservedFeatureFields) {
                      return OBSERVED_FEATURES_TOP_FIELDS.includes(f.NAME);
                    }
                    if (unit === 'percent' && f.DISPLAY_DEMOGRAPHIC_RATE) {
                      return true;
                    }
                    if (unit === 'count' && f.DISPLAY_DEMOGRAPHIC_COUNT) {
                      return true;
                    }
                    return false;
                  })
                  .map((f) => (
                    <option key={f.NAME} value={f.NAME}>
                      {f.DISPLAY_TEXT}
                    </option>
                  ))}
              </optgroup>
            </DropdownSelector>
          </div>
        </>
      )}
      {(mapType === 'analytics') && (
        <>
          <div className={styles["control"]}>
            <span className={styles["label"]}>Projections</span>
            <DropdownSelector
              value={analyticsType}
              onChange={(event) => setAnalyticsType(event.target.value)}>
              <optgroup label="Select projection type">
                {analyticsCategories.map(type => (
                  <option key={type.name} value={type.name}>
                    {type.display_text}
                  </option>
                ))}
              </optgroup>
            </DropdownSelector>
          </div>
        </>
      )}
      <div className={styles["control"]}>
        <span className={styles["label"]}>Years</span>
        <DropdownSelector
          value={year}
          onChange={(event) => setYear(event.target.value)}
          disabled={disabledYear}>
          <optgroup label="Select year" />
          {SUPPORTED_YEARS.map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </DropdownSelector>
      </div>

      {selectedGeographicFeature && (
        <Button
          onClick={downloadResources}
          color="primary"
          size="sm"
          styleName="download-btn"
          download>
          Download
        </Button>
      )}
    </div>
  );
}

DisplaySelectors.propTypes = {
  mapType: PropTypes.string.isRequired,
  geography: PropTypes.string.isRequired,
  maltreatmentTypes: PropTypes.arrayOf(PropTypes.string).isRequired,
  observedFeature: PropTypes.string.isRequired,
  year: PropTypes.string.isRequired,
  unit: PropTypes.string.isRequired,
  selectedGeographicFeature: PropTypes.string.isRequired,
  setGeography: PropTypes.func,
  setMaltreatmentTypes: PropTypes.func.isRequired,
  setObservedFeature: PropTypes.func.isRequired,
  setYear: PropTypes.func,
  setUnit: PropTypes.func,
  limitToTopObservedFeatureFields: PropTypes.bool,
  downloadResources: PropTypes.func.isRequired
};

DisplaySelectors.defaultProps = {
  setGeography: null,
  setYear: null,
  setUnit: null,
  limitToTopObservedFeatureFields: false
};

export default DisplaySelectors;
