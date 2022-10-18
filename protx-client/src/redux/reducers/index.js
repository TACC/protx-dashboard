import { combineReducers } from 'redux';
import {
  protx,
  protxDemographicsDistribution,
  protxMaltreatmentDistribution,
  protxAnalytics,
  protxAnalyticsStateDistribution,
} from './protx.reducers';

export default combineReducers({
  protx,
  protxDemographicsDistribution,
  protxMaltreatmentDistribution,
  protxAnalytics,
  protxAnalyticsStateDistribution,
});
