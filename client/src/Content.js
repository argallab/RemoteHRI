import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import VideoStimulus from './components/PassiveStimulus/VideoStimulus'
import DiscreteGridWorld from './components/ActiveStimulus/DiscreteGridWorld'
import Survey from './components/PassiveStimulus/Survey'
import LoadingScreen from './components/LoadingScreen'
import PreExperimentForm from './components/PreExperimentForm';
import PostExperimentForm from './components/PostExperimentForm';
import TextDisplay from './components/PassiveStimulus/TextDisplay'
import ContinuousWorld from './components/ActiveStimulus/ContinuousWorld'
import ContinuousWorldDynamic from './components/ActiveStimulus/ContinuousWorldDynamic'
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
            // postExperimentReponse: {}, // NOTE: added 06/02/2021 ~ awt
            trialData: {},
            experimentDone: false,
            experimentName: "",
            experimentInstructions: ""
        }

        this.startExperiment = this.startExperiment.bind(this)
        this.getNextStimulus = this.getNextStimulus.bind(this)
        this.getNextTrial = this.getNextTrial.bind(this)
        this.endExperiment = this.endExperiment.bind(this)
        // this.postExperiment = this.postExperiment.bind(this) // awt [06/02/2021]

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
        var url = `/startExperiment?&s=${data.sex}&a=${data.age}&r=${data.race}&h=${data.hand}` // the 'data' structure comes from the PreExperiment Form and is assumed to have sex,age,race and hand info. Assign each of the variables in data to s,a,r, and h respectively.
        // Refer to onSubmit() in PreExperimentForm
        fetch(url, this.fetchConfig)
            .then((response) => {
                if (response.status === 200) { //response.status === 200 means that the server successfully answered the request.
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
                }) // At this point the session variable has the flattened (randomized) stimuli list ready to be served. 
                this.getNextStimulus() // get the first trial right away. 
            })
            .catch((err) => console.error(err))
            console.log('startExperiment fetch outer loop!')
    }

    /* postExperiment() { // awt [06/03/2021]
        fetch("/postExperiment", this.fetchConfig)
            .then((response) => {
                if (response.status === 200) {
                    return response.json()
                } else {
                    throw new Error("/postExperiment failed with error code: " + response.status) 
                }
            })
            .then((data) => {
                console.log("/postExperiment response:")
                console.log(data)
                this.setState({
                    postExperimentResponse: data,
                    postExperiment: true
                })
                console.log('postExperiment 2nd .then outer loop!')
                //this.getNextStimulus()
            })
            .catch((err) => console.error(err))
            console.log('postExperiment fetch outer loop!')
    } */

    endExperiment() {
        fetch("/endExperiment", this.fetchConfig)
            .then((response) => {
                if (response.status === 200) {
                    return response.json()
                } else {
                    throw new Error("/endExperiment failed with error code: " + response.status) // awt [06/03/2021]
                }
            })
            .then((data) => {
                console.log("/endExperiment response:") // awt [06/03/2021]
                console.log(data)
                this.setState({
                    endExperimentResponse: data,
                    experimentDone: true
                })
                this.getNextStimulus()
            })
            .catch((err) => console.error(err))
            console.log('endExperiment fetch outer loop!')
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

    getNextStimulus(body = {}, dumpQuery = false) {
        var params = { ...this.fetchConfig }
        params["method"] = "POST"
        if (dumpQuery) body.dumpQuery = true

        params["body"] = JSON.stringify(body)
        fetch("/getNextStimulus", params)
            .then((response) => {
                if (response.status === 200) {
                    return response.json()
                } else {
                    throw new Error("/getNextStimulus failed with error code: " + response.status)
                }
            })
            .then((data) => { // made changes to this block to set a pre-experimentDone render; awt [06/02/2021]
                console.log("/getNextStimulus response:")
                console.log(data)
                //if (this.state.postExperiment) { 
                if (data.data.Data === "Done") {
                    console.log("endExperiment cb")
                    this.setState({
                        trialData: {},
                        trialLoaded: false,
                        experimentDone: true
                    }, this.endExperiment)
                    //console.log('data.data.Data === "postExperimentQuestionnaire"')
                }
                /* else if (data.data.Data === "postExperimentQuestionnaire") {
                    console.log("postExperiment cb")
                    this.setState({
                        //trialData: {},
                        //trialLoaded: false,
                        postExperiment: true,
                        trialData: data.data
                    }, this.postExperiment)
                    //console.log('data.data.Data === "Done"')
                } */
                else {
                    if (data.progress) {
                        this.setState({
                            trialData: data.data,
                            trialLoaded: true
                        })
                    } else {
                        console.log("Successfully dumped data")
                    }
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
        toSend["clockTime"] = new Date().toISOString();
        toSend["latency"] = (answer.end - answer.start) / 1000;
        toSend["answer"] = answer
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

        /* if (this.state.postExperiment) {

           
            else {
                return(
                    <div>
                            <h3>{this.state.experimentName}</h3>
                            <hr />
                            <PostExperimentForm endExperiment={this.endExperiment} />
                    </div>
            )}
        } */

        //else if (this.state.experimentDone) && (this.state.postExperimentForm ) {
        //    <LoadingScreen hideLoader={true} text={"Experiment done!"} />
        //}

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
                            <ContinuousWorld key={this.state.trialData.trialIndex} data={this.state.trialData} batchSubmit={this.getNextStimulus} submit={this.getNextTrial} />
                        )
                    } else if (this.state.trialData.stimulusType === "robot-arm") {
                        return (
                            <RobotArmWorld key={this.state.trialData.trialIndex} data={this.state.trialData} submit={this.getNextTrial} />
                        )
                    } else if (this.state.trialData.stimulusType === 'continuous-world-dynamic') {
                        return (
                            <ContinuousWorldDynamic key={this.state.trialData.trialIndex} data={this.state.trialData} batchSubmit={this.getNextStimulus} submit={this.getNextTrial} />
                        )
                    } else if (this.state.trialData.stimulusType === 'post-experiment-questionnaire') {
                        return (
                            <PostExperimentForm key={this.state.trialData.trialIndex} submit={this.getNextTrial}></PostExperimentForm>                            
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
                    // show name of the experiment at the top of the pre-experiment form. Which collects demographic data. 
                )
            }
        } else {
            return (
                <LoadingScreen />
            )
        }

    }
}