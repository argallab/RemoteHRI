import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import VideoStimulus from './components/PassiveStimulus/VideoStimulus'
import DiscreteGridWorld from './components/ActiveStimulus/DiscreteGridWorld'
import LoadingScreen from './components/LoadingScreen'
import { Button } from 'react-bootstrap'

export default class App extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      data: {},
      experimentLoaded: false,
      experimentStarted: false,
      // note: can eventually experiment with preloading
      trialLoaded: false,
      startExperimentResponse: {}
    }

    this.startExperiment = this.startExperiment.bind(this)
  }

  componentDidMount() {
    console.log(process.env.REACT_APP_SERVERURL)
    if (process.env.REACT_APP_SERVERURL != null && process.env.REACT_APP_SERVERURL != "") {
      this.setState({
        experimentLoaded: true
      })
    }
  }

  startExperiment() {
    fetch(process.env.REACT_APP_SERVERURL + "/startExperiment", {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      mode: "cors"
    })
      .then((response) => {
        if (response.status === 200) {
          return response.json()
        } else {
          throw "/startExperiment failed with error code: " + response.status
        }
      })
      .then((data) => {
        console.log("/startExperiment response:")
        console.log(data)
        this.setState({
          startExperimentResponse: data,
          experimentStarted: true
        })
      })
      .catch((err) => console.error(err))
  }

  getNextStimuli() {
    fetch()
  }

  render() {
    if (this.state.experimentLoaded) {
      if (this.state.experimentStarted) {
        if (this.state.trialLoaded) {
          return (
            <div className="App">
              <DiscreteGridWorld />
            </div>
          )
        } else {
          return (
            <div className="App">
              <LoadingScreen text={"Loading trial..."} />
            </div>
          )
        }
      } else {
        return (
          <div className="App">
            <Button onClick={this.startExperiment}>Start Experiment</Button>
          </div>
        )
      }
    } else {
      return (
        <div className="App">
          <LoadingScreen />
        </div>
      )
    }

  }
}