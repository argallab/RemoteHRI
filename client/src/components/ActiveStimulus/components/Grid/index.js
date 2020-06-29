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
    constructor(props) {
        super(props)
    }

    render() {

        var gridJsx = []
        for (var i = 0; i < this.props.numRows; i++) {
            var row = []
            for (var j = 0; j < this.props.numCols; j++) {
                if (this.props.grid[i][j] == "O") {
                    row.push(
                        <div className="rectangle grid-obstacle">
                        </div>
                    )
                } else if (this.props.grid[i][j] == "G") {
                    row.push(
                        <div className="rectangle grid-goal">
                        </div>
                    )
                } else if (this.props.grid[i][j] == "X") {
                    row.push(
                        <div className="rectangle grid-empty">
                        </div>
                    )
                } else if (this.props.grid[i][j] == "W") {
                    row.push(
                        <div className="rectangle grid-goal">
                            <div className="circle"></div>
                        </div>
                    )
                } else {
                    row.push(
                        <div className="rectangle grid-empty">
                            <div className="circle"></div>
                        </div>
                    )
                }
            }
            gridJsx.push(
                <Row>{row}</Row>
            )
        }

        return (
            <div className="rectangles">
                {gridJsx}
            </div>
        )
    }
}