import React, { useEffect, useState } from 'react';
import { stringify } from 'query-string';
import { Route, Switch, Redirect } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { SectionMessage, LoadingSpinner } from '_common';
import DisplaySelectors from './DisplaySelectors';
import MainMap from '../maps/MainMap';
import MainChart from '../charts/MainChart';
import './DashboardDisplay.css';
import './DashboardDisplay.module.scss';

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
  const DEFAULT_YEAR = '2020';
  const [maltreatmentTypes, setMaltreatmentTypes] = useState(
    PRESELECTED_MALTREATMENT_CATEGORIES
  );
  const [observedFeature, setObservedFeature] = useState('AGE17');
  const [year, setYear] = useState(DEFAULT_YEAR);
  const [selectedGeographicFeature, setSelectedGeographicFeature] = useState(
    ''
  );
  const [unit, setUnit] = useState('count');
  const [map, setMap] = useState(null);
  const [resourceLayers, setResourceLayers] = useState(null);

  const dispatch = useDispatch();
  const { loading, error, data } = useSelector(state => state.protx);
  const protxRoute = '/protx';

  // Get systems and any other initial data we need from the backend.
  useEffect(() => {
    dispatch({ type: 'FETCH_PROTX' });
  }, []);

  // Get systems and any other initial data we need from the backend.
  useEffect(() => {
    if (mapType === 'maltreatment') {
      // maltreatment only has county data.
      setGeography('county');
      setUnit('rate_per_100k_under17');
    } else {
      setYear(DEFAULT_YEAR);
      setGeography('county');
      setUnit('percent');
    }
  }, [mapType]);

  const handleDownloadResources = () => {
    if (map && resourceLayers) {
      const selectedResourcesNaicsCode = resourceLayers
        .filter(r => {
          return map.hasLayer(r.layer);
        })
        .map(r => r.naicsCode);
      const typeQuery = stringify({
        naicsCode: selectedResourcesNaicsCode
      });

      const downloadResourceHref = `/api/protx/download/${geography}/${selectedGeographicFeature}?${typeQuery}`;
      window.open(downloadResourceHref);
    }
  };

  if (error) {
    return (
      <div styleName="error">
        <SectionMessage type="warn">
          There was a problem loading the map data.
        </SectionMessage>
      </div>
    );
  }

  if (loading) {
    return (
      <div styleName="root">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div styleName="root">
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
                  selectedGeographicFeature={selectedGeographicFeature}
                  setMaltreatmentTypes={setMaltreatmentTypes}
                  setObservedFeature={setObservedFeature}
                  setYear={setYear}
                  setUnit={setUnit}
                  downloadResources={handleDownloadResources}
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
                      map={map}
                      setMap={setMap}
                      resourceLayers={resourceLayers}
                      setResourceLayers={setResourceLayers}
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
                  selectedGeographicFeature={selectedGeographicFeature}
                  setMaltreatmentTypes={setMaltreatmentTypes}
                  setObservedFeature={setObservedFeature}
                  setUnit={setUnit}
                  downloadResources={handleDownloadResources}
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
                      map={map}
                      setMap={setMap}
                      resourceLayers={resourceLayers}
                      setResourceLayers={setResourceLayers}
                    />
                  </div>
                  <div className="display-layout-chart">
                    <MainChart
                      chartType="demographics"
                      mapType={mapType}
                      geography={geography}
                      observedFeature={observedFeature}
                      year={DEFAULT_YEAR}
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
                  selectedGeographicFeature={selectedGeographicFeature}
                  setMaltreatmentTypes={setMaltreatmentTypes}
                  setObservedFeature={setObservedFeature}
                  setYear={setYear}
                  downloadResources={handleDownloadResources}
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
                      map={map}
                      setMap={setMap}
                      resourceLayers={resourceLayers}
                      setResourceLayers={setResourceLayers}
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
