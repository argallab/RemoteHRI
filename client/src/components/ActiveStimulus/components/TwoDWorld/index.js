// Code developed by Finley Lau*, Deepak Gopinath*. Copyright (c) 2020. Argallab. (*) Equal contribution
import React from 'react'

export default class TwoDWorld extends React.Component {
    render() {
        var worldrobotPosition
        if (this.props.human) {
            var worldrobotPosition = {width: this.props.human.width, height: this.props.human.height, bottom: this.props.humanState.y, left: this.props.humanState.x, transform: `rotate(${this.props.humanState.angle}deg)`}
        }

        var worldautoPosition
        if (this.props.aa) {
            var worldautoPosition = {position: "absolute", width: this.props.aa.width, height: this.props.aa.height, bottom: this.props.aaState.y, left: this.props.aaState.x, transform: `rotate(${this.props.aaState.angle}deg)`}

        }
        var worldgoalPosition = {bottom: this.props.goalLocationY, left: this.props.goalLocationX, width: this.props.goalWidth, height: this.props.goalHeight}
        var worldObstacles = this.props.obstacles.map((o) => <div style={{position: "absolute", width: o.width, height: o.height, bottom: o.y, left: o.x}} className="grid-obstacle"></div>)
        return (
            <div className="world-container">
                {this.props.human && <img id="worldrobot" style={worldrobotPosition} src="worldrobot.png" />}
                {this.props.aa && <img id="worldauto" style={worldautoPosition} src="worldauto.png" />}
                <div id="worldgoal" style={worldgoalPosition} className="grid-goal"></div>
                {worldObstacles}
            </div>
        )
    }
}