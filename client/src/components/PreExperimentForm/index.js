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
export default class PreExperimentForm extends Component {
    constructor(props) {
        super(props)

        this.state = {
            race: "",
            age: "",
            sex: "",
            hand: ""
        }

        this.onSubmit = this.onSubmit.bind(this)
        this.handleChange = this.handleChange.bind(this)
    }


    onSubmit() {
        console.log("onSubmit called from DemographicInfoForm")
        var data = {
            race: this.state.race,
            age: this.state.age,
            sex: this.state.sex,
            hand: this.state.hand
        }
        this.props.startExperiment(data)
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
                <h5>Demographic Information</h5>
                <Form>
                    <Row>
                        <Col md={3}>
                            <Form.Group controlId={`age`}>
                                <Form.Label>Age</Form.Label>
                                <Form.Control
                                    type="number"
                                    value={this.state.age}
                                    onChange={this.handleChange}
                                    name="age"
                                    min="13" />
                            </Form.Group>
                        </Col>
                        <Col md={3}>
                            <Form.Group controlId={`sex`}>
                                <Form.Label>Gender</Form.Label>
                                <Form.Control
                                    as="select"
                                    type="select"
                                    value={this.state.sex}
                                    onChange={this.handleChange}
                                    name="sex"
                                >
                                    <option></option>
                                    <option>Male</option>
                                    <option>Female</option>
                                    <option>Non-binary</option>
                                    <option>Prefer not to answer</option>
                                </Form.Control>
                            </Form.Group>
                        </Col>
                        <Col md={3}>
                            <Form.Group controlId={`race`}>
                                <Form.Label>Race</Form.Label>
                                <Form.Control
                                    as="select"
                                    type="select"
                                    value={this.state.race}
                                    onChange={this.handleChange}
                                    name="race">
                                    <option></option>
                                    <option>American Indian or Alaska Native</option>
                                    <option>Asian</option>
                                    <option>Black or African American</option>
                                    <option>Native Hawaiian or Other Pacific Islander</option>
                                    <option>White</option>
                                    <option>Hispanic or Latino or Spanish Origin</option>
                                    <option>Other</option>
                                    <option>Prefer not to answer</option>
                                </Form.Control>
                            </Form.Group>
                        </Col>
                        <Col md={3}>
                            <Form.Group controlId={`hand`}>
                                <Form.Label>Right or left handed?</Form.Label>
                                <Form.Control
                                    as="select"
                                    type="select"
                                    value={this.state.hand}
                                    onChange={this.handleChange}
                                    name="hand">
                                    <option></option>
                                    <option>Right-handed</option>
                                    <option>Left-handed</option>
                                    <option>Ambidextrous</option>
                                    <option>Prefer not to answer</option>
                                </Form.Control>
                            </Form.Group>
                        </Col>
                    </Row>

                </Form>
                <hr />
                <div style={{ display: "flex", justifyContent: "center" }}>
                    <Button onClick={this.onSubmit}>Start Experiment</Button>

                </div>
            </div>
        )

    }

}