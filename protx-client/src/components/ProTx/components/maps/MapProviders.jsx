import L from 'leaflet';

export default function Maptiles() {
  const providers = [];
  const layers = {};

  // eslint-disable-next-line no-unused-vars
  const tiles_CartoDBPositron = L.tileLayer(
    'https://abcd.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
    {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
      minZoom: 0,
      maxZoom: 20,
      name: 'CartoDB Positron',
      type: 'png',
    }
  );

  // eslint-disable-next-line no-unused-vars
  const tiles_StadiaAlidadeSmooth = L.tileLayer(
    'https://tiles.stadiamaps.com/tiles/alidade_smooth/{z}/{x}/{y}{r}.{ext}',
    {
      attribution:
        '&copy; <a href="https://www.stadiamaps.com/" target="_blank">Stadia Maps</a> &copy; <a href="https://openmaptiles.org/" target="_blank">OpenMapTiles</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      minZoom: 0,
      maxZoom: 20,
      name: 'Stadia - Alidade Smooth',
      type: 'png',
    }
  );

  // eslint-disable-next-line no-unused-vars
  const tiles_StadiaStamenTonerLite = L.tileLayer(
    'https://tiles.stadiamaps.com/tiles/stamen_toner_lite/{z}/{x}/{y}{r}.{ext}',
    {
      attribution:
        '&copy; <a href="https://www.stadiamaps.com/" target="_blank">Stadia Maps</a> &copy; <a href="https://www.stamen.com/" target="_blank">Stamen Design</a> &copy; <a href="https://openmaptiles.org/" target="_blank">OpenMapTiles</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      minZoom: 0,
      maxZoom: 20,
      name: 'Stadia - Stamen Toner Lite',
      type: 'png',
    }
  );

  // eslint-disable-next-line no-unused-vars
  const tiles_OsmMapnik = L.tileLayer(
    'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
    {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      minZoom: 0,
      maxZoom: 19,
      name: 'Open Street Maps - Mapnik',
      type: 'png',
    }
  );

  providers.push(tiles_CartoDBPositron);
  providers.push(tiles_StadiaAlidadeSmooth);
  providers.push(tiles_StadiaStamenTonerLite);
  providers.push(tiles_OsmMapnik);

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
