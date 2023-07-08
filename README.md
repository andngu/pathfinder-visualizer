# Pathfinder Visualizer
The Pathfinder Visualizer is an interactive tool designed to visually demonstrate the inner workings of various pathfinding algorithms. The goal of this project is to create a platform where users can draw walls on a grid and watch as the chosen algorithm finds the shortest path between them.

This project is designed to help both beginners and advanced programmers alike understand how popular pathfinding algorithms work by providing a step-by-step visual guide through the algorithm's process. It supports four different algorithms including Depth-First Search (DFS), Breadth-First Search (BFS), Dijkstra's Algorithm, and A* Search Algorithm (in progress).

## Technologies Used:
This project is developed using the following technologies:

    React: The project is primarily built using React, a popular JavaScript library for building user interfaces, particularly single-page applications where you need a fast, interactive user interface.

    Material-UI: The user interface is designed using Material-UI, a popular React UI framework. Material-UI provides a variety of pre-built components following Material Design guidelines by Google, making the user interface modern, responsive, and user-friendly.


React's component-based architecture is leveraged to create reusable, manageable, and testable code. Material-UI provides a consistent and attractive look-and-feel throughout the application, with built-in responsiveness to ensure the application works well on any screen size.

## How to Use:

    Clone or download the repository to your local machine.
    Install all the necessary dependencies using npm install.
    Run the application using npm start and visit http://localhost:8080 in your browser.
    Click on any cell in the grid to create a wall, or click and drag to create multiple walls.
    Select a pathfinding algorithm from the button group to start the algorithm.

## Algorithms:

This project includes the following pathfinding algorithms:

    Depth-First Search (DFS): DFS is an algorithm for traversing or searching tree or graph data structures. It uses a last-in, first-out approach, which often does not yield the shortest path.

    Breadth-First Search (BFS): BFS is another algorithm for traversing or searching tree or graph data structures. It uses a first-in, first-out approach, which guarantees the shortest path in an unweighted graph.

    Dijkstra's Algorithm: Dijkstra's Algorithm is a well-known algorithm for finding the shortest paths between nodes in a graph, which may represent, for example, road networks. It works for both directed and undirected graphs.

    A Star Algorithm*: A* is a graph traversal and path search algorithm, which is widely used in many fields of computer science due to its completeness, optimality, and optimal efficiency. It uses a best-first search and finds the least-cost path from a given initial node to one goal node.
