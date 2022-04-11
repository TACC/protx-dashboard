import { all, call, put, takeLeading } from 'redux-saga/effects';
import { fetchUtil } from '../../utils/fetchUtil';

// REDUCERS.

export function* fetchProtx(action) {
  yield put({ type: 'PROTX_INIT' });
  try {
    const {
      maltreatment,
      demographics,
      texasBoundary,
      display,
      resources
    } = yield all({
      maltreatment: call(fetchUtil, {
        url: `/protx/api/maltreatment`
      }),
      demographics: call(fetchUtil, {
        url: `/protx/api/demographics`
      }),
      texasBoundary: call(fetchUtil, {
        url: `/data-static/Texas_State_Boundary.geojson`
      }),
      display: call(fetchUtil, {
        url: `/protx/api/display`
      }),
      resources: call(fetchUtil, {
        url: `/protx/api/resources`
      })
    });
    yield put({
      type: 'PROTX_SUCCESS',
      payload: {
        observedFeatures: demographics.data,
        observedFeaturesMeta: demographics.meta,
        maltreatment: maltreatment.data,
        maltreatmentMeta: maltreatment.meta,
        texasBoundary,
        display,
        resources: resources.resources,
        resourcesMeta: resources.display
      }
    });
  } catch (error) {
    yield put({
      type: 'PROTX_FAILURE'
    });
  }
}

export function* fetchProtxDemographicsDistribution(action) {
  yield put({ type: 'PROTX_DEMOGRAPHICS_DISTRIBUTION_INIT' });
  try {
    const data = yield call(fetchUtil, {
      url: `/api/protx/demographics-plot-distribution/${action.payload.area}/${action.payload.selectedArea}/${action.payload.variable}/${action.payload.unit}/`
    });
    yield put({
      type: 'PROTX_DEMOGRAPHICS_DISTRIBUTION_SUCCESS',
      payload: {
        data: data.result
      }
    });
  } catch (error) {
    yield put({
      type: 'PROTX_DEMOGRAPHICS_DISTRIBUTION_FAILURE'
    });
  }
}

export function* fetchProtxMaltreatmentDistribution(action) {
  yield put({ type: 'PROTX_MALTREATMENT_DISTRIBUTION_INIT' });
  try {
    const data = yield call(fetchUtil, {
      url: `/api/protx/maltreatment-plot-distribution/`,
      headers: {
        'Content-Type': 'application/json'
      },
      method: 'PATCH',
      body: JSON.stringify({
        area: action.payload.area,
        selectedArea: action.payload.selectedArea,
        geoid: action.payload.geoid,
        variables: action.payload.variables,
        unit: action.payload.unit
      })
    });
    yield put({
      type: 'PROTX_MALTREATMENT_DISTRIBUTION_SUCCESS',
      payload: {
        data: data.result
      }
    });
  } catch (error) {
    yield put({
      type: 'PROTX_MALTREATMENT_DISTRIBUTION_FAILURE'
    });
  }
}

export function* watchProtx() {
  yield takeLeading('FETCH_PROTX', fetchProtx);
}

export function* watchProtxDemographicsDistribution() {
  yield takeLeading(
    'FETCH_PROTX_DEMOGRAPHICS_DISTRIBUTION',
    fetchProtxDemographicsDistribution
  );
}

export function* watchProtxMaltreatmentDistribution() {
  yield takeLeading(
    'FETCH_PROTX_MALTREATMENT_DISTRIBUTION',
    fetchProtxMaltreatmentDistribution
  );
}
