import React, { useEffect, useState } from 'react';
import { MultiSelect } from 'react-multi-select-component';
import PropTypes from 'prop-types';
import './MaltreatmentSelector.css';

const MaltreatmentSelector = ({
  selectedTypes,
  setSelectedTypes,
  variables,
  unit,
}) => {
  const [selected, setSelected] = useState([]);

  const options = variables
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
      if (f.NAME === 'ALL') {
        return false;
      }
      // todo, check with kelly if needed
      const showRate = unit === 'percent' || unit === 'rate_per_100k_under17';
      if (showRate && f.DISPLAY_MALTREATMENT_RATE) {
        return true;
      }
      if (!showRate && f.DISPLAY_MALTREATMENT_COUNT) {
        return true;
      }
      return false;
    })
    .map((v) => {
      return { label: v.DISPLAY_TEXT, value: v.NAME };
    });

  const overideStrings = {
    allItemsAreSelected: 'All',
  };

  const customValueRenderer = (currentSelectedTypes, _options) => {
    if (currentSelectedTypes.length) {
      if (currentSelectedTypes.length === 1) {
        return currentSelectedTypes.map(({ label }) => label);
      }
      if (currentSelectedTypes.length === _options.length) {
        return [` All selected (${currentSelectedTypes.length})`];
      }
      return [
        ` Multiple maltreatment selected (${currentSelectedTypes.length})`,
      ];
    }
    return 'None';
  };

  useEffect(() => {
    const updatedSelected = selectedTypes.map((val) => {
      const variable = variables.find((element) => element.NAME === val);
      return { label: variable.DISPLAY_TEXT, value: variable.NAME };
    });
    setSelected(updatedSelected);
  }, [selectedTypes]);

  const handleChange = (newSelection) => {
    const newSelectionTypes = newSelection.map((e) => e.value);
    setSelectedTypes(newSelectionTypes);
  };

  return (
    <MultiSelect
      options={options}
      value={selected}
      onChange={handleChange}
      labelledBy="Select"
      overrideStrings={overideStrings}
      valueRenderer={customValueRenderer}
    />
  );
};

MaltreatmentSelector.propTypes = {
  variables: PropTypes.arrayOf(PropTypes.object).isRequired,
  unit: PropTypes.string.isRequired,
  selectedTypes: PropTypes.arrayOf(PropTypes.string).isRequired,
  setSelectedTypes: PropTypes.func.isRequired,
};

export default MaltreatmentSelector;
