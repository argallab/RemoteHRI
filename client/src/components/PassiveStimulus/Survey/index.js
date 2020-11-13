// Code developed by Finley Lau*, Deepak Gopinath*. Copyright (c) 2020. Argallab. (*) Equal contribution
import React, { Component } from 'react';
import { Row, Col } from 'react-bootstrap';
import LoadingScreen from '../../LoadingScreen';
import TextResponse from '../../Responses/TextResponse';
import SliderResponse from '../../Responses/SliderResponse';
import SelectResponse from '../../Responses/SelectResponse';
import OverlayButton from '../../OverlayButton'

/**
 * VideoStimulus trial display.  Displays videos and variable number of questions to the user.
 * Additional data expected in addition to VideoStimulus data:
 * trial index (zero-indexed but displayed one-indexed)
 * various function callbacks
 * experiment ID
 * maybe add functionality to add a name for the trial in the admin application and variably display it here
 */
export default class Survey extends Component {
    constructor(props) {
        super(props)

        this.state = {
            data: {},
            loaded: false,
            textResponses: []
        }

        this.handleResponseChange = this.handleResponseChange.bind(this)
        this.onSubmit = this.onSubmit.bind(this)
        this.checkValidation = this.checkValidation.bind(this)
    }

    /**
     * Gets data to render for the experiment.
     * For now just calls hard-coded json data, but eventually will call server route.
     */
    componentDidMount() {
        var json = this.props.data
        var textResponses = []
        for (var i = 0; i < json.questions.length; i++) {
            if (json.questions[i].type === 2 || json.questions[i].type === "2" || json.questions[i].type === "slider") textResponses.push({response: Math.floor((json.questions[i].min + json.questions[i].max)/2)})
            else textResponses.push({ response: "" })
        }
        this.setState({
            start: Date.now(),
            data: json,
            loaded: true,
            textResponses
        })
    }

    onSubmit() {
        console.log("onSubmit called from Survey")
        var answer = {
            start: this.state.start,
            answers: this.state.textResponses,
            end: Date.now()
        }
        this.props.submit(answer)
    }

    handleResponseChange(e, i) {
        var copy = this.state.textResponses
        copy[i].response = e.target.value
        this.setState({
            textResponses: copy
        })
    }

    checkValidation() {
        for (var i = 0; i < this.state.textResponses.length; i++) {
            if (this.state.textResponses[i].response === "") return false
        }
        return true
    }

    /**
     * Note - not much freedom in controls with ReactPlayer component, maybe can look into how to do that with this specific component or use a different component later down the road if we want to allow it
     * Button text should be variable (Finish vs Next)
     * Ideas for later:
     * - start timer right as the video ends
     * - disable the Next button until the video ends
     */
    render() {
        var buttonDisabled = !this.checkValidation();
        if (this.state.loaded) {
            var responses = this.state.data.questions.map((q, i) => {
                if (q.type === 0 || q.type === "0" || q.type === "text") {
                    return (
                        <TextResponse
                            key={`textresponse${i}`}
                            index={i}
                            handleChange={this.handleResponseChange}
                            question={q.text}
                            response={this.state.textResponses[i].response} />
                    )
                } else if (q.type === 1 || q.type === "1" || q.type === "select") {
                    return (
                        <SelectResponse
                            key={`selectresponse${i}`}
                            index={i}
                            handleChange={this.handleResponseChange}
                            question={q.text}
                            options={q.options}
                            response={this.state.textResponses[i].response} />
                    )

                } else if (q.type === 2 || q.type === "2" || q.type === "slider") {
                    return (
                        <SliderResponse
                            key={`sliderresponse${i}`}
                            index={i}
                            handleChange={this.handleResponseChange}
                            question={q.text}
                            min={q.min}
                            max={q.max}
                            minDescription={q.minDescription}
                            maxDescription={q.maxDescription}
                            response={this.state.textResponses[i].response} />
                    )
                }
                else {
                    return (
                        <div></div>
                    )
                }
            })

            // if we have the data for the experiment, display it
            return (
                <div>
                    <Row>
                        <Col xs={12} style={{ fontSize: 18 }}><p>{this.state.data.instructions}</p></Col>
                    </Row>
                    <hr />
                    {responses}
                    <hr />
                    <div className="centered-content">
                        <OverlayButton disabled={buttonDisabled} text="Submit" tip="Please fill out all fields" onClickHandler={this.onSubmit} />
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

/**
 *                         <OverlayTrigger
                            placement="right"

                            delay={{ show: 250, hide: 400 }}
                            overlay={<RenderTooltip tooltipText="Please fill out all questions" />} >
                            <div style={{display: "inline-block", cursor: "not-allowed"}}><Button disabled={true} onClick={this.onSubmit}>Submit</Button></div>

                        </OverlayTrigger>
 */