import React from 'react';
import { useSelector } from 'react-redux';
import { useRouteMatch, Redirect } from 'react-router-dom';
import DashboardDisplay from './DashboardDisplay';
import '../shared/Variables.css';
import './Dashboard.css';
import * as ROUTES from '../../../../constants/routes';

function Dashboard() {

  return (
    <div className="dashboard-root">
        <DashboardDisplay />
    </div>
  );
}

export default Dashboard;
