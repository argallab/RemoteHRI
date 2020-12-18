import React from 'react'
import TwoDWorld from "../components/TwoDWorld"
import { Row, Col } from 'react-bootstrap'

var SAT = require('sat');

export default class ContinuousWorldDynamic extends React.Component {
    constructor(props){
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
            // contains constant values about the human robot
            this.humanSpecs = {
                width: data.humanAgent.width,
                height: data.humanAgent.height,
                maxLinearVelocity: data.humanAgent.maxLinearVelocity, // in pixels/second
                linearAcceleration: data.humanAgent.linearAcceleration, //in pixels/second/second
                maxAngularVelocity: data.humanAgent.maxAngularVelocity,
                angularAcceleration: data.humanAgent.angularAcceleration,
                halfDiagonal: data.humanAgent.width / 2 * Math.sqrt(2),
                linearMu: data.humanAgent.linearMu,
                rotationMu: data.humanAgent.rotationMu
            }

            // contains variable values about the human robot, lives in state
            humanSpecs = {
                x: data.humanAgent.x,
                y: data.humanAgent.y,
                xv: data.humanAgent.xv,
                yv: data.humanAgent.yv,
                angle: data.humanAgent.angle,
                angularVelocity: data.humanAgent.angularVelocity,
                lv: data.humanAgent.lv
            }

        }

        //skip autonomous agent for the time being

        this.goalSpecs = {
            width: data.goalWidth,
            height: data.goalHeight,
            x: data.goalLocationX,
            y: data.goalLocationY
        }

        // obstacles is a list specified in the json. For eeach element in the obstacle list extracted the following object
        this.obstacleSpecs = data.obstacles.map((o) => {
            return (
                {
                    width: o.width,
                    height: o.height,
                    x: o.locationX,
                    y: o.locationY,
                    deltaX: o.deltaX, //note that if the deltaX is not specifed in the json, then this quantity will be undefined. So, before using it anywhere it needs to be defined.
                    deltaY: o.deltaY
                }
            )
        })


        this.state = {
            humanSpecs: humanSpecs,
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

        //skip PI controller stuff. Only needed for autonomous agent
        this.world = new SAT.Box(this.point(0, 0), this.worldSpecs.width, this.worldSpecs.height).toPolygon()

        if (this.humanSpecs) {
            console.log('in HUMAN')
            var h_deltax = this.humanSpecs.width / 2
            var h_deltay = this.humanSpecs.height / 2
            // specify human robot from the center, and then four points
            this.human = new SAT.Polygon(this.point(this.state.humanSpecs.x, this.state.humanSpecs.y), [this.point(-1 * h_deltax, -1 * h_deltay), this.point(h_deltax, -1 * h_deltay), this.point(h_deltax, h_deltay), this.point(-1 * h_deltax, h_deltay)])
            this.human.setAngle(-1 * this.degreeToRad(this.state.humanSpecs.angle))
            this.human.xv = this.state.humanSpecs.xv //init velocity is zero
            this.human.yv = this.state.humanSpecs.yv //
            this.human.tv = this.state.humanSpecs.angularVelocity
            this.human.lv = this.state.humanSpecs.lv
        }

        // specify goal from the bottom left corner + width and height
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
        this.moveObstacles = this.moveObstacles.bind(this)
        this.plan = []
        this.noCount = 0
        this.started = false
    }

    componentDidMount(){
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
            if(this.didWin){
                this.keys = {}
            }
            if (!this.didWin) this.didWin = this.update(progress)
            var didWin = this.didWin

            // determine end state - human agent present must be at the goal to win
            var winningState = (this.human && didWin) || (this.human && didWin) || !this.human

            this.moveObstacles()

            this.draw()

            //create logging event
            var event = {}

            if (this.human) event["human"] = {
                x: this.human.pos.x,
                y: this.human.pos.y,
                angle: this.human.angle, //potentially add velocity info as well?
                xv: this.human.xv,
                yv: this.human.yv,
                tv: this.human.tv,
                lv: this.human.lv
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

            var pass = false
            var a = event
            var b = this.eventList[this.eventList.length - 1]

            if (this.eventList.length > 0 && a && b){
                var humansMatch = true
                if (a.human){
                    if (JSON.stringify(a.human) != JSON.stringify(b.human)) humansMatch = false
                }

                pass = humansMatch
            }
            if (!pass) { //if pass is false this block will be entered. 
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

    onWin(){
        //clearTimeout(this.autonomousAgentTimer)
        this.setState({
            didWin: true
        })

        this.onSubmit()
    }

    onSubmit(){
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
    updateLinearVelocity(lvi, lvd){
        var lvf = 0.0 // final linear velocity
        lvf = lvi + lvd // update linear velocity, lvi - linear velocity initial, lvd - linear velocity delta
        //apply velocity dependent drag (The param needs tuning)
        if (lvf > 0.0){
            lvf = lvf - this.humanSpecs.linearMu / this.fps
        } else if (lvf < 0.0) {
            lvf = lvf + this.humanSpecs.linearMu / this.fps
        }
        var robotMaxLinearVelocity = this.humanSpecs.maxLinearVelocity /this.fps // max velocity allowed
        lvf = Math.max(-robotMaxLinearVelocity, Math.min(lvf, robotMaxLinearVelocity)) //cap velocity
        var keysPressed = this.anyKeysPressed()
        if (keysPressed === "" && Math.abs(lvf) < 0.0002){ // if no keys are pressed and if the current velocity is less than a threshold make it zero so that the robot completely stops
            lvf = 0.0
        }
        
        return lvf
    }
    updateAngularVelocity(tvi, tvd){
        var tvf //final angular velocity
        tvf = tvi + tvd // update angular velocity, tvi - angular velocity initial, tvd - angular velocity delta
        
        //angular velocity dependent drag
        if (tvf > 0.0){
            tvf = tvf - this.humanSpecs.rotationMu / this.fps
        } else if (tvf < 0.0) {
            tvf = tvf + this.humanSpecs.rotationMu / this.fps
        }
        
        var robotMaxAngularVelocity = this.humanSpecs.maxAngularVelocity / this.fps
        tvf = Math.max(-robotMaxAngularVelocity, Math.min(tvf, robotMaxAngularVelocity)) //cap angular velocity
        var keysPressed = this.anyKeysPressed()
        console.log('TVF', tvf)
        if (keysPressed === "" && Math.abs(tvf) < 0.0002){ // if no keys are pressed and if the current velocity is less than a threshold make it zero so that the robot completely stops rotating
            console.log('ZERO TVF')
            tvf = 0.0
        }
        
        return tvf
    }
    updateRobotPose(xi, yi, ti, lvf, tvf){
        //ti is in radians
        var xf = 0 // final pose and velocity variables
        var yf = 0
        var tf = 0
        var xvf = 0.0
        var yvf = 0.0
        if (tvf != 0.0){ //nonzero angular velocity
            
            xf = xi - (lvf/tvf)*Math.sin(ti) + (lvf/tvf)*Math.sin(ti + tvf)
            yf = yi + (lvf/tvf)*Math.cos(ti) - (lvf/tvf)*Math.cos(ti + tvf)
            tf = ti + tvf
            
        } else if (tvf == 0.0) { // zero angular velocity
            xf = xi + lvf*Math.cos(ti) 
            yf = yi + lvf*Math.sin(ti)
            tf = ti
        }

        //extract component along x and y
        xvf = lvf*Math.cos(tf)
        yvf = lvf*Math.sin(tf)

        var finalPose = {xf, yf, tf, xvf, yvf, lvf, tvf} // collect all relevant return values into an object
        return finalPose
    }
    update(progress){
        if (!this.human) {
            return false
        }

        var keysPressed = this.anyKeysPressed()
        
        //THIS NEEDS FIXING. The reason why this is needed is because, we want to minimize the calls to update to reduce the size of the data being logged. When no interaction happens (measure by key pressed) and when the robot has completely come to a stop, then don't refresh anything
        if (keysPressed === "" && Math.abs(this.human.lv) == 0.0 && Math.abs(this.human.tv) == 0.0) {
            console.log('IN')
            return false
        }

        // progress is the amount of time that has passed in ms
        

        var robotLinearAcceleration = this.humanSpecs.linearAcceleration / this.fps
        var robotAngularAcceleration = this.degreeToRad(this.humanSpecs.angularAcceleration /this.fps)

        // theta, x, delta, initial
        
        var tvd = 0 //delta in angular velocity
        var lvd = 0 //delta in linear velocity (along the current heading)

        //update angular velocity
        if (this.keys["a"] || this.keys["ArrowLeft"]) {
            tvd = robotAngularAcceleration
        } else if (this.keys["d"] || this.keys["ArrowRight"]) {
            tvd = -1 * robotAngularAcceleration
        }
        
        //update linear velocity
        if (this.keys["w"] || this.keys["ArrowUp"]) {
            lvd = robotLinearAcceleration
        } else if (this.keys["s"] || this.keys["ArrowDown"]) {
            lvd = robotLinearAcceleration * -1
        }
        
        var lvi = this.human.lv // get current linear velocity
        var tvi = this.human.tv // get current angular velocity
        
        var lvf = this.updateLinearVelocity(lvi, lvd) //linear velocity along the heading
        var tvf = this.updateAngularVelocity(tvi, tvd)

        var ti = this.human.angle
        var xi = this.human.pos.x
        var yi = this.human.pos.y
        
        var finalPose = this.updateRobotPose(xi, yi, ti, lvf, tvf)

        this.human.setAngle(finalPose.tf)
        this.human.pos.x = finalPose.xf
        this.human.pos.y = finalPose.yf
        this.human.xv = finalPose.xvf
        this.human.yv = finalPose.yvf
        this.human.tv = finalPose.tvf
        this.human.lv = finalPose.lvf

        // assume we don't collide to start
        var collisionObstacle = false
        for (var o in this.obstacles) {
            collisionObstacle = collisionObstacle || SAT.testPolygonPolygon(this.human, this.obstacles[o])
        }

        var insideBoundary = true
        var response = new SAT.Response()
        var insideBoundary = SAT.testPolygonPolygon(this.human, this.world, response)

        if (!(insideBoundary && response.aInB) || collisionObstacle) {
            // if we have collided or outside the boundaries, reject the movement (revert changes in reverse order)
            this.human.pos.y = yi
            this.human.pos.x = xi
            this.human.setAngle(ti)
            this.human.xv = 0.0
            this.human.yv = 0.0
            this.human.tv = 0.0
            this.human.lv = 0.0
        }

        // return whether we have reached the goal or not
        return SAT.testPolygonPolygon(this.human, this.goal)

    }

    /**
     * Updates state of the game in order to re render the screen
     */
    draw() {
        var x_bl
        var y_bl
        var humanSpecs

        if (this.human) {
            x_bl = this.human.pos.x - this.humanSpecs.width * 0.5
            y_bl = this.human.pos.y - this.humanSpecs.height * 0.5
            humanSpecs = {
                x: x_bl,
                y: y_bl,
                xv: this.human.xv,
                yv: this.human.yv,
                lv: this.human.lv,
                angle: -1 * this.radToDegree(this.human.angle),
                angularVelocity: this.human.tv
            }
        }
        this.setState({
            humanSpecs,
            obstacleSpecs: this.obstacleSpecs
        })
    }

    componentWillUnmount() {
        document.removeEventListener("keydown", this.handleKeyPress, false);
        document.removeEventListener("keyup", this.handleKeyPress, false);
    }

    handleKeyPress(event) {
        var validKeys = new Set(["w", "a", "s", "d", "ArrowUp", "ArrowLeft", "ArrowRight", "ArrowDown"])
        var linearKeys = new Set(["w", "s", "ArrowUp", "ArrowDown"])
        var angularKeys = new Set(["a","d","ArrowLeft", "ArrowRight"])
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
                            xv: this.human.xv,
                            yv: this.human.yv,
                            lv: this.human.lv,
                            angle: this.human.angle,
                            angularVelocity: this.human.tv
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
                    xv: this.human.xv,
                    yv: this.human.yv,
                    lv: this.human.lv,
                    angle: this.human.angle,
                    angularVelocity: this.human.tv
                }
            }
            // if (linearKeys.has(event.key)){
            // this.human.xv= 0.0
            // this.human.yv = 0.0
            // }
            // if (angularKeys.has(event.key)){
            //     this.human.tv = 0.0
            // }
            
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