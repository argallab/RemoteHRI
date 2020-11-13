// Code developed by Finley Lau*, Deepak Gopinath*. Copyright (c) 2020. Argallab. (*) Equal contribution
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
export default class Grid extends Component {
    render() {
        const rectangleStyle = {
            border: this.props.visualizeGridLines && "1px solid #000",
            width: this.props.cellSize,
            height: this.props.cellSize
        }

        const circleStyle = {
            human: {
                width: 0.6*this.props.cellSize,
                height: 0.6*this.props.cellSize,
                top: 0.2*this.props.cellSize,
                left: 0.2*this.props.cellSize,
                backgroundColor: "#aaa"
            },
            auto: {
                width: 0.6*this.props.cellSize,
                height: 0.6*this.props.cellSize,
                top: 0.2*this.props.cellSize,
                right: 0.2*this.props.cellSize,
                backgroundColor: "red"
            }
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
            auto: {
                width: 0.6*this.props.cellSize,
                height: 0.6*this.props.cellSize,
                top: 0.2*this.props.cellSize,
                right: 0.07*this.props.cellSize,
                backgroundColor: "red"
            }
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
                } else if (this.props.grid[i][j] === "WA" || this.props.grid[i][j] === "WH") {
                    row.push(
                        <div key={`cell${i}${j}`} style={rectangleStyle} className="rectangle grid-goal">
                            <div style={this.props.grid[i][j] === "WA" ? circleStyle.auto : circleStyle.human} className="circle"></div>
                        </div>
                    )
                } else if (this.props.grid[i][j] === "WAH") {
                    row.push(
                        <div key={`cell${i}${j}`} style={rectangleStyle} className="rectangle grid-goal">
                            <div style={circleStyleWin.human} className="circle"></div>
                            <div style={circleStyleWin.auto} className="circle"></div>
                        </div>
                    )
                }
                else {
                    row.push(
                        <div key={`cell${i}${j}`} style={rectangleStyle} className="rectangle grid-empty">
                            <div style={this.props.grid[i][j] === "A" ? circleStyle.auto : circleStyle.human} className="circle"></div>
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
