export default class Node {
    constructor(x, y, isOccupied) {
        this.x = x
        this.y = y
        this.pos = {
            x, y
        }
        this.isOccupied = isOccupied
        this.f = 0
        this.g = 0
        this.h = 0
        this.cost = 1
        this.visited = false
        this.closed = false
        this.parent = null
    }
}