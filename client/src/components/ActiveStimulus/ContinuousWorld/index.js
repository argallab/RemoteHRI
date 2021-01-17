import React from 'react'
import TwoDWorld from "../components/TwoDWorld"
import { Row, Col } from 'react-bootstrap'

import AStarNode from '../../../services/AStarNode'
import AStar from '../../../services/AStarPlanning'
var SAT = require('sat');

export default class ContinuousWorld extends React.Component {
    constructor(props) {
        super(props)


        var data = this.props.data

        // width and height of the world
        // eventually should be converted to percentages to allow for variable width and height depending on window size
        this.worldSpecs = {
            width: data.worldWidth,
            height: data.worldHeight,
        }

        var humanSpecs // these variables used for state of the human controlled robot
        var aaSpecs // these variables used for state for the autonomy controlled robot
        if (data.humanAgent) {
            // contains constant values about the human robot. 
            this.humanSpecs = {
                width: data.humanAgent.width,
                height: data.humanAgent.height,
                velocity: data.humanAgent.velocity, // in pixels/second
                angularVelocity: data.humanAgent.angularVelocity,
                halfDiagonal: data.humanAgent.width / 2 * Math.sqrt(2)
            }

            // contains variable values about the human robot, lives in state
            humanSpecs = {
                x: data.humanAgent.x,
                y: data.humanAgent.y,
                angle: data.humanAgent.angle
            }


        }

        if (data.autonomousAgent) {
            // contains constant values about the autonomous robot
            this.aaSpecs = {
                width: data.autonomousAgent.width,
                height: data.autonomousAgent.height,
                velocity: data.autonomousAgent.velocity, // in pixels/second
                angularVelocity: data.autonomousAgent.angularVelocity,
                halfDiagonal: data.autonomousAgent.width / 2 * Math.sqrt(2)
            }

            // contains variable values about the autonomous robot, lives in state
            aaSpecs = {
                x: data.autonomousAgent.x,
                y: data.autonomousAgent.y,
                angle: data.autonomousAgent.angle
            }
        }


        this.goalSpecs = {
            width: data.goalWidth,
            height: data.goalHeight,
            x: data.goalLocationX,
            y: data.goalLocationY,
            angle: data.angle // NOTE: CHECK THIS! -awt 1/21/2021
        }


        this.obstacleSpecs = data.obstacles.map((o) => {
            return (
                {
                    width: o.width,
                    height: o.height,
                    x: o.locationX,
                    y: o.locationY,
                    deltaX: o.deltaX,
                    deltaY: o.deltaY
                }
            )
        })


        this.state = {
            humanSpecs: humanSpecs,
            aaSpecs: aaSpecs,
            postText: "Good job!",
            didWin: false,
            obstacleSpecs: this.obstacleSpecs
        }

        this.lastRender = 0
        this.didWin = false
        this.then = Date.now()
        this.startTime = this.then
        this.start = Date.now()

        this.eventLog = {} // not used, but here for potential future changes/logging
        this.eventList = [] // keeps track of state information at every frame

        this.fpsInterval = 1000 / data.fps // number of milliseconds between each frame
        this.fps = data.fps

        this.sum_e_w = 0 // angular velocity, integral sum term for PID controller
        this.sum_e_v = 0 // velocity, integral sum term for PID controller

        this.world = new SAT.Box(this.point(0, 0), this.worldSpecs.width, this.worldSpecs.height).toPolygon()

        // set up human robot

        if (this.humanSpecs) {
            console.log('in HUMAN')
            var h_deltax = this.humanSpecs.width / 2
            var h_deltay = this.humanSpecs.height / 2
            // specify human robot from the center, and then four points
            this.human = new SAT.Polygon(this.point(this.state.humanSpecs.x, this.state.humanSpecs.y), [this.point(-1 * h_deltax, -1 * h_deltay), this.point(h_deltax, -1 * h_deltay), this.point(h_deltax, h_deltay), this.point(-1 * h_deltax, h_deltay)])
            this.human.setAngle(-1 * this.degreeToRad(this.state.humanSpecs.angle))
            
        }

        // set up aa robot

        if (this.aaSpecs) {
            console.log('in AUTONOMY')
            var a_deltax = this.aaSpecs.width / 2
            var a_deltay = this.aaSpecs.height / 2
            this.aa = new SAT.Polygon(this.point(this.state.aaSpecs.x, this.state.aaSpecs.y), [this.point(-1 * a_deltax, -1 * a_deltay), this.point(a_deltax, -1 * a_deltay), this.point(a_deltax, a_deltay), this.point(-1 * a_deltax, a_deltay)])
            this.aa.setAngle(-1 * this.degreeToRad(this.state.aaSpecs.angle))
        }

        // specify goal from the bottom left corner + width and height
        this.goal = new SAT.Box(this.point(this.goalSpecs.x, this.goalSpecs.y), this.goalSpecs.width, this.goalSpecs.height).toPolygon()
        this.obstacles = this.obstacleSpecs.map((o) => {
            return new SAT.Box(this.point(o.x, o.y), o.width, o.height).toPolygon()
        })

        // how much to approximate the grid when running astar, default value is two
        this.approx = data.gridApproximation ? data.gridApproximation : 2

        this.keys = {}

        this.runGame = this.runGame.bind(this) // runGame is NOT an arrow function. Therefore, we have to use the bind() method. Refer to Why Arrow Functions in  https://www.w3schools.com/react/react_events.asp. If bind is not used inside runGame, the 'this' variable will be undefined.
        this.update = this.update.bind(this)
        this.draw = this.draw.bind(this)
        this.controllerUpdate = this.controllerUpdate.bind(this)

        this.calculateAutonomousPlan = this.calculateAutonomousPlan.bind(this);
        this.updatePlan = this.updatePlan.bind(this)
        this.translatePlan = this.translatePlan.bind(this)
        this.adjustPlan = this.adjustPlan.bind(this)

        this.anyKeysPressed = this.anyKeysPressed.bind(this)

        this.handleKeyPress = this.handleKeyPress.bind(this)
        this.degreeToRad = this.degreeToRad.bind(this)

        this.onWin = this.onWin.bind(this)
        this.onSubmit = this.onSubmit.bind(this)

        this.moveObstacles = this.moveObstacles.bind(this)

        this.plan = []
        this.noCount = 0
        this.started = false
    }

    // set up listeners, start the game and calculate a plan
    componentDidMount() {
        document.addEventListener("keydown", this.handleKeyPress, false);
        document.addEventListener("keyup", this.handleKeyPress, false)
        

        window.requestAnimationFrame(this.runGame)
        this.updatePlan()
    }

    async updatePlan() {
        // calculate plan of the desired motion of the center of the robot
        // reduce that plan to a smaller set of real-world "way points" based on some factor of the robots velocity - ignoring angular velocity
        // console.log("starting calculations")
        if (this.aa) {
            var plan = this.calculateAutonomousPlan()
            plan = this.translatePlan(plan)
            var closestIndex = this.adjustPlan(plan)
            plan = plan.slice(closestIndex)

            return plan
        }
    }

    // finds the index of the plan that has the closest waypoint to the current robots position
    // use this because calculating plan takes a long time - robot could move while calculating the plan from a previous point
    adjustPlan(plan) {
        if (plan.length === 0) return 0
        var minIndex = 0
        var robot = this.aa.pos
        var minDistance = Math.hypot(plan[0].x - robot.x, plan[0].y - robot.y)
        for (var i = 1; i < plan.length; i++) {
            var waypoint = plan[i]
            var dist = Math.hypot(waypoint.x - robot.x, waypoint.y - robot.y)
            if (dist < minDistance) {
                minDistance = dist
                minIndex = i
            }
        }

        return minIndex
    }

    // reduce the size of calculated plan into waypoints
    translatePlan(plan) {
        var approx = this.approx

        var newPlan = []

        var interval = Math.floor(this.aaSpecs.velocity / this.fps) + 1
        var i = interval;
        for (; i < plan.length; i += interval) {
            newPlan.push({ x: plan[i].x * approx, y: plan[i].y * approx })
        }

        if (plan.length % interval != 0) {
            newPlan.push({ x: plan[plan.length - 1].x * approx, y: plan[plan.length - 1].y * approx })
        }

        return newPlan
    }

    // runs A* to calculate a plan
    calculateAutonomousPlan() {
        if (this.aa) {
            var approx = this.approx

            var grid = []
            // reduce the size of the grid, construct grid of all empty cells
            for (var i = 0; i < this.worldSpecs.width / approx; i += 1) {
                var row = []
                for (var j = 0; j < this.worldSpecs.height / approx; j += 1) {
                    row.push(new AStarNode(i, j, false))
                }
                grid.push(row)
            }

            // autonomous agent buffer to not run into walls or obstacles
            var offset = Math.max(this.aaSpecs.width / 2, this.aaSpecs.height / 2, this.aaSpecs.halfDiagonal)


            // mark human robot as occupied
            // inflate the human by half diagonal
            if (this.human) {
                grid[Math.floor(this.human.pos.x / approx)][Math.floor(this.human.pos.y / approx)].isOccupied = true


                for (var i = -1 * Math.floor(this.humanSpecs.halfDiagonal) - offset; i < Math.floor(this.humanSpecs.halfDiagonal) + offset; i++) {
                    for (var j = -1 * Math.floor(this.humanSpecs.halfDiagonal) - offset; j < Math.floor(this.humanSpecs.halfDiagonal) + offset; j++) {
                        if (grid[Math.floor((this.human.pos.x + i) / approx)] && grid[Math.floor((this.human.pos.x + i) / approx)][Math.floor((this.human.pos.y + j) / approx)]) {
                            grid[Math.floor((this.human.pos.x + i) / approx)][Math.floor((this.human.pos.y + j) / approx)].isOccupied = true
                        }
                    }
                }
            }


            // goal specified by bottom left corner
            // mark it false in case the human agent is there
            var goalLocation = {
                x: this.goalSpecs.x + this.goalSpecs.width / 2,
                y: this.goalSpecs.y + this.goalSpecs.height / 2
            }

            grid[Math.floor(goalLocation.x / approx)][Math.floor(goalLocation.y / approx)].isOccupied = false

            // obstacles specified by bottom left corner
            // mark the entire obstacle as well as offset
            for (var o of this.obstacleSpecs) {
                for (var i = o.x - offset; i < o.x + o.width + offset; i += approx) {
                    for (var j = o.y - offset; j < o.y + o.height + offset; j += approx) {
                        if (grid[Math.floor(i / approx)] && grid[Math.floor(i / approx)][Math.floor(j / approx)]) grid[Math.floor(i / approx)][Math.floor(j / approx)].isOccupied = true
                    }
                }
            }

            for (var i = 0; i < this.worldSpecs.width / approx; i++) {
                // stepping through each row of the grid
                if (i < offset / 2 || i >= this.worldSpecs.height / approx - offset / 2) {
                    for (var j = 0; j < this.worldSpecs.width / approx; j++) {
                        if (grid[i][j]) grid[i][j].isOccupied = true
                    }
                }
                else {
                    for (var j = 0; j < offset / 2; j++) {
                        if (grid[i][j]) grid[i][j].isOccupied = true
                    }

                    for (var j = this.worldSpecs.width / approx - offset / 2; j < this.worldSpecs.width / approx; j++) {
                        if (grid[i][j]) grid[i][j].isOccupied = true
                    }
                }

            }


            var planner = new AStar(grid)
            var path = planner.search(grid[Math.floor(this.aa.pos.x / approx)][Math.floor(this.aa.pos.y / approx)], grid[Math.floor(goalLocation.x / approx)][Math.floor(goalLocation.y / approx)], planner.manhattan, true)
            return path
        } else {
            return []
        }

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
            if (this.didWin) {
                // stop the robot from moving in case any residual keys are left
                this.keys = {}

            }
            if (!this.didWin) this.didWin = this.update(progress)
            var didWin = this.didWin


            
            var autoWin = this.aa && SAT.testPolygonPolygon(this.aa, this.goal)
            if (!autoWin && this.aa && this.started) {
                this.controllerUpdate()
            }

            // determine end state - any agents present must be at the goal to win
            var winningState = (this.human && this.aa && didWin && autoWin) || (this.human && didWin && !this.aa) || (!this.human && this.aa && autoWin)

            this.moveObstacles()

            this.draw()


            // create logging event
            var event = {}

            if (this.human) event["human"] = {
                x: this.human.pos.x,
                y: this.human.pos.y,
                angle: this.human.angle
            }

            if (this.aa) event["robot"] = {
                x: this.aa.pos.x,
                y: this.aa.pos.y,
                angle: this.aa.angle
            }

            var isObject = (object) => {
                return object != null && typeof object === 'object';
            }

            var deepEqual = (object1, object2) => {
                const keys1 = Object.keys(object1);
                const keys2 = Object.keys(object2);

                if (keys1.length !== keys2.length) {
                    return false;
                }

                for (const key of keys1) {
                    const val1 = object1[key];
                    const val2 = object2[key];
                    const areObjects = isObject(val1) && isObject(val2);
                    if (
                        areObjects && !deepEqual(val1, val2) ||
                        !areObjects && val1 !== val2
                    ) {
                        return false;
                    }
                }

                return true;
            }


            var pass = false // if no agent has moved, don't relog
            var a = event
            var b = this.eventList[this.eventList.length - 1]
            if (this.eventList.length > 0 && a && b) {
                var humansMatch = true
                if (a.human) {
                    if (JSON.stringify(a.human) != JSON.stringify(b.human)) humansMatch = false
                }

                var robotsMatch = true

                if (a.robot) {
                    if (JSON.stringify(a.robot) != JSON.stringify(b.robot)) robotsMatch = false
                }

                pass = humansMatch && robotsMatch
            }
            
            if (!pass) {
                event.time = now
                this.eventList.push(event)
                
                // handles batching, could change the 100 limit to a variable number based on number of agents
                if (this.eventList.length > 100) {
                    this.props.batchSubmit({answer: this.eventList}, true)
                    this.eventList = []
                }
            }

            
            this.lastRender = timestamp
            if (winningState) {
                // send any remaining events not captured by the batching
                if (this.eventList.length > 0) {
                    this.props.batchSubmit({answer: this.eventList}, true)
                }
                this.onWin()
                return
            }
        }
        window.requestAnimationFrame(this.runGame)
    }

    onWin() {
        //clearTimeout(this.autonomousAgentTimer)
        this.setState({
            didWin: true
        })

        this.onSubmit()
    }

    onSubmit() {
        console.log("onSubmit called from ContinuousWorld")

        var answer = {
            start: this.start,
            keypresses: this.eventList,
            end: Date.now()
        }
        this.props.submit(answer)
    }


    moveObstacles() {

        // works as coded, but corners unfortunate robots
        // only makes practical sense if obstacles move MUCH slower than the robots
        for (var i = 0; i < this.obstacleSpecs.length; i++) {
            var oldPos = {
                x: this.obstacleSpecs[i].x,
                y: this.obstacleSpecs[i].y
            }


            if (this.obstacleSpecs[i].deltaX) {
                var newPos = this.obstacles[i].pos.x + this.obstacleSpecs[i].deltaX / this.fps
                if (newPos < 0) newPos = this.worldSpecs.width
                if (newPos > this.worldSpecs.width) newPos = 0
                this.obstacleSpecs[i].x = newPos
                this.obstacles[i].pos.x = newPos
            }

            if (this.obstacleSpecs[i].deltaY) {
                var newPos = this.obstacles[i].pos.y + this.obstacleSpecs[i].deltaY / this.fps
                if (newPos < 0) newPos = this.worldSpecs.height
                if (newPos > this.worldSpecs.height) newPos = 0
                this.obstacleSpecs[i].y = newPos
                this.obstacles[i].pos.y = newPos

            }

            // if the obstacle will collide with a human or autonomous robot, move it back
            if (this.human && SAT.testPolygonPolygon(this.obstacles[i], this.human)) {
                this.obstacles[i].pos.x = oldPos.x
                this.obstacles[i].pos.y = oldPos.y
                this.obstacleSpecs[i].x = oldPos.x
                this.obstacleSpecs[i].y = oldPos.y
            }

            if (this.aa && SAT.testPolygonPolygon(this.obstacles[i], this.aa)) {
                this.obstacles[i].pos.x = oldPos.x
                this.obstacles[i].pos.y = oldPos.y
                this.obstacleSpecs[i].x = oldPos.x
                this.obstacleSpecs[i].y = oldPos.y
            }
        }
    }

    /**
     * Computes the new state of the game - but DOES NOT CHANGE REACT STATE
     * Returns whether the game is over or not.
     */
    update(progress) {
        if (!this.human) {
            return false
        }

        var keysPressed = this.anyKeysPressed()
        if (keysPressed === "") {
            return false
        }

        // progress is the amount of time that has passed in ms
        var robotVelocity = this.humanSpecs.velocity / this.fps // pixels/frame
        var robotAngularVelocity = this.degreeToRad(this.humanSpecs.angularVelocity / this.fps) // rad/frame

        // theta, x, delta, initial
        var td = 0
        var xd = 0
        var yd = 0
        var ti = this.human.angle
        var xi = this.human.pos.x
        var yi = this.human.pos.y

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
        this.human.setAngle(tf)
        this.human.pos.x = xf
        this.human.pos.y = yf


        // assume we don't collide to start
        var collisionObstacle = false
        for (var o in this.obstacles) {
            collisionObstacle = collisionObstacle || SAT.testPolygonPolygon(this.human, this.obstacles[o])
        }

        if (this.aa) collisionObstacle = collisionObstacle || SAT.testPolygonPolygon(this.human, this.aa)



        var insideBoundary = true
        var response = new SAT.Response()
        var insideBoundary = SAT.testPolygonPolygon(this.human, this.world, response)
        if (!(insideBoundary && response.aInB) || collisionObstacle) {
            // if we have collided or outside the boundaries, reject the movement (revert changes in reverse order) //why is this important for it to be reverse order
            this.human.pos.y = yi
            this.human.pos.x = xi
            this.human.setAngle(ti)
        }


        // return whether we have reached the goal or not
        return SAT.testPolygonPolygon(this.human, this.goal)
    }

    /**
     * Computes change in the autonomous agent using PI controllers for both angular and translational velocity
     * always changes angle
     * only moves forwards if it is ALMOST the right angle
     * 
     * NOTE: Shared control can be implemented in this function by using this.keys to determine user input and then changing the values assigned to this.aa.pos.x and this.aa.pos.y and this.aa.angle
     */
    controllerUpdate() {
        
        // console.log("controller update")

        // angular velocity PID parameters
        var kwp = 0.6
        var kwi = 0.0000001

        // velocity PID paramters
        var kvp = 0.6
        var kvi = 0.0005


        if (this.plan.length > 0) {

            // save original position in case we need to revert
            var originalData = {
                x: this.aa.pos.x,
                y: this.aa.pos.y,
                angle: this.aa.angle
            }

            var waypoint = this.plan[0]

            // console.log("wp", waypoint)
            // console.log("current pos", this.aa.pos)

            var w = {
                x: waypoint.x - this.aa.pos.x,
                y: waypoint.y - this.aa.pos.y
            }

            var waypointV = new SAT.Vector(w.x, w.y)


            var frontVector = (x, y, angle) => {
                var x_d = Math.cos(angle)
                var y_d = Math.sin(angle)
                var hyp = this.aaSpecs.width / 2

                return ({
                    x: x_d * hyp,
                    y: y_d * hyp
                })
            }

            var delta_xy = this.aaSpecs.velocity / this.fps

            var f = frontVector(this.aa.pos.x, this.aa.pos.y, this.aa.angle)

            // console.log("front relative", f.x, f.y)
            // f contains x and y of the front of the robot, relative to the center of the robot
            var theta_robot = Math.atan2(f.y, f.x)
            // console.log("robot angle", theta_robot)


            // console.log("waypoint relative", w.x, w.y)

            var theta_wp = Math.atan2(w.y, w.x)

            // console.log("wp angle", theta_wp)

            var e_t = theta_wp - theta_robot
            if (Math.abs(e_t) > Math.PI) {
                if (e_t > 0) {
                    e_t = e_t - 2 * Math.PI
                } else {
                    e_t = 2 * Math.PI + e_t
                }
            }
            // console.log("error", e_t)

            this.sum_e_w += e_t
            var error_summation = kwi * this.fpsInterval * this.sum_e_w
            // console.log("integral term", error_summation)

            var ang = this.degreeToRad(this.aaSpecs.angularVelocity / this.fps)

            var total_error = kwp * e_t + error_summation
            var flip = false
            if (total_error < 0) flip = true
            // console.log("total error", total_error)

            total_error = Math.min(Math.abs(total_error), ang)
            if (flip) total_error = total_error * -1
            // console.log("changing angle of ", this.aa.angle, "by", total_error)

            this.aa.setAngle(this.aa.angle + total_error)
            // console.log("rotating", total_error)
            if (Math.abs(total_error) < 0.02) {

                var distance = Math.hypot(waypoint.x - this.aa.pos.x, waypoint.y - this.aa.pos.y)
                // console.log("distance: ", distance)

                this.sum_e_v += distance
                var error_summation = kvi * this.fpsInterval * this.sum_e_v



                var total_error = kvp * distance + error_summation
                total_error = Math.min(total_error, this.aaSpecs.velocity / this.fps)
                // console.log("moving", total_error)
                // console.log("moving the robot by", total_error)
                var xd = delta_xy * Math.cos(this.aa.angle)
                var yd = delta_xy * Math.sin(this.aa.angle)
                this.aa.pos.x += xd
                this.aa.pos.y += yd

                var neww = {
                    x: waypoint.x - this.aa.pos.x,
                    y: waypoint.y - this.aa.pos.y
                }

                var newWaypointV = new SAT.Vector(neww.x, neww.y)
                if (Math.acos(newWaypointV.dot(waypointV) / (waypointV.len() * newWaypointV.len())) > 1.57) {
                    this.plan.shift()
                }


            }


            // assume we don't collide to start
            var collisionObstacle = false
            for (var o in this.obstacles) {
                collisionObstacle = collisionObstacle || SAT.testPolygonPolygon(this.aa, this.obstacles[o])
            }

            if (this.human) collisionObstacle = collisionObstacle || SAT.testPolygonPolygon(this.aa, this.human)

            if (collisionObstacle) {
                this.aa.pos.x = originalData.x
                this.aa.pos.y = originalData.y
                this.aa.angle = originalData.angle
            }

            // console.log("calling updateplan")
            this.updatePlan().then((plan) => {
                if (plan.length == 0) {
                    // console.log("plan length is 0")
                    this.noCount++
                    if (this.noCount >= 3) {
                        this.plan = []
                    }
                } else {
                    this.noCount = 0
                    // console.log(plan.length)
                    this.plan = plan
                }
            })

        } else {
            // console.log("calculating plan")
            this.updatePlan().then((plan) => {
                if (plan.length == 0) {
                    // console.log("plan length is 0")
                } else {
                    // console.log(plan.length)
                    this.plan = plan
                }
            })
        }
    }

    /**
     * Updates state of the game in order to re render the screen
     */
    draw() {
        var x_bl
        var y_bl
        var humanSpecs
        var aaSpecs

        var aaX_bl
        var aaY_bl

        if (this.human) {
            x_bl = this.human.pos.x - this.humanSpecs.width * 0.5
            y_bl = this.human.pos.y - this.humanSpecs.height * 0.5
            humanSpecs = {
                x: x_bl,
                y: y_bl,
                angle: -1 * this.radToDegree(this.human.angle)
            }
        }

        if (this.aa) {
            aaX_bl = this.aa.pos.x - this.aaSpecs.width * 0.5
            aaY_bl = this.aa.pos.y - this.aaSpecs.height * 0.5

            aaSpecs = {
                x: aaX_bl,
                y: aaY_bl,
                angle: -1 * this.radToDegree(this.aa.angle)
            }
        }



        this.setState({
            humanSpecs,
            aaSpecs,
            obstacleSpecs: this.obstacleSpecs
        })
    }

    componentWillUnmount() {
        document.removeEventListener("keydown", this.handleKeyPress, false);
        document.removeEventListener("keyup", this.handleKeyPress, false);
    }



    handleKeyPress(event) {
        var validKeys = new Set(["w", "a", "s", "d", "ArrowUp", "ArrowLeft", "ArrowRight", "ArrowDown"])
        if (validKeys.has(event.key)) this.keys[event.key] = event.type === "keydown"
        if (event.type === "keydown") this.started = true

        if (event.type === "keydown") {

            if (!this.eventLog[event.key]) this.eventLog[event.key] = []
            if (event.repeat) {
            } else {
                this.eventLog[event.key].push({
                    start: {
                        time: Date.now(),
                        robot: {
                            x: this.human.pos.x,
                            y: this.human.pos.y,
                            angle: this.human.angle
                        }
                    }
                })

            }
        } else if (event.type === "keyup") {
            if (!this.eventLog[event.key]) return
            this.eventLog[event.key][this.eventLog[event.key].length - 1].end = {
                time: Date.now(),
                robot: {
                    x: this.human.pos.x,
                    y: this.human.pos.y,
                    angle: this.human.angle
                }
            }
        }

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
                            human={this.humanSpecs}
                            humanState={this.state.humanSpecs}
                            aa={this.aaSpecs}
                            aaState={this.state.aaSpecs}

                            goalLocationX={this.goalSpecs.x}
                            goalLocationY={this.goalSpecs.y}
                            goalWidth={this.goalSpecs.width}
                            goalHeight={this.goalSpecs.height}

                            obstacles={this.state.obstacleSpecs}
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