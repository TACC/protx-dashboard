import { THEME_CB12_MAIN, THEME_HIST_GRADIENT_ALT1 } from '../data/colors';
import { CATEGORY_CODES } from '../data/meta';

/**
 * TODO: Integrate chroma.js library for dynamic color scale generation.
 * Assign an imported color theme for use in plot generation.
 */

const plotColors = THEME_CB12_MAIN;
const histColors = THEME_HIST_GRADIENT_ALT1;
const categoryCodes = CATEGORY_CODES;

const plotConfig = {
  doubleClickDelay: 1000,
  responsive: true,
  displayModeBar: false,
  modeBarButtonsToRemove: [],
  displaylogo: false,
  showEditInChartStudio: false
};

/**
 *
 * TODO: determine if we need to pass in different values to the layout per-plot for tick configurations. These could also be created by combining the base layout object with an override object in the plot component.
 *
 * @param {*} typesDataArray
 * @returns
 */

const getPlotLayout = (
  plotAnnotation,
  plotOrientation,
  plotLegend,
  plotXAxisTitle,
  plotXAxisType,
  plotYAxisTitle,
  plotYAxisType
) => {
  // Defaults settings.
  const baseMargin = 40;
  const basePadding = 5;
  const baseStandoff = 20;
  const baseFontSize = 8;
  const baseTitleFontSize = 10;

  const plotLayoutAutoSize = true;
  const plotLayoutMarginTop = baseMargin;
  const plotLayoutMarginRight = baseMargin;
  const plotLayoutMarginBottom = baseMargin;
  const plotLayoutMarginLeft = baseMargin;
  const plotLayoutmarginPad = basePadding;
  const plotLayoutFontSize = baseFontSize;

  const plotLayoutXaxisAutoMargin = false;
  const plotLayoutXaxisAutoRange = true;
  const plotLayoutXaxisType = plotXAxisType;
  const plotLayoutXaxisTickAngle = 0;
  const plotLayoutXaxisTick0 = 0; // %,# --> 0 | $ --> 1000
  const plotLayoutXaxisTickFormat = null; // %,# --> null | $ --> 'f'
  const plotLayoutXaxisTickPrefix = null; // %,# --> null | $ --> '$'
  const plotLayoutXaxisTickSuffix = null; // % --> '%' | #,$ --> null
  const plotLayoutXaxisTitle = plotXAxisTitle;
  const plotLayoutXaxisTitleStandoff = baseStandoff;
  const plotLayoutXaxisTitleFontSize = baseTitleFontSize;

  const plotLayoutYaxisAutoMargin = true;
  let plotLayoutYaxisAutorange;
  const plotLayoutYaxisType = plotYAxisType;
  const plotLayoutYaxisTickAngle = 0;
  const plotLayoutYaxisTick0 = 0; // %,# --> 0 | $ --> 1000
  const plotLayoutYaxisTickFormat = null; // %,# --> null | $ --> 'f'
  const plotLayoutYaxisTickPrefix = null; // %,# --> null | $ --> '$'
  const plotLayoutYaxisTickSuffix = null; // % --> '%' | #,$ --> null
  const plotLayoutYaxisTitle = plotYAxisTitle;
  const plotLayoutYaxisTitleStandoff = baseStandoff;
  const plotLayoutYaxisTitleFontSize = baseTitleFontSize;

  if (plotOrientation === 'v') {
    plotLayoutYaxisAutorange = true;
  }

  if (plotOrientation === 'h') {
    plotLayoutYaxisAutorange = 'reversed';
  }

  const newPlotLayout = {
    autosize: plotLayoutAutoSize,
    margin: {
      t: plotLayoutMarginTop,
      r: plotLayoutMarginRight,
      b: plotLayoutMarginBottom,
      l: plotLayoutMarginLeft,
      pad: plotLayoutmarginPad
    },
    font: {
      size: plotLayoutFontSize
    },
    xaxis: {
      automargin: plotLayoutXaxisAutoMargin,
      autorange: plotLayoutXaxisAutoRange,
      type: plotLayoutXaxisType,
      tickangle: plotLayoutXaxisTickAngle,
      tick0: plotLayoutXaxisTick0,
      tickformat: plotLayoutXaxisTickFormat,
      tickprefix: plotLayoutXaxisTickPrefix,
      ticksuffix: plotLayoutXaxisTickSuffix,
      title: {
        text: plotLayoutXaxisTitle,
        standoff: plotLayoutXaxisTitleStandoff,
        font: {
          size: plotLayoutXaxisTitleFontSize
        }
      }
    },
    yaxis: {
      automargin: plotLayoutYaxisAutoMargin,
      autorange: plotLayoutYaxisAutorange,
      type: plotLayoutYaxisType,
      tickangle: plotLayoutYaxisTickAngle,
      tick0: plotLayoutYaxisTick0,
      tickformat: plotLayoutYaxisTickFormat,
      tickprefix: plotLayoutYaxisTickPrefix,
      ticksuffix: plotLayoutYaxisTickSuffix,
      title: {
        text: plotLayoutYaxisTitle,
        standoff: plotLayoutYaxisTitleStandoff,
        font: {
          size: plotLayoutYaxisTitleFontSize
        }
      }
    },
    showlegend: plotLegend,
    annotations: [plotAnnotation]
  };

  return newPlotLayout;
};

const getTraceFillColor = (targetPlot, catcode, unique) => {
  let barColorIndex = 12;
  let barColor = histColors[barColorIndex];

  if (targetPlot === 'maltreatment') {
    const indexKey = categoryCodes.indexOf(catcode);
    barColor = plotColors[indexKey];
    return barColor;
  }

  if (targetPlot === 'observed') {
    barColorIndex = 1;
    if (unique) {
      barColorIndex = 10;
    }
  }

  if (targetPlot === 'predictive') {
    barColorIndex = 8;
    if (unique) {
      barColorIndex = 6;
    }
  }

  barColor = histColors[barColorIndex];
  return barColor;
};

const getBarTrace = (
  traceY,
  traceX,
  traceName,
  traceFillColor,
  barOrientation
) => {
  let xData;
  let yData;

  if (barOrientation === 'v') {
    xData = traceX;
    yData = traceY;
  }

  if (barOrientation === 'h') {
    xData = traceY;
    yData = traceX;
  }

  return {
    y: [yData],
    x: [xData],
    name: traceName,
    type: 'bar',
    orientation: barOrientation,
    marker: {
      line: {
        color: ['#111111'],
        width: 0.1
      },
      color: [traceFillColor]
    }
  };
};

/**
 *
 * @param {*} typesDataArray
 * @returns
 */

const getPlotDataBars = (targetPlotType, typesDataArray, plotOrientation) => {
  const newPlotData = [];

  for (let i = 0; i < typesDataArray.length; i += 1) {
    const yData = typesDataArray[i].value;
    const xData = typesDataArray[i].code;
    const tName = typesDataArray[i].name;
    const isHighlighted = typesDataArray[i].highlight;

    const traceFillColor = getTraceFillColor(
      targetPlotType,
      xData,
      isHighlighted
    );

    const type = getBarTrace(
      yData,
      xData,
      tName,
      traceFillColor,
      plotOrientation
    );

    newPlotData.push(type);
  }

  return newPlotData;
};

/**
 * Template for Plot Traces.
 */

const plotTraceBaseTemplate = {
  template: {
    data: {
      bar: [
        {
          error_x: { color: '#2a3f5f' },
          error_y: { color: '#2a3f5f' },
          marker: {
            line: { color: '#E5ECF6', width: 0.5 },
            pattern: { fillmode: 'overlay', size: 10, solidity: 0.2 }
          },
          type: 'bar'
        }
      ],
      barpolar: [
        {
          marker: {
            line: { color: '#E5ECF6', width: 0.5 },
            pattern: { fillmode: 'overlay', size: 10, solidity: 0.2 }
          },
          type: 'barpolar'
        }
      ],
      carpet: [
        {
          aaxis: {
            endlinecolor: '#2a3f5f',
            gridcolor: 'white',
            linecolor: 'white',
            minorgridcolor: 'white',
            startlinecolor: '#2a3f5f'
          },
          baxis: {
            endlinecolor: '#2a3f5f',
            gridcolor: 'white',
            linecolor: 'white',
            minorgridcolor: 'white',
            startlinecolor: '#2a3f5f'
          },
          type: 'carpet'
        }
      ],
      choropleth: [
        {
          colorbar: { outlinewidth: 0, ticks: '' },
          type: 'choropleth'
        }
      ],
      contour: [
        {
          colorbar: { outlinewidth: 0, ticks: '' },
          colorscale: [
            [0, '#0d0887'],
            [0.1111111111111111, '#46039f'],
            [0.2222222222222222, '#7201a8'],
            [0.3333333333333333, '#9c179e'],
            [0.4444444444444444, '#bd3786'],
            [0.5555555555555556, '#d8576b'],
            [0.6666666666666666, '#ed7953'],
            [0.7777777777777778, '#fb9f3a'],
            [0.8888888888888888, '#fdca26'],
            [1, '#f0f921']
          ],
          type: 'contour'
        }
      ],
      contourcarpet: [
        {
          colorbar: { outlinewidth: 0, ticks: '' },
          type: 'contourcarpet'
        }
      ],
      heatmap: [
        {
          colorbar: { outlinewidth: 0, ticks: '' },
          colorscale: [
            [0, '#0d0887'],
            [0.1111111111111111, '#46039f'],
            [0.2222222222222222, '#7201a8'],
            [0.3333333333333333, '#9c179e'],
            [0.4444444444444444, '#bd3786'],
            [0.5555555555555556, '#d8576b'],
            [0.6666666666666666, '#ed7953'],
            [0.7777777777777778, '#fb9f3a'],
            [0.8888888888888888, '#fdca26'],
            [1, '#f0f921']
          ],
          type: 'heatmap'
        }
      ],
      heatmapgl: [
        {
          colorbar: { outlinewidth: 0, ticks: '' },
          colorscale: [
            [0, '#0d0887'],
            [0.1111111111111111, '#46039f'],
            [0.2222222222222222, '#7201a8'],
            [0.3333333333333333, '#9c179e'],
            [0.4444444444444444, '#bd3786'],
            [0.5555555555555556, '#d8576b'],
            [0.6666666666666666, '#ed7953'],
            [0.7777777777777778, '#fb9f3a'],
            [0.8888888888888888, '#fdca26'],
            [1, '#f0f921']
          ],
          type: 'heatmapgl'
        }
      ],
      histogram: [
        {
          marker: {
            pattern: { fillmode: 'overlay', size: 10, solidity: 0.2 }
          },
          type: 'histogram'
        }
      ],
      histogram2d: [
        {
          colorbar: { outlinewidth: 0, ticks: '' },
          colorscale: [
            [0, '#0d0887'],
            [0.1111111111111111, '#46039f'],
            [0.2222222222222222, '#7201a8'],
            [0.3333333333333333, '#9c179e'],
            [0.4444444444444444, '#bd3786'],
            [0.5555555555555556, '#d8576b'],
            [0.6666666666666666, '#ed7953'],
            [0.7777777777777778, '#fb9f3a'],
            [0.8888888888888888, '#fdca26'],
            [1, '#f0f921']
          ],
          type: 'histogram2d'
        }
      ],
      histogram2dcontour: [
        {
          colorbar: { outlinewidth: 0, ticks: '' },
          colorscale: [
            [0, '#0d0887'],
            [0.1111111111111111, '#46039f'],
            [0.2222222222222222, '#7201a8'],
            [0.3333333333333333, '#9c179e'],
            [0.4444444444444444, '#bd3786'],
            [0.5555555555555556, '#d8576b'],
            [0.6666666666666666, '#ed7953'],
            [0.7777777777777778, '#fb9f3a'],
            [0.8888888888888888, '#fdca26'],
            [1, '#f0f921']
          ],
          type: 'histogram2dcontour'
        }
      ],
      mesh3d: [{ colorbar: { outlinewidth: 0, ticks: '' }, type: 'mesh3d' }],
      parcoords: [
        {
          line: { colorbar: { outlinewidth: 0, ticks: '' } },
          type: 'parcoords'
        }
      ],
      pie: [{ automargin: true, type: 'pie' }],
      scatter: [
        {
          marker: { colorbar: { outlinewidth: 0, ticks: '' } },
          type: 'scatter'
        }
      ],
      scatter3d: [
        {
          line: { colorbar: { outlinewidth: 0, ticks: '' } },
          marker: { colorbar: { outlinewidth: 0, ticks: '' } },
          type: 'scatter3d'
        }
      ],
      scattercarpet: [
        {
          marker: { colorbar: { outlinewidth: 0, ticks: '' } },
          type: 'scattercarpet'
        }
      ],
      scattergeo: [
        {
          marker: { colorbar: { outlinewidth: 0, ticks: '' } },
          type: 'scattergeo'
        }
      ],
      scattergl: [
        {
          marker: { colorbar: { outlinewidth: 0, ticks: '' } },
          type: 'scattergl'
        }
      ],
      scattermapbox: [
        {
          marker: { colorbar: { outlinewidth: 0, ticks: '' } },
          type: 'scattermapbox'
        }
      ],
      scatterpolar: [
        {
          marker: { colorbar: { outlinewidth: 0, ticks: '' } },
          type: 'scatterpolar'
        }
      ],
      scatterpolargl: [
        {
          marker: { colorbar: { outlinewidth: 0, ticks: '' } },
          type: 'scatterpolargl'
        }
      ],
      scatterternary: [
        {
          marker: { colorbar: { outlinewidth: 0, ticks: '' } },
          type: 'scatterternary'
        }
      ],
      surface: [
        {
          colorbar: { outlinewidth: 0, ticks: '' },
          colorscale: [
            [0, '#0d0887'],
            [0.1111111111111111, '#46039f'],
            [0.2222222222222222, '#7201a8'],
            [0.3333333333333333, '#9c179e'],
            [0.4444444444444444, '#bd3786'],
            [0.5555555555555556, '#d8576b'],
            [0.6666666666666666, '#ed7953'],
            [0.7777777777777778, '#fb9f3a'],
            [0.8888888888888888, '#fdca26'],
            [1, '#f0f921']
          ],
          type: 'surface'
        }
      ],
      table: [
        {
          cells: {
            fill: { color: '#EBF0F8' },
            line: { color: 'white' }
          },
          header: {
            fill: { color: '#C8D4E3' },
            line: { color: 'white' }
          },
          type: 'table'
        }
      ]
    },
    layout: {
      annotationdefaults: {
        arrowcolor: '#2a3f5f',
        arrowhead: 0,
        arrowwidth: 1
      },
      autotypenumbers: 'strict',
      coloraxis: { colorbar: { outlinewidth: 0, ticks: '' } },
      colorscale: {
        diverging: [
          [0, '#8e0152'],
          [0.1, '#c51b7d'],
          [0.2, '#de77ae'],
          [0.3, '#f1b6da'],
          [0.4, '#fde0ef'],
          [0.5, '#f7f7f7'],
          [0.6, '#e6f5d0'],
          [0.7, '#b8e186'],
          [0.8, '#7fbc41'],
          [0.9, '#4d9221'],
          [1, '#276419']
        ],
        sequential: [
          [0, '#0d0887'],
          [0.1111111111111111, '#46039f'],
          [0.2222222222222222, '#7201a8'],
          [0.3333333333333333, '#9c179e'],
          [0.4444444444444444, '#bd3786'],
          [0.5555555555555556, '#d8576b'],
          [0.6666666666666666, '#ed7953'],
          [0.7777777777777778, '#fb9f3a'],
          [0.8888888888888888, '#fdca26'],
          [1, '#f0f921']
        ],
        sequentialminus: [
          [0, '#0d0887'],
          [0.1111111111111111, '#46039f'],
          [0.2222222222222222, '#7201a8'],
          [0.3333333333333333, '#9c179e'],
          [0.4444444444444444, '#bd3786'],
          [0.5555555555555556, '#d8576b'],
          [0.6666666666666666, '#ed7953'],
          [0.7777777777777778, '#fb9f3a'],
          [0.8888888888888888, '#fdca26'],
          [1, '#f0f921']
        ]
      },
      colorway: [
        '#636efa',
        '#EF553B',
        '#00cc96',
        '#ab63fa',
        '#FFA15A',
        '#19d3f3',
        '#FF6692',
        '#B6E880',
        '#FF97FF',
        '#FECB52'
      ],
      font: { color: '#2a3f5f' },
      geo: {
        bgcolor: 'white',
        lakecolor: 'white',
        landcolor: '#E5ECF6',
        showlakes: true,
        showland: true,
        subunitcolor: 'white'
      },
      hoverlabel: { align: 'left' },
      hovermode: 'closest',
      mapbox: { style: 'light' },
      paper_bgcolor: 'white',
      plot_bgcolor: '#E5ECF6',
      polar: {
        angularaxis: {
          gridcolor: 'white',
          linecolor: 'white',
          ticks: ''
        },
        bgcolor: '#E5ECF6',
        radialaxis: {
          gridcolor: 'white',
          linecolor: 'white',
          ticks: ''
        }
      },
      scene: {
        xaxis: {
          backgroundcolor: '#E5ECF6',
          gridcolor: 'white',
          gridwidth: 2,
          linecolor: 'white',
          showbackground: true,
          ticks: '',
          zerolinecolor: 'white'
        },
        yaxis: {
          backgroundcolor: '#E5ECF6',
          gridcolor: 'white',
          gridwidth: 2,
          linecolor: 'white',
          showbackground: true,
          ticks: '',
          zerolinecolor: 'white'
        },
        zaxis: {
          backgroundcolor: '#E5ECF6',
          gridcolor: 'white',
          gridwidth: 2,
          linecolor: 'white',
          showbackground: true,
          ticks: '',
          zerolinecolor: 'white'
        }
      },
      shapedefaults: { line: { color: '#2a3f5f' } },
      ternary: {
        aaxis: { gridcolor: 'white', linecolor: 'white', ticks: '' },
        baxis: { gridcolor: 'white', linecolor: 'white', ticks: '' },
        bgcolor: '#E5ECF6',
        caxis: { gridcolor: 'white', linecolor: 'white', ticks: '' }
      },
      title: { x: 0.05 },
      xaxis: {
        automargin: true,
        gridcolor: 'white',
        linecolor: 'white',
        ticks: '',
        title: { standoff: 15 },
        zerolinecolor: 'white',
        zerolinewidth: 2
      },
      yaxis: {
        automargin: true,
        gridcolor: 'white',
        linecolor: 'white',
        ticks: '',
        title: { standoff: 15 },
        zerolinecolor: 'white',
        zerolinewidth: 2
      }
    }
  }
};

const hoverTemplate =
  '<b>%{text}</b><br><br>' +
  '%{yaxis.title.text}: %{y:$,.0f}<br>' +
  '%{xaxis.title.text}: %{x:.0%}<br>' +
  'String Text: %{marker.size:,}' +
  '<extra></extra>';

export {
  plotColors,
  histColors,
  plotConfig,
  getPlotLayout,
  getPlotDataBars,
  plotTraceBaseTemplate,
  hoverTemplate
};
