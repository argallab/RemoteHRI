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
            hand: "",
            errors: "",
            show_splash_page: true,
            show_form_page: false,
            show_training_phase_info_page: false
        }

        this.render_flag = false

        this.onSubmit = this.onSubmit.bind(this)
        this.handleChange = this.handleChange.bind(this)
        // NOTE: the methods below is adapted from: https://stackoverflow.com/questions/41296668/reactjs-form-input-validation
        this.contactSubmit = this.contactSubmit.bind(this)
        this.handleValidation = this.handleValidation.bind(this)
        this.render = this.render.bind(this) // check this
    }


    onSubmit() {
        // case where questionnaire is fully filled out; triggers pre-training info. page
        if (this.state["show_splash_page"] == false) { 
            if (this.state["show_training_phase_info_page"] == false) {
                console.log("onSubmit called from DemographicInfoForm")
                this.setState({"show_form_page": false})
                var data = {
                    race: this.state.race,
                    age: this.state.age,
                    sex: this.state.sex,
                    hand: this.state.hand,
                    errors: {}
                }
                this.render_flag = false;
                this.props.startExperiment(data, this.render_flag)
            }
        }
        // initial case to trigger rendering of the experiment's splash page
        else if (this.state["show_splash_page"] == true) {
            this.render_flag = true;
            this.setState({show_splash_page: false})
            this.setState({show_form_page: true})
            //this.render()
            //this.props.startExperiment(data, this.render_flag)

        }
        else if (this.state["show_form_page"] == true) {
            this.render_flag = true;
            //this.render()
            
            //this.props.startExperiment(data, this.render_flag)
        }
        
    }

    handleChange(e) {
        this.setState({
            [e.target.name]: e.target.value
        })
    }
     // NOTE: the method below is adapted from: https://stackoverflow.com/questions/41296668/reactjs-form-input-validation
     contactSubmit(e){
        e.preventDefault();

        if (this.state["show_splash_page"] == false) {
            if (this.state["show_training_phase_info_page"] == false) {
                if (this.state["show_form_page"] == true) {
                    if(this.handleValidation()){
                        this.onSubmit();
                        alert("Form submitted. Thank you!");
                    }
                    else{
                        let errors_list = Object.keys(this.state.errors)
                        var inputErrorStr = `Form contains missing information; please provide appropriate answers. The following questions returned the following ${errors_list.length} errors:`;
                        for (var i=0; i < errors_list.length; i++) {
                            var str2add = `${this.state.errors[errors_list[i]]}`;
                            var inputErrorStr = `${inputErrorStr} \n ${str2add}`;
                        }
                        alert(inputErrorStr)
                    }
                }
            }
        }
        else if (this.state["show_splash_page"] == true) {
            this.setState({show_splash_page: true})
            alert("pass through contactSubmit for splash page")
            this.onSubmit()
            //this.render()
        }

        else if (this.state.show_training_phase_info_page == true){
            this.setState({state: this.state})

            //this.render()

        }

        else {
            if(this.handleValidation()){
                this.setState({show_training_phase_info_page: true})
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

        //
        if (fields["race"] == ""){
            formIsValid = false;
            validation_errors["race"] = "[1] Field cannotbe empty."
        }
        //
        if (fields["sex"] == ""){
            formIsValid = false;
            validation_errors["sex"] = "[2] Field cannot be empty."
            
        }
        //
        if (fields["age"] == ""){
            formIsValid = false;
            validation_errors["age"] = "[3] Field cannot be empty."
            
        }
        /* if (fields["age"].type != "number"){
            formIsValid = false;
            errors["age"] = "Cannot be empty."
            
        } */
        if (fields["age"] <= "13"){
            formIsValid = false;
            validation_errors["age"] = "[3] You must be above the age of 13 to participate in this AMT study."
            
        }

        //
        if (fields["hand"] == ""){
            formIsValid = false;
            validation_errors["hand"] = "[4] Field cannot be empty."
            
        }

        this.setState({errors: validation_errors})
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
        if (this.state["show_splash_page"] == true){
            return(
            <div>
                <h3>Welcome to our experiment! [enter participant statement]</h3>
                <Button onClick={this.contactSubmit}>Start Experiment</Button>
            </div>
            )
        }
        else if (this.state["show_training_phase_info_page"] == true) {
            return (
                <div>
                    <h3>[enter training phase trial instructions for participant]</h3>
                    <Button onClick={this.contactSubmit}>Start Experiment</Button>
                </div>
            )
        }
        else {
            return (
                <div>
                    <h3>Demographic Information Survey</h3>
                    <hr/>
                    <Form>
                        <div class="center">  
                        
                            <h5>- Please respond to the following four questions by using the drop-down menus (or by entering your numeric age in years for the question pertaining to age). </h5>
                            <h5>- We are required to collect this information by law. </h5>
                            <h5>- When you're done providing your answers, please click the blue, rectangular "Start Experiment" button below.</h5>                           
                        
                            {/* <Row>
                                <Col md={8}>    
                                <h5>Please respond to the following four questions by using the drop-down menus. We are required to collect this information by law. When you're done providing your answers, please click the blue, rectangular "Start Experiment" button below.</h5>                           
                                </Col>  
                            </Row> */}
                        </div>
                        <hr/>
                        <Row lg={2}>
                            <Col md={3}>
                                <Form.Group controlId={`age`}>
                                    <Form.Label>[Q1] Age</Form.Label>
                                    <Form.Control
                                        type="number"
                                        value={this.state.age}
                                        onChange={this.handleChange}
                                        name="age"
                                        min="13"
                                        max="150"/>
                                </Form.Group>
                            </Col>
                            <Col md={3}>
                                <Form.Group controlId={`sex`}>
                                    <Form.Label>[Q2] Gender</Form.Label>
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
                                        <option>Non-binary/Non-conforming</option>
                                        <option>Prefer not to answer</option>
                                    </Form.Control>
                                </Form.Group>
                            </Col>
                            <Col md={3}>
                                <Form.Group controlId={`race`}>
                                    <Form.Label>[Q3] Race</Form.Label>
                                    <Form.Control
                                        as="select"
                                        type="select"
                                        name="Race"
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
                                    <Form.Label>[Q4] Right or left handed?</Form.Label>
                                    <Form.Control
                                        as="select"
                                        type="select"
                                        name="Hand"
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
                        <Button onClick={this.contactSubmit}>Start Experiment</Button>

                    </div>
                </div>
            )}

    }

}