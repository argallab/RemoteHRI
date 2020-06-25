import React, { Component } from 'react';
import { Row, Col, Form, Button } from 'react-bootstrap';
import Question from '../../Responses/Question'

/**
 * Video Stimulus component that allows researcher to upload or input links to N videos, N >= 1.
 * Allows researcher to specify instructions, number of questions, questions to ask the subject.
 */
export default class VideoStimulus extends Component {
    constructor(props) {
        super(props)

        this.state = {
            numQs: 1,
            link: "",
            instructions: "",
            questions: [{ text: "", type: "0" }]
        }

        this.onSubmit = this.onSubmit.bind(this)
        this.handleNumQsChange = this.handleNumQsChange.bind(this)
        this.handleResponseTypeChange = this.handleResponseTypeChange.bind(this)
        this.handleQuestionTextChange = this.handleQuestionTextChange.bind(this)

        this.handleChange = this.handleChange.bind(this)
    }

    onSubmit(e) {
        var req = {
            numQuestions: this.state.numQs,
            videoLink: this.state.link,
            instructions: this.state.instructions,
            questions: this.state.questions
        }
        console.log(req)
    }

    handleChange(e) {
        this.setState({
            [e.target.name]: e.target.value
        })
    }


    handleNumQsChange(e) {
        var copy = this.state.questions
        if (e.target.value > this.state.numQs) {
            copy.push({ text: "", type: "0" })
        } else if (e.target.value < this.state.numQs) {
            copy.pop()

        }
        this.setState({
            numQs: e.target.value,
            questions: copy
        })
    }


    handleQuestionTextChange(e, i) {
        var copy = this.state.questions
        copy[i].text = e.target.value
        this.setState({
            questions: copy
        })
    }

    handleResponseTypeChange(e, i) {
        var copy = this.state.questions
        copy[i].type = e.target.value
        this.setState({
            questions: copy
        })
    }


    render() {
        var questions = []
        for (var i = 0; i < this.state.numQs; i++) {
            questions.push(
                <Question
                    key={`question${i}`}
                    onQuestionTextChange={this.handleQuestionTextChange}
                    onResponseTypeChange={this.handleResponseTypeChange}
                    questionText={this.state.questions[i].text}
                    responseType={this.state.questions[i].type}
                    questionNumber={i} />
            )
        }

        return (
            <div className="stimulus-container">
                <Row>
                    <Col xs={12}>
                        <h4>Create Trial: Video Stimulus</h4>

                    </Col>
                </Row>
                <hr />
                <Row>
                    <Col xs={12}>
                        <Form>
                            <Form.Row>
                                <Col xs={12}>
                                    <Form.Group controlId="instructions">
                                        <Form.Label>Trial Instructions</Form.Label>
                                        <Form.Control
                                            as="textarea"
                                            type="text"
                                            value={this.state.instructions}
                                            name="instructions"
                                            onChange={this.handleChange}
                                            placeholder="Instructions for trial..." />
                                    </Form.Group>
                                </Col>
                            </Form.Row>
                            <Form.Row>
                                <Col xs={8}>
                                    <Form.Group controlId="videoLink">
                                        <Form.Label>Video Link</Form.Label>
                                        <Form.Control
                                            type="text"
                                            value={this.state.link}
                                            name="link"
                                            onChange={this.handleChange}
                                            required
                                            placeholder="www.youtube.com" />
                                        <Form.Control.Feedback>At least one video is required.</Form.Control.Feedback>
                                    </Form.Group>
                                </Col>
                                <Col xs={4}>
                                    <Form.Group controlId="numberOfQuestions">
                                        <Form.Label>Number of questions</Form.Label>
                                        <Form.Control
                                            type="number"
                                            value={this.state.numQs}
                                            onChange={this.handleNumQsChange}
                                            name="numQs"
                                            placeholder="0" />
                                    </Form.Group>
                                </Col>
                            </Form.Row>
                            <hr />
                            {questions}
                        </Form>
                    </Col>
                </Row>
                <hr />
                <Row>
                    <Col xs={12}>
                        <Button onClick={this.onSubmit} className="mb-2">Submit</Button>
                    </Col>
                </Row>
            </div>
        );
    }
}