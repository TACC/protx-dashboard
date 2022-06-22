import React from 'react';
import { useSelector } from 'react-redux';
import { useRouteMatch, Redirect } from 'react-router-dom';
import DashboardDisplay from './DashboardDisplay';
import '../shared/Variables.css';
import './Dashboard.css';
import * as ROUTES from '../../../../constants/routes';

function Dashboard() {
  const { path } = useRouteMatch();
  const setupComplete = useSelector(state => state.workbench.setupComplete);

  return (
    <div className="dashboard-root">
      {setupComplete ? (
        <DashboardDisplay />
      ) : (
        <Redirect
          from={`${path}`}
          to={`${ROUTES.WORKBENCH}${ROUTES.ONBOARDING}/setup/`}
        />
      )}
    </div>
  );
}

export default Dashboard;
