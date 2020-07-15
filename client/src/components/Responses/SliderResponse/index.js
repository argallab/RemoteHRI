import React, { Component } from 'react';
import { Row, Col, Form } from 'react-bootstrap';

/**
 * Renders a text response with question text.
 * Expected props: index (int, 0 indexed), question (string), handleChange(e, i) (function), response (string)
 */
export default class SliderResponse extends Component {
    render() {

        return (
            <div>
                <Row>
                    <Col xs={12}>
                        <b>{`Question ${this.props.index + 1}: ${this.props.question}`}</b>
                    </Col>
                </Row>
                <Row style={{ marginTop: 10 }}>
                    <Col xs={12}>
                        <Form>
                            <Form.Group controlId={`sliderresponse${this.props.index}`}>
                                <Form.Label>Your Answer: {this.props.response}</Form.Label>
                                <div style={{ display: "flex", width: "60%", flexDirection: "row", alignItems: "center", justifyContent: "space-between", margin: 10 }}>
                                    <Form.Label>{this.props.minDescription}</Form.Label>
                                    <Form.Control
                                        style={{ width: "90%", height: "30%" }}
                                        type="range"
                                        value={this.props.response}
                                        max={this.props.max}
                                        min={this.props.min}
                                        step="1"
                                        onChange={(e) => this.props.handleChange(e, this.props.index)} >
                                    </Form.Control>
                                    <Form.Label>{this.props.maxDescription}</Form.Label>

                                </div>

                            </Form.Group>
                        </Form>
                    </Col>
                </Row>
                <hr />
            </div>
        )
    }
}