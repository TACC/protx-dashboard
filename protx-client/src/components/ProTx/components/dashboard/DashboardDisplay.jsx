import React, { useEffect, useState } from 'react';
import { stringify } from 'query-string';
import { useDispatch, useSelector } from 'react-redux';
import { SectionMessage, LoadingSpinner } from '_common';
import DisplaySelectors from './DisplaySelectors';
import MainMap from '../maps/MainMap';
import MainChart from '../charts/MainChart';
import './DashboardDisplay.css';
import styles from './DashboardDisplay.module.scss';

function DashboardDisplay() {
  const [map, setMap] = useState(null);
  const [resourceLayers, setResourceLayers] = useState(null);

  const dispatch = useDispatch();
  const { loading, error, data } = useSelector((state) => state.protx);
  const selection = useSelector((state) => state.protxSelection);

  const setSelectedGeographicFeature = (geoid) => {
    dispatch({
      type: 'PROTX_CONFIG/SET_SELECTED_GEOGRAPHIC_FEATURE',
      payload: geoid,
    });
  };

  // Get data we need from the backend.
  useEffect(() => {
    dispatch({ type: 'FETCH_PROTX' });
  }, []);

  const handleDownloadResources = () => {
    if (map && resourceLayers) {
      const selectedResourcesNaicsCode = resourceLayers
        .filter((r) => {
          return map.hasLayer(r.layer);
        })
        .map((r) => r.naicsCode);
      const typeQuery = stringify({
        naicsCode: selectedResourcesNaicsCode,
      });

      let downloadResourceHref = `/protx/api/download/${selection.geography}/${selection.selectedGeographicFeature}/`;
      if (typeQuery) {
        downloadResourceHref += `?${typeQuery}`;
      }
      window.open(downloadResourceHref);
    }
  };

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
      <div className={styles.loading}>
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className={styles.root}>
      <DisplaySelectors downloadResources={handleDownloadResources} />
      <div className="display-layout-root">
        <div className="display-layout-map">
          <MainMap
            data={data}
            setSelectedGeographicFeature={setSelectedGeographicFeature}
            map={map}
            setMap={setMap}
            resourceLayers={resourceLayers}
            setResourceLayers={setResourceLayers}
          />
        </div>
        <div className="display-layout-chart">
          <MainChart data={data} showInstructions />
        </div>
      </div>
    </div>
  );
}

export default DashboardDisplay;
