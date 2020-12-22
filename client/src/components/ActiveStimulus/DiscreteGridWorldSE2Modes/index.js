import React, { Component } from 'react';
import { Row, Col } from 'react-bootstrap';
import LoadingScreen from '../../LoadingScreen';
import GridSE2Mode from '../components/GridSE2Mode'

export default class DiscreteGridWorldSE2Modes extends Component {
    constructor(props) {
        super(props)

        this.state = {
            loaded: false,
            grid: [],
            numRows: 0,
            numCols: 0, 
            didWin: false,
            windowWidth: 0, 
            windowHeight: 0
        }

        this.onSubmit = this.onSubmit.bind(this)
        this.computeGrid = this.computeGrid.bind(this)
        this.handleKeyPress = this.handleKeyPress.bind(this)
        this.onWin = this.onWin.bind(this)

        this.updateWindowDimensions = this.updateWindowDimensions.bind(this)
        this.calculateCellSize = this.calculateCellSize.bind(this)
        
    }

    componentDidMount() {
        var json = this.props.data

        json.height = parseInt(json.height)
        json.width = parseInt(json.width)
        json.goalLocationX = parseInt(json.goalLocationX)
        json.goalLocationY = parseInt(json.goalLocationY)
        json.goalAngle = parseInt(json.goalAngle)

        for (var o of json.obstacles) {
            o.locationX = parseInt(o.locationX)
            o.locationY = parseInt(o.locationY)
        }

        this.obstacles = json.obstacles
        this.started = false

        this.tickTime = json.tickTime

        this.start = Date.now()
        this.keypresses = []

        this.visualizeGridLines = json.visualizeGridLines
        this.trialIndex = json.trialIndex
        this.width = json.width
        this.height = json.height

        this.numModes = json.numModes //if 2 then 1d control. 
        this.currentMode = json.currentMode //starting mode
        this.modeToColor = {1: "red", 2:"#7FFFD4", 3:"green"} //(x,y,theta) modes

        this.setState({
            goalLocationX: json.goalLocationX,
            goalLocationY: json.goalLocationY,
            goalAngle: json.goalAngle,
            obstacles: json.obstacles,
            humanAgent: json.humanAgent, // starting location fo the human agent
            currentMode: json.currentMode,
            instructions: json.instructions,
            loaded: true,
            postText: json.postText,
            windowWidth: window.innerWidth,
            windowHeight: window.innerHeight,
            cellWidth: 0,
            cellHeight: 0,
            robotColor: this.modeToColor[json.currentMode]
        }, () => {
            document.addEventListener("keydown", this.handleKeyPress, false);
            window.addEventListener("resize", this.updateWindowDimensions)
            this.computeGrid()

        })
        this.calledWin = false
    }

    updateWindowDimensions() {
        this.setState({
            windowWidth: window.innerWidth,
            windowHeight: window.innerHeight
        })
    }

    calculateCellSize() {
        const gw = this.state.windowWidth * .8
        const gh = this.state.windowHeight * .8

        const sizeW = gw / this.width
        const sizeH = gh / this.height

        return Math.min(sizeW, sizeH)

    }


    componentWillUnmount() {
        // clearTimeout(this.autonomousAgentTimer)

        window.removeEventListener("resize", this.updateWindowDimensions)
        document.removeEventListener("keydown", this.handleKeyPress, false);

    }

    /**
     * Note that (0,0) is location of top left corner.
     * @param {event} event 
     */

    handleKeyPress(event) {
        if (!this.state.humanAgent) {
            this.started = !this.started
            return;
        }

        this.started = true

        if (this.state.didWin) {
            return;
        }

        this.keypresses.push({
            keyPress: event.key,
            timestamp: Date.now(),
            state: {
                humanAgent: this.state.humanAgent,
                currentMode: this.state.currentMode
            }
        })
        var oldLocation = this.state.humanAgent
        var oldMode = this.state.currentMode

        var newLocation
        var newAngle
        var newMode = this.state.currentMode
        var robotColor = this.state.robotColor
        console.log(this.state.currentMode)
        if (event.key === "1" && !event.repeat){ 
            newMode = this.state.currentMode - 1 // wrap mode around, decreasing
            if (newMode === 0){
                newMode = this.numModes
            }
        } else if (event.key === "2" && !event.repeat){ //wrap mode around, increasing
            newMode = this.state.currentMode + 1
            if (newMode === this.numModes + 1){
                newMode = 1
            }
        } else if (event.key === "w" || event.key === "ArrowUp") {
            // if the robot is in top row or cell above the robot is an obstacle - invalid move
            if (this.state.currentMode === 2){
                if (this.state.humanAgent.y === 0 || this.state.grid[this.state.humanAgent.y - 1][this.state.humanAgent.x] === "O") return;
                
                newLocation = {
                    x: oldLocation.x,
                    y: oldLocation.y - 1,
                    angle:oldLocation.angle
                }
            } else {
                return
            }

        } else if (event.key === "s" || event.key === "ArrowDown") {
            // if the robot is in bottom row or cell below the robot is an obstacle - invalid move
            if (this.state.currentMode === 2){
                if (this.state.humanAgent.y === this.state.numRows - 1 || this.state.grid[this.state.humanAgent.y + 1][this.state.humanAgent.x] === "O") return;

                newLocation = {
                    x: oldLocation.x,
                    y: oldLocation.y + 1,
                    angle:oldLocation.angle
                }
            }else {
                return
            }

        } else if (event.key === "a" || event.key === "ArrowLeft") {
            // if the robot is in left column or cell left of the robot is an obstacle - invalid move
            if(this.state.currentMode === 1){

                if (this.state.humanAgent.x === 0 || this.state.grid[this.state.humanAgent.y][this.state.humanAgent.x - 1] === "O") return;

                newLocation = {
                    x: oldLocation.x - 1,
                    y: oldLocation.y,
                    angle:oldLocation.angle
                }
            }else if (this.state.currentMode === 3) { //if in rotation
                newLocation = {
                    x: oldLocation.x,
                    y: oldLocation.y,
                    angle: oldLocation.angle - 45
                }
            }else {
                return
            }

        } else if (event.key === "d" || event.key === "ArrowRight") {
            // if the robot is in right column or cell right of the robot is an obstacle - invalid move
            if(this.state.currentMode === 1){
                if (this.state.humanAgent.x === this.state.numCols - 1 || this.state.grid[this.state.humanAgent.y][this.state.humanAgent.x + 1] === "O") return;

                newLocation = {
                    x: oldLocation.x + 1,
                    y: oldLocation.y,
                    angle:oldLocation.angle
                }
            } else if (this.state.currentMode === 3) { //if in rotation
                newLocation = {
                    x: oldLocation.x,
                    y: oldLocation.y,
                    angle: oldLocation.angle + 45
                }
            } else {
                return
            }
        }
        this.setState({
            humanAgent: newLocation || oldLocation,
            currentMode: newMode,
            robotColor: this.modeToColor[newMode]
        }, () => {
            this.computeGrid()
        })
    }

    onWin() {
        if (this.calledWin) {
            return
        }

        this.calledWin = true

        this.setState({
            didWin: true
        })
        this.onSubmit()
    }
    computeGrid() {
        var didWin = false
        if (this.state.humanAgent && this.state.humanAgent.x === this.state.goalLocationX && this.state.humanAgent.y === this.state.goalLocationY) {
            didWin = true
        }

        var winningState = (this.state.humanAgent && didWin) // the humanRobot exists and it down

        if (winningState) this.onWin() //trigger the onin function which will then trigger the onSubmit function

        var grid = []
        for (var i = 0; i < this.height; i++) {
            var r = []
            for (var j = 0; j < this.width; j++) {
                r.push("X")
            }
            grid.push(r)
        }
        //at this stage grid is a list of lists with all X's
        grid[this.state.goalLocationY][this.state.goalLocationX] = "G" // mark the goal cell properly

        for (var o of this.obstacles) {
            grid[o.locationY][o.locationX] = "O" // mark the obstacle cells 
        }

        if (this.state.humanAgent) {
            grid[this.state.humanAgent.y][this.state.humanAgent.x] = "0"
        }

        if (didWin) {
            grid[this.state.goalLocationY][this.state.goalLocationX] = "WH"
        }

        this.setState({
            grid,
            numRows: this.height,
            numCols: this.width
        })
    }
    onSubmit() {
        console.log("onSubmit called from DiscreteGridWorldModes")

        var answer = {
            start: this.start, //start time of the trial
            keypress: this.keypresses,
            end: Date.now() // end time of the trial
        }
        this.props.submit(answer) //props.submit is essentially the submit function handle provided from Content.js which will call the next stimulus. 
    }

    render() {
        // https://stackoverflow.com/questions/38249183/draw-radius-lines-in-circle-with-css
        if(this.state.loaded){
            const cellSize = this.calculateCellSize()
            return (
                <div>
                    <Row>
                        <Col xs={12}><h4>{`Trial ${this.trialIndex + 1}`}</h4></Col>
                    </Row>
                    <Row>
                        <Col xs={12} style={{ fontSize: 18 }}><p>{this.state.instructions}</p></Col>
                    </Row>
                    <Row>
                        <Col xs={12} style={{ fontSize: 18 }}><p>current mode {this.state.currentMode}</p></Col>
                    </Row>

                    <div className="centered-content">
                        <GridSE2Mode
                            cellSize={cellSize}
                            grid={this.state.grid}
                            numRows={this.state.numRows}
                            numCols={this.state.numCols}
                            visualizeGridLines={this.visualizeGridLines}
                            robotColor={this.state.robotColor}
                            angle={this.state.humanAgent.angle}
                        />
                    </div>
                    <hr />
                    {
                        this.state.didWin ?
                            <div className="centered-content">{this.state.postText}</div> :
                            <div></div>
                    }
                </div>
            )
        } else {
            // if we are waiting for the server to send the details for the experiment, show the user a spinning circle
            return (
                <LoadingScreen />
            )
        }
    }
    
}