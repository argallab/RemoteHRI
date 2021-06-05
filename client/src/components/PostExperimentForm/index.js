import React, { Component } from 'react';
import { Row, Col, Form, Button } from 'react-bootstrap';
/**
 * VideoStimulus trial display.  Displays videos and variable number of questions to the user.
 * Additional data expected in addition to VideoStimulus data:
 * trial index (zero-indexed but displayed one-indexed)
 * various function callbacks
 * experiment ID
 * maybe add functionality to add a name for the trial in the admin application and variably display it here
 */
export default class PostExperimentForm extends Component {
    constructor(props) {
        super(props)

        this.state = {
            taskDifficulty1: "",
            taskDifficulty2: "",
            interactionWithRobot1: "",
            interactionWithRobot2: "",
            interactionWithRobot3: "",
            interactionWithRobot4: ""
        }

        this.onSubmit = this.onSubmit.bind(this)
        this.handleChange = this.handleChange.bind(this)
    }


    onSubmit() {
        console.log("onSubmit called from postExperimentQuestionnaire")
        var data = {
            taskDifficulty1: this.state.taskDifficulty1,
            taskDifficulty2: this.state.taskDifficulty2,
            interactionWithRobot1: this.state.interactionWithRobot1,
            interactionWithRobot2: this.state.interactionWithRobot2,
            interactionWithRobot3: this.state.interactionWithRobot3,
            interactionWithRobot4: this.state.interactionWithRobot4
        }
        this.props.submit(data)
    }

    handleChange(e) {
        this.setState({
            [e.target.name]: e.target.value
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
        return (
            <div>
                <h5>Post Task Questionnaire</h5>
                <Form>
                    <Row>
                        <Col md={3}>
                            <Form.Group controlId={`taskDifficulty1`}>
                                <Form.Label>It was easy for me to complete this task.</Form.Label>
                                <Form.Control
                                    as="select"
                                    type="select"
                                    value={this.state.taskDifficulty1}
                                    onChange={this.handleChange}
                                    name="taskDifficulty1">
                                    <option></option>
                                    <option>strongly disagree</option>
                                    <option>disagree</option>
                                    <option>somewhat disagree</option>
                                    <option>neutral</option>
                                    <option>somewhat agree</option>
                                    <option>agree</option>
                                    <option>strongly agree</option>
                                </Form.Control>
                            </Form.Group>
                        </Col>
                        <Col md={3}>
                            <Form.Group controlId={`taskDifficulty2`}>
                                <Form.Label>The tasks were well-defined.</Form.Label>
                                <Form.Control
                                    as="select"
                                    type="select"
                                    value={this.state.taskDifficulty2}
                                    onChange={this.handleChange}
                                    name="taskDifficulty2">
                                    <option></option>
                                    <option>strongly disagree</option>
                                    <option>disagree</option>
                                    <option>somewhat disagree</option>
                                    <option>neutral</option>
                                    <option>somewhat agree</option>
                                    <option>agree</option>
                                    <option>strongly agree</option>
                                </Form.Control>
                            </Form.Group>
                        </Col>
                        <Col md={3}>
                            <Form.Group controlId={`interactionWithRobot1`}>
                                <Form.Label>I found the controls to be intuitive.</Form.Label>
                                <Form.Control
                                    as="select"
                                    type="select"
                                    value={this.state.interactionWithRobot1}
                                    onChange={this.handleChange}
                                    name="interactionWithRobot1">
                                    <option></option>
                                    <option>strongly disagree</option>
                                    <option>disagree</option>
                                    <option>somewhat disagree</option>
                                    <option>neutral</option>
                                    <option>somewhat agree</option>
                                    <option>agree</option>
                                    <option>strongly agree</option>
                                </Form.Control>
                            </Form.Group>
                        </Col>
                        <Col md={3}>
                            <Form.Group controlId={`interactionWithRobot2`}>
                                <Form.Label>The vehicle moved as I intended it to.</Form.Label>
                                <Form.Control
                                    as="select"
                                    type="select"
                                    value={this.state.interactionWithRobot2}
                                    onChange={this.handleChange}
                                    name="interactionWithRobot2">
                                    <option></option>
                                    <option>strongly disagree</option>
                                    <option>disagree</option>
                                    <option>somewhat disagree</option>
                                    <option>neutral</option>
                                    <option>somewhat agree</option>
                                    <option>agree</option>
                                    <option>strongly agree</option>
                                </Form.Control>
                            </Form.Group>
                        </Col>
                        <Col md={3}>
                            <Form.Group controlId={`interactionWithRobot3`}>
                                <Form.Label>It was difficulty to plan how to reach a given goal.</Form.Label>
                                <Form.Control
                                    as="select"
                                    type="select"
                                    value={this.state.interactionWithRobot3}
                                    onChange={this.handleChange}
                                    name="interactionWithRobot3">
                                    <option></option>
                                    <option>strongly disagree</option>
                                    <option>disagree</option>
                                    <option>somewhat disagree</option>
                                    <option>neutral</option>
                                    <option>somewhat agree</option>
                                    <option>agree</option>
                                    <option>strongly agree</option>
                                </Form.Control>
                            </Form.Group>
                        </Col>
                        <Col md={3}>
                            <Form.Group controlId={`interactionWithRobot4`}>
                                <Form.Label>I had a clear view of the objects in the testing environment.</Form.Label>
                                <Form.Control
                                    as="select"
                                    type="select"
                                    value={this.state.interactionWithRobot4}
                                    onChange={this.handleChange}
                                    name="interactionWithRobot4">
                                    <option></option>
                                    <option>strongly disagree</option>
                                    <option>disagree</option>
                                    <option>somewhat disagree</option>
                                    <option>neutral</option>
                                    <option>somewhat agree</option>
                                    <option>agree</option>
                                    <option>strongly agree</option>
                                </Form.Control>
                            </Form.Group>
                        </Col>
                    </Row>

                </Form>
                <hr />
                <div style={{ display: "flex", justifyContent: "center" }}>
                    <Button onClick={this.onSubmit}>Finish Experiment</Button>

                </div>
            </div>
        )

    }

}