import React, { Component } from 'react';
import { Row, Col, Form, Button } from 'react-bootstrap';

/**
 * Question/response component containing a field to enter a question and select a method of response from the subject.
 * Must be passed functions as props for onChange values.
 * Expected props: onQuestionTextChange(questionNumber) (function), onResponseTypeChange(questionNumber) (function), questionText (string), responseType (int?), questionNumber (int)
 */
export default class Question extends Component {
    render() {
        return (
            <Form.Row>
                <Col xs={9}>
                    <Form.Group controlId="questions">
                        <Form.Label>Question {this.props.questionNumber + 1}</Form.Label>
                        <Form.Control
                            as="textarea"
                            type="text"
                            value={this.props.questionText}
                            onChange={(e) => this.props.onQuestionTextChange(e, this.props.questionNumber)}
                            placeholder={`Enter text for question ${this.props.questionNumber + 1}`} />
                    </Form.Group>
                </Col>
                <Col xs={3}>
                    <Form.Group controlId="type">
                        <Form.Label>Response Type</Form.Label>
                        <Form.Control
                            onChange={(e) => this.props.onResponseTypeChange(e, this.props.questionNumber)}
                            value={this.props.responseType}
                            as="select" >
                            <option value={0}>Text</option>
                            <option value={1}>Audio</option>
                            <option value={2}>Video</option>
                        </Form.Control>
                    </Form.Group>
                </Col>
            </Form.Row>
        );
    }
}