import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import VideoStimulus from './components/PassiveStimulus/VideoStimulus'
import DiscreteGridWorld from './components/ActiveStimulus/DiscreteGridWorld'
import Survey from './components/PassiveStimulus/Survey'
import LoadingScreen from './components/LoadingScreen'
import { Button } from 'react-bootstrap'

export default class App extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      experimentLoaded: false,
      experimentStarted: false,
      // note: can eventually experiment with preloading
      trialLoaded: false,
      startExperimentResponse: {},
      trialData: {},
      experimentDone: false
    }

    this.startExperiment = this.startExperiment.bind(this)
    this.getNextStimulus = this.getNextStimulus.bind(this)
    this.getNextTrial = this.getNextTrial.bind(this)
    this.endExperiment = this.endExperiment.bind(this)

    this.fetchConfig = {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      mode: "cors",
      credentials: "include"
    }
  }

  componentDidMount() {
    if (process.env.REACT_APP_SERVERURL !== null && process.env.REACT_APP_SERVERURL !== "") {
      this.setState({
        experimentLoaded: true
      })
    }
  }

  startExperiment() {
    fetch("/startExperiment", this.fetchConfig)
      .then((response) => {
        if (response.status === 200) {
          return response.json()
        } else {
          throw new Error("/startExperiment failed with error code: " + response.status)
        }
      })
      .then((data) => {
        console.log("/startExperiment response:")
        console.log(data)
        this.setState({
          startExperimentResponse: data,
          experimentStarted: true
        })
        this.getNextStimulus()
      })
      .catch((err) => console.error(err))
  }

  endExperiment() {
    fetch("/endExperiment", this.fetchConfig)
      .then((response) => {
        if (response.status === 200) {
          return response.json()
        } else {
          throw new Error("/end failed with error code: " + response.status)
        }
      })
      .then((data) => {
        console.log("/end response:")
        console.log(data)
      })
      .catch((err) => console.error(err))
  }

  checkSessionData() {
    fetch("/showSessionData", this.fetchConfig)
      .then((response) => {
        if (response.status === 200) {
          return response.json()
        } else {
          throw new Error("/showSessionData failed with error code: " + response.status)
        }
      })
      .then((data) => {
        console.log("/showSessionData response:")
        console.log(data)
      })
  }

  getNextStimulus(body = {}) {
    var params = { ...this.fetchConfig }
    params["method"] = "POST"
    params["body"] = JSON.stringify(body)
    fetch("/getNextStimulus", params)
      .then((response) => {
        if (response.status === 200) {
          return response.json()
        } else {
          throw new Error("/getNextStimulus failed with error code: " + response.status)
        }
      })
      .then((data) => {
        console.log("/getNextStimulus response:")
        console.log(data)
        if (data.Data === "Done") {
          this.setState({
            trialData: {},
            trialLoaded: false,
            experimentDone: true
          }, this.endExperiment)

        } else {
          console.log(data.blockName)
          console.log(data.trialIndex)
          this.setState({
            trialData: data,
            trialLoaded: true
          })
        }
      })
      .catch((err) => {
        console.log(err)
      })
  }

  getNextTrial(answer) {
    console.log("Called getNextTrial with object ", answer)
    // clockTime, answer, latency
    var toSend = { ...answer }
    console.log(answer)
    toSend["clockTime"] = new Date().toISOString();
    toSend["latency"] = (answer.end - answer.start) / 1000;
    toSend["answer"] = answer
    console.log(toSend)
    this.getNextStimulus(toSend)
  }

  render() {
    if (this.state.experimentDone) {
      return (
        <LoadingScreen hideLoader={true} text={"Experiment done!"} />
      )
    }

    if (this.state.experimentLoaded) {
      if (this.state.experimentStarted) {
        if (this.state.trialLoaded) {
          if (this.state.trialData.stimulusType === "grid-world") {
            return (
              <div className="App">
                <DiscreteGridWorld key={this.state.trialData.trialIndex} data={this.state.trialData} submit={this.getNextTrial} />
              </div>
            )
          } else if (this.state.trialData.stimulusType === "survey") {
            return (
              <div className="App">
                <Survey key={this.state.trialData.trialIndex} data={this.state.trialData} submit={this.getNextTrial} />
              </div>
            )
          }

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