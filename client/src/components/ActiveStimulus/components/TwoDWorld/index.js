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
        var worldgoalPositionVar = {bottom: this.props.goalLocationY, left: this.props.goalLocationX, width: this.props.goalWidth, height: this.props.goalHeight, transform: `rotate(${this.props.angle}deg)`}

        var worldObstacles = this.props.obstacles.map((o) => <div style={{position: "absolute", width: o.width, height: o.height, bottom: o.y, left: o.x}} className="grid-goal"></div>)
        
        
        //<div id="worldgoal" style={worldgoalPosition} src="worldauto.png"  className="grid-goal"></div> (from line 32)
        //{this.props.goal && <img id="worldgoal" style={worldgoalPosition} src="png/robot_cw.png" />}
        //{this.props.goal && <img id="worldgoal" style={worldgoalPosition} src="png/robot_cw.png" className="circle" />}
        if (test_bool) {
            // cw case
            if (this.props.human.angularVelocity > 1 && Math.abs(this.props.human.lv) <= 1){
                return (
                    
                    <div className="world-container">
                        
                        
                        <div>
                        
                            {this.props.goals && <img id="worldgoal" style={worldgoalPositionVar} src="png/robot_cw.png" />}
                            <img id="worldgoalcell" style={worldgoalPosition} src="png/robot_cw.png"  alt="goal_cell" className="grid-goal"/>                      
                        </div>
                        
                        

                        {this.props.human && <img id="worldrobot" style={worldrobotPosition} src="png/robot_fw_bw.png" />}
                        {this.props.aa && <img id="worldauto" style={worldautoPosition} src="worldauto.png" />}
                        
                        
                        {worldObstacles}
                    </div>
            
            )
            }
            // fwr case
            if (this.props.human.angularVelocity > 1 && this.props.human.lv > 1){
                return (
                    
                    <div className="world-container">
                        
                        
                        <div>
                        
                            {this.props.goals && <img id="worldgoal" style={worldgoalPositionVar} src="png/robot_fw_bw.png" />}
                            <img id="worldgoalcell" style={worldgoalPosition} src="png/robot_fwr_bwl.png" alt="goal_cell" className="grid-goal"/>                      
                        </div>
                        
                        

                        {this.props.human && <img id="worldrobot" style={worldrobotPosition} src="png/robot_fwr_bwl.png" />}
                        {this.props.aa && <img id="worldauto" style={worldautoPosition} src="worldauto.png" />}
                        
                        
                        {worldObstacles}
                    </div>
            
            )
            }
            // bwr case
            if (this.props.human.angularVelocity > 1 && this.props.human.lv < -1){
                return (
                    
                    <div className="world-container">
                        
                        
                        <div>
                        
                            {this.props.goals && <img id="worldgoal" style={worldgoalPositionVar} src="png/robot_fw_bw.png" />}
                            <img id="worldgoalcell" style={worldgoalPosition} src="png/robot_fw_bw" alt="goal_cell" className="grid-goal"/>                      
                        </div>

                        {this.props.human && <img id="worldrobot" style={worldrobotPosition} src="png/robot_fwl_bwr.png" alt="user_icon"/>}
        
                    </div>
            
            )
            }
            // ccw case
            if (this.props.human.angularVelocity < -1 && Math.abs(this.props.human.lv) <= 1){
                return (
                    
                    <div className="world-container">
                        
                        
                        <div>
                        
                            {this.props.goals && <img id="worldgoal" style={worldgoalPositionVar} src="png/robot_fw_bw.png" />}
                            <img id="worldgoalcell" style={worldgoalPosition} src="png/robot_fw_bw" alt="goal_cell" className="grid-goal"/>                      
                        </div>

                        {this.props.human && <img id="worldrobot" style={worldrobotPosition} src="png/robot_ccw.png" alt="user_icon" />}

                    </div>
            
            )
            }
            // fwl case
            else if (this.props.human.angularVelocity < -1 && this.props.human.lv > 1){
                return (
                    
                    <div className="world-container">
                        
                        
                        <div>
                        
                            {this.props.goals && <img id="worldgoal" style={worldgoalPositionVar} src="png/robot_fw_bw.png" />}
                            <img id="worldgoalcell" style={worldgoalPosition} src="png/robot_fw_bw.png" alt="goal_cell" className="grid-goal"/>                      
                        </div>


                        {this.props.human && <img id="worldrobot" style={worldrobotPosition} src="png/robot_fwl_bwr.png" alt="user_icon"/>}

                    </div>
            
            )
            }
            // bwl case
            else if (this.props.human.angularVelocity < -1 && this.props.human.lv < -1){
                return (
                    
                    <div className="world-container">
                        
                        
                        <div>
                        
                            {this.props.goals && <img id="worldgoal" style={worldgoalPositionVar} src="png/robot_fw_bw.png" />}
                            <img id="worldgoalcell" style={worldgoalPosition} src="png/robot_fw_bw.png" alt="goal_cell" className="grid-goal"/>                      
                        </div>
                        
                        {this.props.human && <img id="worldrobot" style={worldrobotPosition} src="png/robot_fwr_bwl.png" alt="user_icon"/>}

                    </div>
            
            )
            }
            // fw case
            else if (Math.abs(this.props.human.angularVelocity) <= 1 && this.props.human.lv < -1){
                return (
                    
                    <div className="world-container">
                        
                        
                        <div>
                        
                            {this.props.goals && <img id="worldgoal" style={worldgoalPositionVar} src="png/robot_fw_bw.png" />}
                            <img id="worldgoalcell" style={worldgoalPosition} src="png/robot_fw_bw.png" alt="goal_cell" className="grid-goal"/>                      
                        </div>

                        {this.props.human && <img id="worldrobot" style={worldrobotPosition} src="png/robot_fw_bw.png" alt="user_icon"/>}

                    </div>
            
            )
            }
            // bw case
            else if (Math.abs(this.props.human.angularVelocity) <= 1 && this.props.human.lv < -1){
                return (
                    
                    <div className="world-container">
                        
                        
                        <div>
                        
                            {this.props.goals && <img id="worldgoal" style={worldgoalPositionVar} src="png/robot_fw_bw.png" />}
                            <img id="worldgoalcell" style={worldgoalPosition} src="png/robot_fw_bw.png" alt="goal_cell" className="grid-goal"/>                      
                        </div> 

                        {this.props.human && <img id="worldrobot" style={worldrobotPosition} src="png/robot_fw_bw.png" alt="user_icon"/>}

                    </div>
            
            )
            }
            // stationary case
            else if (Math.abs(this.props.human.angularVelocity <= 1 && Math.abs(this.props.human.lv) <= 1)) {
                return (
                    <div className="world-container">
                        
                        
                        <div>
                        
                            {this.props.goals && <img id="worldgoal" style={worldgoalPositionVar} src="png/robot_fw_bw.png" />}
                            <img id="worldgoalcell" style={worldgoalPosition} src="png/robot_fw_bwpng" alt="goal_cell" className="grid-goal"/>                      
                        </div>

                        {this.props.human && <img id="worldrobot" style={worldrobotPosition} src="png/robot_fw_bw.png" alt="user_icon"/>}

                    </div>
                )
            }
            // catch-all case; currently defaults to worldrobot.png for easy visualization
            else {
                return (
                    <div className="world-container">
                        
                        
                        <div>
                        
                            {this.props.goals && <img id="worldgoal" style={worldgoalPositionVar} src="worldrobot.png" />}
                            <img id="worldgoalcell" style={worldgoalPosition} src="png/robot_ccw.png" alt="goal_cell" className="grid-goal"/>                      
                        </div>                                              

                        {this.props.human && <img id="worldrobot" style={worldrobotPosition} src="png/robot_fw_bw.png" alt="user_icon"/>}

                    </div>
                )
            }
        }
        else {
            return (
                <div className="world-container">
                    {this.props.human && <img id="worldrobot" style={worldrobotPosition} src="worldrobot.png" alt="user_icon"/>}
                    <div id="worldgoal" style={worldgoalPosition} src="worldauto.png"  className="grid-goal"></div>
                </div>
            )
        }
    
    }
}