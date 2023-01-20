import React from 'react';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import { DropdownSelector } from '_common';
import { Button } from 'reactstrap';
import MaltreatmentSelector from './MaltreatmentSelector';
import { SUPPORTED_YEARS } from '../data/meta';
import styles from './DisplaySelectors.module.scss';

/* Radio buttons for types of values to display in dropdown (see COOKS-110 for next steps). */
function RateSelector({
  valueLabelRadioBtn0,
  valueLabelRadioBtn1,
  valueRadioBtn0,
  valueRadioBtn1,
  value,
  setValue,
}) {
  const isButton0Selected = value === valueRadioBtn0;
  const isButton1Selected = value === valueRadioBtn1;
  return (
    <div className={styles['radio-container']}>
      <div className="radio-container-element">
        {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
        <label>
          <input
            className={`radio-button ${styles['radio-button']}`}
            type="radio"
            value={valueRadioBtn0}
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
            className={`radio-button ${styles['radio-button']}`}
            type="radio"
            value={valueRadioBtn1}
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
  value: PropTypes.string.isRequired,
};

/**
 * Selectors (i.e. dropdowns) to allow users to select what to display on maps/charts
 *
 * Note:
 * Maltreatment data is available at the county level.
 * Demographic Features only has 2019 data.
 *
 */
function DisplaySelectors({ downloadResources }) {
  const dispatch = useDispatch();
  const selection = useSelector((state) => state.protxSelection);
  const display = useSelector((state) => state.protx.data.display);

  const setType = (selectedType) => {
    dispatch({
      type: 'PROTX_CONFIG/SET_TYPE',
      payload: { type: selectedType, displayData: display },
    });
  };
  const setYear = (year) => {
    dispatch({
      type: 'PROTX_CONFIG/SET_YEAR',
      payload: year,
    });
  };
  const setMaltreatmentTypes = (maltreatmentTypes) => {
    dispatch({
      type: 'PROTX_CONFIG/SET_SELECTED_MALTREATMENT_TYPES',
      payload: maltreatmentTypes,
    });
  };
  const setObservedFeature = (observedFeature) => {
    dispatch({
      type: 'PROTX_CONFIG/SET_OBSERVED_FEATURE',
      payload: observedFeature,
    });
  };
  const setUnit = (newUnit) => {
    dispatch({
      type: 'PROTX_CONFIG/SET_UNIT',
      payload: { unit: newUnit, displayData: display },
    });
  };
  const setGeography = (newGeography) => {
    dispatch({
      type: 'PROTX_CONFIG/SET_GEOGRAPHY',
      payload: newGeography,
    });
  };

  const demographicsOrMaltreatment =
    selection.type === 'maltreatment' || selection.type === 'observedFeatures';
  const disableGeography = selection.type !== 'observedFeatures';
  const disabledYear = selection.type === 'observedFeatures';
  const valueLabelRadioBtn0 = 'Percentages';
  const valueLabelRadioBtn1 =
    selection.type === 'maltreatment' ? 'Rate per 100K children' : 'Totals';
  const valueRadioBtn0 = 'percent';
  const valueRadioBtn1 =
    selection.type === 'maltreatment' ? 'rate_per_100k_under17' : 'count';

  return (
    <div className={styles['display-selectors']}>
      <div className={styles['control']}>
        <span className={styles['label']}>Report</span>
        <DropdownSelector
          value={selection.type}
          onChange={(event) => setType(event.target.value)}
        >
          <optgroup label="Select Report">
            <option value="maltreatment">Child Maltreatment</option>
            <option value="observedFeatures">Demographics</option>
            <option value="analytics">Analytics</option>
          </optgroup>
        </DropdownSelector>
      </div>
      <div className={styles['control']}>
        <span className={styles['label']}>Area</span>
        <DropdownSelector
          value={selection.geography}
          onChange={(event) => setGeography(event.target.value)}
          disabled={disableGeography}
        >
          <optgroup label="Select Areas">
            <option value="dfps_region">DFPS Regions</option>
            <option value="tract">Census Tracts</option>
            <option value="county">Counties</option>
          </optgroup>
        </DropdownSelector>
      </div>
      {demographicsOrMaltreatment && (
        <div className={styles['control']}>
          <span className={styles['label']}>Value</span>
          <RateSelector
            value={selection.unit}
            valueLabelRadioBtn0={valueLabelRadioBtn0}
            valueLabelRadioBtn1={valueLabelRadioBtn1}
            valueRadioBtn0={valueRadioBtn0}
            valueRadioBtn1={valueRadioBtn1}
            setValue={setUnit}
          />
        </div>
      )}
      {selection.type === 'maltreatment' && (
        <div className={styles['control']}>
          <span className={styles['label']}>Type</span>
          <MaltreatmentSelector
            unit={selection.unit}
            variables={display.variables}
            selectedTypes={selection.maltreatmentTypes}
            setSelectedTypes={setMaltreatmentTypes}
          />
        </div>
      )}
      {selection.type === 'observedFeatures' && (
        <>
          <div className={styles['control']}>
            <span className={styles['label']}>Demographic</span>
            <DropdownSelector
              value={selection.observedFeature}
              onChange={(event) => setObservedFeature(event.target.value)}
            >
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
                    if (
                      selection.unit === 'percent' &&
                      f.DISPLAY_DEMOGRAPHIC_RATE
                    ) {
                      return true;
                    }
                    if (
                      selection.unit === 'count' &&
                      f.DISPLAY_DEMOGRAPHIC_COUNT
                    ) {
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
      {selection.type !== 'analytics' && (
        <div className={styles['control']}>
          <span className={styles['label']}>Years</span>
          <DropdownSelector
            value={selection.year}
            onChange={(event) => setYear(event.target.value)}
            disabled={disabledYear}
          >
            <optgroup label="Select year" />
            {SUPPORTED_YEARS.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </DropdownSelector>
        </div>
      )}
      {selection.selectedGeographicFeature && (
        <Button
          onClick={downloadResources}
          color="primary"
          size="sm"
          className="download-btn"
          download
        >
          Download
        </Button>
      )}
    </div>
  );
}

DisplaySelectors.propTypes = {
  downloadResources: PropTypes.func.isRequired,
};

export default DisplaySelectors;
