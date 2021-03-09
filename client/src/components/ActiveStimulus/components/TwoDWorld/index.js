import React from 'react'

let test_bool = 3

export default class TwoDWorld extends React.Component {
    

    render() {
        var worldrobotPosition
        if (this.props.human) {
            var worldrobotPosition = {width: this.props.human.width, height: this.props.human.height, bottom: this.props.humanState.y, left: this.props.humanState.x, transform: `rotate(${this.props.humanState.angle}deg)`, 'transform-origin': 'center'}
        }

        var worldautoPosition
        if (this.props.aa) {
            var worldautoPosition = {position: "absolute", width: this.props.aa.width, height: this.props.aa.height, bottom: this.props.aaState.y, left: this.props.aaState.x, transform: `rotate(${this.props.aaState.angle}deg)`}
        }

        //var worldBoundaryPosition
        //if (this.props.bound) {
        //var worldBoundaryPosition = {position: "center", width: 400, height: 400, bottom: 450/2 , left: 450/2}
        var worldBoundaryPosition = {position: "center", width: 850, height: 850, bottom: 0, left: 0}//bottom: this.props.human.width/2, left: this.props.human.width/2}
        var trial_type_bound = this.props.trial_type

        var src_bound = this.props.bound.bound2plot
        let boundary2plot = src_bound

        var src_goal = this.props.goal.goal2plot
        let goal2plot = src_goal
        
        //console.log(src_bound)
        //console.log(boundary2plot)
        //console.log({String}, src_bound)
        //}   



        //var worldgoalPosition
        //if (this.props.goal) {
        //    var worldgoalPosition = {width: this.props.goal.width, height: this.props.goal.height, bottom: this.props.goal.y, left: this.props.goal.x, transform: `rotate(${this.props.goal.angle}deg)`}
        //}

        //var worldgoalPosition = {width: this.props.goal.width, height: this.props.goal.height, bottom: this.props.goal.y, left: this.props.goal.x, transform: `rotate(${this.props.goal.angle}deg)`}

        var worldgoalPosition = {position: "absolute", bottom: this.props.goalLocationY, left: this.props.goalLocationX, width: this.props.goalWidth, height: this.props.goalHeight}//, transform: `rotate(${this.props.angle}deg)`, 'transform-origin': 'center'}
        var worldgoalPositionVar = {bottom: this.props.goalLocationY, left: this.props.goalLocationX, width: this.props.goalWidth, height: this.props.goalHeight, transform: `rotate(${this.props.angle}deg)`}

        var worldObstacles = this.props.obstacles.map((o) => <div style={{position: "absolute", width: o.width, height: o.height, bottom: o.y, left: o.x}} className="grid-goal"></div>)
        
        
        //<div id="worldgoal" style={worldgoalPosition} src="worldauto.png"  className="grid-goal"></div> (from line 32)
        //{this.props.goal && <img id="worldgoal" style={worldgoalPosition} src="png/robot_cw.png" />}
        //{this.props.goal && <img id="worldgoal" style={worldgoalPosition} src="png/robot_cw.png" className="circle" />}
        if (test_bool === 1) {
            // cw case
            if (this.props.human.angularVelocity > 1 && Math.abs(this.props.human.lv) <= 1){
                return (
                    
                    <div className="world-container">
 
                        
                        <div>
                        
                            {this.props.goals && <img id="worldgoal" style={worldgoalPositionVar} src="png/robot_fwbw.png" />}
                            <img id="worldgoalcell" style={worldgoalPosition} src="png/robot_fwbw.png"  alt="goal_cell" className="grid-goal"/>                      
                        </div>
                        

                        {this.props.human && <img id="worldrobot" style={worldrobotPosition} src="png/robot_fw_bw.png" />}
                        
                        
                        {worldObstacles}
                    </div>
            
            )
            }
            // fwr case
            if (this.props.human.angularVelocity > 1 && this.props.human.lv > 1){
                return (
                    
                    <div className="world-container">
                        
                        
                        <div>
                        
                            {this.props.goals && <img id="worldgoal" style={worldgoalPositionVar} src="png/robot_fwbw.png" />}
                            <img id="worldgoalcell" style={worldgoalPosition} src="png/robot_fwbw.png" alt="goal_cell" className="grid-goal"/>                      
                        </div>

                        {this.props.human && <img id="worldrobot" style={worldrobotPosition} src="png/robot_fwr_bwl.png" />}
                        
                        
                        {worldObstacles}
                    </div>
            
            )
            }
            // bwr case
            if (this.props.human.angularVelocity > 1 && this.props.human.lv < -1){
                return (
                    
                    <div className="world-container">
                        
                        
                        <div>
                        
                            {this.props.goals && <img id="worldgoal" style={worldgoalPositionVar} src="png/robot_fwbw.png" />}
                            <img id="worldgoalcell" style={worldgoalPosition} src="png/robot_fwbw.png" alt="goal_cell" className="grid-goal"/>                      
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
                        
                            {this.props.goals && <img id="worldgoal" style={worldgoalPositionVar} src="png/robot_fwbw.png" />}
                            <img id="worldgoalcell" style={worldgoalPosition} src="png/robot_fwbw.png" alt="goal_cell" className="grid-goal"/>                      
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
                        
                            {this.props.goals && <img id="worldgoal" style={worldgoalPositionVar} src="png/robot_fwbw.png" />}
                            <img id="worldgoalcell" style={worldgoalPosition} src="png/robot_fwbw.png" alt="goal_cell" className="grid-goal"/>                      
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
                        
                            {this.props.goals && <img id="worldgoal" style={worldgoalPositionVar} src="png/robot_fwbw.png" />}
                            <img id="worldgoalcell" style={worldgoalPosition} src="png/robot_fwbw.png" alt="goal_cell" className="grid-goal"/>                      
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
                        
                            {this.props.goals && <img id="worldgoal" style={worldgoalPositionVar} src="png/robot_fwbw.png" />}
                            <img id="worldgoalcell" style={worldgoalPosition} src="png/robot_fwbw.png" alt="goal_cell" className="grid-goal"/>                      
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
                        
                            {this.props.goals && <img id="worldgoal" style={worldgoalPositionVar} src="png/robot_fwbw.png" />}
                            <img id="worldgoalcell" style={worldgoalPosition} src="png/robot_fwbw.png" alt="goal_cell" className="grid-goal"/>                      
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
                        
                            {this.props.goals && <img id="worldgoal" style={worldgoalPositionVar} src="png/robot.png" />}
                            <img id="worldgoalcell" style={worldgoalPosition} src="png/robot.png" alt="goal_cell" className="grid-goal"/>                      
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
                            <img id="worldgoalcell" style={worldgoalPosition} src="worldrobot.png" alt="goal_cell" className="grid-goal"/>                      
                        </div>                                              

                        {this.props.human && <img id="worldrobot" style={worldrobotPosition} src="png/robot_fw_bw.png" alt="user_icon"/>}

                    </div>
                )
            }
        }
        else if (test_bool === 2) {
            if (trial_type_bound =='fw'){
                return (
                    <div className="world-container">
                        <img id="worldboundary" style={worldBoundaryPosition} src={boundary2plot}/>
                        <div>
                            
                            {this.props.goals && <img id="worldgoal" style={worldgoalPosition} src="png/goal_icon_v2.png" />}
                            <img id="worldgoalcell" style={worldgoalPosition} src="png/goal_icon_v2.png" alt="goal_cell" className="grid-goal"/>   
                                
                        </div>
                        {this.props.human && <img id="worldrobot" style={worldrobotPosition} src="png/robot_icon_v2.png" />}
                    </div>
                )
            }
            else if (trial_type_bound = 'bw'){
                return (
                    <div className="world-container">
                        <img id="worldboundary" style={worldBoundaryPosition} src={boundary2plot}/>
                        <div>
                            
                            {this.props.goals && <img id="worldgoal" style={worldgoalPosition} src="png/goal_icon_v2.png" />}
                            <img id="worldgoalcell" style={worldgoalPosition} src="png/goal_icon_v2.png" alt="goal_cell" className="grid-goal"/>   
                                
                        </div>
                        {this.props.human && <img id="worldrobot" style={worldrobotPosition} src="png/robot_icon_v2.png" />}
                    </div>
                )

            }
            else if (trial_type_bound = 'fwr'){
                return (
                    <div className="world-container">
                        <img id="worldboundary" style={worldBoundaryPosition} src={boundary2plot}/>
                        <div>
                            
                            {this.props.goals && <img id="worldgoal" style={worldgoalPosition} src="png/goal_icon_v2.png" />}
                            <img id="worldgoalcell" style={worldgoalPosition} src="png/goal_icon_v2.png" alt="goal_cell" className="grid-goal"/>   
                                
                        </div>
                        {this.props.human && <img id="worldrobot" style={worldrobotPosition} src="png/robot_icon_v2.png" />}
                    </div>
                )

            }
            else if (trial_type_bound == 'fwl'){
                return (
                    <div className="world-container">
                        <img id="worldboundary" style={worldBoundaryPosition} src={boundary2plot}/>
                        <div>
                            
                            {this.props.goals && <img id="worldgoal" style={worldgoalPosition} src="png/goal_icon_v2.png" />}
                            <img id="worldgoalcell" style={worldgoalPosition} src="png/goal_icon_v2.png" alt="goal_cell" className="grid-goal"/>   
                            
                        </div>
                        {this.props.human && <img id="worldrobot" style={worldrobotPosition} src="png/robot_icon_v2.png" />}
                    </div>
                )

            }
            else if (trial_type_bound == 'bwr'){
                return (
                    <div className="world-container">
                        <img id="worldboundary" style={worldBoundaryPosition} src={boundary2plot}/>
                        <div>
                            
                            {this.props.goals && <img id="worldgoal" style={worldgoalPosition} src="png/goal_icon_v2.png" />}
                            <img id="worldgoalcell" style={worldgoalPosition} src="png/goal_icon_v2.png" alt="goal_cell" className="grid-goal"/>   
                                
                        </div>
                        {this.props.human && <img id="worldrobot" style={worldrobotPosition} src="png/robot_icon_v2.png" />}
                    </div>
                )

            }
            else if (trial_type_bound == 'bwl'){
                return (
                    <div className="world-container">
                        <img id="worldboundary" style={worldBoundaryPosition} src={boundary2plot}/>
                        <div>
                            
                            {this.props.goals && <img id="worldgoal" style={worldgoalPosition} src="png/goal_icon_v2.png" />}
                            <img id="worldgoalcell" style={worldgoalPosition} src="png/goal_icon_v2.png" alt="goal_cell" className="grid-goal"/>   
                                
                        </div>
                        {this.props.human && <img id="worldrobot" style={worldrobotPosition} src="png/robot_icon_v2.png" />}
                    </div>
                )

            }
            else if (this.props.trial_type == 'ccw'){
                return (
                    <div className="world-container">
                        <img id="worldboundary" style={worldBoundaryPosition} src={boundary2plot}/>
                        <div>
                            
                            {this.props.goals && <img id="worldgoal" style={worldgoalPosition} src="png/goal_icon_v2.png" />}
                            <img id="worldgoalcell" style={worldgoalPosition} src="png/goal_icon_v2.png" alt="goal_cell" className="grid-goal"/>   
                                
                        </div>
                        {this.props.human && <img id="worldrobot" style={worldrobotPosition} src="png/robot_icon_v2.png" />}
                    </div>
                )

            }
            else if (this.props.trial_type == 'cw'){
                return (
                    <div className="world-container">
                        <img id="worldboundary" style={worldBoundaryPosition} src={boundary2plot}/>
                        <div>
                            
                            {this.props.goals && <img id="worldgoal" style={worldgoalPosition} src="png/goal_icon_v2.png" />}
                            <img id="worldgoalcell" style={worldgoalPosition} src="png/goal_icon_v2.png" alt="goal_cell" className="grid-goal"/>   
                                
                        </div>
                        {this.props.human && <img id="worldrobot" style={worldrobotPosition} src="png/robot_icon_v2.png" />}
                    </div>
                )

            }
            else {
                return(
                    <div className="world-container">
                    <img id="worldboundary" style={worldBoundaryPosition} src={boundary2plot}/>
                    <div>
                        
                        {this.props.goals && <img id="worldgoal" style={worldgoalPosition} src="png/goal_icon_v2.png" />}
                        <img id="worldgoalcell" style={worldgoalPosition} src="png/goal_icon_v2.png" alt="goal_cell" className="grid-goal"/>   
                              
                    </div>
                    {this.props.human && <img id="worldrobot" style={worldrobotPosition} src="png/robot_icon_v2.png" />}
                    </div>
                )
            }


        }
        else if (test_bool == 3){
            return (
                <div className="world-container">
                    <img id="worldboundary" style={worldBoundaryPosition} src={boundary2plot}/>
                    <div>
                        
                        {this.props.goals && <img id="worldgoal" style={worldgoalPositionVar} src={goal2plot} />}
                        <img id="worldgoalcell" style={worldgoalPosition} src={goal2plot} alt="goal_cell" className="grid-goal"/>   
                              
                    </div>
                    {this.props.human && <img id="worldrobot" style={worldrobotPosition} src="png/robot_icon_v2.png" />}
                </div>
            )
        }
        else {
            return (
                <div className="world-container">
                    <img id="worldboundary" style={worldBoundaryPosition} src={boundary2plot}/>
                    <div>
                        
                        {this.props.goals && <img id="worldgoal" style={worldgoalPositionVar} src="png/goal_icon_v2.png" />}
                        <img id="worldgoalcell" style={worldgoalPosition} src="png/goal_icon_v2.png" alt="goal_cell" className="grid-goal"/>   
                              
                    </div>
                    {this.props.human && <img id="worldrobot" style={worldrobotPosition} src="png/robot_icon_v2.png" />}
                </div>
            )
        }
    
    }

}