import React from "react";
import { Row, Col, Form, Button } from 'react-bootstrap';

/**
 * Video Stimulus component that allows researcher to upload or input links to N videos, N >= 1.
 * Allows researcher to specify instructions, number of questions, questions to ask the subject.
 */
export default class DiscreteGridWorld extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            width: 5,
            height: 5,
            goalLocationX: 4,
            goalLocationY: 4,
            obstacles: [
                {
                    label: "",
                    locationX: 2,
                    locationY: 2
                }
            ],
            robotLocationX: 0,
            robotLocationY: 0,
            visualizeGridLines: true,
            instructions: "",
            numObstacles: 1,
            postText: ""
        };

        this.handleChange = this.handleChange.bind(this)
        this.handleObstacleChange = this.handleObstacleChange.bind(this)
        this.onSubmit = this.onSubmit.bind(this)
    }

    /**
     * Handles submission of DiscreteGridWorld form data.
     */
    onSubmit() {
        var req = this.state
        console.log(req)
    }

    /**
     * Handles changes to the form fields using the "name" attribute in the JSX.  If the user is increasing the value of numObstacles, then we must add to the obstacles array in state.  If the user is decreasing the value, we must remove elements.
     * One possible change is that we could initially make the obstacles array of max size, and then the user's obstacles will not get "deleted" if they remove an obstacle.
     * @param {event} e 
     */
    handleChange(e) {
        if (e.target.name == "numObstacles") {
            var copy = this.state.obstacles
            if (e.target.value > this.state.numObstacles) {
                copy.push({ label: "", locationX: 0, locationY: 0 })
            } else if (e < this.state.numObstacles) {
                copy.pop()
            }
            this.setState({
                numObstacles: e.target.value,
                obstacles: copy
            })

        } else {
            const target = e.target
            const name = target.name
            const value = name != "visualizeGridLines" ? target.value : target.checked
            this.setState({
                [name]: value
            })
        }
    }

    /**
     * Handles changes to label or location information for individual obstacles.
     * @param {event} e 
     * @param {int}} i 
     */
    handleObstacleChange(e, i) {
        console.log(e.target.name)
        console.log(e.target.value)
        console.log(i)
        var copy = this.state.obstacles
        copy[i][e.target.name] = e.target.value

        this.setState({
            obstacles: copy
        })
    }



    render() {
        var obstacles = []
        for (var j = 0; j < this.state.numObstacles; j++) {
            var i = j
            obstacles.push(
                <Form.Row key={`obstacle${i}`}>
                    <Col xs={6}>
                        <Form.Group controlId={`obstacle${i}Label`}>
                            <Form.Label>{`Obstacle ${i + 1} label`}</Form.Label>
                            <Form.Control
                                type="text"
                                name="label"
                                value={this.state.obstacles[i].label}
                                onChange={(e) => this.handleObstacleChange(e, i)}
                                placeholder={`Obstacle ${i + 1}`} />
                        </Form.Group>
                    </Col>
                    <Col xs={3}>
                        <Form.Group controlId={`obstacle${i}X`}>
                            <Form.Label>{`Obstacle ${i+1} x-coord`}</Form.Label>
                            <Form.Control
                                type="number"
                                value={this.state.obstacles[i].locationX}
                                onChange={(e) => this.handleObstacleChange(e, i)}
                                name="locationX"
                                placeholder="0" />
                        </Form.Group>
                    </Col>
                    <Col xs={3}>
                        <Form.Group controlId={`obstacle${i}Y`}>
                            <Form.Label>{`Obstacle ${i + 1} y-coord`}</Form.Label>
                            <Form.Control
                                type="number"
                                value={this.state.obstacles[i].locationY}
                                onChange={(e) => this.handleObstacleChange(e, i)}
                                name="locationY"
                                placeholder="0" />
                        </Form.Group>
                    </Col>
                </Form.Row>
            )
        }

        return (
            <div className="stimulus-container">
                <Row>
                    <Col xs={12}>
                        <h4>Create Trial: Discrete Grid World</h4>

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
                                            name="instructions"
                                            value={this.state.instructions}
                                            onChange={this.handleChange}
                                            placeholder="Instructions for trial..." />
                                    </Form.Group>
                                </Col>
                            </Form.Row>
                            <Form.Row>
                                <Col xs={12}>
                                    <Form.Group controlId="postText">
                                        <Form.Label>Text to display after winning</Form.Label>
                                        <Form.Control
                                            as="textarea"
                                            type="text"
                                            name="postText"
                                            value={this.state.postText}
                                            onChange={this.handleChange}
                                            placeholder="Great job, moving on to the next trial..." />
                                    </Form.Group>
                                </Col>
                            </Form.Row>
                            <Form.Row>
                                <Col xs={2}>
                                    <Form.Group controlId="width">
                                        <Form.Label>World Width</Form.Label>
                                        <Form.Control
                                            type="number"
                                            value={this.state.width}
                                            onChange={this.handleChange}
                                            name="width"
                                            placeholder="1" />
                                    </Form.Group>
                                </Col>
                                <Col xs={2}>
                                    <Form.Group controlId="height">
                                        <Form.Label>World Height</Form.Label>
                                        <Form.Control
                                            type="number"
                                            value={this.state.height}
                                            onChange={this.handleChange}
                                            name="height"
                                            placeholder="1" />
                                    </Form.Group>
                                </Col>
                                <Col xs={2}>
                                    <Form.Group controlId="robotLocationX">
                                        <Form.Label>Robot Starting x-coord</Form.Label>
                                        <Form.Control
                                            type="number"
                                            value={this.state.robotLocationX}
                                            onChange={this.handleChange}
                                            name="robotLocationX"
                                            placeholder="0" />
                                        <Form.Text className="text-muted">Using 0 indexing</Form.Text>
                                    </Form.Group>
                                </Col>
                                <Col xs={2}>
                                    <Form.Group controlId="robotLocationY">
                                        <Form.Label>Robot Starting y-coord</Form.Label>
                                        <Form.Control
                                            type="number"
                                            value={this.state.robotLocationY}
                                            name="robotLocationY"
                                            onChange={this.handleChange}
                                            placeholder="0" />
                                        <Form.Text className="text-muted">Using 0 indexing</Form.Text>
                                    </Form.Group>
                                </Col>
                                <Col xs={2}>
                                    <Form.Group controlId="goalLocationX">
                                        <Form.Label>Goal x-coord</Form.Label>
                                        <Form.Control
                                            type="number"
                                            value={this.state.goalLocationX}
                                            onChange={this.handleChange}
                                            name="goalLocationX"
                                            placeholder="0" />
                                        <Form.Text className="text-muted">Using 0 indexing</Form.Text>
                                    </Form.Group>
                                </Col>
                                <Col xs={2}>
                                    <Form.Group controlId="goalLocationY">
                                        <Form.Label>Goal y-coord</Form.Label>
                                        <Form.Control
                                            type="number"
                                            value={this.state.goalLocationY}
                                            name="goalLocationY"
                                            onChange={this.handleChange}
                                            placeholder="0" />
                                        <Form.Text className="text-muted">Using 0 indexing</Form.Text>
                                    </Form.Group>
                                </Col>
                            </Form.Row>
                            <Form.Row>
                                <Col xs={4}>
                                    <Form.Group controlId="visualizeGridLines">
                                        <Form.Label>Visualize Grid Lines</Form.Label>
                                        <Form.Check
                                            type="checkbox"
                                            name="visualizeGridLines"
                                            checked={this.state.visualizeGridLines}
                                            onChange={this.handleChange} />
                                        <Form.Text className="text-muted">Controls whether to display grid lines to subject</Form.Text>
                                    </Form.Group>
                                </Col>
                                <Col xs={4}>
                                    <Form.Group controlId="numObstacles">
                                        <Form.Label>Number of obstacles</Form.Label>
                                        <Form.Control
                                            type="number"
                                            value={this.state.numObstacles}
                                            name="numObstacles"
                                            onChange={this.handleChange}
                                            placeholder="0" />
                                    </Form.Group>
                                </Col>
                            </Form.Row>
                            <hr />
                            {obstacles}
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
        )
    }
}
