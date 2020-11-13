// Code developed by Finley Lau*, Deepak Gopinath*. Copyright (c) 2020. Argallab. (*) Equal contribution

import React from 'react';
import VideoStimulus from './components/PassiveStimulus/VideoStimulus'
import DiscreteGridWorld from './components/ActiveStimulus/DiscreteGridWorld'
import { Tabs, Tab } from 'react-bootstrap'
import 'bootstrap/dist/css/bootstrap.min.css';

function App() {
  return (
    <div className="App">
      <Tabs defaultActiveKey="profile" id="uncontrolled-tab-example">
        <Tab eventKey="vs" title="Video Stimulus">
          <VideoStimulus />
        </Tab>
        <Tab eventKey="dgw" title="Discrete Grid World">
          <DiscreteGridWorld />
        </Tab>

      </Tabs>
    </div>
  );
}

export default App;
