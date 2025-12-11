/**
 * @packageDocumentation
 * Maze generation using depth-first search with backtracking (recursive backtracker algorithm).
 */
import type { Grid, Cell } from "./grid";
import { type IBuilder } from "./builders";
import { BuilderCell, gridLogger } from "./roomBuilder";

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
  currentCell: Cell | null = null;
  stack: Cell[] = [];
  maze: Set<Cell> = new Set();
  /**
   * Creates a new maze builder for the given grid.
   * @param grid - The grid to carve a maze into.
   */
  constructor(grid: Grid) {
    this.grid = grid;
    this.init()
  }

  init() {

  }

  /**
   * Randomly selects an unvisited cell from the unvisited list and removes it.
   * @returns A randomly selected unvisited cell, or null if none remain.
   */
  findUnvisitedCell(attempts = 0): Cell | null {
    if (attempts >= this.grid.cells.length) return null
    const x = Math.floor(Math.random() * this.grid.width);
    const y = Math.floor(Math.random() * this.grid.height);

    const cell = this.grid.getCell(x, y);
    if (cell === undefined) return null
    if (cell === null) {
      const cell = new BuilderCell(x, y)
      this.grid.setCell(x, y, cell);
      return cell
    }

    const nextCell = this.findUnvisitedCell(attempts++)
    return nextCell
  }

  /**
   * Finds a random unvisited neighbor of the given cell.
   * Checks all four cardinal directions (top, right, bottom, left).
   * @param cell - The cell to find neighbors of.
   * @returns A random unvisited neighbor, or undefined if none exist.
   */
  getUnvisitedNeighbor(cell: Cell): Cell | undefined {
    const neighbors = [];
    const directions = [
      { dx: 0, dy: -1 }, // top
      { dx: 1, dy: 0 }, // right
      { dx: 0, dy: 1 }, // bottom
      { dx: -1, dy: 0 } // left
    ];
    for (const dir of directions) {
      const neighbor = this.grid.getCell(cell.x + dir.dx, cell.y + dir.dy);
      if (neighbor === null) {
        neighbors.push(dir);
      }
    }

    if (neighbors.length === 0) {
      return undefined;
    }

    const randomDirection = neighbors[Math.floor(Math.random() * neighbors.length)];

    const neighbor = cell.copy()

    neighbor.x = cell.x + randomDirection.dx
    neighbor.y = cell.y + randomDirection.dy

    return neighbor
  }

  /**
   * Removes walls between two adjacent cells to carve a passage.
   * If next is null, isolates the current cell by setting all walls.
   * Otherwise, opens walls between the two cells based on their relative position.
   * @param current - The current cell.
   * @param next - The next cell to carve to, or null to isolate current.
   */
  removeWall(current: Cell, from: Cell | null) {
    current.walls.top = true;
    current.walls.bottom = true;
    current.walls.left = true;
    current.walls.right = true;

    if (from === null) return

    const dx = from.x - current.x;
    const dy = from.y - current.y;

    if (dx === 1) {
      current.walls.right = false;
      from.walls.left = false;
    } else if (dx === -1) {
      current.walls.left = false;
      from.walls.right = false;
    } else if (dy === 1) {
      current.walls.bottom = false;
      from.walls.top = false;
    } else if (dy === -1) {
      current.walls.top = false;
      from.walls.bottom = false;
    }
  }

  /**
   * Initializes the current cell if not already set.
   * Finds the first unvisited cell, marks it as visited, and logs the start.
   */
  carve(cell: Cell) {
    this.removeWall(cell, this.currentCell);

    this.currentCell = cell
    this.maze.add(this.currentCell);
    this.stack.push(cell);
    this.grid.setCell(cell.x, cell.y, cell);

    return true
  }

  /**
   * Performs one iteration of maze carving.
   * Finds an unvisited neighbor of the current cell and carves a passage to it.
   * If no neighbors exist, backtracks to the previous cell.
   * @returns True if carving continued, false if the maze generation is complete.
   */
  advanceMaze(): boolean {
    if (!this.currentCell) return false

    const nextCell = this.getUnvisitedNeighbor(this.currentCell);
    if (nextCell) {
      gridLogger.log(`Carving from (${this.currentCell.x}, ${this.currentCell.y}) to (${nextCell.x}, ${nextCell.y})`);
      this.carve(nextCell)
      return true
    } else {
      gridLogger.log(`Backtracking from (${this.currentCell.x}, ${this.currentCell.y})`);
      this.currentCell = this.stack.pop() || null;
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
    if (this.grid.cells.filter(c => c === null).length === 0) return false

    if (!this.currentCell) {
      const cell = this.findUnvisitedCell()
      if (!cell) {
        gridLogger.log("MazeBuilder complete")
        return false;
      }
      gridLogger.log(`Starting new carve at (${cell.x}, ${cell.y})`);
      return this.carve(cell);
    }

    return this.advanceMaze();
  }
}
