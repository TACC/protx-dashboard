import { combineReducers } from 'redux';
import {
  protx,
  protxDemographicsDistribution,
  protxMaltreatmentDistribution,
  protxAnalytics,
  protxAnalyticsStatewideDistribution,
} from './protx.reducers';
import { protxSelection } from './configuration';

export default combineReducers({
  protx,
  protxSelection,
  protxDemographicsDistribution,
  protxMaltreatmentDistribution,
  protxAnalytics,
  protxAnalyticsStatewideDistribution,
});
