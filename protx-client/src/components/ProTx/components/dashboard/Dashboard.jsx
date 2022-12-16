import React from 'react';
import DashboardDisplay from './DashboardDisplay';
import '../shared/Variables.css';
import './Dashboard.css';

function Dashboard() {
  return (
    <div className="dashboard-root">
      <DashboardDisplay />
    </div>
  );
}

export default Dashboard;
