// Heuristic function (Manhattan)
export const heuristic = (nodeA, nodeB) => {
  let d1 = Math.abs(nodeB.row - nodeA.row);
  let d2 = Math.abs(nodeB.col - nodeA.col);
  return d1 + d2;
 };

export const areNodesEqual = (node1, node2) => {
  return node1.row === node2.row && node1.col === node2.col;
};

export const depthFirstSearch = (startNode, endNode, grid) => {
  const numRows = grid.length;
  const numCols = grid[0].length;
  const visited = new Set();
  const stack = [startNode];
  const prev = new Array(numRows).fill(null).map(() => new Array(numCols).fill(null));
  const visitedNodesInOrder = [];

  let endNodeFound = false;

  while (stack.length > 0 && !endNodeFound) {
    const node = stack.pop();
    const { row, col } = node;
    visited.add(`${row}-${col}`);

    if (node.isEnd) {
      endNodeFound = true;
      break;
    }

    const neighbors = getNeighbors(row, col, grid);
    for (const neighbor of neighbors) {
      const [neighborRow, neighborCol] = neighbor;
      if (
        !visited.has(`${neighborRow}-${neighborCol}`) &&
        !grid[neighborRow][neighborCol].isWall
      ) {
        stack.push(grid[neighborRow][neighborCol]);
        visited.add(`${neighborRow}-${neighborCol}`);
        prev[neighborRow][neighborCol] = node;

        visitedNodesInOrder.push(grid[neighborRow][neighborCol]);
      }
    }
  }

  return { prev, visitedNodesInOrder };
};

export const breadthFirstSearch = (startNode, endNode, grid) => {
  const numRows = grid.length;
  const numCols = grid[0].length;
  const visited = new Set();
  const queue = [startNode];
  const prev = new Array(numRows).fill(null).map(() => new Array(numCols).fill(null));
  const visitedNodesInOrder = []; 

  let endNodeFound = false;

  while (queue.length > 0 && !endNodeFound) { 
    const node = queue.shift();
    const { row, col } = node;
    visited.add(`${row}-${col}`);

    if (node.isEnd) {
      endNodeFound = true;
      break;
    }

    const neighbors = getNeighbors(row, col, grid);
    for (const neighbor of neighbors) {
      const [neighborRow, neighborCol] = neighbor;
      if (
        !visited.has(`${neighborRow}-${neighborCol}`) &&
        !grid[neighborRow][neighborCol].isWall
      ) {
        queue.push(grid[neighborRow][neighborCol]);
        visited.add(`${neighborRow}-${neighborCol}`);
        prev[neighborRow][neighborCol] = node;

        visitedNodesInOrder.push(grid[neighborRow][neighborCol]); 
      }
    }
  }

  return { prev, visitedNodesInOrder }; 
};

export const dijkstra = (startNode, endNode, grid) => {
  const numRows = grid.length;
  const numCols = grid[0].length;
  const visited = new Set();
  const distances = {};
  const prev = new Array(numRows).fill(null).map(() => new Array(numCols).fill(null));
  const visitedNodesInOrder = [];

  distances[`${startNode.row}-${startNode.col}`] = 0;

  while (true) {
    let currentNode = null;
    let minDistance = Infinity;

    // Find the unvisited node with the smallest distance
    for (let row = 0; row < numRows; row++) {
      for (let col = 0; col < numCols; col++) {
        const node = grid[row][col];
        const distance = distances[`${row}-${col}`];

        if (!visited.has(`${row}-${col}`) && distance !== undefined && distance < minDistance) {
          currentNode = node;
          minDistance = distance;
        }
      }
    }

    if (currentNode === null) {
      // No more unvisited nodes
      break;
    }

    const { row, col } = currentNode;
    visited.add(`${row}-${col}`);

    if (currentNode.isEnd) {
      break;
    }

    const neighbors = getNeighbors(row, col, grid);

    for (const neighbor of neighbors) {
      const [neighborRow, neighborCol] = neighbor;
      const neighborNode = grid[neighborRow][neighborCol];
      const distance = distances[`${row}-${col}`] + 1; // Assuming that the distance between the nodes is 1

      if (!visited.has(`${neighborRow}-${neighborCol}`) && !neighborNode.isWall) {
        if (!distances[`${neighborRow}-${neighborCol}`] || distance < distances[`${neighborRow}-${neighborCol}`]) {
          distances[`${neighborRow}-${neighborCol}`] = distance;
          prev[neighborRow][neighborCol] = currentNode;
        }

        visitedNodesInOrder.push(neighborNode);
      }
    }
  }

  return { prev, visitedNodesInOrder };
};

// TODO: fix implementation for edge case, infinite loop in constructPath
export const aStar = (startNode, endNode, grid) => {
  const numRows = grid.length;
  const numCols = grid[0].length;
  const openSet = [startNode];
  const closedSet = new Set();
  const prev = new Array(numRows).fill(null).map(() => new Array(numCols).fill(null));

  startNode.g = 0;
  startNode.h = heuristic(startNode, endNode);
  startNode.f = startNode.g + startNode.h;

  const visitedNodesInOrder = [];

  while (openSet.length > 0) {
    let currentNode = openSet[0];
    let currentIndex = 0;

    // Find the node with the lowest f score in the open set
    for (let i = 1; i < openSet.length; i++) {
      if (openSet[i].f < currentNode.f) {
        currentNode = openSet[i];
        currentIndex = i;
      }
    }

    openSet.splice(currentIndex, 1); // Remove currentNode from openSet
    closedSet.add(currentNode);

    visitedNodesInOrder.push(currentNode);

    if (areNodesEqual(currentNode, endNode)) {
      // We've reached the end node, we can reconstruct the path
      return { prev, visitedNodesInOrder };
    }

    const neighbors = getNeighbors(currentNode.row, currentNode.col, grid);

    for (const neighbor of neighbors) {
      const [neighborRow, neighborCol] = neighbor;
      const neighborNode = grid[neighborRow][neighborCol];

      if (closedSet.has(neighborNode) || neighborNode.isWall) {
        continue;
      }

      const tentativeGScore = currentNode.g + 1; // Assuming that the distance between the nodes is 1

      if (openSet.includes(neighborNode)) {
        if (tentativeGScore < neighborNode.g) {
          neighborNode.g = tentativeGScore;
          prev[neighborRow][neighborCol] = currentNode;
          neighborNode.f = neighborNode.g + neighborNode.h;
        }
      } else {
        openSet.push(neighborNode);
        neighborNode.g = tentativeGScore;
        prev[neighborRow][neighborCol] = currentNode;
        neighborNode.h = heuristic(neighborNode, endNode);
        neighborNode.f = neighborNode.g + neighborNode.h;
      }
    }
  }
  // If we've exited the loop without returning, then no path exists
  return { prev, visitedNodesInOrder };
};


// Get neighboring nodes
export const getNeighbors = (row, col, grid) => {
  const numRows = grid.length;
  const numCols = grid[0].length;

  const neighbors = [];
  if (row > 0) neighbors.push([row - 1, col]);
  if (row < numRows - 1) neighbors.push([row + 1, col]);
  if (col > 0) neighbors.push([row, col - 1]);
  if (col < numCols - 1) neighbors.push([row, col + 1]);
  return neighbors;
};