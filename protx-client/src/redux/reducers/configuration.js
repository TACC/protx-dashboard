const PRESELECTED_MALTREATMENT_CATEGORIES = [
  'ABAN',
  'EMAB',
  'LBTR',
  'MDNG',
  'NSUP',
  'PHAB',
  'PHNG',
  'RAPR',
  'SXAB',
  'SXTR',
];

const DEFAULT_YEAR = '2020';

export const initialState = {
  type: 'maltreatment',
  geography: 'county',
  maltreatmentTypes: PRESELECTED_MALTREATMENT_CATEGORIES,
  observedFeature: 'AGE17',
  year: DEFAULT_YEAR,
  unit: 'rate_per_100k_under17',
  selectedGeographicFeature: '',
};

function transitionToNewType(state, newType, displayData) {
  if (newType === state.type) {
    return state;
  } else {
    switch (newType) {
      case 'maltreatment':
        return {
          ...state,
          type: newType,
          geography: 'county',
          unit: state.unit === 'count' ? 'rate_per_100k_under17' : state.unit, // maltreatment can be 'percent' or 'rate_per_100k_under17'
          selectedGeographicFeature:
            state.geography === 'county' ? state.selectedGeographicFeature : '', // reset if not a selected county
        };
      case 'observedFeatures':
        const updatedUnit =
          state.unit === 'rate_per_100k_under17' ? 'count' : state.unit; // demographics can be 'percent' or 'count'
        return {
          ...state,
          type: newType,
          year: DEFAULT_YEAR, // show only single year of demographics //TODOroute confirm
          unit: updatedUnit,
          observedFeature: getCorrectSelectedObservedFeature(
            state.observedFeature,
            updatedUnit,
            displayData
          ),
        };
      case 'analytics':
        return {
          ...state,
          type: newType,
          year: DEFAULT_YEAR,
          geography: 'county',
          selectedGeographicFeature:
            state.geography === 'county' ? state.selectedGeographicFeature : '', // reset if not a selected county
        };
      default:
        console.error('Switching to unsupported type');
        return state;
    }
  }
}

function getCorrectSelectedObservedFeature(
  currentObservedFeature,
  currentUnit,
  displayData
) {
  // check to see if we also need to switch the variable if it doesn't have a a count or percentage
  // that would be needed.
  const currentFeature = displayData.variables.find(
    (f) => f.NAME === currentObservedFeature
  );
  if (currentUnit === 'percent' && !currentFeature.DISPLAY_DEMOGRAPHIC_RATE) {
    // switch to another variable that has DISPLAY_DEMOGRAPHIC_RATE as true
    return displayData.variables.find((f) => f.DISPLAY_DEMOGRAPHIC_RATE).NAME;
  } else if (
    currentUnit === 'count' &&
    !currentFeature.DISPLAY_DEMOGRAPHIC_COUNT
  ) {
    // switch to another variable that has DISPLAY_DEMOGRAPHIC_COUNT as true
    return displayData.variables.find((f) => f.DISPLAY_DEMOGRAPHIC_COUNT).NAME;
  } else {
    return currentObservedFeature;
  }
}

export function protxSelection(state = initialState, action) {
  switch (action.type) {
    case 'PROTX_CONFIG/SET_TYPE':
      return transitionToNewType(
        state,
        action.payload.type,
        action.payload.displayData
      );
    case 'PROTX_CONFIG/SET_SELECTED_MALTREATMENT_TYPES':
      return {
        ...state,
        maltreatmentTypes: action.payload,
      };
    case 'PROTX_CONFIG/SET_OBSERVED_FEATURE':
      return {
        ...state,
        observedFeature: action.payload,
      };
    case 'PROTX_CONFIG/SET_GEOGRAPHY':
      return {
        ...state,
        geography: action.payload,
        selectedGeographicFeature: '',
      };
    case 'PROTX_CONFIG/SET_YEAR':
      return {
        ...state,
        year: action.payload,
      };
    case 'PROTX_CONFIG/SET_UNIT':
      const newState = {
        ...state,
        unit: action.payload.unit,
      };
      if (state.type === 'observedFeatures') {
        newState.observedFeature = getCorrectSelectedObservedFeature(
          newState.observedFeature,
          newState.unit,
          action.payload.displayData
        );
      }
      return newState;
    case 'PROTX_CONFIG/SET_SELECTED_GEOGRAPHIC_FEATURE':
      return {
        ...state,
        selectedGeographicFeature: action.payload,
      };
    default:
      return state;
  }
}
