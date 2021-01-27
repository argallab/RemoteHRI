import React, { Component } from 'react';
import { Row, Col } from 'react-bootstrap';
import LoadingScreen from '../../LoadingScreen';
import Grid from '../components/Grid'
import AStarNode from '../../../services/AStarNode'
import AStar from '../../../services/AStarPlanning'

/**
 * VideoStimulus trial display.  Displays videos and variable number of questions to the user.
 * Additional data expected in addition to VideoStimulus data:
 * trial index (zero-indexed but displayed one-indexed)
 * various function callbacks
 * experiment ID
 * maybe add functionality to add a name for the trial in the admin application and variably display it here
 */
export default class DiscreteGridWorld extends Component {
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
        this.calculateAutonomousPlan = this.calculateAutonomousPlan.bind(this)
        this.moveObjects = this.moveObjects.bind(this)
    }

    /**
     * Gets data to render for the experiment.
     * For now just calls hard-coded json data, but eventually will call server route.
     */
    componentDidMount() {
        var json = this.props.data


        json.height = parseInt(json.height);
        json.width = parseInt(json.width)
        json.goalLocationX = parseInt(json.goalLocationX);
        json.goalLocationY = parseInt(json.goalLocationY);

        for (var o of json.obstacles) {
            o.locationX = parseInt(o.locationX)
            o.locationY = parseInt(o.locationY)
        }

        this.obstacles = json.obstacles

        this.plan = []
        this.started = false

        this.tickTime = json.tickTime

        this.start = Date.now()
        this.keypresses = []

        this.visualizeGridLines = json.visualizeGridLines
        this.trialIndex = json.trialIndex
        this.width = json.width
        this.height = json.height

        this.setState({
            goalLocationX: json.goalLocationX,
            goalLocationY: json.goalLocationY,
            obstacles: json.obstacles,
            humanAgent: json.humanAgent,
            autonomousAgent: json.autonomousAgent,
            instructions: json.instructions,
            loaded: true,
            postText: json.postText,
            windowWidth: window.innerWidth,
            windowHeight: window.innerHeight,
            cellWidth: 0,
            cellHeight: 0
        }, () => {


            document.addEventListener("keydown", this.handleKeyPress, false);
            window.addEventListener("resize", this.updateWindowDimensions)
            this.computeGrid()
            this.moveObjects()

            if (this.state.autonomousAgent) {
                this.plan = this.calculateAutonomousPlan()
            }
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

    // Runs A* to calculate the plan
    calculateAutonomousPlan() {
        var grid = []
        for (var i = 0; i < this.width; i++) {
            var row = []
            for (var j = 0; j < this.height; j++) {
                row.push(new AStarNode(i, j, false))
            }
            grid.push(row)
        }


        for (var o of this.obstacles) {
            grid[o.locationX][o.locationY].isOccupied = true
        }

        if (this.state.humanAgent) {
            grid[this.state.humanAgent.x][this.state.humanAgent.y].isOccupied = true
        }

        grid[this.state.goalLocationX][this.state.goalLocationY].isOccupied = false

        var planner = new AStar(grid)
        var path = planner.search(grid[this.state.autonomousAgent.x][this.state.autonomousAgent.y], grid[this.state.goalLocationX][this.state.goalLocationY])
        return path
    }

    // calculates each tick - moves autonomous agent and moves obstacles
    // NOTE: shared control can be implemented in this function by setting up a key listening object, similarly to ContinuousWorld, and then changing the space that the robot moves in to 
    moveObjects() {
        // move the autonomous agent
        var autonomousAgent = this.state.autonomousAgent

        // start moving the aa only when user presses a key
        if (this.started && autonomousAgent) {
            if (this.plan.length === 0) {
                // do nothing
            } else {
                if (!(this.plan[0].x === this.state.goalLocationX && this.plan[0].y === this.state.goalLocationY) && this.state.humanAgent && this.plan[0].x === this.state.humanAgent.x && this.plan[0].y === this.state.humanAgent.y) {
                } else {
                    autonomousAgent = this.plan[0]
                }
            }
        }

        // move the obstacles
        for (var o of this.obstacles) {
            var oldPosition = {
                x: o.locationX,
                y: o.locationY
            }


            var newX = o.deltaX ? oldPosition.x + o.deltaX : oldPosition.x
            var newY = o.deltaY ? oldPosition.y + o.deltaY : oldPosition.y

            if (newX === -1) newX = this.width - 1
            else if (newX === this.width) newX = 0

            if (newY === -1) newY = this.height - 1
            else if (newY === this.height) newY = 0


            var newPosition = {
                x: newX,
                y: newY
            }

            var autoWon = this.state.autonomousAgent && this.state.autonomousAgent.x === this.state.goalLocationX && this.state.autonomousAgent.y === this.state.goalLocationY
            var humanWon = this.state.humanAgent && this.state.humanAgent.x === this.state.goalLocationX && this.state.humanAgent.y === this.state.goalLocationY
            // obstacle can not overlap robots
            if ((this.state.autonomousAgent && !autoWon && newPosition.x === this.state.autonomousAgent.x && newPosition.y === this.state.autonomousAgent.y) || (this.state.humanAgent && !humanWon && newPosition.x === this.state.humanAgent.x && newPosition.y === this.state.humanAgent.y)) {
                newPosition = oldPosition
                // can also do reflection here by flipping velocities
            }

            o.locationX = newPosition.x
            o.locationY = newPosition.y
        }

        this.setState({
            autonomousAgent
        })
        this.computeGrid()
        if (this.state.autonomousAgent){
            this.plan = this.calculateAutonomousPlan()
        }
        this.autonomousAgentTimer = setTimeout(this.moveObjects, this.tickTime)
    }



    /**
     * Need to understand when this function will be called - could run into some bugs later where this listener is not being properly removed
     */
    componentWillUnmount() {
        clearTimeout(this.autonomousAgentTimer)

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

        if (this.state.autonomousAgent) {
            this.keypresses.push({
                keyPress: event.key,
                timestamp: Date.now(),
                state: {
                    humanAgent: this.state.humanAgent,
                    autonomousAgent: {
                        x: this.state.autonomousAgent.x,
                        y: this.state.autonomousAgent.y
                    }
                }
            })
        } else {
            this.keypresses.push({
                keyPress: event.key,
                timestamp: Date.now(),
                state: {
                    humanAgent: this.state.humanAgent
                }
            })
        }

        var oldLocation = this.state.humanAgent
        var newLocation
        if (event.key === "w" || event.key === "ArrowUp") {
            // if the robot is in top row or cell above the robot is an obstacle - invalid move
            if (this.state.humanAgent.y === 0 || this.state.grid[this.state.humanAgent.y - 1][this.state.humanAgent.x] === "O") return;
            

            newLocation = {
                x: oldLocation.x,
                y: oldLocation.y - 1
            }

        } else if (event.key === "s" || event.key === "ArrowDown") {
            // if the robot is in bottom row or cell below the robot is an obstacle - invalid move
            if (this.state.humanAgent.y === this.state.numRows - 1 || this.state.grid[this.state.humanAgent.y + 1][this.state.humanAgent.x] === "O") return;

            newLocation = {
                x: oldLocation.x,
                y: oldLocation.y + 1
            }

        } else if (event.key === "a" || event.key === "ArrowLeft") {
            // if the robot is in left column or cell left of the robot is an obstacle - invalid move
            if (this.state.humanAgent.x === 0 || this.state.grid[this.state.humanAgent.y][this.state.humanAgent.x - 1] === "O") return;

            newLocation = {
                x: oldLocation.x - 1,
                y: oldLocation.y
            }

        } else if (event.key === "d" || event.key === "ArrowRight") {
            // if the robot is in right column or cell right of the robot is an obstacle - invalid move
            if (this.state.humanAgent.x === this.state.numCols - 1 || this.state.grid[this.state.humanAgent.y][this.state.humanAgent.x + 1] === "O") return;

            newLocation = {
                x: oldLocation.x + 1,
                y: oldLocation.y
            }
        }

        if (newLocation && this.state.autonomousAgent) {
            var autoWon = this.state.autonomousAgent.x === this.state.goalLocationX && this.state.autonomousAgent.y === this.state.goalLocationY
            if (!autoWon && newLocation.x === this.state.autonomousAgent.x && newLocation.y === this.state.autonomousAgent.y) newLocation = oldLocation
        }

        this.setState({
            humanAgent: newLocation || oldLocation
        }, () => {
            this.computeGrid()
            if (this.state.autonomousAgent) this.plan = this.calculateAutonomousPlan()
        })
    }

    onWin() {
        if (this.calledWin) {
            return
        }

        this.calledWin = true
        clearTimeout(this.autonomousAgentTimer)

        this.setState({
            didWin: true
        })
    
        this.onSubmit()
    }

    computeGrid() {
        var didWin = false
        var autoWin = false
        if (this.state.humanAgent && this.state.humanAgent.x === this.state.goalLocationX && this.state.humanAgent.y === this.state.goalLocationY) {
            didWin = true
        }

        if (this.state.autonomousAgent && this.state.autonomousAgent.x === this.state.goalLocationX && this.state.autonomousAgent.y === this.state.goalLocationY) {
            autoWin = true
        }


        var winningState = (this.state.humanAgent && this.state.autonomousAgent && didWin && autoWin) || (this.state.humanAgent && didWin && !this.state.autonomousAgent) || (!this.state.humanAgent && this.state.autonomousAgent && autoWin)

        if (winningState) this.onWin()

        var grid = []
        for (var i = 0; i < this.height; i++) {
            var r = []
            for (var j = 0; j < this.width; j++) {
                r.push("X")
            }
            grid.push(r)
        }
        grid[this.state.goalLocationY][this.state.goalLocationX] = "G"

        for (var o of this.obstacles) {
            grid[o.locationY][o.locationX] = "O"
        }

        if (this.state.humanAgent) {
            grid[this.state.humanAgent.y][this.state.humanAgent.x] = "0"
        }

        if (this.state.autonomousAgent) {
            grid[this.state.autonomousAgent.y][this.state.autonomousAgent.x] = "A"
        }

        if (autoWin && didWin) {
            grid[this.state.goalLocationY][this.state.goalLocationX] = "WAH"
        } else if (autoWin) {
            console.log("auto won")
            grid[this.state.goalLocationY][this.state.goalLocationX] = "WA"
        } else if (didWin) {
            grid[this.state.goalLocationY][this.state.goalLocationX] = "WH"
        }



        this.setState({
            grid,
            numRows: this.height,
            numCols: this.width
        })
    }



    onSubmit() {
        console.log("onSubmit called from DiscreteGridWorld")
        var answer = {
            start: this.start,
            keypresses: this.keypresses,
            end: Date.now()
        }
        this.props.submit(answer)
    }

    /**
     * Note - not much freedom in controls with ReactPlayer component, maybe can look into how to do that with this specific component or use a different component later down the road if we want to allow it
     * Button text should be variable (Finish vs Next)
     * Ideas for later:
     * - start timer right as the video ends
     * - disable the Next button until the video ends
     */
    render() {
        /*
        Grid codes:
        "O" means obstacle
        "G" means goal
        "X" means nothing
        0 1 2 3 4 etc. will be robots
        */

        if (this.state.loaded) {
            const cellSize = this.calculateCellSize()
            return (
                <div>
                    <Row>
                        <Col xs={12}><h4>{`Trial ${this.trialIndex + 1}`}</h4></Col>
                    </Row>
                    <hr />
                    <Row>
                        <Col xs={12} style={{ fontSize: 18 }}><p>{this.state.instructions}</p></Col>
                    </Row>

                    <div className="centered-content">
                        <Grid
                            cellSize={cellSize}
                            grid={this.state.grid}
                            numRows={this.state.numRows}
                            numCols={this.state.numCols}
                            visualizeGridLines={this.visualizeGridLines}
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