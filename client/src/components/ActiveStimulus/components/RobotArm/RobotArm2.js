import React from "react";
import ReactDOM from "react-dom";
import Matter, { Events, Composite, World, Body } from "matter-js";

class Scene extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            currentNode: 2,
            mode: 0 // 0 controls nodes, 1 controls hand angle, 2 controls hand pos
        };

        this.jointAngularVelocity = 0.01
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
        engine.constraintIterations = 10
        var myCanvas = document.getElementById("world")
        this.world = engine.world
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

        this.floor = Bodies.rectangle(this.percentX(50), this.percentY(100), this.percentX(100), wall_width, { render: { fillStyle: "gray" }, restitution: 0 })
        this.walls = [
            Bodies.rectangle(this.percentX(50), 0, this.percentX(100), wall_width, { render: { fillStyle: "gray" }, restitution: 0 }),
            this.floor,
            Bodies.rectangle(this.percentX(100), this.percentY(50), wall_width, this.percentY(100), { render: { fillStyle: "gray" }, restitution: 0 }),
            Bodies.rectangle(0, this.percentX(50), wall_width, this.percentY(100), { render: { fillStyle: "gray" }, restitution: 0 })
        ]

        for (var i of this.walls) {
            Body.setStatic(i, true)
        }

        World.add(this.world, this.walls)

        var linkHeight = 100
        var linkWidth = 25
        var jointOffset = 5
        var linkRadius = 10

        var linkSpecs = [
            {
                color: "red"
            },
            {
                color: "blue"
            },
            {
                color: "orange"
            },
            {
                color: "purple"
            }
        ]

        this.links = linkSpecs.map((link, i) => {
            return Bodies.rectangle(this.percentX(50), this.percentY(100) - wall_width / 2 - ((2*i + 1)*linkHeight / 2 + (2*(i+1) * jointOffset)), linkWidth, linkHeight, {
                render: {fillStyle: link.color},
                chamfer: {
                    radius: linkRadius
                }
            })
        })

        this.inertia = this.links[0].inertia

        this.joints = []
        for (var i = 0; i < this.links.length; i++) {
            var bodyA
            var prevOffset
            if (i === 0) {
                bodyA = this.floor
                prevOffset = -1 * wall_width / 2 - jointOffset
            } else {
                bodyA = this.links[i - 1]
                prevOffset = -1 * linkHeight / 2 - jointOffset
            }

            this.joints.push(Constraint.create({
                bodyA: bodyA,
                bodyB: this.links[i],
                length: 0,
                pointA: { x: 0, y: prevOffset },
                pointB: { x: 0, y: linkHeight / 2 + jointOffset },
                stiffness: 1
            }))
        }

        this.supports = []
        for (var i = 0; i < this.links.length; i++) {
            var bodyA
            var prevOffset
            var length
            if (i === 0) {
                bodyA = this.walls[2]
                prevOffset = {x: 0, y: 0}
                length = this.getDistance(0)
            } else {
                bodyA = this.links[i - 1]
                prevOffset = {x: 0, y: 0}
                length = linkHeight + 2 * jointOffset
            }

            this.supports.push(Constraint.create({
                bodyA: bodyA,
                bodyB: this.links[i],
                length: length,
                pointA: prevOffset,
                pointB: {x: 0, y: 0},
                stiffness: 1
            }))
        }


        World.add(this.world, this.links)
        World.add(this.world, this.joints)
        World.add(this.world, this.supports)


        Events.on(engine, 'beforeUpdate', (event) => {
            this.updateBodies()
        })


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

    getDistance(i) {
        var posA = i === 0 ? this.walls[2].position : this.links[i-1].position
        var posB = this.links[i].position

        return Math.hypot(posA.x - posB.x, posA.y - posB.y)
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
                if (event.key === "w" && this.state.currentNode < this.links.length - 1) {
                    for (var i of this.links) {
                        Body.setAngularVelocity(i, 0)
                    }
                    if (this.state.currentNode !== 0) {
                        this.supports[this.state.currentNode-1].length = this.getDistance(this.state.currentNode-1)
                    }
                    this.supports[this.state.currentNode].length = this.getDistance(this.state.currentNode)
                    if (this.state.currentNode < this.links.length - 1) {
                        this.supports[this.state.currentNode+1].length = this.getDistance(this.state.currentNode + 1)
                    }

                    World.add(this.world, this.supports[this.state.currentNode])
                    World.remove(this.world, this.supports[this.state.currentNode + 1])
                    this.setState({
                        currentNode: this.state.currentNode + 1
                    }, () => {
                        // Matter.Body.setInertia(this.nodes[this.state.currentNode], this.inertia)
                        // Matter.Body.setInertia(this.nodes[this.state.currentNode-1], Infinity)
                    })

                } else if (event.key === "s" && this.state.currentNode > 0) {
                    for (var i of this.links) {
                        Body.setAngularVelocity(i, 0)
                    }

                    if (this.state.currentNode !== 0) {
                        this.supports[this.state.currentNode-1].length = this.getDistance(this.state.currentNode-1)
                    }
                    this.supports[this.state.currentNode].length = this.getDistance(this.state.currentNode)
                    if (this.state.currentNode < this.links.length - 1) {
                        this.supports[this.state.currentNode+1].length = this.getDistance(this.state.currentNode + 1)
                    }

                    World.add(this.world, this.supports[this.state.currentNode])
                    World.remove(this.world, this.supports[this.state.currentNode - 1])
                    this.setState({
                        currentNode: this.state.currentNode - 1
                    }, () => {
                        // Matter.Body.setInertia(this.nodes[this.state.currentNode], this.inertia)
                        // Matter.Body.setInertia(this.nodes[this.state.currentNode+1], Infinity)
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
            for (var i = 0; i < q; i++) {
                Body.setInertia(this.links[i], Infinity)
            }

            for (var i = q; i < this.links.length; i++) {
                Body.setInertia(this.links[i], this.inertia)
            }

            World.remove(this.world, this.supports[q])


            if (this.keys["a"]) {
                Body.setAngularVelocity(this.links[q], -1 * this.jointAngularVelocity)
            } else if (this.keys["d"]) {
                Body.setAngularVelocity(this.links[q], 1 * this.jointAngularVelocity)
            } else {
                Body.setAngularVelocity(this.links[q], 0)
            }

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