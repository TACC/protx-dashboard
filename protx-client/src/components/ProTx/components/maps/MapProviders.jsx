import L from 'leaflet';

export default function Maptiles() {
  const providers = [];
  const layers = {};

  // Provider: Open Street Maps
  // No key required.

  // eslint-disable-next-line no-unused-vars
  const basemapOsmDefault = L.tileLayer(
    'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    {
      attribution:
        'Map data: &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      minZoom: 0,
      maxZoom: 17,
      name: 'OSM - Default',
      type: 'png',
    }
  );

  // eslint-disable-next-line no-unused-vars
  const basemapOsmBw = L.tileLayer(
    'https://{s}.tiles.wmflabs.org/bw-mapnik/{z}/{x}/{y}.png',
    {
      attribution:
        '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      minZoom: 0,
      maxZoom: 18,
      name: 'OSM - Mapnik B&W',
      type: 'png',
    }
  );

  // eslint-disable-next-line no-unused-vars
  const basemapOsmTopo = L.tileLayer(
    'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
    {
      attribution:
        'Map data: &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)',
      minZoom: 0,
      maxZoom: 17,
      name: 'OSM - OpenTopo',
      type: 'png',
    }
  );

  // eslint-disable-next-line no-unused-vars
  const basemapOsmMapnik = L.tileLayer(
    'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      minZoom: 0,
      maxZoom: 19,
      name: 'OSM - Mapnik',
      type: 'png',
    }
  );

  // OpenStreetMaps Maptiles.
  providers.push(basemapOsmDefault);
  providers.push(basemapOsmBw);
  providers.push(basemapOsmTopo);
  providers.push(basemapOsmMapnik);

  Object.keys(providers).forEach((k) => {
    const layer = providers[k];
    const layerName = providers[k].options.name;
    layers[layerName] = layer;
  });

  return {
    providers,
    layers,
  };
}
