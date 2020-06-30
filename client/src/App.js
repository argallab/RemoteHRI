import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import VideoStimulus from './components/PassiveStimulus/VideoStimulus'
import DiscreteGridWorld from './components/ActiveStimulus/DiscreteGridWorld'
function App() {
  return (
    <div className="App">
      <DiscreteGridWorld />
    </div>
  );
}

export default App;
