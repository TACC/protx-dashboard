import React from 'react';
import PropTypes from 'prop-types';
import './PredictiveFeaturesTable.css';
import './FigureCaption.css';

export const FigureCaption = ({label, captionText}) =>
    <div className="plot-annotation">
        <span className="annotation-label">{label}</span>
        {' '}
        {captionText}
    </div>

FigureCaption.propTypes = {
    label: PropTypes.string.isRequired,
    captionText: PropTypes.string.isRequired,
};
  