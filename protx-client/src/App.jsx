import { useState } from 'react'
import ProTx from './components/ProTx';
import { BrowserRouter as Router, Route } from 'react-router-dom';

function App() {
  //TODO: redirect if user hasn't passed onboarding. https://jira.tacc.utexas.edu/browse/COOKS-257

  return (
    <Router>
      <Route path="/protx/dash" component={ProTx} />
    </Router>
  )
}

export default App
