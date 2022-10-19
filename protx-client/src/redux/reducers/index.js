import { combineReducers } from 'redux';
import {
  protx,
  protxDemographicsDistribution,
  protxMaltreatmentDistribution,
  protxAnalytics
} from './protx.reducers';

export default combineReducers({
  protx,
  protxDemographicsDistribution,
  protxMaltreatmentDistribution,
  protxAnalytics
});
