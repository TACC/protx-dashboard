import { PHR_MSA_COUNTIES } from '../data/PHR_MSA_County_Data';

/**
 *
 * @param {*} string
 * @returns
 */
const capitalizeString = string => {
  return string[0].toUpperCase() + string.slice(1);
};

/**
 * Compare an observedFeature's valueType with valueType and return  true if same type (i.e. percent type or non-percent type)
 *
 * This is not a valueType direct comparison as we are really considering things as being
 * percentages or non-percentages.  This is cause we have percents and a variety of yet-to-be-defined
 * non-percentage value types (like count, dollars etc).
 *
 * @param {Object} observed feature
 * @param {String} valueType
 * @return boolean
 */
const compareSimplifiedValueType = (observedFeature, valueType) => {
  const isPercent =
    'valueType' in observedFeature && observedFeature.valueType === 'percent';
  return valueType === 'percent' ? isPercent : !isPercent;
};

/**
 * Get the county name for a given trimmed Geoid.
 * @param {String} trimmedGeoid
 * @returns {countyName: string}
 */
const getCountyName = trimmedGeoid => {
  const county = Object.values(PHR_MSA_COUNTIES).find(cty => {
    const baseCode = '000';
    const countyCode = (baseCode + cty['FIPS Number']).slice(-3);
    return countyCode === trimmedGeoid;
  });
  const countyName = county ? county['County Name'] : 'Not Found';
  return countyName;
};

/**
 * Get a pertinent geography name for a given geography and Geoid.
 * @param {String} geography
 * @param {String} currentGeoid
 * @returns {geographyName: string}
 */
const getSelectedGeographyName = (geography, currentGeoid) => {
  let geographyName, trimmedGeoid;

  switch (geography) {
    case 'county':
      trimmedGeoid = currentGeoid.substring(currentGeoid.length - 3);
      geographyName = getCountyName(trimmedGeoid);
      break;
    case 'tract':
      trimmedGeoid = currentGeoid.slice(2, 5);
      geographyName = getCountyName(trimmedGeoid);
      break;
    case 'dfps_region':
      const regionLabel = currentGeoid.substring(currentGeoid.indexOf('-') + 1);
      geographyName = regionLabel;
      break;
    default:
      geographyName = '';
  }

  return geographyName;
};

/**
 * Get meta data for observed features
 * @param {Object} data
 * @param {String} geography
 * @param {Number} year
 * @param {String} observedFeature
 * @returns {Object} meta data (min, max)
 */
const getObservedFeaturesMetaData = (
  data,
  geography,
  year,
  observedFeature,
  unit
) => {
  const hasValues =
    geography in data.observedFeaturesMeta &&
    year in data.observedFeaturesMeta[geography] &&
    observedFeature in data.observedFeaturesMeta[geography][year] &&
    unit in data.observedFeaturesMeta[geography][year][observedFeature];
  if (hasValues) {
    return data.observedFeaturesMeta[geography][year][observedFeature][unit];
  }
  return null;
};

/**
 * Get meta data for maltreatment data
 * @param {Object} data
 * @param {String} geography
 * @param {Number} year
 * @param Array<{String}> maltreatmentTypes
 * @param {String} valueType
 * @returns {Object} meta data (min, max)
 */
const getMaltreatmentMetaData = (
  data,
  geography,
  year,
  maltreatmentTypes,
  valueType
) => {
  // maltreatment data is derived from data as
  // it is based on the list of selected maltreatment types
  if (maltreatmentTypes.length === 0) {
    return null;
  }

  const hasYearAndGeography =
    geography in data.maltreatment && year in data.maltreatment[geography];

  let meta = null;
  const aggregrateValues = {};

  if (hasYearAndGeography) {
    const yearDataSet = data.maltreatment[geography][year];
    maltreatmentTypes.forEach(malType => {
      if (malType in yearDataSet) {
        Object.entries(yearDataSet[malType]).forEach(([geoid, countInfo]) => {
          const value = countInfo[valueType];
          if (value) {
            if (geoid in aggregrateValues) {
              aggregrateValues[geoid] += value;
            } else {
              aggregrateValues[geoid] = value;
            }
          }
        });
      }
    });

    const values = Object.values(aggregrateValues).map(x => +x);
    if (values.length) {
      meta = { min: Math.min(...values), max: Math.max(...values) };
    } else {
      // no values were found
      return null;
    }
  }
  if (meta.max < 100.0000001 && meta.min > 99.9999999) {
    // quick fix for https://github.com/TACC/protx/pull/97
    meta.max = 100;
    meta.min = 100;
  }
  return meta;
};

/**
 * Get meta data for maltreatment data
 * @param {Object} data
 * @param {String} map type
 * @param {String} geography
 * @param {Number} year
 * @param {String} observedFeature
 * @param Array<{String}> maltreatmentTypes
 * @param {String} unit
 * @returns {Object} meta data (min, max)
 */
const getMetaData = (
  data,
  mapType,
  geography,
  year,
  observedFeature,
  maltreatmentTypes,
  unit
) => {
  const meta =
    mapType === 'observedFeatures'
      ? getObservedFeaturesMetaData(
          data,
          geography,
          year,
          observedFeature,
          unit
        )
      : getMaltreatmentMetaData(data, geography, year, maltreatmentTypes, unit);
  return meta;
};

/**
 * Get value of an observed (demographic) feature  data for maltreatment data
 * @param {Object} data
 * @param {String} geography
 * @param {Number} year
 * @param {Number} geoid
 * @param {String} observedFeature
 * @param {boolean} unit
 * @returns {Number} value (null if no value exists)
 */
const getObservedFeatureValue = (
  data,
  geography,
  year,
  geoid,
  observedFeature,
  unit
) => {
  const dataSet = data.observedFeatures[geography];
  const hasElementAndProperty =
    year in dataSet &&
    observedFeature in dataSet[year] &&
    geoid in dataSet[year][observedFeature] &&
    unit in dataSet[year][observedFeature][geoid];
  const featureValue = hasElementAndProperty
    ? dataSet[year][observedFeature][geoid][unit]
    : null;
  return featureValue;
};

/**
 * Get aggreagated value of maltreatment counts for a feature
 * @param {Object} data
 * @param {String} geography
 * @param {Number} year
 * @param {Number} geoid
 * @param Array<{String}> maltreatmentTypes
 * @returns {Number} value (null if no value exists)
 */
const getMaltreatmentAggregatedValue = (
  data,
  geography,
  year,
  valueType,
  geoid,
  maltreatmentTypes
) => {
  const hasYearAndGeography =
    geography in data.maltreatment && year in data.maltreatment[geography];
  let value = 0;
  if (hasYearAndGeography) {
    maltreatmentTypes.forEach(malType => {
      if (
        malType in data.maltreatment[geography][year] &&
        geoid in data.maltreatment[geography][year][malType] &&
        valueType in data.maltreatment[geography][year][malType][geoid]
      ) {
        value += data.maltreatment[geography][year][malType][geoid][valueType];
      }
    });
  }
  return value;
};

/**
 *  Get list of maltreatment display names
 *
 * @param {*} typesDataArray
 * @returns
 */
const getMaltreatmentTypeNames = (maltreatmentTypeCodes, data) => {
  const updatedMaltreatmentTypesList = [];
  if (maltreatmentTypeCodes.length === 0) {
    return ['None'];
  }
  for (let i = 0; i < maltreatmentTypeCodes.length; i += 1) {
    for (let j = 0; j < data.display.variables.length; j += 1) {
      if (maltreatmentTypeCodes[i] === data.display.variables[j].NAME) {
        updatedMaltreatmentTypesList.push(
          data.display.variables[j].DISPLAY_TEXT
        );
      }
    }
  }
  return updatedMaltreatmentTypesList;
};

/**
 * Get label for selected maltreatment types
 * @param Array<{String}> maltreatmentTypes
 * @param <String> unit
 */
const getMaltreatmentLabel = (maltreatmentTypes, unit) => {
  if (unit === 'percent') {
    return 'Percent';
  }
  if (unit === 'rate_per_100k_under17') {
    return maltreatmentTypes.length > 1
      ? 'Aggregated rate per 100K children'
      : 'Rate per 100K children';
  }
  return maltreatmentTypes.length > 1 ? 'Aggregated Count' : 'Count';
};

/** Get display label for selected observed feature
 *
 * @param selectedObservedFeatureCode:str code of feature
 * @returns label
 */
const getObservedFeaturesLabel = (selectedObservedFeatureCode, data) => {
  return data.display.variables.find(
    f => selectedObservedFeatureCode === f.NAME
  ).DISPLAY_TEXT;
};

/** Get display label for map
 *
 * @returns string
 */
const getMapLegendLabel = (
  mapType,
  maltreatmentTypes,
  observedFeature,
  unit,
  data
) => {
  if (mapType === 'maltreatment') {
    return getMaltreatmentLabel(maltreatmentTypes, unit);
  } else if ( mapType === 'observedFeatures') {
    // For demographics (i.e. observed feature)
    const suffix = unit === `percent` ? ' (Percentages)' : ' (Totals)';
    return getObservedFeaturesLabel(observedFeature, data) + suffix;
  } else {
    return "Risk Category";
  }
};


/**
 * Get analytics risk label
 * @param {Object} data
 * @param {Number} geoid
 * @returns {String} risk label (null if no value exists)
 */
const getAnalyticsRiskLabel = (
  data,
  geoid
) => {
  const hasRiskLabel = geoid in data.analytics;
  const riskLabel = hasRiskLabel ? data.analytics[geoid].risk_label : null;
  return riskLabel;
};

export {
  capitalizeString,
  compareSimplifiedValueType,
  getMetaData,
  getObservedFeatureValue,
  getMaltreatmentAggregatedValue,
  getSelectedGeographyName,
  getCountyName,
  getMaltreatmentTypeNames,
  getMaltreatmentLabel,
  getObservedFeaturesLabel,
  getMapLegendLabel,
  getAnalyticsRiskLabel
};
