export default class AStar {
    // expects a grid made up of AStarNode objects
    constructor(grid) {
        this.grid = grid
    }

    init() {
        for (var x = 0; x < this.grid.length; x++) {
            for (var y = 0; y < this.grid[x].length; y++) {
                var node = this.grid[x][y]
                node.f = 0
                node.g = 0
                node.h = 0
                node.cost = 1
                node.visited = false
                node.closed = false
                node.parent = null
            }
        }
    }

    heap() {
        return new BinaryHeap((node) => {return node.f})
    }

    // passed start and end as AStarNode objects
    search(start, end, heuristic) {
        this.init()
        heuristic = heuristic || this.manhattan

        var openHeap = this.heap()

        openHeap.push(start);

        while (openHeap.size() > 0) {
            var currentNode = openHeap.pop();
            if (currentNode === end) {
                var curr = currentNode
                var ret = []
                while (curr.parent) {
                    ret.push(curr)
                    curr = curr.parent
                }
                return ret.reverse()
            }

            currentNode.closed = true

            var neighbors = this.neighbors(this.grid, currentNode)

            for (var i = 0; i < neighbors.length; i++) {
                var neighbor = neighbors[i]

                if (neighbor.closed || neighbor.isOccupied) {
                    continue
                }

                var gScore = currentNode.g + neighbor.cost
                var visited = neighbor.visited

                if (!visited || gScore < neighbor.g) {
                    neighbor.visited = true
                    neighbor.parent = currentNode
                    neighbor.h = neighbor.h || heuristic(neighbor.pos, end.pos)
                    neighbor.g = gScore
                    neighbor.f = neighbor.g + neighbor.h

                    if (!visited) {
                        openHeap.push(neighbor)
                    } else {
                        openHeap.rescoreElement(neighbor)
                    }
                }

            }
        }

        return []
    }

    neighbors(grid, currentNode) {
        var ret = []
        var x = currentNode.x
        var y = currentNode.y

        if (grid[x-1] && grid[x-1][y]) ret.push(grid[x-1][y])

        if (grid[x+1] && grid[x+1][y]) ret.push(grid[x+1][y])

        if (grid[x] && grid[x][y-1]) ret.push(grid[x][y-1])

        if (grid[x] && grid[x][y+1]) ret.push(grid[x][y+1])

        return ret;
    }

    manhattan(a, b) {
        var d1 = Math.abs(b.x - a.x)
        var d2 = Math.abs(b.y - a.y)
        return d1 + d2
    }
}

function BinaryHeap(scoreFunction) {
    this.content = [];
    this.scoreFunction = scoreFunction;
  }
  
  BinaryHeap.prototype = {
    push: function(element) {
      // Add the new element to the end of the array.
      this.content.push(element);
  
      // Allow it to sink down.
      this.sinkDown(this.content.length - 1);
    },
    pop: function() {
      // Store the first element so we can return it later.
      var result = this.content[0];
      // Get the element at the end of the array.
      var end = this.content.pop();
      // If there are any elements left, put the end element at the
      // start, and let it bubble up.
      if (this.content.length > 0) {
        this.content[0] = end;
        this.bubbleUp(0);
      }
      return result;
    },
    remove: function(node) {
      var i = this.content.indexOf(node);
  
      // When it is found, the process seen in 'pop' is repeated
      // to fill up the hole.
      var end = this.content.pop();
  
      if (i !== this.content.length - 1) {
        this.content[i] = end;
  
        if (this.scoreFunction(end) < this.scoreFunction(node)) {
          this.sinkDown(i);
        } else {
          this.bubbleUp(i);
        }
      }
    },
    size: function() {
      return this.content.length;
    },
    rescoreElement: function(node) {
      this.sinkDown(this.content.indexOf(node));
    },
    sinkDown: function(n) {
      // Fetch the element that has to be sunk.
      var element = this.content[n];
  
      // When at 0, an element can not sink any further.
      while (n > 0) {
  
        // Compute the parent element's index, and fetch it.
        var parentN = ((n + 1) >> 1) - 1;
        var parent = this.content[parentN];
        // Swap the elements if the parent is greater.
        if (this.scoreFunction(element) < this.scoreFunction(parent)) {
          this.content[parentN] = element;
          this.content[n] = parent;
          // Update 'n' to continue at the new position.
          n = parentN;
        }
        // Found a parent that is less, no need to sink any further.
        else {
          break;
        }
      }
    },
    bubbleUp: function(n) {
      // Look up the target element and its score.
      var length = this.content.length;
      var element = this.content[n];
      var elemScore = this.scoreFunction(element);
  
      while (true) {
        // Compute the indices of the child elements.
        var child2N = (n + 1) << 1;
        var child1N = child2N - 1;
        // This is used to store the new position of the element, if any.
        var swap = null;
        var child1Score;
        // If the first child exists (is inside the array)...
        if (child1N < length) {
          // Look it up and compute its score.
          var child1 = this.content[child1N];
          child1Score = this.scoreFunction(child1);
  
          // If the score is less than our element's, we need to swap.
          if (child1Score < elemScore) {
            swap = child1N;
          }
        }
  
        // Do the same checks for the other child.
        if (child2N < length) {
          var child2 = this.content[child2N];
          var child2Score = this.scoreFunction(child2);
          if (child2Score < (swap === null ? elemScore : child1Score)) {
            swap = child2N;
          }
        }
  
        // If the element needs to be moved, swap it, and continue.
        if (swap !== null) {
          this.content[n] = this.content[swap];
          this.content[swap] = element;
          n = swap;
        }
        // Otherwise, we are done.
        else {
          break;
        }
      }
    }
  };