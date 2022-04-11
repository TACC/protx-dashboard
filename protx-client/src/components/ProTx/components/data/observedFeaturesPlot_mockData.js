export const OBSERVED_FEATURES_PLOT_BACKEND_DATA_MOCK = {
  fig_aes: {
    yrange: (10107.9, 52605.3),
    xrange: (0, 115.50000000000001),
    geotype: 'county',
    label_units: 'per capita income (1000s of dollars)',
    bar_labels: [
      '10-14',
      '14-19',
      '19-23',
      '23-27',
      '27-31',
      '31-36',
      '36-40',
      '40-44',
      '44-48',
      '48-53'
    ],
    bar_centers: [
      12232.77,
      16482.51,
      20732.25,
      24981.989999999998,
      29231.73,
      33481.47,
      37731.21,
      41980.95,
      46230.69,
      50480.43
    ],
    years: {
      2011: {
        focal_value: 27920.0,
        mean: 22028.86220472441,
        median: 21631.5,
        bars: [13, 46, 100, 62, 18, 11, 3, 1, 0, 0]
      },
      2012: {
        focal_value: 28125.0,
        mean: 22431.716535433072,
        median: 21992.0,
        bars: [9, 40, 100, 69, 21, 12, 2, 1, 0, 0]
      },
      2013: {
        focal_value: 27920.0,
        mean: 22028.86220472441,
        median: 21631.5,
        bars: [13, 46, 100, 62, 18, 11, 3, 1, 0, 0]
      },
      2014: {
        focal_value: 28541.0,
        mean: 23318.91338582677,
        median: 22901.0,
        bars: [6, 27, 93, 82, 30, 10, 5, 0, 1, 0]
      },
      2015: {
        focal_value: 29058.0,
        mean: 23551.799212598424,
        median: 22747.5,
        bars: [5, 26, 100, 73, 34, 10, 5, 0, 1, 0]
      },
      2016: {
        focal_value: 29791.0,
        mean: 24076.55905511811,
        median: 23605.0,
        bars: [4, 23, 80, 88, 40, 10, 7, 2, 0, 0]
      },
      2017: {
        focal_value: 30857.0,
        mean: 24859.01968503937,
        median: 24284.5,
        bars: [6, 18, 65, 98, 41, 15, 10, 1, 0, 0]
      },
      2018: {
        focal_value: 32092.0,
        mean: 25497.251968503937,
        median: 25128.5,
        bars: [5, 20, 46, 105, 48, 19, 8, 3, 0, 0]
      },
      2019: {
        focal_value: 33292.0,
        mean: 26280.503937007874,
        median: 25928.5,
        bars: [3, 17, 42, 90, 65, 23, 7, 5, 2, 0]
      }
    }
  }
};

/**
 * REFERENCE DATA OBJECT FOR DEMOGRAPHICS PLOT
 *
 * In the initial version of the demographics plot,
 * the component will have access to these values for rendering:
 *
 * == From Current Props:
 *   - const myCountyId = 1234;
 *   - const displayText = : 'Tarrant County'};
 *
 * == From New Prop:
 *   - const ThisIsComingfromBackend={'fig_aes':{...}};
 *
 * The plot will replicate the code from the Jupyter notebook for the timeseries_histogram() method en masse for the first version.
 *
 * After the initial prototyping is deployed, the following methods need to be refactored across the dataUtils & plotUtils for more responsive use in the plot component:
 *   - timeseries_histogram()      ** plotUtils monolith.
 *   - demographic_data_prep()     ** dataUtils monolith.
 **/

export const DOLLARS_HIST_DATA = {
  fig_aes: {
    yrange: (10107.9, 52605.3),
    xrange: (0, 115.50000000000001),
    geotype: 'county',
    label_units: 'per capita income (1000s of dollars)',
    bar_labels: [
      '10-14',
      '14-19',
      '19-23',
      '23-27',
      '27-31',
      '31-36',
      '36-40',
      '40-44',
      '44-48',
      '48-53'
    ],
    bar_centers: [
      12232.77,
      16482.51,
      20732.25,
      24981.989999999998,
      29231.73,
      33481.47,
      37731.21,
      41980.95,
      46230.69,
      50480.43
    ],
    focal_display: 'None'
  },
  years: {
    2011: {
      focal_value: 'None',
      mean: 22028.86220472441,
      median: 21631.5,
      bars: [13, 46, 100, 62, 18, 11, 3, 1, 0, 0]
    },
    2012: {
      focal_value: 'None',
      mean: 22431.716535433072,
      median: 21992.0,
      bars: [9, 40, 100, 69, 21, 12, 2, 1, 0, 0]
    },
    2013: {
      focal_value: 'None',
      mean: 22028.86220472441,
      median: 21631.5,
      bars: [13, 46, 100, 62, 18, 11, 3, 1, 0, 0]
    },
    2014: {
      focal_value: 'None',
      mean: 23318.91338582677,
      median: 22901.0,
      bars: [6, 27, 93, 82, 30, 10, 5, 0, 1, 0]
    },
    2015: {
      focal_value: 'None',
      mean: 23551.799212598424,
      median: 22747.5,
      bars: [5, 26, 100, 73, 34, 10, 5, 0, 1, 0]
    },
    2016: {
      focal_value: 'None',
      mean: 24076.55905511811,
      median: 23605.0,
      bars: [4, 23, 80, 88, 40, 10, 7, 2, 0, 0]
    },
    2017: {
      focal_value: 'None',
      mean: 24859.01968503937,
      median: 24284.5,
      bars: [6, 18, 65, 98, 41, 15, 10, 1, 0, 0]
    },
    2018: {
      focal_value: 'None',
      mean: 25497.251968503937,
      median: 25128.5,
      bars: [5, 20, 46, 105, 48, 19, 8, 3, 0, 0]
    },
    2019: {
      focal_value: 'None',
      mean: 26280.503937007874,
      median: 25928.5,
      bars: [3, 17, 42, 90, 65, 23, 7, 5, 2, 0]
    }
  }
};

export const COUNT_HIST_DATA = {
  fig_aes: {
    yrange: (0.0, 28620.9),
    xrange: (0, 5493.400000000001),
    geotype: 'tract',
    label_units: 'population 17 years old and under',
    bar_labels: [
      '0-2862',
      '2862-5724',
      '5724-8586',
      '8586-11448',
      '11448-14310',
      '14310-17173',
      '17173-20035',
      '20035-22897',
      '22897-25759',
      '25759-28621'
    ],
    bar_centers: [
      1431.045,
      4293.135,
      7155.225,
      10017.315,
      12879.405,
      15741.495,
      18603.585,
      21465.675000000003,
      24327.765,
      27189.855000000003
    ],
    focal_display: 'None'
  },
  years: {
    2011: {
      focal_value: 'None',
      mean: 1295.8037490436113,
      median: 1142.5,
      bars: [4994, 220, 13, 1, 0, 0, 0, 0, 0, 0]
    },
    2012: {
      focal_value: 'None',
      mean: 1310.1241392501913,
      median: 1146.0,
      bars: [4977, 231, 17, 2, 1, 0, 0, 0, 0, 0]
    },
    2013: {
      focal_value: 'None',
      mean: 1295.8037490436113,
      median: 1142.5,
      bars: [4994, 220, 13, 1, 0, 0, 0, 0, 0, 0]
    },
    2014: {
      focal_value: 'None',
      mean: 1336.7925033467202,
      median: 1152.0,
      bars: [4935, 268, 21, 4, 0, 1, 0, 0, 0, 0]
    },
    2015: {
      focal_value: 'None',
      mean: 1350.4897646833747,
      median: 1165.0,
      bars: [4928, 270, 23, 4, 1, 0, 1, 0, 0, 0]
    },
    2016: {
      focal_value: 'None',
      mean: 1364.5448632102546,
      median: 1165.0,
      bars: [4911, 282, 27, 4, 2, 0, 0, 1, 0, 0]
    },
    2017: {
      focal_value: 'None',
      mean: 1379.181070745698,
      median: 1171.5,
      bars: [4894, 298, 32, 1, 3, 1, 0, 0, 1, 0]
    },
    2018: {
      focal_value: 'None',
      mean: 1394.6616943966342,
      median: 1169.0,
      bars: [4872, 317, 32, 3, 3, 1, 0, 0, 1, 0]
    },
    2019: {
      focal_value: 'None',
      mean: 1403.6811400153022,
      median: 1174.5,
      bars: [4870, 310, 36, 7, 1, 2, 1, 0, 0, 1]
    }
  }
};

export const PERCENT_HIST_DATA = {
  fig_aes: {
    yrange: (0.0, 100.0),
    xrange: (0, 3351.7000000000003),
    geotype: 'tract',
    label_units: 'population 17 years old and under',
    bar_labels: [
      '0-10',
      '10-20',
      '20-30',
      '30-40',
      '40-50',
      '50-60',
      '60-70',
      '70-80',
      '80-90',
      '90-100'
    ],
    bar_centers: [5.0, 15.0, 25.0, 35.0, 45.0, 55.0, 65.0, 75.0, 85.0, 95.0],
    focal_display: 'None'
  },
  years: {
    2011: {
      focal_value: 'None',
      mean: 26.37039429954948,
      median: 26.778963282249236,
      bars: [154, 704, 2717, 1542, 106, 5, 0, 0, 0, 0]
    },
    2012: {
      focal_value: 'None',
      mean: 26.178610679581432,
      median: 26.516276152723727,
      bars: [154, 722, 2755, 1503, 92, 2, 0, 0, 0, 0]
    },
    2013: {
      focal_value: 'None',
      mean: 26.37039429954948,
      median: 26.778963282249236,
      bars: [154, 704, 2717, 1542, 106, 5, 0, 0, 0, 0]
    },
    2014: {
      focal_value: 'None',
      mean: 25.78204501247421,
      median: 26.199690402476783,
      bars: [162, 740, 2896, 1359, 68, 4, 0, 0, 0, 0]
    },
    2015: {
      focal_value: 'None',
      mean: 25.61544335813166,
      median: 25.97876575978766,
      bars: [150, 783, 2947, 1277, 66, 4, 0, 0, 0, 0]
    },
    2016: {
      focal_value: 'None',
      mean: 25.488768260989957,
      median: 25.86250958343981,
      bars: [150, 797, 2974, 1250, 54, 2, 0, 0, 0, 0]
    },
    2017: {
      focal_value: 'None',
      mean: 25.312094860845527,
      median: 25.795066743727595,
      bars: [160, 849, 2964, 1208, 47, 2, 0, 0, 0, 0]
    },
    2018: {
      focal_value: 'None',
      mean: 25.154047524933116,
      median: 25.606469002695423,
      bars: [158, 850, 2997, 1180, 42, 2, 0, 0, 0, 0]
    },
    2019: {
      focal_value: 'None',
      mean: 24.985044005882337,
      median: 25.374466714756057,
      bars: [159, 859, 3047, 1115, 47, 1, 0, 0, 0, 0]
    }
  }
};

export const FOCAL_DATA = {
  fig_aes: {
    yrange: (10107.9, 52605.3),
    xrange: (0, 115.50000000000001),
    geotype: 'county',
    label_units: 'per capita income (1000s of dollars)',
    bar_labels: [
      '10-14',
      '14-19',
      '19-23',
      '23-27',
      '27-31',
      '31-36',
      '36-40',
      '40-44',
      '44-48',
      '48-53'
    ],
    bar_centers: [
      12232.77,
      16482.51,
      20732.25,
      24981.989999999998,
      29231.73,
      33481.47,
      37731.21,
      41980.95,
      46230.69,
      50480.43
    ],
    focal_display: 'Tarrant County'
  },
  years: {
    2011: {
      focal_value: 27920.0,
      mean: 22028.86220472441,
      median: 21631.5,
      bars: [13, 46, 100, 62, 18, 11, 3, 1, 0, 0]
    },
    2012: {
      focal_value: 28125.0,
      mean: 22431.716535433072,
      median: 21992.0,
      bars: [9, 40, 100, 69, 21, 12, 2, 1, 0, 0]
    },
    2013: {
      focal_value: 27920.0,
      mean: 22028.86220472441,
      median: 21631.5,
      bars: [13, 46, 100, 62, 18, 11, 3, 1, 0, 0]
    },
    2014: {
      focal_value: 28541.0,
      mean: 23318.91338582677,
      median: 22901.0,
      bars: [6, 27, 93, 82, 30, 10, 5, 0, 1, 0]
    },
    2015: {
      focal_value: 29058.0,
      mean: 23551.799212598424,
      median: 22747.5,
      bars: [5, 26, 100, 73, 34, 10, 5, 0, 1, 0]
    },
    2016: {
      focal_value: 29791.0,
      mean: 24076.55905511811,
      median: 23605.0,
      bars: [4, 23, 80, 88, 40, 10, 7, 2, 0, 0]
    },
    2017: {
      focal_value: 30857.0,
      mean: 24859.01968503937,
      median: 24284.5,
      bars: [6, 18, 65, 98, 41, 15, 10, 1, 0, 0]
    },
    2018: {
      focal_value: 32092.0,
      mean: 25497.251968503937,
      median: 25128.5,
      bars: [5, 20, 46, 105, 48, 19, 8, 3, 0, 0]
    },
    2019: {
      focal_value: 33292.0,
      mean: 26280.503937007874,
      median: 25928.5,
      bars: [3, 17, 42, 90, 65, 23, 7, 5, 2, 0]
    }
  }
};
