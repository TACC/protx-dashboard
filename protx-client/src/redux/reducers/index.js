import { combineReducers } from 'redux';
import {
  protx,
  protxDemographicsDistribution,
  protxMaltreatmentDistribution
} from './protx.reducers';

export default combineReducers({
  protx,
  protxDemographicsDistribution,
  protxMaltreatmentDistribution
});
