import { useState } from 'react'
import ProTx from './components/ProTx';
import { BrowserRouter as Router, Route } from 'react-router-dom';

function App() {
  //TODO: redirect if user hasn't passed onboarding.
  return (
    <Router>
      <Route path="/protx/dash" component={ProTx} />
    </Router>
  )
}

export default App
