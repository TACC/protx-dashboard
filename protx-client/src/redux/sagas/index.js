import { all } from 'redux-saga/effects';

import {
  watchProtx,
  watchProtxDemographicsDistribution,
  watchProtxMaltreatmentDistribution,
  watchProtxAnalytics,
  watchProtxAnalyticsStatewideDistribution,
} from './protx.sagas';

export default function* rootSaga() {
  yield all([
    watchProtx(),
    watchProtxDemographicsDistribution(),
    watchProtxMaltreatmentDistribution(),
    watchProtxAnalytics(),
    watchProtxAnalyticsStatewideDistribution(),
  ]);
}
