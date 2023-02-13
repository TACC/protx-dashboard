import React from 'react';
import PropTypes from 'prop-types';
import Plot from 'react-plotly.js';
import './MainPlot.css';
import styles from './MainPlot.module.scss';


function MainPlot({ plotState, className }) {
  return (
    <Plot
      divId="main-plot"
      className={`${styles['main-plot']} ${className}`}
      data={plotState.data}
      layout={plotState.layout}
      config={plotState.config}
      useResizeHandler
    />
  );
}

MainPlot.propTypes = {
  /** Any additional className(s) for the root element */
  className: PropTypes.string,
  /** State of plotly plot (data, layout, config) **/
  // eslint-disable-next-line react/forbid-prop-types
  plotState: PropTypes.object.isRequired,
};

MainPlot.defaultProps = {
  className: '',
};

export default MainPlot;
