import type { Grid, Cell } from "./grid";
import { type IBuilder, gridLogger } from "./roomBuilder";

export class MazeBuilder implements IBuilder {
  grid: Grid;
  unvisited: Cell[] = [];
  currentCell: Cell | null = null;
  stack: Cell[] = [];
  constructor(grid: Grid) {
    this.grid = grid;
    this.unvisited = this.grid.cells.filter(c => c.visited === false);
  }

  findUnvisitedCell(): Cell | null {
    if (this.unvisited.length === 0) {
      return null;
    }
    const index = Math.floor(Math.random() * this.unvisited.length);
    const cell = this.unvisited[index];
    this.unvisited = this.unvisited.filter(c => c !== cell);
    return cell || null;
  }

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

  setCurrentCell() {
    if (this.currentCell) return;
    this.currentCell = this.findUnvisitedCell();
    if (!this.currentCell) return;
    this.removeWall(this.currentCell, null);
    this.currentCell.visited = true;
    this.unvisited = this.unvisited.filter(c => c !== this.currentCell);
    gridLogger.log(`Starting new carve at (${this.currentCell.x}, ${this.currentCell.y})`);
  }

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

  build(): Grid {
    while (this.step()) { }
    return this.grid;
  }

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
