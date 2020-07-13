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
            
            width: this.props.cellSize,
            height: this.props.cellSize
        }

        const circleStyle = {
            width: 0.6*this.props.cellSize,
            height: 0.6*this.props.cellSize,
            top: 0.2*this.props.cellSize,
            left: 0.2*this.props.cellSize
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
                } else if (this.props.grid[i][j] === "W") {
                    row.push(
                        <div key={`cell${i}${j}`} style={rectangleStyle} className="rectangle grid-goal">
                            <div style={circleStyle} className="circle"></div>
                        </div>
                    )
                } else {
                    row.push(
                        <div key={`cell${i}${j}`} style={rectangleStyle} className="rectangle grid-empty">
                            <div style={circleStyle} className="circle"></div>
                        </div>
                    )
                }
            }
            gridJsx.push(
                <div style={{margin: 0, height: this.props.cellSize}} key={`row${i}`}>{row}</div>
            )
        }

        return (
            <div className="rectangles">
                {gridJsx}
            </div>
        )
    }
}
