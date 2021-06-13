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

        this.data_tmp = {
            race: "",
            age: "",
            sex: "",
            hand: ""
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
        /* console.log(`   oS -> spp: ${this.state["show_splash_page"]}`)
        console.log(`   oS -> sfp: ${this.state["show_form_page"]}`)
        console.log(`   oS -> stpip: ${this.state["show_training_phase_info_page"]}`)
        console.log(`   oS -> rf: ${this.render_flag}`) */
        // case where questionnaire is fully filled out; triggers pre-training info. page
        if (this.state["show_splash_page"] == false && this.state["show_training_phase_info_page"] == false && this.render_flag == true) { 
           /*  if  {
                if  { */
                    //console.log("onSubmit called from DemographicInfoForm")
                    this.data_tmp = {
                        race: this.state.race,
                        age: this.state.age,
                        sex: this.state.sex,
                        hand: this.state.hand
                    }
                    data = {
                        race: this.state.race,
                        age: this.state.age,
                        sex: this.state.sex,
                        hand: this.state.hand
                    }

                    //this.props.startExperiment(data, this.render_flag)
                    this.render_flag = false;
                    //console.log(this.state["show_training_phase_info_page"])
                    this.setState({"show_form_page": false})
                    this.setState({"show_training_phase_info_page": true})
                    //console.log(this.state["show_training_phase_info_page"])
                    //
/*                 }
            } */
            
        }
        // initial case to trigger rendering of the experiment's splash page
        else if (this.state["show_splash_page"] == true) {
            console.log(`spp onSubmit()`)
            this.render_flag = true;
            this.setState({show_splash_page: false})
            this.setState({show_form_page: true})
            //this.render()
            //this.props.startExperiment(data, this.render_flag)

        }
        /* else if (this.state["show_form_page"] == true) {
            this.render_flag = true;
            //this.render()
            
            //this.props.startExperiment(data, this.render_flag)
        }
 */
        else if (this.state["show_training_phase_info_page"] == true && this.render_flag == false) {
            //if  {
                var data = this.data_tmp
                //console.log(`stpip onSubmit()`)
                this.props.startExperiment(data, this.render_flag)
            //}
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
        /* console.log(`cS -> spp: ${this.state["show_splash_page"]}`)
        console.log(`cS -> sfp: ${this.state["show_form_page"]}`)
        console.log(`cS -> stpip: ${this.state["show_training_phase_info_page"]}`)
        console.log(`cS -> rf: ${this.render_flag}`) */

        //
        if (this.state["show_splash_page"] == false && this.state["show_training_phase_info_page"] == false && this.state["show_form_page"] == true) 
            {
                    if(this.handleValidation()){
                        this.onSubmit();
                        //alert("Form submitted. Thank you!");
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

        // (1) initial case to show splash page
        else if (this.state["show_splash_page"] == true) {
            this.setState({show_splash_page: true})
            //alert("pass through contactSubmit for splash page")
            this.onSubmit()
            //this.render()
        }

        // (3) case to show splash page training phase information
        else if (this.state["show_training_phase_info_page"] == true){
            //this.setState({state: this.state})
            console.log('training phase info page')
            this.setState({show_training_phase_info_page: true})
            
            //alert("training phase info page")
            //this.render()
            this.onSubmit()

        }

        // check for handle validation; i.e., if form was correctly filled out
        else {
            console.log("error encountered")
            /* // case where form is correctly filled out
            if(this.handleValidation()){
                this.setState({show_training_phase_info_page: true})
                this.onSubmit()
                //alert("Form submitted. Thank you!");
                
            }
            // case where form is not correctly filled out
            else{
                let errors_list = Object.keys(this.state.errors)
                var inputErrorStr = `Form contains missing information; please provide appropriate answers. The following questions returned the following ${errors_list.length} errors:`;
                for (var i=0; i < errors_list.length; i++) {
                    var str2add = `${this.state.errors[errors_list[i]]}`
                    var inputErrorStr = `${inputErrorStr} \n ${str2add}`;
                }
                alert(inputErrorStr)
            } */
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

        /* console.log(`      r -> spp: ${this.state["show_splash_page"]}`)
        console.log(`      r -> sfp: ${this.state["show_form_page"]}`)
        console.log(`      r -> stpip: ${this.state["show_training_phase_info_page"]}`)
        console.log(`      r -> rf: ${this.render_flag}`) */
        if (this.state["show_splash_page"] == true){
            return(
            <div>
                <h3>Hello, and thank you for your interest in participating in our study! Participation should take approximately 20-25 minutes to complete.</h3>
                <hr/>
                <h4>Study: Quantifying Control Bias in the Operation of a Virtual Vehicle </h4>
                <h4>Institution: Northwestern University (https://www.northwestern.edu/)</h4>
                <h4>Research Group: argallab (https://www.argallab.northwestern.edu/)</h4>
                <hr/>
                <h3>By participating in this study, you are consenting to allow the research group to collect, analyze, and use data collected during this study (your keypresses throughout the course of this study; your responses to any requests for information/questionnaires presenting within this study) for research purposes. This data will be collected on the local network of the machine you are currently using; after collection, it will be deidentified and stored in the institution’s secure storage. By clicking through to the next page and beginning the study, you are electronically confirming your consent.</h3>
                <hr/>

                <Button onClick={this.contactSubmit}>Start Experiment</Button>
            </div>
            )
        }
        else if (this.state["show_training_phase_info_page"] == true) {
            this.render_flag = false
            return (
                <div>
                    <h3>in this experiment, you'll be moving a virtual vehicle with the WASD keys with your dominant hand to reach a number of different parking spots. The vehicle is represented by a brown, semi-transparent oval with an orange arrow attached. The arrow represents the vehicle's front end (the direction it is pointing). The W and S keys give forward and backward signals; the A and D keys make the vehicle turn. The parking spots are represented as cyan rectangles-they also have orange arrows representing the direction they are facing.</h3>
                    <hr/>
                    <h3>To complete a trial, you need to (1) move the vehicle fully into the parking space, making sure the direction of the orange arrows matches, and (2) slow the vehicle to near-stop alongside these conditions. It is, after all, a parking space-not a drive through! After completing a trial, the vehicle will reset to the center of the screen and the next trial will begin after a brief pause. </h3>
                    <hr/>
                    <h3> in the following training phase, you will be presented with green boundary regions between the vehicle's starting location (center of the screen) and the parking spaces. This boundary is meant to encourage smooth driving, and you should try to stay within the green region as much as possible. That being said, there is no penalty for exiting this region, and you are encouraged to move the vehicle in a way that feels natural to you. </h3>
                    <hr/>
                    <h3> NOTE: in all trials, the goal is not to reach the parking space as fast as possible. Instead, it is to reach the parking space in a smooth manner and in a way that feels natural to you.</h3>
                    <Button onClick={this.contactSubmit}>Start Training</Button>
                </div>
            )
        }
        else {
            return (
                <div>
                    <h2>Demographic Information Survey</h2>
                    <hr/>
                    <Form>
                        <div>  
                        
                            <h5>- Please respond to the following four questions by using the drop-down menus (or by entering your numeric age in years for the question pertaining to age). </h5>
                            <h5>- We are required to collect this information by law. </h5>
                            <h5>- When you're done providing your answers, please click the blue, rectangular "Next" button below.</h5>                           
                        
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
                                        min="13"/>
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
                                        <option>Other/Option not listed</option>
                                        <option>Prefer not to answer</option>
                                    </Form.Control>
                                </Form.Group>
                            </Col>
                        </Row>
                        <Row lg={2}>
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
                        <Button onClick={this.contactSubmit}>Next</Button>

                    </div>
                </div>
            )}

    }

}