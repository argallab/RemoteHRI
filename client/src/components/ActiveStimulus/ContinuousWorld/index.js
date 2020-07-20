import React from 'react'
import TwoDWorld from "../components/TwoDWorld"

export default class ContinuousWorld extends React.Component {
    constructor(props)
    {
        super(props)

        this.state = {
        }

        this.keys = {}

        this.handleKeyPress = this.handleKeyPress.bind(this)
        this.computeMovement = this.computeMovement.bind(this)
        this.degreeToRad = this.degreeToRad.bind(this)
    }

    degreeToRad(theta) {
        return theta * Math.PI / 180
    }

    componentDidMount() {
        this.setState({
            x: 0,
            y: 0,
            angle: 0,
            velocity: 20,
            angularVelocity: 5
        }, () => {
            document.addEventListener("keydown", this.handleKeyPress, false);
            document.addEventListener("keyup", this.handleKeyPress, false);
        })

    }

    componentWillUnmount() {
        document.removeEventListener("keydown", this.handleKeyPress, false);
        document.removeEventListener("keyup", this.handleKeyPress, false);
    }

    handleKeyPress(event) {
        this.keys[event.key] = event.type === "keydown"
        this.computeMovement()
    }


    computeMovement() {
        var x = this.state.x
        var y = this.state.y
        var angle = this.state.angle

        if (this.keys["a"] || this.keys["ArrowLeft"]) {
            angle = (angle - this.state.angularVelocity) % 360
        } else if (this.keys["d"] || this.keys["ArrowRight"]) {
            angle = (angle + this.state.angularVelocity % 360)
        }


        var deltaX = (this.state.velocity * Math.cos(this.degreeToRad(angle)))
        var deltaY = (this.state.velocity * Math.sin(this.degreeToRad(angle)))
        if (this.keys["w"] || this.keys["ArrowUp"]) {
            var newX = x + deltaX
            var newY = y + deltaY
            if (newX < 0 || newX > 700 || newY < 0 || newY > 700) {
                this.setState({angle})
                return
            }
            x = x + deltaX
            y = y + deltaY

        } else if (this.keys["s"] || this.keys["ArrowDown"]) {
            var newX = x - deltaX
            var newY = y - deltaY
            if (newX < 0 || newX > 700 || newY < 0 || newY > 700) {
                this.setState({angle})
                return
            }
            x = x - deltaX
            y = y - deltaY
        }

        this.setState({x, y, angle})
    }

    render() {
        return (
            <div className="centered-content">
                <TwoDWorld x={this.state.x} y={this.state.y} angle={this.state.angle} />
            </div>
        )
    }
}