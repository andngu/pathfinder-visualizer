import React, { useState, useEffect, useCallback } from 'react';

const numRows = 20;
const numCols = 20;

const createGrid = () => {
  const grid = [];
  for (let row = 0; row < numRows; row++) {
    const currentRow = [];
    for (let col = 0; col < numCols; col++) {
      let isStart = false;
      let isEnd = false;
      let isWall = false;

      if (row === 0 && col === 0) {
        isStart = true;
      } else if (row === numRows - 1 && col === numCols - 1) {
        isEnd = true;
      } else {
        isWall = Math.random() < 0.2; // Adjust the probability (0.2 = 20% chance)
      }

      currentRow.push({
        row,
        col,
        isStart,
        isEnd,
        isVisited: false,
        isWall,
      });
    }
    grid.push(currentRow);
  }
  return grid;
};

function Pathfinder() {
  const [grid, setGrid] = useState(createGrid);
  const [startNode, setStartNode] = useState({ row: 0, col: 0 });
  const [endNode, setEndNode] = useState({ row: numRows - 1, col: numCols - 1 });
  const [visitedNodes, setVisitedNodes] = useState([]);
  const [shortestPath, setShortestPath] = useState([]);
  const [isRunning, setIsRunning] = useState(false);

  const handleNodeClick = useCallback((row, col) => {
    if (isRunning) return;

    const newGrid = grid.map((rowNodes) =>
      rowNodes.map((node) => {
        if (node.isStart) {
          return { ...node, isStart: false };
        }
        if (node.isEnd) {
          return { ...node, isEnd: false };
        }
        if (node.row === row && node.col === col) {
          return { ...node, isWall: !node.isWall };
        }
        return node;
      })
    );

    if (startNode.row === row && startNode.col === col) {
      setStartNode(null);
    } else if (!startNode) {
      setStartNode({ row, col });
      newGrid[row][col] = { ...newGrid[row][col], isStart: true };
    }

    if (endNode.row === row && endNode.col === col) {
      setEndNode(null);
    } else if (!endNode) {
      setEndNode({ row, col });
      newGrid[row][col] = { ...newGrid[row][col], isEnd: true };
    }

    setGrid(newGrid);
  }, [grid, startNode, endNode, isRunning]);

  const constructPath = useCallback((prev) => {
    const shortestPath = [];
    let currentNode = [endNode.row, endNode.col];

    while (currentNode) {
      shortestPath.unshift({ row: currentNode[0], col: currentNode[1] });
      currentNode = prev[`${currentNode[0]}-${currentNode[1]}`];
    }

    setShortestPath(shortestPath);
  }, [endNode]);

  const getNeighbors = useCallback((row, col) => {
    const neighbors = [];
    if (row > 0) neighbors.push([row - 1, col]);
    if (row < numRows - 1) neighbors.push([row + 1, col]);
    if (col > 0) neighbors.push([row, col - 1]);
    if (col < numCols - 1) neighbors.push([row, col + 1]);
    return neighbors;
  }, []);

  const findShortestPath = useCallback(async () => {
    const visited = new Set();
    const queue = [[startNode.row, startNode.col]];
    const prev = {};

    while (queue.length > 0) {
      const [row, col] = queue.shift();
      const node = grid[row][col];
      visited.add(`${row}-${col}`);

      if (node.isEnd) {
        break;
      }

      setIsRunning(true);
      await new Promise((resolve) => setTimeout(resolve, 5));

      setVisitedNodes((prevVisitedNodes) => [
        ...prevVisitedNodes,
        { row, col },
      ]);

      const neighbors = getNeighbors(row, col);
      for (const neighbor of neighbors) {
        const [neighborRow, neighborCol] = neighbor;
        if (
          !visited.has(`${neighborRow}-${neighborCol}`) &&
          !grid[neighborRow][neighborCol].isWall
        ) {
          queue.push([neighborRow, neighborCol]);
          visited.add(`${neighborRow}-${neighborCol}`);
          prev[`${neighborRow}-${neighborCol}`] = [row, col];
        }
      }
    }

    constructPath(prev);
    setIsRunning(false);
  }, [grid, startNode, constructPath, getNeighbors]);

  useEffect(() => {
    const handleReset = () => {
      if (isRunning) return;

      setGrid(createGrid);
      setStartNode({ row: 0, col: 0 });
      setEndNode({ row: numRows - 1, col: numCols - 1 });
      setVisitedNodes([]);
      setShortestPath([]);
    };

    document.addEventListener('keydown', handleReset);

    return () => {
      document.removeEventListener('keydown', handleReset);
    };
  }, [isRunning]);

  return (
    <>
      <button onClick={findShortestPath} disabled={isRunning}>
        {isRunning ? 'Running...' : 'Find Path'}
      </button>

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
    </>
  );
}

export default Pathfinder;
