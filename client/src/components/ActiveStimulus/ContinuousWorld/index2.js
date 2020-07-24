import React from 'react'
import TwoDWorld from "../components/TwoDWorld"
import { Row, Col } from 'react-bootstrap'
var SAT = require('sat');

export default class ContinuousWorld2 extends React.Component {
    constructor(props) {
        super(props)



        this.robotSpecs = {
            width: 50,
            height: 50,
            velocity: 250, // in pixels/second
            angularVelocity: 120

        }

        this.robotHalfDiagonal = 0.5 * this.robotSpecs.width * Math.sqrt(2)

        this.goalSpecs = {
            width: 100,
            height: 100,
            x: 200,
            y: 0
        }

        this.obstacleSpecs = [

        ]

        this.state = {
            robotSpecs: {
                x: 250,
                y: 250,
                angle: 0
            }
        }

        this.lastRender = 0
        this.didWin = false

        this.robot = new SAT.Polygon(this.point(this.state.robotSpecs.x, this.state.robotSpecs.y), [this.point(-25, -25), this.point(25, -25), this.point(25, 25), this.point(-25, 25)])
        this.robot.setAngle(-1 * this.degreeToRad(this.state.robotSpecs.angle))
        this.goal = new SAT.Box(this.point(this.goalSpecs.x, this.goalSpecs.y), this.goalSpecs.width, this.goalSpecs.height).toPolygon()
        this.obstacles = []

        this.keys = {}

        this.runGame = this.runGame.bind(this)
        this.update = this.update.bind(this)
        this.draw = this.draw.bind(this)

        this.anyKeysPressed = this.anyKeysPressed.bind(this)

        this.handleKeyPress = this.handleKeyPress.bind(this)
        this.degreeToRad = this.degreeToRad.bind(this)
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
        for (var key in this.keys) {
            if (this.keys[key]) {
                return true
            }
        }
        return false
    }

    /**
     * Main game loop
     */
    runGame(timestamp) {
        var progress = timestamp - this.lastRender

        this.didWin = this.update(progress)
        this.draw()
        this.lastRender = timestamp
        if (this.didWin) {
            console.log("done")
            console.log(this.robot)
            console.log(this.goal)
            return
        }
        window.requestAnimationFrame(this.runGame)


    }

    /**
     * Computes the new state of the game - but DOES NOT CHANGE REACT STATE
     * Returns whether the game is over or not.
     */
    update(progress) {
        if (!this.anyKeysPressed())
        {
            return false
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
            collisionObstacle = SAT.testPolygonPolygon(this.robot, this.obstacles[o])
        }

        if (collisionObstacle) {
            // if we have collided, reject the movement (revert changes in reverse order)
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
    }

    render() {
        return (
            <div>
                <div>
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
                </div>
            </div>
        )
    }
}