import { all } from 'redux-saga/effects';

import {
  watchProtx,
  watchProtxDemographicsDistribution,
  watchProtxMaltreatmentDistribution,
  watchProtxMaltreatmentAgeDistribution,
  watchProtxAnalytics,
  watchProtxAnalyticsStatewideDistribution,
} from './protx.sagas';

export default function* rootSaga() {
  yield all([
    watchProtx(),
    watchProtxDemographicsDistribution(),
    watchProtxMaltreatmentDistribution(),
    watchProtxMaltreatmentAgeDistribution(),
    watchProtxAnalytics(),
    watchProtxAnalyticsStatewideDistribution(),
  ]);
}
