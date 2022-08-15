export const SUPPORTED_YEARS = [
  '2020',
  '2019',
  '2018',
  '2017',
  '2016',
  '2015',
  '2014',
  '2013',
  '2012',
  '2011'
];

export const OBSERVED_FEATURES_TOP_FIELDS = [
  'SNGPNT',
  'POV',
  'PCI',
  'AGE17',
  'NOHSDP',
  'GROUPQ',
  'CROWD'
];

// TOOO: we should correct vector files to all be the same thing (GEOID)
export const GEOID_KEY = {
  cbsa: 'GEOID_left',
  tract: 'GEOID',
  county: 'GEO_ID',
  dfps_region: 'Sheet1__Re',
  urban_area: 'GEOID10',
  zcta: 'GEOID10'
};

/**
 * Define array of category codes.
 */
export const CATEGORY_CODES = [
  'ABAN',
  'EMAB',
  'LBTR',
  'MDNG',
  'NSUP',
  'PHAB',
  'PHNG',
  'RAPR',
  'SXAB',
  'SXTR',
  'NA'
];
