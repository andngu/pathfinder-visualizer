// Heuristic function (Manhattan)
export const heuristic = (nodeA, nodeB) => {
  let d1 = Math.abs(nodeB.row - nodeA.row);
  let d2 = Math.abs(nodeB.col - nodeA.col);
  return d1 + d2;
 };

export const areNodesEqual = (node1, node2) => {
  return node1.row === node2.row && node1.col === node2.col;
};