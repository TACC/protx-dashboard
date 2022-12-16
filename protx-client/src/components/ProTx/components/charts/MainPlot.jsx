import React from 'react';
import PropTypes from 'prop-types';
import Plot from 'react-plotly.js';
import './MainPlot.css';

function MainPlot({ plotState }) {
  return (
    <Plot
      divId="main-plot"
      className="main-plot"
      data={plotState.data}
      layout={plotState.layout}
      config={plotState.config}
      useResizeHandler
    />
  );
}

MainPlot.propTypes = {
  // eslint-disable-next-line react/forbid-prop-types
  plotState: PropTypes.object.isRequired,
};

MainPlot.defaultProps = {};

export default MainPlot;
