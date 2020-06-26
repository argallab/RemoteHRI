import React, { Component } from 'react';
import { Row, Col, Button, Form } from 'react-bootstrap';
import ReactPlayer from 'react-player';
import LoadingScreen from '../../LoadingScreen';
import TextResponse from '../../Responses/TextResponse';


/**
 * VideoStimulus trial display.  Displays videos and variable number of questions to the user.
 * Additional data expected in addition to VideoStimulus data:
 * trial index (zero-indexed but displayed one-indexed)
 * various function callbacks
 * experiment ID
 * maybe add functionality to add a name for the trial in the admin application and variably display it here
 */
export default class VideoStimulus extends Component {
    constructor(props) {
        super(props)

        this.state = {
            data: {},
            loaded: false,
            textResponses: []
        }

        this.handleResponseChange = this.handleResponseChange.bind(this)
        this.onSubmit = this.onSubmit.bind(this)
    }

    /**
     * Gets data to render for the experiment.
     * For now just calls hard-coded json data, but eventually will call server route.
     */
    componentDidMount() {
        var json = require('../../../data/VideoStimulus.json');
        var textResponses = []
        for (var i = 0; i < json.questions.length; i++)
        {
            textResponses.push({response: ""})
        }
        this.setState({
            data: json,
            loaded: true,
            textResponses
        })
    }

    onSubmit() {
        console.log("submit")
    }

    handleResponseChange(e, i) {
        var copy = this.state.textResponses
        copy[i].response = e.target.value
        this.setState({
            textResponses: copy
        })
    }

    /**
     * Note - not much freedom in controls with ReactPlayer component, maybe can look into how to do that with this specific component or use a different component later down the road if we want to allow it
     * Button text should be variable (Finish vs Next)
     * Ideas for later:
     * - start timer right as the video ends
     * - disable the Next button until the video ends
     */
    render() {
        if (this.state.loaded) {
            var responses = this.state.data.questions.map((q, i) => {
                if (q.type == 0) {
                    return (
                        <TextResponse
                            key={`textresponse${i}`}
                            index={i}
                            handleChange={this.handleResponseChange}
                            question={q.text}
                            response={this.state.textResponses[i].response} />
                    )
                } else {
                    return (
                        <div></div>
                    )
                }
            })

            // if we have the data for the experiment, display it
            return (
                <div>
                    <Row>
                        <Col xs={12}><h4>{`Trial ${this.state.data.trialIndex+1}`}</h4></Col>
                    </Row>
                    <hr />
                    <Row>
                        <Col xs={12} style={{fontSize: 18}}><p>{this.state.data.instructions}</p></Col>
                    </Row>
                    <div className="centered-content">
                        <ReactPlayer url={this.state.data.videoLink} />
                    </div>
                    <hr />
                    {responses}
                    <hr />
                    <div className="centered-content">
                        <Button onClick={this.onSubmit}>Next</Button>
                    </div>
                </div>
            )
        } else {
            // if we are waiting for the server to send the details for the experiment, show the user a spinning circle
            return (
                <LoadingScreen />
            )
        }

    }

}