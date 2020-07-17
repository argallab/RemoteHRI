import React, { Component } from 'react';
import { Row, Col, Form } from 'react-bootstrap';

/**
 * Renders a text response with question text.
 * Expected props: index (int, 0 indexed), question (string), handleChange(e, i) (function), response (string)
 */
export default class TextResponse extends Component {
    render() {
        return (
            <div>
                <Row>
                    <Col xs={12}>
                        <b>{`Question ${this.props.index+1}: ${this.props.question}`}</b>
                    </Col>
                </Row>
                <Row style={{marginTop: 10}}>
                    <Col xs={12}>
                        <Form>
                            <Form.Group controlId={`textresponse${this.props.index}`}>
                                <Form.Control
                                    as="textarea"
                                    type="text"
                                    value={this.props.response}
                                    onChange={(e) => this.props.handleChange(e, this.props.index)}
                                    placeholder="Type your answer here..." />
                            </Form.Group>
                        </Form>
                    </Col>
                </Row>
                <hr />
            </div>
        )
    }
}