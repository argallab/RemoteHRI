import React from "react";
import ReactDOM from "react-dom";
import Matter, { Events } from "matter-js";

class Scene extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            currentNode: 0
        };

        this.jointAngularVelocity = 0.05
        this.jointOffset = 10

        this.keys = {}
        this.handleKeyPress = this.handleKeyPress.bind(this)
        this.anyKeysPressed = this.anyKeysPressed.bind(this)

        this.collisionActive = false
        this.collisionLastDirection = ""


    }

    componentDidMount() {
        var Engine = Matter.Engine,
            Render = Matter.Render,
            Runner = Matter.Runner,
            Body = Matter.Body,
            Composite = Matter.Composite,
            Composites = Matter.Composites,
            Constraint = Matter.Constraint,
            MouseConstraint = Matter.MouseConstraint,
            Mouse = Matter.Mouse,
            World = Matter.World,
            Bodies = Matter.Bodies;

        var engine = Engine.create()
        engine.world.gravity.y = 0
        engine.world.gravity.x = 0
        var myCanvas = document.getElementById("world")
        var world = engine.world
        var render = Render.create({
            canvas: myCanvas,
            engine: engine,
            options: {
                width: this.percentX(100),
                height: this.percentY(100),
                background: "black",
                wireframes: false,
                showAngleIndicator: false,
            }
        })

        var wall_width = 50

        this.floor = Bodies.rectangle(this.percentX(50), this.percentY(100), this.percentX(100), wall_width, { isStatic: true })
        this.walls = [
            Bodies.rectangle(this.percentX(50), 0, this.percentX(100), wall_width, { isStatic: true }),
            this.floor,
            Bodies.rectangle(this.percentX(100), this.percentY(50), wall_width, this.percentY(100), { isStatic: true }),
            Bodies.rectangle(0, this.percentX(50), wall_width, this.percentY(100), { isStatic: true })
        ]
        
        World.add(world, this.walls)

        var x_n = this.percentX(50)
        var y_n = this.percentY(50)
        var radius = 12
        var w_n = 25
        var h_n = 100

        var nodeSpecs = [
            {
                color: "purple"
            },
            {
                color: "green"
            },
            {
                color: "red"
            },
            {
                color: "blue"
            }
        ]

        this.nodes = nodeSpecs.map((node) => {
            return Bodies.rectangle(x_n, y_n, w_n, h_n, {
                chamfer: { radius: radius },
                inertia: Infinity,
                render: {
                    fillStyle: node.color
                },
                frictionAir: 0,
            })
        })

        this.joints = []
        for (var i = 0; i < this.nodes.length; i++) {
            var bodyA
            var prevOffset
            if (i === 0) {
                bodyA = this.floor
                prevOffset = -1 * wall_width / 2 - this.jointOffset
            } else {
                bodyA = this.nodes[i - 1]
                prevOffset = -1 * h_n / 2 - this.jointOffset
            }

            this.joints.push(Constraint.create({
                bodyA: bodyA,
                bodyB: this.nodes[i],
                length: 0,
                stiffness: 0.7,
                pointA: { x: 0, y: prevOffset },
                pointB: { x: 0, y: h_n / 2 + this.jointOffset },
                friction: 0
            }))
        }

        Events.on(engine, 'beforeUpdate', (event) => {
            this.updateBodies()
        })
        



        World.add(world, this.nodes)
        World.add(world, this.joints)

        Engine.run(engine)
        Render.run(render)

        document.addEventListener("keydown", this.handleKeyPress, false);
        document.addEventListener("keyup", this.handleKeyPress, false)


    }

    percentX(percent) {
        var min = Math.min(.8 * window.innerWidth, .8 * window.innerHeight)
        return Math.round(percent / 100 * min)
    }

    percentY(percent) {
        var min = Math.min(.8 * window.innerWidth, .8 * window.innerHeight)
        return Math.round(percent / 100 * min)
    }

    handleKeyPress(event) {
        var validKeys = new Set(["w", "a", "s", "d", "ArrowUp", "ArrowLeft", "ArrowRight", "ArrowDown"])
        if (validKeys.has(event.key)) this.keys[event.key] = event.type === "keydown"

        if (event.type === "keydown") {
            if (event.key === "w" && this.state.currentNode < this.nodes.length - 1) {
                this.setState({
                    currentNode: this.state.currentNode + 1
                }, () => {
                    if (this.collisionActive) {
                        if (this.collisionLastDirection == "a") this.collisionLastDirection = "d"
                        else this.collisionLastDirection = "a"
                    }
                })

            } else if (event.key === "s" && this.state.currentNode > 0) {
                this.setState({
                    currentNode: this.state.currentNode - 1
                }, () => {
                    if (this.collisionActive) {
                        if (this.collisionLastDirection == "a") this.collisionLastDirection = "d"
                        else this.collisionLastDirection = "a"
                    }
                })
            }
        }
    }

    componentWillUnmount() {
        document.removeEventListener("keydown", this.handleKeyPress);
        document.removeEventListener("keyup", this.handleKeyPress);
    }


    anyKeysPressed() {
        var keys = []
        for (var key in this.keys) {
            if (this.keys[key]) {
                keys.push(key)
            }
        }
        return keys.join(",")
    }

    updateBodies() {
        var q = this.state.currentNode
        var t_d = 0
        
        if (this.collisionActive) {
            if (this.collisionLastDirection === "d") {
                if (this.keys["a"]) {
                    t_d = -1 * this.jointAngularVelocity
                }
            } else if (this.collisionLastDirection === "a") {
                if (this.keys["d"]) {
                    t_d = this.jointAngularVelocity
                }
            }

        } else {
            if (this.keys["d"]) {
                t_d = this.jointAngularVelocity
            } else if (this.keys["a"]) {
                t_d = -1 * this.jointAngularVelocity
            }
        }

        Matter.Body.rotate(this.nodes[q], t_d)

        var collision = false
        for (var i = 0; i < this.nodes.length; i++) {
            for (var k = 0; k < this.walls.length; k++) {
                collision = collision || Matter.SAT.collides(this.walls[k], this.nodes[i]).collided
            }
            for (var j = i + 1; j < this.nodes.length; j++) {
                collision = collision || Matter.SAT.collides(this.nodes[j], this.nodes[i]).collided
            }
        }

        if (collision) {
            this.collisionActive = true
            if (this.collisionLastDirection === "") {
                this.collisionLastDirection = this.keys["d"] ? "d" : "a"
            }
        } else {
            this.collisionActive = false
            this.collisionLastDirection = ""
        }
    }



    render() {
        return (
            <div style={{ flexDirection: "column" }} className="centered-content">
                <div>
                    <p>Current node: {this.state.currentNode}</p>
                </div>
                <div className="centered-content">
                    <canvas id="world"></canvas>
                </div>
            </div>
        )
    }
}
export default Scene;