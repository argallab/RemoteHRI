import React from 'react'

let test_bool = true

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

        //var worldgoalPosition
        //if (this.props.goal) {
        //    var worldgoalPosition = {width: this.props.goal.width, height: this.props.goal.height, bottom: this.props.goal.y, left: this.props.goal.x, transform: `rotate(${this.props.goal.angle}deg)`}
        //}

        //var worldgoalPosition = {width: this.props.goal.width, height: this.props.goal.height, bottom: this.props.goal.y, left: this.props.goal.x, transform: `rotate(${this.props.goal.angle}deg)`}

        var worldgoalPosition = {position: "absolute", bottom: this.props.goalLocationY, left: this.props.goalLocationX, width: this.props.goalWidth, height: this.props.goalHeight, transform: `rotate(${this.props.angle}deg)`}
        var worldObstacles = this.props.obstacles.map((o) => <div style={{position: "absolute", width: o.width, height: o.height, bottom: o.y, left: o.x}} className="grid-goal"></div>)
        //<div id="worldgoal" style={worldgoalPosition} src="worldauto.png"  className="grid-goal"></div> (from line 32)
        //{this.props.goal && <img id="worldgoal" style={worldgoalPosition} src="png/robot_cw.png" />}
        if(test_bool) {
            return (
                <div className="world-container">
                    {this.props.human && <img id="worldrobot" style={worldrobotPosition} src="png/robot_fw_bw.png" />}
                    {this.props.aa && <img id="worldauto" style={worldautoPosition} src="worldauto.png" />}
                    {this.props.goal && <img id="worldgoal" style={worldgoalPosition} src="png/robot_cw.png" />}
                    <div id="worldgoal" style={worldgoalPosition} src="png/robot_cw.png"  className="circles"></div>
                    
                    {worldObstacles}
                </div>
            )
        }
        else {
            return (
                <div className="world-container">
                    {this.props.human && <img id="worldrobot" style={worldrobotPosition} src="worldrobot.png" />}
                    {this.props.aa && <img id="worldauto" style={worldautoPosition} src="worldauto.png" />}
                    <div id="worldgoal" style={worldgoalPosition} src="worldauto.png"  className="grid-goal"></div>
                    {worldObstacles}
                </div>
            )
        }
    }
}