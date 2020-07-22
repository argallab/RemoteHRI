import React from 'react'
import TwoDWorld from "../components/TwoDWorld"
import { Row, Col } from 'react-bootstrap'
var SAT = require('sat');

export default class ContinuousWorld extends React.Component {
    constructor(props) {
        super(props)

        this.state = {
            SATObjects: {
                obstacles: [],
                goal: null,
                robot: null
            },
            obstacles: []
        }

        this.keys = {}

        this.handleKeyPress = this.handleKeyPress.bind(this)
        this.computeMovement = this.computeMovement.bind(this)
        this.degreeToRad = this.degreeToRad.bind(this)
        this.onSubmit = this.onSubmit.bind(this)
    }

    degreeToRad(theta) {
        return theta * Math.PI / 180
    }

    point(x, y) {
        return new SAT.Vector(x, y)
    }

    componentDidMount() {

        var json = this.props.data


        var obstacles = json.obstacles

        var robot = new SAT.Box(new SAT.Vector(json.x, json.y), json.width, json.height).toPolygon()
        var SATobstacles = obstacles.map(o => new SAT.Box(new SAT.Vector(o.locationX, o.locationY), o.width, o.height).toPolygon());

        var goal = new SAT.Box(new SAT.Vector(json.goalLocationX, json.goalLocationY), json.goalWidth, json.goalHeight).toPolygon()

        var SATObjects = { obstacles: SATobstacles, robot, goal }

        this.setState({
            start: Date.now(),
            keypresses: [],
            x: json.x,
            y: json.y,
            angle: json.angle,
            velocity: json.velocity,
            angularVelocity: json.angularVelocity,
            SATObjects,
            width: json.width,
            height: json.height,
            didWin: false,
            trialIndex: json.trialIndex,
            instructions: json.instructions,
            postText: json.postText,
            obstacles,
            goalLocationX: json.goalLocationX,
            goalLocationY: json.goalLocationY,
            goalWidth: json.goalWidth,
            goalHeight: json.goalHeight
        }, () => {
            document.addEventListener("keydown", this.handleKeyPress, false);
            document.addEventListener("keyup", this.handleKeyPress, false);
        })

    }

    componentWillUnmount() {
        document.removeEventListener("keydown", this.handleKeyPress, false);
        document.removeEventListener("keyup", this.handleKeyPress, false);
    }

    handleKeyPress(event) {
        this.keys[event.key] = event.type === "keydown"
        if (event.type === "keydown")
        {
            this.computeMovement()
        }
    }


    onSubmit() {
        console.log("onSubmit called from ContinuousGridWorld")
        var answer = {
            start: this.state.start,
            keypresses: this.state.keypresses,
            end: Date.now()
        }
        this.props.submit(answer)
    }


    onWin() {
        this.setState({
            didWin: true
        })
        this.onSubmit()
    }

    checkCollisions(robot) {
        for (var o of this.state.SATObjects.obstacles) {
            var response = new SAT.Response()
            if (SAT.testPolygonPolygon(robot, o, response) && response.overlap > 5) {
                return true
            }
        }
        return false
    }


    computeMovement() {
        var x = this.state.x
        var y = this.state.y
        var angle = this.state.angle

        var SATObjects = this.state.SATObjects

        var response = new SAT.Response()
        var collisionGoal = SAT.testPolygonPolygon(SATObjects.robot, SATObjects.goal)
        if (this.state.didWin || (collisionGoal && response.overlap > 10)) {
            this.onWin()
            return
        }


        var copy = this.state.keypresses
        copy.push({
            keysPressed: {...this.keys},
            timestamp: Date.now(),
            state: {
                robotLocation: {
                    x,
                    y,
                    angle
                }
            }
        })


        if (this.keys["a"] || this.keys["ArrowLeft"]) {
            angle = (angle - this.state.angularVelocity) % 360

        } else if (this.keys["d"] || this.keys["ArrowRight"]) {
            angle = (angle + this.state.angularVelocity % 360)

        }


        var oldX = x;
        var oldY = y;

        var deltaX = (this.state.velocity * Math.cos(this.degreeToRad(angle)))
        var deltaY = (this.state.velocity * Math.sin(this.degreeToRad(angle)))
        if (this.keys["w"] || this.keys["ArrowUp"]) {
            var newX = x + deltaX
            var newY = y + deltaY
            if (newX < 0 || newX > 700 || newY < 0 || newY > 700) {

                this.setState({ keypresses: copy, angle, SATObjects })
                return
            }
            x = x + deltaX
            y = y + deltaY


        } else if (this.keys["s"] || this.keys["ArrowDown"]) {
            var newX = x - deltaX
            var newY = y - deltaY
            if (newX < 0 || newX > 700 || newY < 0 || newY > 700) {

                this.setState({ keypresses: copy, angle, SATObjects })
                return
            }
            x = x - deltaX
            y = y - deltaY

        }


        SATObjects.robot.pos.x = x
        SATObjects.robot.pos.y = y
        if (this.checkCollisions(SATObjects.robot)) {
            SATObjects.robot.pos.x = oldX
            SATObjects.robot.pos.y = oldY
            x = oldX
            y = oldY
        }

        this.setState({ keypresses: copy, x, y, angle, SATObjects })
    }

    render() {
        return (
            <div>
                <div>
                    <Row>
                        <Col xs={12}><h4>{`Trial ${this.state.trialIndex + 1}`}</h4></Col>
                    </Row>
                    <hr />
                    <Row>
                        <Col xs={12} style={{ fontSize: 18 }}><p>{this.state.instructions}</p></Col>
                    </Row>

                    <div className="centered-content">
                        <TwoDWorld
                            x={this.state.x}
                            y={this.state.y}
                            angle={this.state.angle}
                            goalLocationX={this.state.goalLocationX}
                            goalLocationY={this.state.goalLocationY}
                            goalWidth={this.state.goalWidth}
                            goalHeight={this.state.goalHeight}
                            obstacles={this.state.obstacles}
                        />
                    </div>
                    <hr />
                    {
                        this.state.didWin ?
                            <div className="centered-content">{this.state.postText}</div> :
                            <div></div>
                    }
                </div>
            </div>
        )
    }
}