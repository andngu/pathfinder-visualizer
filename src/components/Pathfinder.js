import React, { useState, useCallback } from 'react';
import { breadthFirstSearch, depthFirstSearch, dijkstra, aStar } from './pathfinding-utils'; // Import the heuristic function
import { Button, ButtonGroup } from '@mui/material';

// Constants
const numRows = 30;
const numCols = 40;
const wallProbability = 0.1;

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

function Pathfinder() {
  const [grid, setGrid] = useState(createGrid);
  const [startNode, setStartNode] = useState(grid[0][0]);
  const [endNode, setEndNode] = useState({ row: numRows - 1, col: numCols - 1 });
  const [visitedNodes, setVisitedNodes] = useState([]);
  const [shortestPath, setShortestPath] = useState([]);
  const [isRunning, setIsRunning] = useState(false);
  const [selectedAlgorithm, setSelectedAlgorithm] = useState(null);
  const [isMouseDown, setIsMouseDown] = useState(false);

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

  const handleMouseDown = useCallback((row, col) => {
    if (isRunning) return;
  
    const newGrid = grid.map((rowNodes) =>
      rowNodes.map((node) => {
        if (node.isStart || node.isEnd) {
          // If the node is the start or end node, return the node as it is
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
    setIsMouseDown(true);
  }, [grid, isRunning]);
  
  
  const handleMouseUp = useCallback(() => {
    if (isRunning) return;
  
    setIsMouseDown(false);
  }, [isRunning]);
  
  const handleMouseEnter = useCallback((row, col) => {
    if (isRunning || !isMouseDown) return;
  
    const newGrid = grid.map((rowNodes) =>
      rowNodes.map((node) => {
        if (node.isStart || node.isEnd) {
          // If the node is the start or end node, return the node as it is
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
  }, [grid, isRunning, isMouseDown]);

  const constructPath = useCallback(async (prev) => {
    const shortestPathNodesInOrder = [];
    let currentNode = endNode;
  
    while (currentNode !== null && currentNode !== undefined) {
      shortestPathNodesInOrder.push({ row: currentNode.row, col: currentNode.col });
      currentNode = prev[currentNode.row][currentNode.col];
      console.log(currentNode)
    }
  
    shortestPathNodesInOrder.reverse();
    for (let i = 0; i < shortestPathNodesInOrder.length; i++) {
      const node = shortestPathNodesInOrder[i];
      await new Promise((resolve) => setTimeout(resolve, 10));
      setShortestPath((prevVisitedNodes) => [...prevVisitedNodes, node]);
    }
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
      await new Promise((resolve) => setTimeout(resolve, 1)); // Delay between each animation
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
      <h1 style={{color: 'white'}}>Pathfinder Visualizer</h1>
      {isRunning ? <h2 style={{color: 'white'}}>{selectedAlgorithm}</h2> : <ButtonGroup variant="contained" aria-label="outlined primary button group">
        <Button onClick={() => runAlgorithm('BFS')} disabled={isRunning}>Breadth-First</Button>
        <Button onClick={() => runAlgorithm('DFS')} disabled={isRunning}>Depth-First</Button>
        <Button onClick={() => runAlgorithm('Dijkstra')} disabled={isRunning}>Dijkstra</Button>
        {/* 
        TODO: re-enable when A* is fixed
        <Button onClick={() => runAlgorithm('A*')} disabled={true}>A*</Button> 
        */}
      </ButtonGroup>}
      
      <div
        className="Grid"
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
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
                onMouseEnter={() => handleMouseEnter(rowIndex, colIndex)}
                onDragStart={(e) => e.preventDefault()}
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
