import React, { useEffect, useState } from 'react';
import { Route, Switch, Redirect, useLocation, useRouteMatch } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { SectionMessage, LoadingSpinner } from '_common';
import DisplaySelectors from './DisplaySelectors';
import MainMap from '../maps/MainMap';
import MainChart from '../charts/MainChart';
import './DashboardDisplay.css';
import styles from  './DashboardDisplay.module.scss';

function DashboardDisplay() {
  // Map type and selected types (i.e. geography, year etc)
  // TODO: control of this state (county, year, feature etc) should be moved to redux/sagas (https://jira.tacc.utexas.edu/browse/COOKS-55)
  const [mapType, setMapType] = useState('maltreatment');
  const [geography, setGeography] = useState('county');
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
    'SXTR'
  ];
  const [maltreatmentTypes, setMaltreatmentTypes] = useState(
    PRESELECTED_MALTREATMENT_CATEGORIES
  );
  const [observedFeature, setObservedFeature] = useState('CROWD');
  const [year, setYear] = useState('2019');
  const [selectedGeographicFeature, setSelectedGeographicFeature] = useState(
    ''
  );
  const [unit, setUnit] = useState('count');
  const dispatch = useDispatch();
  const { loading, error, data } = useSelector(state => state.protx);
  const protxRoute = '/protx/dash';

  // Get systems and any other initial data we need from the backend.
  useEffect(() => {
    dispatch({ type: 'FETCH_PROTX' });
  }, []);

  // Get systems and any other initial data we need from the backend.
  useEffect(() => {
    if (mapType === 'maltreatment') {
      // maltreatment only has county data.
      setGeography('county');
      setUnit('percent');
    } else {
      // observedFeatures (i.e. Demographic Features) and analytics
      setYear('2019'); // observedFeatures (i.e. Demographic Features) only has 2019 data.
      setGeography('county');
      setUnit('count');
    }
  }, [mapType]);

  if (error) {
    return (
      <div className={styles.error}>
        <SectionMessage type="warn">
          There was a problem loading the map data.
        </SectionMessage>
      </div>
    );
  }

  if (loading) {
    return (
      <div className={styles.root}>
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className={styles.root}>
      <Switch>
        <Route
          path={`${protxRoute}/maltreatment`}
          render={() => {
            setMapType('maltreatment');
            return (
              <>
                <DisplaySelectors
                  mapType={mapType}
                  geography={geography}
                  maltreatmentTypes={maltreatmentTypes}
                  observedFeature={observedFeature}
                  year={year}
                  unit={unit}
                  setMaltreatmentTypes={setMaltreatmentTypes}
                  setObservedFeature={setObservedFeature}
                  setYear={setYear}
                  setUnit={setUnit}
                />
                <div className="display-layout-root">
                  <div className="display-layout-map">
                    <MainMap
                      mapType={mapType}
                      geography={geography}
                      maltreatmentTypes={maltreatmentTypes}
                      observedFeature={observedFeature}
                      year={year}
                      unit={unit}
                      data={data}
                      selectedGeographicFeature={selectedGeographicFeature}
                      setSelectedGeographicFeature={
                        setSelectedGeographicFeature
                      }
                    />
                  </div>
                  <div className="display-layout-chart">
                    <MainChart
                      chartType="maltreatment"
                      geography={geography}
                      maltreatmentTypes={maltreatmentTypes}
                      observedFeature={observedFeature}
                      year={year}
                      selectedGeographicFeature={selectedGeographicFeature}
                      data={data}
                      unit={unit}
                      showInstructions
                    />
                  </div>
                </div>
              </>
            );
          }}
        />
        <Route
          path={`${protxRoute}/demographics`}
          render={() => {
            setMapType('observedFeatures');
            return (
              <>
                <DisplaySelectors
                  mapType={mapType}
                  geography={geography}
                  maltreatmentTypes={maltreatmentTypes}
                  observedFeature={observedFeature}
                  year={year}
                  unit={unit}
                  setMaltreatmentTypes={setMaltreatmentTypes}
                  setObservedFeature={setObservedFeature}
                  setUnit={setUnit}
                />
                <div className="display-layout-root">
                  <div className="display-layout-map">
                    <MainMap
                      mapType={mapType}
                      geography={geography}
                      maltreatmentTypes={maltreatmentTypes}
                      observedFeature={observedFeature}
                      year={year}
                      unit={unit}
                      data={data}
                      selectedGeographicFeature={selectedGeographicFeature}
                      setSelectedGeographicFeature={
                        setSelectedGeographicFeature
                      }
                    />
                  </div>
                  <div className="display-layout-chart">
                    <MainChart
                      chartType="demographics"
                      mapType={mapType}
                      geography={geography}
                      observedFeature={observedFeature}
                      year="2019"
                      selectedGeographicFeature={selectedGeographicFeature}
                      data={data}
                      unit={unit}
                      showInstructions
                    />
                  </div>
                </div>
              </>
            );
          }}
        />
        <Route
          path={`${protxRoute}/analytics`}
          render={() => {
            setMapType('observedFeatures');
            return (
              <>
                <DisplaySelectors
                  mapType={mapType}
                  geography={geography}
                  maltreatmentTypes={maltreatmentTypes}
                  observedFeature={observedFeature}
                  year={year}
                  unit={unit}
                  setMaltreatmentTypes={setMaltreatmentTypes}
                  setObservedFeature={setObservedFeature}
                  setYear={setYear}
                />
                <div className="display-layout-root">
                  <div className="display-layout-map">
                    <MainMap
                      mapType={mapType}
                      geography={geography}
                      maltreatmentTypes={maltreatmentTypes}
                      observedFeature={observedFeature}
                      year={year}
                      unit={unit}
                      data={data}
                      selectedGeographicFeature={selectedGeographicFeature}
                      setSelectedGeographicFeature={
                        setSelectedGeographicFeature
                      }
                    />
                  </div>
                  <div className="display-layout-chart">
                    <MainChart
                      chartType="analytics"
                      geography={geography}
                      maltreatmentTypes={maltreatmentTypes}
                      observedFeature={observedFeature}
                      year={year}
                      selectedGeographicFeature={selectedGeographicFeature}
                      data={data}
                      unit={unit}
                      showInstructions
                    />
                  </div>
                </div>
              </>
            );
          }}
        />
        <Redirect from={protxRoute} to={`${protxRoute}/analytics`} />
      </Switch>
    </div>
  );
}

export default DashboardDisplay;
