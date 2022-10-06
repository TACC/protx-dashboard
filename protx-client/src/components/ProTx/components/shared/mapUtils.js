import {
  getObservedFeatureValue,
  getMaltreatmentAggregatedValue
} from './dataUtils';

/**
 * Get style for feature
 *
 * If no value exists, then we return a transparent feature style.  Same if no color scale as
 * that implies no data
 *
 * @param {String} mapType
 * @param {Object} data
 * @param {Object} colorScale
 * @param {String} geography
 * @param {Number} year
 * @param {Number} geoid
 * @param {String} observedFeature
 * @param Array<{String}> maltreatmentTypes
 * @returns {fillColor: string, fillOpacity: number, fill: boolean, stroke: boolean} style
 */
const getFeatureStyle = (
  mapType,
  data,
  colorScale,
  geography,
  year,
  geoid,
  observedFeature,
  maltreatmentTypes,
  unit
) => {
  const stroke = geography == 'dfps_region' ? true : false;
  const color = 'black';
  const weight = 1;
  let fillColor;
  if (mapType === 'observedFeatures') {
    const featureValue = getObservedFeatureValue(
      data,
      geography,
      year,
      geoid,
      observedFeature,
      unit
    );
    if (featureValue && colorScale) {
      fillColor = colorScale.getColor(featureValue);
    }
  } else {
    const featureValue = getMaltreatmentAggregatedValue(
      data,
      geography,
      year,
      unit,
      geoid,
      maltreatmentTypes
    );
    if (featureValue !== 0 && colorScale) {
      fillColor = colorScale.getColor(featureValue);
    }
  }
  if (fillColor) {
    return {
      color,
      fillColor,
      fill: true,
      fillOpacity: 0.5,
      stroke,
      weight
    };
  }
  // if no color/data, we return a transparent style in order to allow for feature selection.
  return {
    color,
    fill: true,
    fillColor: 'black',
    fillOpacity: 0.0,
    stroke,
    weight
  };
};

export default getFeatureStyle;
