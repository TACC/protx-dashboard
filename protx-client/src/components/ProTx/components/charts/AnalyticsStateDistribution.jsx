import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import PropTypes from 'prop-types';
import { LoadingSpinner } from '_common';
import MainPlot from './MainPlot';
import ChartInstructions from "./ChartInstructions";


function AnalyticsStateDistribution({geography}) {
  const dispatch = useDispatch();
  /*
      possibly need -> title or header?
      need -> <MainPlot plotState={plotState} /
   */
  return (
    <div>
      <ChartInstructions currentReportType="hidden" />
    </div>
  )
}

AnalyticsStateDistribution.propTypes = {
  geography: PropTypes.string.isRequired,
};

export default AnalyticsStateDistribution;
