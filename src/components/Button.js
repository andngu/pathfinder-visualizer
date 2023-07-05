import React from 'react';

function Button({findShortestPath, isRunning}) {


  const handleButtonClick = () => {
    findShortestPath();
  };

  return (
    <button onClick={handleButtonClick} disabled={isRunning}>
      {isRunning ? 'Running...' : 'Find Path'}
    </button>
  );
}

export default Button;
