import React from 'react'
import TwoDWorld from "../components/TwoDWorld"
import { Row, Col } from 'react-bootstrap'
var SAT = require('sat');

export default class ContinuousWorld extends React.Component {
    constructor(props) {
        super(props)

        var data = this.props.data

        this.robotSpecs = {
            width: data.width,
            height: data.height,
            velocity: data.velocity, // in pixels/second
            angularVelocity: data.angularVelocity

        }

        this.robotHalfDiagonal = 0.5 * this.robotSpecs.width * Math.sqrt(2)

        this.goalSpecs = {
            width: data.goalWidth,
            height: data.goalHeight,
            x: data.goalLocationX,
            y: data.goalLocationY
        }

        this.obstacleSpecs = data.obstacles.map((o) => {
            return (
                {
                    width: o.width,
                    height: o.height,
                    x: o.locationX,
                    y: o.locationY
                }
            )
        })

        this.state = {
            robotSpecs: {
                x: data.x,
                y: data.y,
                angle: data.angle
            },
            postText: "Good job!",
            didWin: false
        }

        this.lastRender = 0
        this.didWin = false
        this.then = Date.now()
        this.startTime = this.then
        this.start = Date.now()

        this.eventLog = []

        this.fpsInterval = 1000 / data.fps

        this.world = new SAT.Box(this.point(0, 0), 750, 750).toPolygon()
        var deltax = this.robotSpecs.width / 2
        var deltay = this.robotSpecs.height / 2
        this.robot = new SAT.Polygon(this.point(this.state.robotSpecs.x, this.state.robotSpecs.y), [this.point(-1 * deltax, -1 * deltay), this.point(deltax, -1 * deltay), this.point(deltax, deltay), this.point(-1 * deltax, deltay)])
        this.robot.setAngle(-1 * this.degreeToRad(this.state.robotSpecs.angle))
        this.goal = new SAT.Box(this.point(this.goalSpecs.x, this.goalSpecs.y), this.goalSpecs.width, this.goalSpecs.height).toPolygon()
        this.obstacles = this.obstacleSpecs.map((o) => {
            return new SAT.Box(this.point(o.x, o.y), o.width, o.height).toPolygon()
        })

        this.keys = {}

        this.runGame = this.runGame.bind(this)
        this.update = this.update.bind(this)
        this.draw = this.draw.bind(this)

        this.anyKeysPressed = this.anyKeysPressed.bind(this)

        this.handleKeyPress = this.handleKeyPress.bind(this)
        this.degreeToRad = this.degreeToRad.bind(this)

        this.onWin = this.onWin.bind(this)
        this.onSubmit = this.onSubmit.bind(this)
    }

    componentDidMount() {
        document.addEventListener("keydown", this.handleKeyPress, false);
        document.addEventListener("keyup", this.handleKeyPress, false)

        window.requestAnimationFrame(this.runGame)
    }

    degreeToRad(theta) {
        return theta * Math.PI / 180
    }

    radToDegree(theta) {
        return theta * 180 / Math.PI
    }

    point(x, y) {
        return new SAT.Vector(x, y)
    }


    anyKeysPressed() {
        var keys = []
        for (var key in this.keys) {
            if (this.keys[key]) {
                keys.push(key)
            }
        }
        return keys.join(",")
    }

    /**
     * Main game loop
     */
    runGame(timestamp) {

        var now = Date.now()
        var elapsed = now - this.then
        if (elapsed > this.fpsInterval) {
            this.then = now - (elapsed % this.fpsInterval)

            var progress = timestamp - this.lastRender

            this.didWin = this.update(progress)
            this.draw()
            this.lastRender = timestamp
            if (this.didWin) {
                this.onWin()
                document.removeEventListener("keydown", this.handleKeyPress);
                document.removeEventListener("keyup", this.handleKeyPress)
                return
            }
        }
        window.requestAnimationFrame(this.runGame)

    }

    onWin() {
        this.setState({
            didWin: true
        })

        this.onSubmit()
    }

    onSubmit() {
        console.log("onSubmit called from ContinuousWorld")
        var answer = {
            start: this.start,
            keypresses: this.eventLog,
            end: Date.now()
        }
        this.props.submit(answer)
    }

    /**
     * Computes the new state of the game - but DOES NOT CHANGE REACT STATE
     * Returns whether the game is over or not.
     */
    update(progress) {
        var keysPressed = this.anyKeysPressed()
        if (keysPressed === "") {
            return false
        }

        var time = Date.now()
        if (this.eventLog.length > 0 && this.eventLog[this.eventLog.length - 1].keys === keysPressed && time - this.eventLog[this.eventLog.length - 1].lastUpdated < 100) {
            this.eventLog[this.eventLog.length - 1].lastUpdated = time
        } else {
            this.eventLog.push({
                keys: keysPressed,
                time: time,
                lastUpdated: time
            })
        }

        // progress is the amount of time that has passed in ms
        var robotVelocity = this.robotSpecs.velocity / 60 // pixels/frame
        var robotAngularVelocity = this.degreeToRad(this.robotSpecs.angularVelocity / 60) // rad/frame

        // theta, x, delta, initial
        var td = 0
        var xd = 0
        var yd = 0
        var ti = this.robot.angle
        var xi = this.robot.pos.x
        var yi = this.robot.pos.y

        if (this.keys["a"] || this.keys["ArrowLeft"]) {
            td = robotAngularVelocity
        } else if (this.keys["d"] || this.keys["ArrowRight"]) {
            td = -1 * robotAngularVelocity
        }

        // theta final
        var tf = ti + td

        if (this.keys["w"] || this.keys["ArrowUp"]) {
            xd = robotVelocity * Math.cos(tf)
            yd = robotVelocity * Math.sin(tf)
        } else if (this.keys["s"] || this.keys["ArrowDown"]) {
            xd = robotVelocity * -1 * Math.cos(tf)
            yd = robotVelocity * -1 * Math.sin(tf)
        }

        var xf = xi + xd
        var yf = yi + yd


        //this.robot.rotate(td)
        this.robot.setAngle(tf)
        this.robot.pos.x = xf
        this.robot.pos.y = yf


        // assume we don't collide to start
        var collisionObstacle = false
        for (var o in this.obstacles) {
            collisionObstacle = collisionObstacle || SAT.testPolygonPolygon(this.robot, this.obstacles[o])
        }

        var insideBoundary = true
        var response = new SAT.Response()
        var insideBoundary = SAT.testPolygonPolygon(this.robot, this.world, response)
        if (!(insideBoundary && response.aInB) || collisionObstacle) {
            // if we have collided or outside the boundaries, reject the movement (revert changes in reverse order)
            this.robot.pos.y = yi
            this.robot.pos.x = xi
            this.robot.setAngle(ti)
        }
        // return whether we have reached the goal or not
        return SAT.testPolygonPolygon(this.robot, this.goal)
    }

    /**
     * Updates state of the game in order to re render the screen
     */
    draw() {
        var x_bl = this.robot.pos.x - this.robotSpecs.width * 0.5
        var y_bl = this.robot.pos.y - this.robotSpecs.height * 0.5

        this.setState({
            robotSpecs: {
                x: x_bl,
                y: y_bl,
                angle: -1 * this.radToDegree(this.robot.angle)
            }
        })
    }

    componentWillUnmount() {
        document.removeEventListener("keydown", this.handleKeyPress, false);
        document.removeEventListener("keyup", this.handleKeyPress, false);
    }



    handleKeyPress(event) {
        var validKeys = new Set(["w", "a", "s", "d", "ArrowUp", "ArrowLeft", "ArrowRight", "ArrowDown"])
        if (validKeys.has(event.key)) this.keys[event.key] = event.type === "keydown"

        /*
        if (event.type === "keydown")
        {
            if (event.repeat)
            {
                console.log("hold")
            } else {
                console.log("not hold")
            }
        }
        */
    }

    render() {
        return (
            <div>
                <div>
                    <Row>
                        <Col xs={12}><h4>{`Trial ${this.props.data.trialIndex + 1}`}</h4></Col>
                    </Row>
                    <hr />
                    <Row>
                        <Col xs={12} style={{ fontSize: 18 }}><p>{this.props.data.instructions}</p></Col>
                    </Row>
                    <div className="centered-content">
                        <TwoDWorld
                            x={this.state.robotSpecs.x}
                            y={this.state.robotSpecs.y}
                            angle={this.state.robotSpecs.angle}
                            width={this.robotSpecs.width}
                            height={this.robotSpecs.height}

                            goalLocationX={this.goalSpecs.x}
                            goalLocationY={this.goalSpecs.y}
                            goalWidth={this.goalSpecs.width}
                            goalHeight={this.goalSpecs.height}

                            obstacles={this.obstacleSpecs}
                        />
                    </div>
                    <hr />
                    {
                        this.state.didWin &&

                        <div className="centered-content">
                            <p>{this.state.postText}</p>
                        </div>
                    }
                </div>
            </div>
        )
    }
}