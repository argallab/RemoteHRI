import React, { Component } from 'react';
import { Row } from 'react-bootstrap';
/**
 * Cell component that renders a cell in a grid world.
 * States:
 * Empty cell (empty square)
 * Occupied cell (square with a colored robot - circle inside)
 * Obstacle cell (square filled in black)
 * Goal cell (square with a G written inside)
 */
export default class GridMode extends Component {
    render() {
        const rectangleStyle = {
            border: this.props.visualizeGridLines && "1px solid #000",
            width: this.props.cellSize,
            height: this.props.cellSize
        }
        var robotAngle = this.props.angle

        const circleStyle = {
            human: {
                width: 0.6*this.props.cellSize,
                height: 0.6*this.props.cellSize,
                top: 0.2*this.props.cellSize,
                left: 0.2*this.props.cellSize,
                backgroundColor: this.props.robotColor
            },
        }

        const circleStyleWin = {
            human: {
                width: 0.6*this.props.cellSize,
                height: 0.6*this.props.cellSize,
                top: 0.2*this.props.cellSize,
                left: 0.07*this.props.cellSize,
                backgroundColor: "#aaa",
                zIndex: 100
            },
        }

        var gridJsx = []
        for (var i = 0; i < this.props.numRows; i++) {
            var row = []
            for (var j = 0; j < this.props.numCols; j++) {
                if (this.props.grid[i][j] === "O") {
                    row.push(
                        <div key={`cell${i}${j}`} style={rectangleStyle} className="rectangle grid-obstacle">
                        </div>
                    )
                } else if (this.props.grid[i][j] === "G") {
                    row.push(
                        <div key={`cell${i}${j}`} style={rectangleStyle} className="rectangle grid-goal">
                        </div>
                    )
                } else if (this.props.grid[i][j] === "X") {
                    row.push(
                        <div key={`cell${i}${j}`} style={rectangleStyle} className="rectangle grid-empty">
                        </div>
                    )
                } else if (this.props.grid[i][j] === "WH") {
                    row.push(
                        <div key={`cell${i}${j}`} style={rectangleStyle} className="rectangle grid-goal">
                            <div style={circleStyle.human} className="circle">
                                <div key={`cellline${i}${j}`} style={{transform:`rotate(${this.props.angle}deg)`}} className="orientation">
                                </div>
                            </div>
                        </div>
                    )
                } else if (this.props.grid[i][j] === "WAH") {
                    row.push(
                        <div key={`cell${i}${j}`} style={rectangleStyle} className="rectangle grid-goal">
                            <div style={circleStyleWin.human} className="circle"></div>
                        </div>
                    )
                }
                else {
                    row.push(
                        <div key={`cell${i}${j}`} style={rectangleStyle} className="rectangle grid-empty">
                            <div style={circleStyle.human} className="circle">
                                <div key={`cellline${i}${j}`} style={{transform:`rotate(${this.props.angle}deg)`}} className="radius">
                            </div>
                            
                            </div>
                        </div>
                    )
                }
            }
            gridJsx.push(
                <div style={{margin: 0, height: this.props.cellSize}} key={`row${i}`}>{row}</div>
            )
        }

        return (
            <div style={{border: "1px solid #000"}} className="rectangles">
                {gridJsx}
            </div>
        )
    }
}
