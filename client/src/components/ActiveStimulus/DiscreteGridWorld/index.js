import React, { Component } from 'react';
import { Row, Col } from 'react-bootstrap';
import LoadingScreen from '../../LoadingScreen';
import Grid from '../components/Grid'

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
            didWin: false
        }

        this.onSubmit = this.onSubmit.bind(this)
        this.computeGrid = this.computeGrid.bind(this)
        this.handleKeyPress = this.handleKeyPress.bind(this)
        this.onWin = this.onWin.bind(this)
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
        json.robotLocationX = parseInt(json.robotLocationX)
        json.robotLocationY = parseInt(json.robotLocationY)

        this.setState({
            start: Date.now(),
            keypresses: [],
            width: json.width,
            height: json.height,
            goalLocationX: json.goalLocationX,
            goalLocationY: json.goalLocationY,
            obstacles: json.obstacles,
            robotLocationX: json.robotLocationX,
            robotLocationY: json.robotLocationY,
            visualizeGridLines: json.visualizeGridLines,
            instructions: json.instructions,
            numObstacles: parseInt(json.numObstacles),
            loaded: true,
            trialIndex: json.trialIndex,
            postText: json.postText
        }, () => {
            document.addEventListener("keydown", this.handleKeyPress, false);
            this.computeGrid()
        })
    }

    /**
     * Need to understand when this function will be called - could run into some bugs later where this listener is not being properly removed
     */
    componentWillUnmount() {
        document.removeEventListener("keydown", this.handleKeyPress, false);
    }

    /**
     * Note that (0,0) is location of top left corner.
     * @param {event} event 
     */
    handleKeyPress(event) {
        if (this.state.didWin) {
            return;
        }

        var copy = this.state.keypresses
        copy.push({
            keyPress: event.key,
            timestamp: Date.now(),
            state: {
                robotLocation: {
                    x: this.state.robotLocationX,
                    y: this.state.robotLocationY
                }
            }
        })



        if (event.key === "w" || event.key === "ArrowUp") {
            // if the robot is in top row or cell above the robot is an obstacle - invalid move
            if (this.state.robotLocationY === 0 || this.state.grid[this.state.robotLocationY - 1][this.state.robotLocationX] === "O") {
                this.setState({
                    answer: {
                        keypresses: copy
                    }
                })
                return;
            }
            this.setState({
                answer: {
                    keypresses: copy
                },
                robotLocationY: this.state.robotLocationY - 1
            }, this.computeGrid)
        } else if (event.key === "s" || event.key === "ArrowDown") {
            // if the robot is in bottom row or cell below the robot is an obstacle - invalid move
            if (this.state.robotLocationY === this.state.numRows - 1 || this.state.grid[this.state.robotLocationY + 1][this.state.robotLocationX] === "O") {
                this.setState({
                    answer: {
                        keypresses: copy
                    },
                })
                return;
            }
            this.setState({
                answer: {
                    keypresses: copy
                },
                robotLocationY: this.state.robotLocationY + 1
            }, this.computeGrid)
        } else if (event.key === "a" || event.key === "ArrowLeft") {
            // if the robot is in left column or cell left of the robot is an obstacle - invalid move
            if (this.state.robotLocationX === 0 || this.state.grid[this.state.robotLocationY][this.state.robotLocationX - 1] === "O") {
                this.setState({
                    answer: {
                        keypresses: copy
                    }
                })
                return;
            }
            this.setState({
                answer: {
                    keypresses: copy
                },
                robotLocationX: this.state.robotLocationX - 1
            }, this.computeGrid)
        } else if (event.key === "d" || event.key === "ArrowRight") {
            // if the robot is in right column or cell right of the robot is an obstacle - invalid move
            if (this.state.robotLocationX === this.state.numCols - 1 || this.state.grid[this.state.robotLocationY][this.state.robotLocationX + 1] === "O") {
                this.setState({
                    answer: {
                        keypresses: copy
                    }
                })
                return;
            }
            this.setState({
                answer: {
                    keypresses: copy
                },
                robotLocationX: this.state.robotLocationX + 1
            }, this.computeGrid)
        }
    }

    onWin() {
        this.setState({
            didWin: true
        })
        this.onSubmit()
    }

    computeGrid() {
        var didWin = false
        if (this.state.robotLocationX === this.state.goalLocationX && this.state.robotLocationY === this.state.goalLocationY) {
            didWin = true
            this.onWin()
        }
        var grid = []
        for (var i = 0; i < this.state.height; i++) {
            var r = []
            for (var j = 0; j < this.state.width; j++) {
                r.push("X")
            }
            grid.push(r)
        }

        for (var o of this.state.obstacles) {
            grid[o.locationY][o.locationX] = "O"
        }

        grid[this.state.robotLocationY][this.state.robotLocationX] = "0"
        grid[this.state.goalLocationY][this.state.goalLocationX] = "G"

        if (didWin) {
            grid[this.state.goalLocationY][this.state.goalLocationX] = "W"
        }
        this.setState({
            grid,
            numRows: this.state.height,
            numCols: this.state.width
        })
    }



    onSubmit() {
        console.log("onSubmit called from DiscreteGridWorld")
        var answer = {
            start: this.state.start,
            keypresses: this.state.keypresses,
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
            return (
                <div>
                    <Row>
                        <Col xs={12}><h4>{`Trial ${this.state.trialIndex + 1}`}</h4></Col>
                    </Row>
                    <hr />
                    <Row>
                        <Col xs={12} style={{ fontSize: 18 }}><p>{this.state.instructions}</p></Col>
                    </Row>

                    <div className="centered-content">
                        <Grid
                            grid={this.state.grid}
                            numRows={this.state.numRows}
                            numCols={this.state.numCols}
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