import React from 'react'
import TwoDWorld from "../components/TwoDWorld"
import {Row, Col} from 'react-bootstrap'
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
    }

    degreeToRad(theta) {
        return theta * Math.PI / 180
    }

    point(x, y) {
        return new SAT.Vector(x, y)
    }

    componentDidMount() {


        var robot = new SAT.Box(new SAT.Vector(0, 0), 50, 50).toPolygon()
        var obstacles = [
            new SAT.Box(new SAT.Vector(100,200), 50, 100).toPolygon()
        ]
        var goal = new SAT.Box(new SAT.Vector(650, 650), 50, 50).toPolygon()

        var SATObjects = { obstacles, robot, goal }

        this.setState({
            x: 0,
            y: 0,
            angle: 0,
            velocity: 20,
            angularVelocity: 5,
            SATObjects,
            width: 50,
            height: 50,
            didWin: false,
            trialIndex: 1,
            instructions: "Move the robot to the goal.",
            postText: "You won!",
            obstacles: [
                {
                    locationX: 100,
                    locationY: 200,
                    width: 50,
                    height: 100
                }
            ]
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
        this.computeMovement()
    }


    onWin() {
        this.setState({
            didWin: true
        });
    }

    checkCollisions(robot) {
        for (var o of this.state.SATObjects.obstacles)
        {
            var response = new SAT.Response()
            if (SAT.testPolygonPolygon(robot, o, response))
            {
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

                this.setState({ angle, SATObjects })
                return
            }
            x = x + deltaX
            y = y + deltaY



        } else if (this.keys["s"] || this.keys["ArrowDown"]) {
            var newX = x - deltaX
            var newY = y - deltaY
            if (newX < 0 || newX > 700 || newY < 0 || newY > 700) {

                this.setState({ angle, SATObjects })
                return
            }
            x = x - deltaX
            y = y - deltaY

        }

                
        SATObjects.robot.pos.x = x
        SATObjects.robot.pos.y = y
        if (this.checkCollisions(SATObjects.robot))
        {
            SATObjects.robot.pos.x = oldX
            SATObjects.robot.pos.y = oldY
            x = oldX
            y = oldY
        }

        this.setState({ x, y, angle, SATObjects })
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
                            goalLocationX={650}
                            goalLocationY={650}
                            goalWidth={100}
                            goalHeight={100}
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