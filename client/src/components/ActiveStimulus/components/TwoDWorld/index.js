import React from 'react'

export default class TwoDWorld extends React.Component {
    render() {
        var worldrobotPosition = {top: this.props.y, left: this.props.x, transform: `rotate(${this.props.angle}deg)`}

        return (
            <div className="world-container">
                <img id="worldrobot" style={worldrobotPosition} src="worldrobot.png" />
            </div>
        )
    }
}