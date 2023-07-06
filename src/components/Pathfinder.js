import React, { useState, useCallback } from 'react';
import { heuristic, areNodesEqual } from './pathfinding-utils'; // Import the heuristic function
import { Button, ButtonGroup } from '@mui/material';

// Constants
const numRows = 20;
const numCols = 20;
const wallProbability = 0.2;

// Generate initial grid
const createGrid = () => {
  const grid = [];
  for (let row = 0; row < numRows; row++) {
    const currentRow = [];
    for (let col = 0; col < numCols; col++) {
      const isStart = row === 0 && col === 0;
      const isEnd = row === numRows - 1 && col === numCols - 1;
      const isWall = !isStart && !isEnd && Math.random() < wallProbability;

      currentRow.push({
        row,
        col,
        isStart,
        isEnd,
        isVisited: false,
        isWall,
        f: Infinity,
        g: Infinity,
        h: Infinity,
        prev: null,
      });
    }
    grid.push(currentRow);
  }
  return grid;
};

const depthFirstSearch = (startNode, endNode, grid) => {
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


const breadthFirstSearch = (startNode, endNode, grid) => {
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

const dijkstra = (startNode, endNode, grid) => {
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


const aStar = (startNode, endNode, grid) => {
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

      if (!openSet.includes(neighborNode)) {
        openSet.push(neighborNode);
      } else if (tentativeGScore >= neighborNode.g) {
        continue;
      }

      prev[neighborRow][neighborCol] = currentNode;
      neighborNode.g = tentativeGScore;
      neighborNode.h = heuristic(neighborNode, endNode);
      neighborNode.f = neighborNode.g + neighborNode.h;
    }
  }
  // If we've exited the loop without returning, then no path exists
  return { prev, visitedNodesInOrder };
};

// Get neighboring nodes
const getNeighbors = (row, col, grid) => {
  const neighbors = [];
  if (row > 0) neighbors.push([row - 1, col]);
  if (row < numRows - 1) neighbors.push([row + 1, col]);
  if (col > 0) neighbors.push([row, col - 1]);
  if (col < numCols - 1) neighbors.push([row, col + 1]);
  return neighbors;
};

function Pathfinder() {
  const [grid, setGrid] = useState(createGrid);
  const [startNode, setStartNode] = useState(grid[0][0]);
  const [endNode, setEndNode] = useState({ row: numRows - 1, col: numCols - 1 });
  const [visitedNodes, setVisitedNodes] = useState([]);
  const [shortestPath, setShortestPath] = useState([]);
  const [isRunning, setIsRunning] = useState(false);
  const [selectedAlgorithm, setSelectedAlgorithm] = useState(null);

  const handleNodeClick = useCallback((row, col) => {
    if (isRunning) return;
  
    const newGrid = grid.map((rowNodes) =>
      rowNodes.map((node) => {
        if (node.isStart || node.isEnd) {
          // If the clicked node is the start or end node, return the node as it is
          return node;
        }
        if (node.row === row && node.col === col) {
          // Handle other nodes as needed
          return { ...node, isWall: !node.isWall };
        }
        return node;
      })
    );
  
    setGrid(newGrid);
  }, [grid, isRunning]);
  

  const constructPath = useCallback((prev) => {
    const shortestPathNodesInOrder = [];
    let currentNode = endNode;
  
    while (currentNode !== null) {
      shortestPathNodesInOrder.push({ row: currentNode.row, col: currentNode.col });
      currentNode = prev[currentNode.row][currentNode.col];
      console.log(currentNode)
    }
  
    setShortestPath(shortestPathNodesInOrder.reverse());
  }, [endNode]);
  
  const runAlgorithm = useCallback(async (algorithm) => {
    if (isRunning) return;
    
    setIsRunning(true);
    setVisitedNodes([]);
    setShortestPath([]);
    setSelectedAlgorithm(algorithm);
  
    // Define the algorithms dictionary
    const algorithms = {
      'BFS': breadthFirstSearch,
      'A*': aStar,
      'DFS': depthFirstSearch,
      'Dijkstra': dijkstra
    };
    
    const result = algorithms[algorithm](startNode, endNode, grid);
    
    let prev = result.prev;
    let visitedNodesInOrder = result.visitedNodesInOrder;
      
    for (let i = 0; i < visitedNodesInOrder.length; i++) {
      const node = visitedNodesInOrder[i];
      await new Promise((resolve) => setTimeout(resolve, 10)); // Delay between each animation
      setVisitedNodes((prevVisitedNodes) => [...prevVisitedNodes, node]);
    }
  
    constructPath(prev);
    setIsRunning(false);
  }, [startNode, endNode, grid, constructPath, isRunning]);
  
  const handleReset = () => {
    if (isRunning) return;
  
    setGrid(createGrid);
    setStartNode({ row: 0, col: 0 });
    setEndNode({ row: numRows - 1, col: numCols - 1 });
    setVisitedNodes([]);
    setShortestPath([]);
    setSelectedAlgorithm(null);
  };
  
  return (
    <>
      <h1 style={{color: 'white'}}>Pathfinding Visualizer</h1>
      <ButtonGroup variant="contained" aria-label="outlined primary button group">
        <Button onClick={() => runAlgorithm('BFS')} disabled={isRunning}>Breadth-First</Button>
        <Button onClick={() => runAlgorithm('DFS')} disabled={isRunning}>Depth-First</Button>
        <Button onClick={() => runAlgorithm('Dijkstra')} disabled={isRunning}>Dijkstra</Button>
        <Button onClick={() => runAlgorithm('A*')} disabled={isRunning}>A*</Button>
      </ButtonGroup>
      
      <div className="Grid">
        {grid.map((row, rowIndex) =>
          row.map(({ isStart, isEnd, isWall }, colIndex) => {
            const isVisited = visitedNodes.some(
              (visitedNode) =>
                visitedNode.row === rowIndex && visitedNode.col === colIndex
            );
            const isPath = shortestPath.some(
              (pathNode) =>
                pathNode.row === rowIndex && pathNode.col === colIndex
            );

            return (
              <div
                key={`${rowIndex}-${colIndex}`}
                className={`Node${isStart ? ' Start' : ''}${
                  isEnd ? ' End' : ''
                }${isWall ? ' Wall' : ''}${isVisited ? ' Visited' : ''}${
                  isPath ? ' Path' : ''
                }`}
                onClick={() => handleNodeClick(rowIndex, colIndex)}
              />
            );
          })
        )}
      </div>
      <Button variant="contained" onClick={handleReset} disabled={isRunning}>Reset</Button>
    </>
  );
}

export default Pathfinder;
