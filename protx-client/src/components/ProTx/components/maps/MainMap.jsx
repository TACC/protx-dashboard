import React, { useEffect, useState, useRef } from 'react';

import $ from 'jquery';
import L from 'leaflet';
import 'leaflet.vectorgrid';
import 'leaflet.markercluster';
import 'leaflet-easybutton';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
import MapProviders from './MapProviders';
import { GEOID_KEY } from '../data/meta';
import './MainMap.css';
import styles from './MainMap.module.scss';
import 'leaflet/dist/leaflet.css';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';

import { getMetaData, getMapLegendLabel } from '../shared/dataUtils';
import getFeatureStyle from '../shared/mapUtils';
import { IntervalColorScale, CategoryColorScale } from '../shared/colorsUtils';

let mapContainer;

const RESOURCE_ZOOM_LEVEL = 8; // resources will be displayed at this zoom level or higher

const DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
});

L.Marker.prototype.options.icon = DefaultIcon;

function MainMap({
  data,
  map,
  setMap,
  resourceLayers,
  setResourceLayers,
  setSelectedGeographicFeature,
}) {
  const dataServer = window.location.origin;
  const selection = useSelector((state) => state.protxSelection);
  const resources = useSelector((state) => state.protx.data.resources);

  // Leaflet related layers, controls, and map
  const [legendControl, setLegendControl] = useState(null);
  const [layersControl, setLayersControl] = useState(null);
  const [texasOutlineLayer, setTexasOutlineLayer] = useState(null);
  const [selectedGeoid, setSelectedGeoid] = useState(null);
  const [zoomLevel, setZoomLevel] = useState(6);

  const refSelectedGeoid = useRef(selectedGeoid); // Make a ref of the selected feature
  const refResourceLayers = useRef(resourceLayers); // Make a ref of the resources layers
  const refZoomLevel = useRef(zoomLevel); // Make a ref of the resources layers
  const refDataLayer = useRef(null); // Make a ref of the data layer

  function updateSelectedGeographicFeature(newSelectedFeature) {
    refSelectedGeoid.current = newSelectedFeature;
    setSelectedGeoid(newSelectedFeature);
    setSelectedGeographicFeature(newSelectedFeature);
  }

  function updateResourceLayers(newResourceLayers) {
    refResourceLayers.current = newResourceLayers;
    setResourceLayers(newResourceLayers);
  }

  function updateZoomLevel(newZoomLevel) {
    refZoomLevel.current = newZoomLevel;
    setZoomLevel(newZoomLevel);
  }

  /** Handle changes in zoom and show resources when zoomed into map
   */
  const handleZoom = (newZoomLevel, currentMap, currentLayerControl) => {
    const previousZoomLevel = refZoomLevel.current;
    const zoomTransitionOccurred =
      (newZoomLevel < RESOURCE_ZOOM_LEVEL &&
        previousZoomLevel >= RESOURCE_ZOOM_LEVEL) ||
      (newZoomLevel >= RESOURCE_ZOOM_LEVEL &&
        previousZoomLevel < RESOURCE_ZOOM_LEVEL);
    if (zoomTransitionOccurred) {
      if (newZoomLevel >= RESOURCE_ZOOM_LEVEL) {
        currentLayerControl.expand();
        refResourceLayers.current.forEach((resourceLayer) => {
          if (
            resourceLayer.label === 'Child & Youth Services' ||
            resourceLayer.label === 'DFPS Locations'
          ) {
            currentMap.addLayer(resourceLayer.layer);
          }
        });
      } else {
        currentLayerControl.collapse();
        refResourceLayers.current.forEach((resourceLayer) => {
          currentMap.removeLayer(resourceLayer.layer);
        });
        // unselect geographic feature
        if (refSelectedGeoid.current) {
          // deselecting here as well as in click handler; deselecting here
          // is covering the scenario when we are zooming out
          /// https://jira.tacc.utexas.edu/browse/COOKS-181
          refDataLayer.current.resetFeatureStyle(refSelectedGeoid.current);
        }
        updateSelectedGeographicFeature('');
      }
    }
    updateZoomLevel(newZoomLevel);
  };

  useEffect(() => {
    if (map) {
      return;
    }

    const texasOutlineGeojson = L.geoJSON(data.texasBoundary);
    const texasBounds = texasOutlineGeojson.getBounds(texasOutlineGeojson);

    const newMap = L.map(mapContainer, {
      keyboard: false,
      zoom: zoomLevel,
      minZoom: 6,
      maxZoom: 16,
      maxBounds: texasBounds,
      maxBoundsViscosity: 1.0,
      doubleClickZoom: false,
    }).fitBounds(texasBounds);

    L.easyButton('icon icon-globe', (btn, currentMap) => {
      currentMap.fitBounds(texasBounds);
    }).addTo(newMap);

    const texasOutline = L.vectorGrid
      .slicer(data.texasBoundary, {
        rendererFactory: L.canvas.tile,
        vectorTileLayerStyles: {
          sliced(properties, zoom) {
            return {
              stroke: true,
              color: 'black',
              weight: 2,
            };
          },
        },
      })
      .addTo(newMap);

    // Create Layers Control.
    const { providers } = MapProviders();
    providers[1].addTo(newMap);
    const layerControl = L.control.layers().addTo(newMap);
    setLayersControl(layerControl);
    setMap(newMap);
    setTexasOutlineLayer(texasOutline);

    setTimeout(() => {
      $('.leaflet-top.leaflet-right')
        .children()
        .prepend('<div class="resources-layers--title">Resources</div>');
    }, 0);
  }, [data, mapContainer]);

  useEffect(() => {
    if (map && layersControl && refDataLayer.current) {
      map.on('zoomend', () => {
        const currentZoom = map.getZoom();
        handleZoom(currentZoom, map, layersControl);
      });
    }
  }, [map, layersControl, refDataLayer.current]);

  useEffect(() => {
    if (map && layersControl) {
      // remove old legend
      if (legendControl) {
        legendControl.remove();
      }

      let newColorScale;

      if (selection.type === 'analytics') {
        const categories = [
          { key: 'low', label: 'Low' },
          { key: 'medium ', label: 'Medium' }, // 'medium ' with space; check DB
          { key: 'high', label: 'High' },
        ];
        newColorScale = new CategoryColorScale(categories);
      } else {
        const meta = getMetaData(
          data,
          selection.type,
          selection.geography,
          selection.year,
          selection.observedFeature,
          selection.maltreatmentTypes,
          selection.unit
        );
        newColorScale = meta ? new IntervalColorScale(meta) : null;
      }

      if (newColorScale) {
        const label = getMapLegendLabel(
          selection.type,
          selection.maltreatmentTypes,
          selection.observedFeature,
          selection.unit,
          data
        );

        const newLegend = L.control({ position: 'bottomright' });

        newLegend.onAdd = () => {
          const div = L.DomUtil.create('div', 'color legend');
          div.innerHTML += `<div class="legend-title">${label}</div>`;
          // get numeric values between intervals
          // loop through our density intervals and generate a label with a colored square for each interval
          for (let i = 0; i < newColorScale.numberIntervals; i += 1) {
            div.innerHTML += `<div class="scale-value"><i style="background:${newColorScale.colors[i]}"></i> <span>${newColorScale.intervalLabels[i]}</span></div><br>`;
          }
          return div;
        };
        // add new data layer to map and controls
        newLegend.addTo(map);
        setLegendControl(newLegend);
      }

      const vectorTile = `${dataServer}/data-static/vector/${selection.geography}/2019/{z}/{x}/{y}.pbf`;
      const newDataLayer = L.vectorGrid.protobuf(vectorTile, {
        vectorTileLayerStyles: {
          singleLayer: (properties) => {
            const geoid = properties[GEOID_KEY[selection.geography]];
            return getFeatureStyle(
              selection.type,
              data,
              newColorScale,
              selection.geography,
              selection.year,
              geoid,
              selection.observedFeature,
              selection.maltreatmentTypes,
              selection.unit
            );
          },
        },
        interactive: true,
        getFeatureId(f) {
          return f.properties[GEOID_KEY[selection.geography]];
        },
        maxNativeZoom: 14, // All tiles generated up to 14 zoom level
      });

      if (selection.geography === 'dfps_region') {
        // Add tooltip to show which is which region
        newDataLayer.bindTooltip('', { sticky: true });
        newDataLayer.on('mouseover', function (e) {
          const dfpsRegionGeoid =
            e.layer.properties[GEOID_KEY[selection.geography]];
          newDataLayer.setTooltipContent(
            'DFPS Region ' + dfpsRegionGeoid.replace('-', ' ')
          );
        });
      }

      if (refDataLayer.current && layersControl) {
        // we will remove data layer from map
        refDataLayer.current.remove();
      }

      // Add click handler
      newDataLayer.on('click', (e) => {
        const clickedGeographicFeature =
          e.layer.properties[GEOID_KEY[selection.geography]];

        if (refSelectedGeoid.current) {
          refDataLayer.current.resetFeatureStyle(refSelectedGeoid.current);
        }

        if (clickedGeographicFeature !== refSelectedGeoid.current) {
          updateSelectedGeographicFeature(clickedGeographicFeature);
          const highlightedStyle = {
            ...getFeatureStyle(
              selection.type,
              data,
              newColorScale,
              selection.geography,
              selection.year,
              clickedGeographicFeature,
              selection.observedFeature,
              selection.maltreatmentTypes,
              selection.unit
            ),
            color: 'black',
            weight: 2.0,
            stroke: true,
          };
          newDataLayer.setFeatureStyle(
            clickedGeographicFeature,
            highlightedStyle
          );
          // Simple zoom to point clicked based on what type of region is being clicked
          // (see https://jira.tacc.utexas.edu/browse/COOKS-290 and https://jira.tacc.utexas.edu/browse/COOKS-54)
          if (selection.geography === 'county') {
            map.setView(e.latlng, 9);
          } else if (selection.geography === 'dfps_region') {
            map.setView(e.latlng, 8);
          } else {
            map.setView(e.latlng, 11);
          }
        } else {
          updateSelectedGeographicFeature('');
        }
      });

      // add new data layer to map
      newDataLayer.addTo(map);

      // updated/new layer
      if (selection.selectedGeographicFeature) {
        const highlightedStyle = {
          ...getFeatureStyle(
            selection.type,
            data,
            newColorScale,
            selection.geography,
            selection.year,
            selection.selectedGeographicFeature,
            selection.observedFeature,
            selection.maltreatmentTypes,
            selection.unit
          ),
          color: 'black',
          weight: 2.0,
          stroke: true,
        };
        newDataLayer.setFeatureStyle(
          selection.selectedGeographicFeature,
          highlightedStyle
        );
      }

      refDataLayer.current = newDataLayer;

      // ensure that texas outline is on top
      texasOutlineLayer.bringToFront();
    }
  }, [
    data,
    selection.type,
    selection.observedFeature,
    selection.geography,
    selection.maltreatmentTypes,
    selection.year,
    selection.unit,
    map,
    layersControl,
    texasOutlineLayer,
  ]);

  useEffect(() => {
    // display resources data
    if (map && layersControl && resources) {
      // remove previous layers
      if (refResourceLayers.current) {
        refResourceLayers.current.forEach((resourceLayer) => {
          map.removeLayer(resourceLayer.layer);
          layersControl.removeLayer(resourceLayer.layer);
        });
      }

      const resourcesClusterGroups = {};
      resources.forEach((point) => {
        if (!(point.MAIN_DESCRIPTION in resourcesClusterGroups)) {
          resourcesClusterGroups[point.MAIN_DESCRIPTION] = L.markerClusterGroup(
            {
              showCoverageOnHover: false,
            }
          );
        }

        const marker = L.marker(L.latLng(point.LATITUDE, point.LONGITUDE), {
          title: point.NAME,
        });

        let popupContentAssemblage = `<div class="marker-popup-content">`;
        if (point.NAME !== null) {
          popupContentAssemblage += `<div class="marker-popup-name">${point.NAME}</div>`;
        }
        if (point.HOVER_DESCRIPTION !== null) {
          popupContentAssemblage += `<div class="marker-popup-description">${point.HOVER_DESCRIPTION}</div>`;
        }
        if (point.STREET !== null) {
          popupContentAssemblage += `<div class="marker-popup-street">${point.STREET}</div>`;
        }
        popupContentAssemblage += `<div class="marker-popup-location">`;
        if (point.CITY !== null) {
          popupContentAssemblage += `${point.CITY}, `;
        }
        if (point.STATE !== null) {
          popupContentAssemblage += `${point.STATE}, `;
        }
        if (point.POSTAL_CODE !== null) {
          popupContentAssemblage += `${point.POSTAL_CODE}`;
        }
        popupContentAssemblage += `</div>`;
        if (point.PHONE !== null) {
          popupContentAssemblage += `<div class="marker-popup-phone">${point.PHONE}</div>`;
        }
        if (point.WEBSITE !== null) {
          popupContentAssemblage += `<div class="marker-popup-website"><a href="${point.WEBSITE}" target="_blank">website</a></div>`;
        }
        popupContentAssemblage += `</div>`;

        const popupContent = popupContentAssemblage;
        marker.bindPopup(popupContent);
        resourcesClusterGroups[point.MAIN_DESCRIPTION].addLayers(marker);
      });

      const newResourceLayers = [];
      const currentZoom = map.getZoom();

      Object.keys(resourcesClusterGroups)
        .sort()
        .forEach((mainDescription) => {
          const markersClusterGroup = resourcesClusterGroups[mainDescription];
          layersControl.addOverlay(markersClusterGroup, mainDescription);
          if (currentZoom >= RESOURCE_ZOOM_LEVEL) {
            // we would only want to add to map (i.e. selection is ON) if zoomed in
            map.addLayer(markersClusterGroup);
          }
          newResourceLayers.push({
            mainDescription,
            label: mainDescription,
            layer: markersClusterGroup,
          });
        });
      updateResourceLayers(newResourceLayers);
    }
  }, [layersControl, map, resources]);

  useEffect(() => {
    if (map && selection.selectedGeographicFeature === '') {
      // if selected geographic feature gets unset, we should zoom out
      const texasOutlineGeojson = L.geoJSON(data.texasBoundary);
      const texasBounds = texasOutlineGeojson.getBounds(texasOutlineGeojson);
      map.fitBounds(texasBounds);
    }
  }, [map, data, selection.selectedGeographicFeature]);

  return <div className={styles['map']} ref={(el) => (mapContainer = el)} />;
}

MainMap.propTypes = {
  setSelectedGeographicFeature: PropTypes.func.isRequired,
  // eslint-disable-next-line react/forbid-prop-types
  data: PropTypes.object.isRequired,
  // eslint-disable-next-line react/forbid-prop-types
  map: PropTypes.object,
  setMap: PropTypes.func.isRequired,
  resourceLayers: PropTypes.arrayOf(PropTypes.object),
  setResourceLayers: PropTypes.func.isRequired,
};

MainMap.defaultProps = {
  map: null,
  resourceLayers: null,
};

export default MainMap;
