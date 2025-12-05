/**
 * @packageDocumentation
 * Grid and cell data structures for dungeon generation algorithms.
 */

/**
 * Represents a single cell in a generation grid.
 * Stores position, wall state, and visited flag for pathfinding algorithms.
 */
export class Cell {
  x: number
  y: number
  walls: { top: boolean; right: boolean; bottom: boolean; left: boolean }
  visited: boolean

  /**
   * Creates a new grid cell.
   * @param x - X coordinate in the grid.
   * @param y - Y coordinate in the grid.
   */
  constructor(x: number, y: number) {
    this.x = x
    this.y = y
    this.walls = { top: false, right: false, bottom: false, left: false }
    this.visited = false
  }

  /**
   * Static factory method to create a cell.
   * @param x - X coordinate.
   * @param y - Y coordinate.
   * @returns A new cell.
   */
  static new(x: number, y: number): Cell {
    return new Cell(x, y)
  }

  /**
   * Creates a shallow copy of this cell.
   * @returns A new cell with the same coordinates.
   */
  copy() {
    return new Cell(this.x, this.y)
  }
}

/**
 * A 2D grid of cells used for procedural generation algorithms.
 * Manages cell storage, retrieval, and boundary checking.
 */
export class Grid {
  cells: Cell[] = []
  width: number
  height: number
  /**
   * Creates a new grid with the specified dimensions.
   * @param width - Grid width in cells.
   * @param height - Grid height in cells.
   */
  constructor(width: number, height: number) {
    this.width = width
    this.height = height
  }

  isInBounds(x: number, y: number): boolean {
    return x >= 0 && x < this.width && y >= 0 && y < this.height
  }

  getCell(x: number, y: number): Cell | null {
    if (!this.isInBounds(x, y)) return null
    return this.cells[y * this.width + x] || null
  }

  setCell(x: number, y: number, value: Cell): void {
    if (this.isInBounds(x, y)) {
      this.cells[y * this.width + x] = value
    }
  }

  init() {
    this.fill(new Cell(0, 0))
    return this
  }

  fill(fillCell: Cell) {
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        const cell = fillCell.copy()
        cell.x = x
        cell.y = y 
        this.setCell(x, y, cell)
      }
    }
    return this
  }
  static new(width: number, height: number): Grid {
    return new Grid(width, height).init()
  }
}