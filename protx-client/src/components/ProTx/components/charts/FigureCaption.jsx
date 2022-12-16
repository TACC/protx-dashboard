import React from 'react';
import PropTypes from 'prop-types';
import './PredictiveFeaturesTable.css';
import './FigureCaption.css';

export const FigureCaption = ({label, className, children}) => (
  <div className={`annotation ${className}`}>
    <span className="annotation-label">{label}</span> {children}
  </div>
);

FigureCaption.propTypes = {
  label: PropTypes.string,
  className: PropTypes.string,
  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.node),
    PropTypes.node,
  ]).isRequired,
};
