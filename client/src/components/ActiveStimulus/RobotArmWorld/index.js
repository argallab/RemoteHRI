import React from "react";
import ReactDOM from "react-dom";
import Matter, { Events, Composite, World, Body } from "matter-js";
import { Button } from 'react-bootstrap'

class Scene extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            currentNode: 0,
            mode: 0 // 0 controls nodes, 1 controls hand angle, 2 controls hand pos
        };

        this.keys = {}
        this.handleKeyPress = this.handleKeyPress.bind(this)
        this.anyKeysPressed = this.anyKeysPressed.bind(this)
        this.handleModeChange = this.handleModeChange.bind(this)
        this.prepareHandMove = this.prepareHandMove.bind(this)
        this.prepareHandRotate = this.prepareHandRotate.bind(this)

        this.prepareJointRotate = this.prepareJointRotate.bind(this)
        this.onWin = this.onWin.bind(this)

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

        /* sets up physics world */
        var engine = Engine.create()
        engine.world.gravity.y = 0 // removes gravity so we can control all aspects of movement
        engine.world.gravity.x = 0
        engine.constraintIterations = 10 // reduces "stretching" of constraints/joints/supports
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


        var json = this.props.data
       
        /** Declaration of world variables, dimensions, properties, etc. */
        this.jointAngularVelocity = json.jointAngularVelocity
        this.handVelocity = json.handVelocity
        this.winPositionThreshold = json.winPositionThreshold
        this.wall_width = json.wallWidth
        this.linkHeight = json.linkHeight
        this.linkWidth = json.linkWidth
        this.linkRadius = json.linkRadius
        this.jointOffset = json.jointOffset
        this.constraintsVisible = json.constraintsVisible
        this.robotA = json.robotA // dimension of robot hand
        this.handColor = json.handColor
        if (json.goal.unit === "percent"){
            this.goalX = this.percentX(json.goal.x)
            this.goalY = this.percentY(json.goal.y)
        }
        else if (json.goal.unit === "pixel") {
            this.goalX = json.goal.x
            this.goalY = json.goal.y
        }

        this.goalAngle = json.goal.theta
        // eventually this.linkSpecs may include dimensions for the links as well, rendering linkHeight, linkWidth, linkRadius useless
        this.linkSpecs = json.links

        /* Creates the borders of the world */
        this.floor = Bodies.rectangle(this.percentX(50), this.percentY(100), this.percentX(100), this.wall_width, { render: { fillStyle: "gray" }, restitution: 0 })
        this.walls = [
            Bodies.rectangle(this.percentX(50), 0, this.percentX(100), this.wall_width, { render: { fillStyle: "gray" }, restitution: 0 }),
            this.floor,
            Bodies.rectangle(this.percentX(100), this.percentY(50), this.wall_width, this.percentY(100), { render: { fillStyle: "gray" }, restitution: 0 }),
            Bodies.rectangle(0, this.percentX(50), this.wall_width, this.percentY(100), { render: { fillStyle: "gray" }, restitution: 0 })
        ]

        for (var i of this.walls) {
            Body.setStatic(i, true)
        }

        World.add(this.world, this.walls)

        /* Creates the links in the physics engine */
        this.links = this.linkSpecs.map((link, i) => {
            return Bodies.rectangle(this.percentX(50), this.percentY(100) - this.wall_width / 2 - ((2 * i + 1) * this.linkHeight / 2 + (2 * (i + 1) * this.jointOffset)), this.linkWidth, this.linkHeight, {
                render: { fillStyle: link.color },
                chamfer: {
                    radius: this.linkRadius
                }
            })
        })
        this.inertia = this.links[0].inertia // save initial inertia value as some modes set the inertia of the links to Infinity, may need to become an array of inertias with variable link size

        /* Creates the joints in the physics engine (pin connections between two links) */
        this.joints = []
        for (var i = 0; i < this.links.length; i++) {
            var bodyA
            var prevOffset
            if (i === 0) {
                bodyA = this.floor
                prevOffset = -1 * this.wall_width / 2 - this.jointOffset
            } else {
                bodyA = this.links[i - 1]
                prevOffset = -1 * this.linkHeight / 2 - this.jointOffset
            }

            this.joints.push(Constraint.create({
                bodyA: bodyA,
                bodyB: this.links[i],
                length: 0,
                pointA: { x: 0, y: prevOffset },
                pointB: { x: 0, y: this.linkHeight / 2 + this.jointOffset },
                stiffness: 1
            }))
        }

        /* Four sets of supports to keep the links in place.
        Center supports go from the center of a link to another.
        BT supports go from the bottom of a link to the top of the one above it.
        BB supports go from the bottom of a link to the bottom of the one above it.
        Wall supports go from the center of the right wall to the center of a link. (only used for hand rotation)
        Future supports could include TT and TB supports. */
        this.centerSupports = []
        this.btSupports = []
        this.bbSupports = []
        this.wallSupports = []

        for (var i = 0; i < this.links.length; i++) {
            var bodyA
            var prevOffsetC
            var prevOffsetBT
            var prevOffsetBB
            var lengthC
            var lengthBT
            var lengthBB
            if (i === 0) {
                bodyA = this.walls[2]
                prevOffsetC = { x: 0, y: 0 }
                prevOffsetBT = { x: 0, y: 0 }
                prevOffsetBB = { x: 0, y: 0 }
                lengthC = this.getDistance(0)
                lengthBT = this.getDistance(0)
                lengthBB = this.getDistance(0)
            } else {
                bodyA = this.links[i - 1]
                prevOffsetC = { x: 0, y: 0 }
                prevOffsetBT = { x: 0, y: this.linkHeight / 2 }
                prevOffsetBB = { x: 0, y: this.linkHeight / 2 }
                lengthC = this.getDistance(i)//this.linkHeight + 2 * this.jointOffset
                lengthBT = 2 * this.linkHeight + 2 * this.jointOffset
                lengthBB = this.linkHeight + 2 * this.jointOffset
            }

            this.centerSupports.push(Constraint.create({
                bodyA: bodyA,
                bodyB: this.links[i],
                length: lengthC,
                pointA: prevOffsetC,
                pointB: { x: 0, y: 0 },
                stiffness: 1,
                render: {
                    visible: this.constraintsVisible
                }
            }))

            this.btSupports.push(Constraint.create({
                bodyA: bodyA,
                bodyB: this.links[i],
                length: lengthBT,
                pointA: prevOffsetBT,
                pointB: { x: 0, y: i === 0 ? 0 : -1 * this.linkHeight / 2 },
                stiffness: 1,
                render: {
                    visible: this.constraintsVisible
                }

            }))

            this.bbSupports.push(Constraint.create({
                bodyA: bodyA,
                bodyB: this.links[i],
                length: lengthBB,
                pointA: prevOffsetBB,
                pointB: { x: 0, y: i === 0 ? 0 : this.linkHeight / 2 },
                stiffness: 1,
                render: {
                    visible: this.constraintsVisible
                }

            }))

            this.wallSupports.push(Constraint.create({
                bodyA: this.walls[2],
                bodyB: this.links[i],
                length: Math.hypot(this.walls[2].position.x - this.links[i].position.x, this.walls[2].position.y - this.links[i].position.y),
                pointA: { x: 0, y: 0 },
                pointB: { x: 0, y: 0 },
                stiffness: 1,
                render: {
                    visible: this.constraintsVisible
                }
            }))

        }


        this.goal = Bodies.rectangle(this.goalX, this.goalY, this.robotA, this.robotA, {
            isStatic: true,
            render: {
                fillStyle: "transparent",
                lineWidth: 3,
                strokeStyle: "green"
            },
            chamfer: { radius: 10 },
            isSensor: true,
            label: "goal"
        })


        var yLoc = this.wall_width / 2 + 2 * (this.links.length + 1) + this.links.length * this.linkHeight + this.robotA / 2
        this.hand = Bodies.rectangle(this.percentX(50), this.percentY(100) - yLoc, this.robotA, this.robotA, {
            render: {
                fillStyle: this.handColor
            },
            chamfer: { radius: 10 },
            label: "hand"
        })

        this.handAngle = 0 // just bookkeeping - not specifiable, but could be


        // add this to the joints array in order to rotate the hand
        var lastLink = this.links[this.links.length - 1]
        this.handRightSupport = Constraint.create({
            bodyA: lastLink,
            bodyB: this.hand,
            length: this.robotA / 2 + 2 * this.jointOffset + this.linkHeight / 2,
            stiffness: 1,
            pointA: { x: 0, y: 0 },
            pointB: { x: 0, y: 0 },
            render: {
                visible: this.constraintsVisible
            }
        })


        this.joints.push(Constraint.create({
            bodyA: lastLink,
            bodyB: this.hand,
            length: 0,
            stiffness: 1,
            pointA: { x: 0, y: -1 * this.linkHeight / 2 - this.jointOffset },
            pointB: { x: 0, y: this.robotA / 2 + this.jointOffset }

        }))

        Body.setAngle(this.goal, this.goalAngle)

        World.add(this.world, this.links)
        World.add(this.world, this.joints)
        World.add(this.world, this.centerSupports)
        World.add(this.world, this.btSupports)
        World.add(this.world, this.bbSupports)
        World.add(this.world, this.hand)
        World.add(this.world, this.handRightSupport)
        World.add(this.world, this.goal)

        /* Handles each 'tick' of the physics engine */
        Events.on(engine, 'beforeUpdate', (event) => {
            this.updateBodies()
        })

        /* Checks for winning condition - checks the depth of the collision (max value is this.robotA) as well as the location of the centers of the goal/robot */
        Events.on(engine, "collisionActive", (e) => {
            for (var pair of e.pairs) {
                if (pair.bodyA.label === "hand" && pair.bodyB.label === "goal" || pair.bodyA.label === "goal" && pair.bodyB.label === "hand") {
                    if (pair.collision.depth / this.robotA >= this.winPositionThreshold && Math.hypot(this.hand.position.x - this.goal.position.x, this.hand.position.y - this.goal.position.y) <= this.percentX(1.3)) {
                        this.onWin()
                    }
                }
            }
        })

        Engine.run(engine)
        Render.run(render)

        document.addEventListener("keydown", this.handleKeyPress, false);
        document.addEventListener("keyup", this.handleKeyPress, false)


    }

    /* Handles winning condition. Sets all bodies immovable and winning mode on. Eventually must collect data and submit. */
    onWin() {
        for (var i of this.links) {
            Body.setStatic(i, true)
        }

        Body.setStatic(this.hand, true)
        this.setState({
            mode: 3
        })
    }



    /* Prepares the system for joint rotation. Stops all joints from moving, recalculates support lengths. */
    prepareJointRotate() {
        for (var i of this.links) {
            Body.setAngularVelocity(i, 0)
        }

        Body.setAngularVelocity(this.hand, 0)

        for (var i = 0; i < this.links.length; i++) {
            if (i !== 0) {
                this.centerSupports[i - 1].length = this.getDistance(i - 1)
                this.btSupports[i - 1].length = this.getBTDistance(i - 1)
                this.bbSupports[i - 1].length = this.getBBDistance(i - 1)
            }
            this.centerSupports[i].length = this.getDistance(i)
            this.btSupports[i].length = this.getBTDistance(i)
            this.bbSupports[i].length = this.getBBDistance(i)

            if (i < this.links.length - 1) {
                this.centerSupports[i + 1].length = this.getDistance(i + 1)
                this.btSupports[i + 1].length = this.getBTDistance(i + 1)
                this.bbSupports[i + 1].length = this.getBBDistance(i + 1)
            }
        }

        var lastLink = this.links[this.links.length - 1]
        this.handRightSupport.length = Math.hypot(this.hand.position.x - lastLink.position.x, this.hand.position.y - lastLink.position.y)
    }


    /* Prepares the system for hand movement.  Stops all joints from moving and removes all supports. */
    prepareHandMove() {
        for (var i of this.links) {
            Body.setAngularVelocity(i, 0)
        }

        Body.setAngularVelocity(this.hand, 0)

        World.remove(this.world, this.handRightSupport)
        World.remove(this.world, this.bbSupports)
        World.remove(this.world, this.btSupports)
        World.remove(this.world, this.centerSupports)
        World.remove(this.world, this.wallSupports)
    }

    /* Prepares hand rotation. Adds wall supports and removes hand support.  May remove this when converting hand rotation to joint rotation */
    prepareHandRotate() {
        for (var i of this.links) {
            Body.setAngularVelocity(i, 0)
        }

        for (var i = 0; i < this.links.length; i++) {
            this.wallSupports[i].length = Math.hypot(this.walls[2].position.x - this.links[i].position.x, this.walls[2].position.y - this.links[i].position.y)
        }


        Body.setAngularVelocity(this.hand, 0)
        World.add(this.world, this.wallSupports)
        World.remove(this.world, this.handRightSupport)
    }

    /* Handles the mode change (when the mode buttons are clicked) */
    handleModeChange(mode) {
        // if the previous mode is hand movement, we must add back the supports with new lengths.
        if (this.state.mode === 2) {
            this.prepareJointRotate()
            World.add(this.world, this.centerSupports)
            World.add(this.world, this.btSupports)
            World.add(this.world, this.bbSupports)
        }

        var q = this.state.currentNode
        // if the previous mode is joint rotation, the physics engine has removed the supports for the current link.  Add them back.
        if (this.state.mode === 0) {
            World.add(this.world, this.centerSupports[q])
            World.add(this.world, this.btSupports[q])
            World.add(this.world, this.bbSupports[q])
        }

        // if the previous mode is hand rotation, we need to remove the wall supports since they are only used for hand rotation
        if (this.state.mode === 1) {
            World.remove(this.world, this.wallSupports)
        }

        this.handAngle = this.hand.angle

        switch (mode) {
            case 0:
                World.add(this.world, this.handRightSupport)
                this.prepareJointRotate()
                break
            case 1:
                this.prepareHandRotate()
                break
            case 2:
                this.prepareHandMove()
                break
        }
        this.setState({
            mode: mode
        })
    }

    /* Calculates amount of pixels based on window size. */
    percentX(percent) {
        var min = Math.min(.8 * window.innerWidth, .8 * window.innerHeight)
        return Math.round(percent / 100 * min)
    }

    /* Calculates amount of pixels based on window size. */
    percentY(percent) {
        var min = Math.min(.8 * window.innerWidth, .8 * window.innerHeight)
        return Math.round(percent / 100 * min)
    }

    /* Calculates the distance between the center of this link and the link directly below it. For bottom link, calculates distance to the right wall. */
    getDistance(i) {
        var posA = i === 0 ? this.walls[2].position : this.links[i - 1].position
        var posB = this.links[i].position

        return Math.hypot(posA.x - posB.x, posA.y - posB.y)
    }

    /* Calculates the BT distance between this link (T) and the link directly below it (B). */
    getBTDistance(i) {
        if (i === 0) return this.getDistance(i)
        var posA = this.links[i - 1].position
        var posB = this.links[i].position
        var thetaA = this.links[i - 1].angle
        var thetaB = this.links[i].angle
        // posA bottom, posB top
        var dx = (posA.x - this.linkHeight / 2 * Math.sin(thetaA)) - (posB.x + this.linkHeight / 2 * Math.sin(thetaB))
        var dy = (posA.y + this.linkHeight / 2 * Math.cos(thetaA)) - (posB.y - this.linkHeight / 2 * Math.cos(thetaB))
        return Math.hypot(dx, dy)
    }

    /* Calculates the BB distance between this link and the link directly below it. */
    getBBDistance(i) {
        if (i === 0) return this.getDistance(i)

        var posA = this.links[i - 1].position
        var posB = this.links[i].position
        var thetaA = this.links[i - 1].angle
        var thetaB = this.links[i].angle
        // posA bottom, posB bottom
        var dx = (posA.x - this.linkHeight / 2 * Math.sin(thetaA)) - (posB.x - this.linkHeight / 2 * Math.sin(thetaB))
        var dy = (posA.y + this.linkHeight / 2 * Math.cos(thetaA)) - (posB.y + this.linkHeight / 2 * Math.cos(thetaB))
        return Math.hypot(dx, dy)
    }

    /* Updates the lengths of supports for adjacent links to the current one (NOT ALL LINKS). */
    updateLengths() {
        for (var i of this.links) {
            Body.setAngularVelocity(i, 0)
        }

        var i = this.state.currentNode
        if (i !== 0) {
            this.centerSupports[i - 1].length = this.getDistance(i - 1)
            this.btSupports[i - 1].length = this.getBTDistance(i - 1)
            this.bbSupports[i - 1].length = this.getBBDistance(i - 1)
        }
        this.centerSupports[i].length = this.getDistance(i)
        this.btSupports[i].length = this.getBTDistance(i)
        this.bbSupports[i].length = this.getBBDistance(i)

        if (i < this.links.length - 1) {
            this.centerSupports[i + 1].length = this.getDistance(i + 1)
            this.btSupports[i + 1].length = this.getBTDistance(i + 1)
            this.bbSupports[i + 1].length = this.getBBDistance(i + 1)
        }
    }

    handleKeyPress(event) {
        var validKeys = new Set([" ", "w", "a", "s", "d", "ArrowUp", "ArrowLeft", "ArrowRight", "ArrowDown"])
        if (validKeys.has(event.key)) this.keys[event.key] = event.type === "keydown"

        if (event.type === "keydown") {
            var mode = this.state.mode

            if (mode === 0) {
                if (event.key === "w" && this.state.currentNode < this.links.length - 1) {
                    for (var i of this.links) {
                        Body.setAngularVelocity(i, 0)
                    }

                    // lengths of supports may have changed, need to update
                    this.updateLengths()


                    // add the supports to keep the previous joint in place, remove the supports for the new joint so it can move
                    World.add(this.world, this.centerSupports[this.state.currentNode])
                    World.add(this.world, this.btSupports[this.state.currentNode])
                    World.add(this.world, this.bbSupports[this.state.currentNode])

                    World.remove(this.world, this.centerSupports[this.state.currentNode + 1])
                    World.remove(this.world, this.btSupports[this.state.currentNode + 1])
                    World.remove(this.world, this.bbSupports[this.state.currentNode + 1])

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

                    this.updateLengths()


                    World.add(this.world, this.centerSupports[this.state.currentNode])
                    World.add(this.world, this.btSupports[this.state.currentNode])
                    World.add(this.world, this.bbSupports[this.state.currentNode])

                    World.remove(this.world, this.centerSupports[this.state.currentNode - 1])
                    World.remove(this.world, this.btSupports[this.state.currentNode - 1])
                    World.remove(this.world, this.bbSupports[this.state.currentNode - 1])

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

    /* Handles the update of the physics engine based on mode and state of keys pressed. */
    updateBodies() {

        if (this.state.mode == 0) {
            // handles joint rotation

            var q = this.state.currentNode
            
            // any links below the current node will not move, therefore their inertia may be set to infinity to simplify movement and eliminate wiggling
            for (var i = 0; i < q; i++) {
                Body.setInertia(this.links[i], Infinity)
            }

            // any links above the current node will move, therefore their inertia must be non-infinite so that the relative angles between links will not change
            for (var i = q; i < this.links.length; i++) {
                Body.setInertia(this.links[i], this.inertia)
            }

            World.remove(this.world, this.centerSupports[q])
            World.remove(this.world, this.btSupports[q])
            World.remove(this.world, this.bbSupports[q])

            if (this.keys["a"]) {
                Body.setAngularVelocity(this.links[q], -1 * this.jointAngularVelocity)
            } else if (this.keys["d"]) {
                Body.setAngularVelocity(this.links[q], 1 * this.jointAngularVelocity)
            } else {
                for (var i of this.links) {
                    Body.setAngularVelocity(i, 0)
                }
                Body.setAngularVelocity(this.links[q], 0)
            }

        } else if (this.state.mode == 1) {
            // handles hand rotation

            if (this.keys["a"]) {
                Body.setAngularVelocity(this.hand, -1 * this.jointAngularVelocity)
            } else if (this.keys["d"]) {
                Body.setAngularVelocity(this.hand, 1 * this.jointAngularVelocity)
            } else {
                Body.setAngularVelocity(this.hand, 0)
            }
        } else if (this.state.mode === 2) {

            // handles hand movement
            for (var i of this.links) {
                Body.setInertia(i, this.inertia)
            }

            Matter.Body.setStatic(this.hand, true)
            var cos = this.handVelocity * Math.cos(this.handAngle)
            var sin = this.handVelocity * Math.sin(this.handAngle)
            if (this.keys["w"]) {
                Matter.Body.setPosition(this.hand, Matter.Vector.add(this.hand.position, Matter.Vector.create(sin, -1 * cos)))
            } else if (this.keys["s"]) {
                Matter.Body.setPosition(this.hand, Matter.Vector.add(this.hand.position, Matter.Vector.create(-1 * sin, cos)))
            } else if (this.keys["a"]) {
                Matter.Body.setPosition(this.hand, Matter.Vector.add(this.hand.position, Matter.Vector.create(-1 * cos, -1 * sin)))
            } else if (this.keys["d"]) {
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
                    {
                        this.state.mode > 2 && <p>YOU WON</p>
                    }
                </div>
                <div className="centered-content">
                    <canvas id="world"></canvas>
                </div>
                <div id="robotControlButtons" style={{ display: "flex", flexDirection: "row", justifyContent: "center", width: "100%" }}>
                    <Button disabled={this.state.mode === 0 || this.state.mode > 2} onClick={() => this.handleModeChange(0)} name="rotatejoints">Rotate joints</Button>
                    <Button disabled={this.state.mode === 1 || this.state.mode > 2} onClick={() => this.handleModeChange(1)} name="rotatehand">Rotate hand</Button>
                    <Button disabled={this.state.mode === 2 || this.state.mode > 2} onClick={() => this.handleModeChange(2)} name="movehand">Move hand</Button>
                </div>
            </div>
        )
    }
}
export default Scene;