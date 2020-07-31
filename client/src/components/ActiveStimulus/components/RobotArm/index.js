import React from "react";
import ReactDOM from "react-dom";
import Matter, { Events } from "matter-js";

class Scene extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            currentNode: 0,
            mode: 2 // 0 controls nodes, 1 controls hand angle, 2 controls hand pos
        };

        this.jointAngularVelocity = 0.05
        this.jointOffset = 10
        this.handVelocity = 10

        this.keys = {}
        this.handleKeyPress = this.handleKeyPress.bind(this)
        this.anyKeysPressed = this.anyKeysPressed.bind(this)

        this.collisionActive = false
        this.collisionLastDirection = ""
        this.collisionInvolvesCurrent = false


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
        this.robot_a = 75
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

        this.robot = Composite.create(
            {
                isStatic: true,
            }
        )

        this.nodes = nodeSpecs.map((node, index) => {
            return Bodies.rectangle(x_n, (this.percentY(100) - wall_width / 2) -((0.5 + index)*h_n + 10*(index+2)), w_n, h_n, {
                chamfer: { radius: radius },
                inertia: index !== 0 && Infinity,
                render: {
                    fillStyle: node.color
                },
                frictionAir: 0,
            })
        })

        this.hand = Bodies.rectangle(x_n, 725-((0.5 + this.nodes.length)*h_n + 10*(this.nodes.length + 2)), this.robot_a, this.robot_a, {
            inertia: Infinity,
            render: {
                fillStyle: "yellow"
            },
            frictionAir: 0,
            chamfer: {radius: 10},
            restitution: 0
        })

        this.handAngle = 0


        this.inertia = this.nodes[0].inertia

        for (var node of this.nodes) {
             Composite.add(this.robot, node)

        }

        Composite.add(this.robot, this.hand)

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

        this.joints.push(Constraint.create({
            bodyA: this.nodes[this.nodes.length - 1],
            bodyB: this.hand,
            length: 0,
            stiffness: 0.7,
            pointA: {x: 0, y: -1 * h_n / 2 - this.jointOffset},
            pointB: {x:0, y: this.robot_a/2 + this.jointOffset},
            friction: 0
        }))



        this.prevCollisions = {
            walls: [],
            nodes: []
        }

        for (var i = 0; i < this.walls.length; i++) {
            this.prevCollisions.walls.push([])
            for (var j = 0; j < this.nodes.length; j++) {
                this.prevCollisions.walls[i].push(0)
            }
        }

        for (var i = 0; i < this.nodes.length; i++) {
            this.prevCollisions.nodes.push([])
            for (var j = i+1; j < this.nodes.length; j++) {
                this.prevCollisions.nodes[i].push(0)
            }
        }



        Events.on(engine, 'beforeUpdate', (event) => {
            this.updateBodies()
        })
        



        World.add(world, this.nodes)
        World.add(world, this.joints)
        World.add(world, this.hand)

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
        var validKeys = new Set([" ", "w", "a", "s", "d", "ArrowUp", "ArrowLeft", "ArrowRight", "ArrowDown"])
        if (validKeys.has(event.key)) this.keys[event.key] = event.type === "keydown"

        if (event.type === "keydown") {
            var mode = this.state.mode

            if (event.key === " ") {
                mode = (mode + 1) % 3
                if (mode === 2) this.handAngle = this.hand.angle
                this.setState({
                    mode: mode
                })
            }

            if (mode === 0) {
                if (event.key === "w" && this.state.currentNode < this.nodes.length - 1) {
                    this.setState({
                        currentNode: this.state.currentNode + 1
                    }, () => {
                        Matter.Body.setInertia(this.nodes[this.state.currentNode], this.inertia)
                        Matter.Body.setInertia(this.nodes[this.state.currentNode-1], Infinity)
                    })
    
                } else if (event.key === "s" && this.state.currentNode > 0) {
                    this.setState({
                        currentNode: this.state.currentNode - 1
                    }, () => {
                        Matter.Body.setInertia(this.nodes[this.state.currentNode], this.inertia)
                        Matter.Body.setInertia(this.nodes[this.state.currentNode+1], Infinity)
                    })
                }
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
        if (this.state.mode == 0) {
            var q = this.state.currentNode
            Matter.Body.setInertia(this.nodes[q], this.inertia)
            Matter.Body.setInertia(this.hand, Infinity)
            for (var i = 0; i < this.nodes.length; i++) {
                if (i !== q) {
                    Matter.Body.setAngularVelocity(this.nodes[i], 0)
                    Matter.Body.setInertia(this.nodes[i], Infinity)
                }
            }
            if (this.keys["a"]) {
                Matter.Body.setAngularVelocity(this.nodes[q], -1 * this.jointAngularVelocity)
    
            } else if (this.keys["d"]) {
               Matter.Body.setAngularVelocity(this.nodes[q], 1 * this.jointAngularVelocity)
            } else {
                Matter.Body.setAngularVelocity(this.nodes[q], 0)
            }
        } else if (this.state.mode == 1) {
            Matter.Body.setInertia(this.hand, this.inertia)
            for (var i = 0; i < this.nodes.length; i++) {
                Matter.Body.setInertia(this.nodes[i], Infinity)
                Matter.Body.setAngularVelocity(this.nodes[i], 0)
            }
            var angVel = 0.05
            if (this.keys["ArrowLeft"]) {
                Matter.Body.setAngularVelocity(this.hand, -1*angVel)
            } else if (this.keys["ArrowRight"]) {
                Matter.Body.setAngularVelocity(this.hand, angVel)
            } else {
                Matter.Body.setAngularVelocity(this.hand, 0)
            }

        } else if (this.state.mode == 2) {
            console.log(this.handAngle)

            Matter.Body.setStatic(this.hand, true)
            for (var i = 0; i < this.nodes.length; i++) {
                Matter.Body.setInertia(this.nodes[i], this.inertia)
                Matter.Body.setAngularVelocity(this.nodes[i], 0)
            }
            var cos = this.handVelocity * Math.cos(this.handAngle)
            var sin = this.handVelocity * Math.sin(this.handAngle)
            if (this.keys["ArrowUp"]) {
                Matter.Body.setPosition(this.hand, Matter.Vector.add(this.hand.position, Matter.Vector.create(sin, -1*cos)))
            } else if (this.keys["ArrowDown"]) {
                Matter.Body.setPosition(this.hand,  Matter.Vector.add(this.hand.position, Matter.Vector.create(-1*sin, cos)))
            } else if (this.keys["ArrowLeft"]) {
                Matter.Body.setPosition(this.hand, Matter.Vector.add(this.hand.position, Matter.Vector.create(-1*cos, -1*sin)))
            } else if (this.keys["ArrowRight"]) {
                Matter.Body.setPosition(this.hand, Matter.Vector.add(this.hand.position, Matter.Vector.create(cos, sin)))
            }
            Matter.Body.setAngle(this.hand, this.handAngle)
            Matter.Body.setStatic(this.hand, false)
        }
    }



    render() {
        return (
            <div style={{ flexDirection: "column" }} className="centered-content">
                <div>
                    {
                        this.state.mode === 0 && <p>Current node: {this.state.currentNode}</p>
                    }
                    {
                        this.state.mode === 1 && <p>Controlling hand angle</p>
                    }
                    {
                        this.state.mode === 2 && <p>Controlling hand position</p>
                    }
                </div>
                <div className="centered-content">
                    <canvas id="world"></canvas>
                </div>
            </div>
        )
    }
}
export default Scene;