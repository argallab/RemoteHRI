import React, { Component } from 'react';
import { Row, Col, Form } from 'react-bootstrap';

/**
 * Renders a text response with question text.
 * Expected props: index (int, 0 indexed), question (string), handleChange(e, i) (function), response (string)
 */
export default class SelectResponse extends Component {
    render() {
        var options = [<option></option>]
        for (var i = 0; i < this.props.options.length; i++) {
            options.push(<option>{this.props.options[i]}</option>)
        }
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
                            <Form.Group controlId={`textresponse${this.props.index}`}>
                                <Form.Control
                                style={{width: "60%"}}
                                    as="select"
                                    type="text"
                                    value={this.props.response}
                                    onChange={(e) => this.props.handleChange(e, this.props.index)}>
                                    {options}
                                </Form.Control>
                            </Form.Group>
                        </Form>
                    </Col>
                </Row>
                <hr />
            </div>
        )
    }
}