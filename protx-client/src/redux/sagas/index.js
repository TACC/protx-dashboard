import { all } from 'redux-saga/effects';

import {
  watchProtx,
  watchProtxDemographicsDistribution,
  watchProtxMaltreatmentDistribution,
  watchProtxAnalytics,
  watchProtxAnalyticsStateDistribution,
} from './protx.sagas';

export default function* rootSaga() {
  yield all([
    watchProtx(),
    watchProtxDemographicsDistribution(),
    watchProtxMaltreatmentDistribution(),
    watchProtxAnalytics(),
    watchProtxAnalyticsStateDistribution(),
  ]);
}
