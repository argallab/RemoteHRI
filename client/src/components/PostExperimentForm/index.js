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
            interactionWithRobot4: "",
            errors: {}
        }
        
        this.onSubmit = this.onSubmit.bind(this)
        this.handleChange = this.handleChange.bind(this)
        // NOTE: the methods below is adapted from: https://stackoverflow.com/questions/41296668/reactjs-form-input-validation
        this.contactSubmit = this.contactSubmit.bind(this)
        this.handleValidation = this.handleValidation.bind(this)


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

    // NOTE: the method below is adapted from: https://stackoverflow.com/questions/41296668/reactjs-form-input-validation
    contactSubmit(e){
        e.preventDefault();

        

        if(this.handleValidation()){
            this.onSubmit()
            alert("Form submitted. Thank you!");
        }
        else{
            let errors_list = Object.keys(this.state.errors)
            var inputErrorStr = `Form contains missing information; please provide appropriate answers. The following questions returned the following ${errors_list.length} errors:`;
            for (var i=0; i < errors_list.length; i++) {
                var str2add = `${this.state.errors[errors_list[i]]}`
                var inputErrorStr = `${inputErrorStr} \n ${str2add}`;
            }
            alert(inputErrorStr)
        }
    }

    // NOTE: the method below is adapted from: https://stackoverflow.com/questions/41296668/reactjs-form-input-validation
    handleChange(e) { 
        //let fields = this.state;
        //fields[field] = e.target.value;

        this.setState({
            [e.target.name]: e.target.value
        })
    }

    // NOTE: the method below is adapted from: https://stackoverflow.com/questions/41296668/reactjs-form-input-validation
    handleValidation(){
        let fields = this.state;
        let validation_errors = {};
        let formIsValid = true;

        if (fields["taskDifficulty1"] == ""){
            formIsValid = false;
            validation_errors["taskDifficulty1"] = "[Q1] Cannot be empty."
        }
        if (fields["taskDifficulty2"] == ""){
            formIsValid = false;
            validation_errors["taskDifficulty2"] = "[Q2] Cannot be empty."
            
        }
        if (fields["interactionWithRobot1"] == ""){
            formIsValid = false;
            validation_errors["interactionWithRobot1"] = "[Q3] Cannot be empty."
            
        }
        if (fields["interactionWithRobot2"] == ""){
            formIsValid = false;
            validation_errors["interactionWithRobot2"] = "[Q4] Cannot be empty."
            
        }
        if (fields["interactionWithRobot3"] == ""){
            formIsValid = false;
            validation_errors["interactionWithRobot3"] = "[Q5] Cannot be empty."
            
        }
        if (fields["interactionWithRobot4"] == ""){
            formIsValid = false;
            validation_errors["interactionWithRobot4"] = "[Q6] Cannot be empty."
            
        }

        //this.setState({errors: validation_errors});
        this.state.errors = validation_errors;
        return formIsValid;
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
                <h8>Post Task Questionnaire</h8>
                <br/>
                Please provide answers for each of the following (6) questions:
                <br/>

                <Form>
                    <Row>
                        <br/>
                        <Col md={3}>
                            <Form.Group controlId={`[Q1] taskDifficulty1`}>
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
                        {/* </Col>
                        <Col md={3}> */}
                            <Form.Group controlId={`[Q2] taskDifficulty2`}>
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
                        {/* </Col>
                        <Col md={3}> */}
                            <Form.Group controlId={`interactionWithRobot1`}>
                                <Form.Label>I found the controls to be intuitive.</Form.Label>
                                <Form.Control
                                    as="select"
                                    type="select"
                                    value={this.state.interactionWithRobot1}
                                    onChange={this.handleChange}
                                    name="[Q3] interactionWithRobot1">
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
                        {/* </Col>
                        <Col md={3}> */}
                            <Form.Group controlId={`interactionWithRobot2`}>
                                <Form.Label>The vehicle moved as I intended it to.</Form.Label>
                                <Form.Control
                                    as="select"
                                    type="select"
                                    value={this.state.interactionWithRobot2}
                                    onChange={this.handleChange}
                                    name="[Q4] interactionWithRobot2">
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
                        {/* </Col>
                        <Col md={3}> */}
                            <Form.Group controlId={`interactionWithRobot3`}>
                                <Form.Label>It was difficult to plan how to reach a given goal.</Form.Label>
                                <Form.Control
                                    as="select"
                                    type="select"
                                    value={this.state.interactionWithRobot3}
                                    onChange={this.handleChange}
                                    name="[Q5] interactionWithRobot3">
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
                        {/* </Col>
                        <Col md={3}> */}
                            <Form.Group controlId={`interactionWithRobot4`}>
                                <Form.Label>I had a clear view of the objects in the testing environment.</Form.Label>
                                <Form.Control
                                    as="select"
                                    type="select"
                                    value={this.state.interactionWithRobot4}
                                    onChange={this.handleChange}
                                    name="[Q6] interactionWithRobot4">
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
                {/* </Form>
                </Col> */}
            </Row>
            </Form>
                <hr />
                <div style={{ display: "flex", justifyContent: "center" }}>
                    <Button onClick={this.contactSubmit}>Finish Experiment</Button>

                </div>
            </div>
        )

    }

}