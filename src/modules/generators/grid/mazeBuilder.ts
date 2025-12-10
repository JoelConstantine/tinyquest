/**
 * @packageDocumentation
 * Maze generation using depth-first search with backtracking (recursive backtracker algorithm).
 */
import type { Grid, Cell } from "./grid";
import { type IBuilder } from "./builders";
import { gridLogger } from "./roomBuilder";

/**
 * Generates a maze by carving passages through a grid using the recursive backtracker algorithm.
 *
 * The algorithm works by:
 * 1. Starting at a random cell and marking it as visited
 * 2. Randomly choosing an unvisited neighbor and carving a passage to it
 * 3. Recursively repeating until no unvisited neighbors remain
 * 4. Backtracking to find cells with unvisited neighbors
 *
 * Implements the {@link IBuilder} interface for use with dungeon generation pipelines.
 */
export class MazeBuilder implements IBuilder {
  grid: Grid;
  unvisited: Cell[] = [];
  currentCell: Cell | null = null;
  stack: Cell[] = [];
  /**
   * Creates a new maze builder for the given grid.
   * @param grid - The grid to carve a maze into.
   */
  constructor(grid: Grid) {
    this.grid = grid;
    this.unvisited = this.grid.cells.filter(c => c.visited === false);
  }

  /**
   * Randomly selects an unvisited cell from the unvisited list and removes it.
   * @returns A randomly selected unvisited cell, or null if none remain.
   */
  findUnvisitedCell(): Cell | null {
    if (this.unvisited.length === 0) {
      return null;
    }
    const index = Math.floor(Math.random() * this.unvisited.length);
    const cell = this.unvisited[index];
    this.unvisited = this.unvisited.filter(c => c !== cell);
    return cell || null;
  }

  /**
   * Finds a random unvisited neighbor of the given cell.
   * Checks all four cardinal directions (top, right, bottom, left).
   * @param cell - The cell to find neighbors of.
   * @returns A random unvisited neighbor, or undefined if none exist.
   */
  getUnvisitedNeighbor(cell: Cell): Cell | undefined {
    const neighbors: Cell[] = [];
    const directions = [
      { dx: 0, dy: -1 }, // top
      { dx: 1, dy: 0 }, // right
      { dx: 0, dy: 1 }, // bottom
      { dx: -1, dy: 0 } // left
    ];
    for (const dir of directions) {
      const neighbor = this.grid.getCell(cell.x + dir.dx, cell.y + dir.dy);
      if (neighbor && !neighbor.visited) {
        neighbors.push(neighbor);
      }
    }

    return neighbors[Math.floor(Math.random() * neighbors.length)];
  }

  /**
   * Removes walls between two adjacent cells to carve a passage.
   * If next is null, isolates the current cell by setting all walls.
   * Otherwise, opens walls between the two cells based on their relative position.
   * @param current - The current cell.
   * @param next - The next cell to carve to, or null to isolate current.
   */
  removeWall(current: Cell, next: Cell | null) {
    if (next === null) {
      current.walls.top = true;
      current.walls.bottom = true;
      current.walls.left = true;
      current.walls.right = true;
      return;
    };
    const dx = next.x - current.x;
    const dy = next.y - current.y;

    next.walls.top = true;
    next.walls.bottom = true;
    next.walls.left = true;
    next.walls.right = true;

    if (dx === 1) {
      current.walls.right = false;
      next.walls.left = false;
    } else if (dx === -1) {
      current.walls.left = false;
      next.walls.right = false;
    } else if (dy === 1) {
      current.walls.bottom = false;
      next.walls.top = false;
    } else if (dy === -1) {
      current.walls.top = false;
      next.walls.bottom = false;
    }
  }

  /**
   * Initializes the current cell if not already set.
   * Finds the first unvisited cell, marks it as visited, and logs the start.
   */
  setCurrentCell() {
    if (this.currentCell) return;
    this.currentCell = this.findUnvisitedCell();
    if (!this.currentCell) return;
    this.removeWall(this.currentCell, null);
    this.currentCell.visited = true;
    this.unvisited = this.unvisited.filter(c => c !== this.currentCell);
    gridLogger.log(`Starting new carve at (${this.currentCell.x}, ${this.currentCell.y})`);
  }

  /**
   * Performs one iteration of maze carving.
   * Finds an unvisited neighbor of the current cell and carves a passage to it.
   * If no neighbors exist, backtracks to the previous cell.
   * @returns True if carving continued, false if the maze generation is complete.
   */
  carve() {
    this.setCurrentCell();
    if (!this.currentCell) {
      gridLogger.log("No current cell to carve from");
      return false;
    }


    const nextCell = this.getUnvisitedNeighbor(this.currentCell);
    if (nextCell) {
      this.stack.push(this.currentCell);
      gridLogger.log(`Carving from (${this.currentCell.x}, ${this.currentCell.y}) to (${nextCell.x}, ${nextCell.y})`);
      this.removeWall(this.currentCell, nextCell);
      this.currentCell = nextCell;
      this.currentCell.visited = true;
      this.unvisited = this.unvisited.filter(c => c !== this.currentCell);
      return true
    } else {
      gridLogger.log(`Backtracking from (${this.currentCell.x}, ${this.currentCell.y})`);
      this.currentCell = this.stack.pop() || null;
      this.carve()
    }
    return true;
  }

  /**
   * Completes the entire maze generation in one call.
   * Repeatedly calls step() until the maze is fully carved.
   * @returns The fully generated grid with maze carving complete.
   */
  build(): Grid {
    while (this.step()) { }
    return this.grid;
  }

  /**
   * Executes one step of the maze generation algorithm.
   * Called iteratively to allow progressive generation with visual updates.
   * @returns True if generation should continue, false if the maze is complete.
   */
  step(): boolean {
    // if unvisited is empty, we're done
    if (this.unvisited.length === 0) {
      gridLogger.log("Maze generation complete");
      return false;
    }
    gridLogger.log("MazeBuilder step");
    return this.carve();
  }
}
