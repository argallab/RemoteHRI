import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import VideoStimulus from './components/PassiveStimulus/VideoStimulus'
import DiscreteGridWorld from './components/ActiveStimulus/DiscreteGridWorld'
import Survey from './components/PassiveStimulus/Survey'
import LoadingScreen from './components/LoadingScreen'
import PreExperimentForm from './components/PreExperimentForm';
import TextDisplay from './components/PassiveStimulus/TextDisplay'
import ContinuousWorld from './components/ActiveStimulus/ContinuousWorld'
import RobotArmWorld from './components/ActiveStimulus/RobotArmWorld';
/**
 * See README.md for documentation.
 */
export default class Content extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            experimentLoaded: false,
            experimentStarted: false,
            // note: can eventually experiment with preloading
            trialLoaded: false,
            startExperimentResponse: {},
            trialData: {},
            experimentDone: false,
            experimentName: "",
            experimentInstructions: ""
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
            fetch("/getExperimentName", this.fetchConfig)
                .then((response) => {
                    if (response.status === 200) {
                        return response.json()
                    } else {
                        throw new Error("/getExperimentName failed with error code: " + response.status)
                    }
                })
                .then((data) => {
                    console.log("/getExperimentName response:")
                    console.log(data)
                    this.setState({
                        experimentLoaded: true,
                        experimentName: data.name,
                    })
                })
                .catch((err) => console.error(err))
        }
    }

    startExperiment(data = {}) {
        var url = `/startExperiment?&s=${data.sex}&a=${data.age}&r=${data.race}&h=${data.hand}`
        fetch(url, this.fetchConfig)
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

        /**
         * If the experiment is done, show the done screen.
         * 
         * If we have estalished a connection with the server but haven't loaded the experiment yet, show the Loading screen.
         * If we have loaded the experiment but the subject has not pressed the start button, show the PreExperimentForm.
         * If we have started the experiment and we have a trial loaded, display it.
         * If we have started the experiment but are waiting for a trial to load, display the Loading screen.
         */


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
                            <DiscreteGridWorld key={this.state.trialData.trialIndex} data={this.state.trialData} submit={this.getNextTrial} />
                        )
                    } else if (this.state.trialData.stimulusType === "survey") {
                        return (
                            <Survey key={this.state.trialData.trialIndex} data={this.state.trialData} submit={this.getNextTrial} />
                        )
                    } else if (this.state.trialData.stimulusType === "text-display") {
                        return (
                            <TextDisplay key={this.state.trialData.trialIndex} data={this.state.trialData} submit={this.getNextTrial} />
                        )
                    } else if (this.state.trialData.stimulusType === "video") {
                        return (
                            <VideoStimulus key={this.state.trialData.trialIndex} data={this.state.trialData} submit={this.getNextTrial} />
                        )
                    } else if (this.state.trialData.stimulusType === "continuous-world") {
                        return (
                            <ContinuousWorld key={this.state.trialData.trialIndex} data={this.state.trialData} submit={this.getNextTrial} />
                        )
                    } else if (this.state.trialData.stimulusType === "robot-arm") {
                        return (
                            <RobotArmWorld key={this.state.trialData.trialIndex} data={this.state.trialData} submit={this.getNextTrial} />
                        )
                    }

                } else {
                    return (
                        <LoadingScreen text={"Loading trial..."} />
                    )
                }
            } else {
                return (
                    <div>
                        <h3>{this.state.experimentName}</h3>
                        <hr />
                        <PreExperimentForm startExperiment={this.startExperiment} />
                    </div>
                )
            }
        } else {
            return (
                <LoadingScreen />
            )
        }

    }
}