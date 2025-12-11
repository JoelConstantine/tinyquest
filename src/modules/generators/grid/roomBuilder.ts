/**
 * @packageDocumentation
 * Room placement utilities used by dungeon generators. Provides a simple
 * room builder that places rectangular rooms into a grid and helper types
 * used by other generators.
 */
import { Rect } from "../../../engine/utils";
import type { IGridBuilder } from "./builders";
import { Grid, Cell } from "./grid";

/**
 * A cell specialization used during room placement. Tracks which room the
 * cell belongs to and whether it has been visited/placed.
 */
export class BuilderCell extends Cell {
  visited: boolean = false
  room!: Room
  constructor(x: number, y: number) {
    super(x, y,)
  }
  /**
   * Factory helper to create a new BuilderCell.
   */
  static new(x: number, y: number) {
    return new BuilderCell(x, y)
  }

  /**
   * Open a wall in the specified cardinal direction. Direction is a
   * [dx, dy] pair where dx/dy are -1/0/1.
   */
  breakWall(direction: [number, number]) {
    const dx = direction[0]
    const dy = direction[1]

    if (dx === 1) {
      this.walls.right = false
    } else if (dx === -1) {
      this.walls.left = false
    }
    
    if (dy === 1) {
      this.walls.bottom = false;
    } else if (dy === -1) {
      this.walls.top = false;
    }
  }
}

/**
 * Lightweight logger used by the grid builders to output progress messages.
 */
class Logger {
  logFn = console.info;

  log(message: string) {
    this.logFn(message);
  }
}
export const gridLogger = new Logger();

/**
 * Options for configuring the `RoomBuilder`.
 */
type RoomBuilderOptions = {
  minRoomWidth?: number;
  minRoomHeight?: number;
  maxRoomWidth?: number;
  maxRoomHeight?: number;
  maxAttempts?: number;
};
const roomOptionsDefaults: RoomBuilderOptions = {
  minRoomWidth: 2,
  minRoomHeight: 2,
  maxRoomWidth: 5,
  maxRoomHeight: 5,
  maxAttempts: 50
};

/**
 * Represents a rectangular room composed of `BuilderCell` instances.
 * Tracks contained cells and exit points used for connecting rooms.
 */
export class Room extends Rect {
  cells: BuilderCell[] = [];
  exits: Set<BuilderCell> = new Set()

  constructor(x: number, y: number, width: number, height: number) {
    super(x, y, width, height);
  }

  /** Add a cell to this room and set its room reference. */
  addCell(cell: BuilderCell) {
    cell.room = this
    this.cells.push(cell);
  }

  /**
   * Return border cells of the room (cells on the perimeter).
   */
  getBorders(): BuilderCell[] {
      const borderCells: BuilderCell[] = []
      for (const cell of this.cells) {
          if (cell.x === this.x || cell.x === this.x + this.width - 1 || cell.y === this.y || cell.y === this.y + this.height - 1) {
              borderCells.push(cell)
          }
      }

      return borderCells
  }

  /**
   * Mark a cell as an exit and add it to the room cells.
   */
  addExit(cell: BuilderCell) {
    this.exits.add(cell)
    this.addCell(cell)
  }
}

/**
 * Generate a random room fitting within the given grid and size bounds.
 */
const generateRandomRoom = (grid: Grid, minWidth: number, minHeight: number, maxWidth: number, maxHeight: number): Room => {
  const width = Math.floor(Math.random() * (maxWidth - minWidth + 1)) + minWidth;
  const height = Math.floor(Math.random() * (maxHeight - minHeight + 1)) + minHeight;
  const x = Math.floor(Math.random() * (grid.width - width));
  const y = Math.floor(Math.random() * (grid.height - height));
  return new Room(x, y, width, height);
};

/**
 * Room placement builder. Attempts to place a number of non-overlapping
 * rectangular rooms into the grid.
 */
export class RoomBuilder implements IGridBuilder {
  grid: Grid;
  minRoomWidth: number;
  minRoomHeight: number;
  maxRoomWidth: number;
  maxRoomHeight: number;
  maxAttempts: number;
  protected attempts: number = 0;
  readonly rooms: Room[] = [];
  /**
   * Create a new RoomBuilder.
   */
  constructor(
    grid: Grid,
    minRoomWidth: number,
    minRoomHeight: number,
    maxRoomWidth: number,
    maxRoomHeight: number,
    maxAttempts: number
  ) {
    this.grid = grid;
    this.minRoomWidth = minRoomWidth;
    this.minRoomHeight = minRoomHeight;
    this.maxRoomWidth = maxRoomWidth;
    this.maxRoomHeight = maxRoomHeight;
    this.maxAttempts = maxAttempts;
  }

  /** Build all rooms synchronously. */
  build(): Grid {
    while (this.step()) { }
    return this.grid;
  }

  /**
   * Attempt to add a single room. Returns true while adding rooms, false
   * when the maximum attempts have been reached.
   */
  step() {
    if (this.attempts < this.maxAttempts) {
      gridLogger.log(`RoomBuilder Step: Attempt ${this.attempts + 1} of ${this.maxAttempts}`);
      this.attempts++;
      const room = generateRandomRoom(this.grid, this.minRoomWidth, this.minRoomHeight, this.maxRoomWidth, this.maxRoomHeight);

      gridLogger.log(`Generated room at (${room.x}, ${room.y}) with size ${room.width}x${room.height}`);
      // Check for overlaps and add the room if it doesn't overlap
      if (!Room.doesNotOverlap(room, this.rooms)) {
        return true;
      }

      gridLogger.log(`Adding room at (${room.x}, ${room.y}) with size ${room.width}x${room.height}`);
      this.addRoom(room);
      return true;
    }
    gridLogger.log(`RoomBuilder: Max attempts reached (${this.maxAttempts}). Stopping.`);
    return false;
  }

  /** Add a room to the builder and place it into the grid. */
  addRoom(room: Room) {
    this.rooms.push(room);
    this.placeRoom(room);
  }

  /** Place the room's cells into the grid and mark walls on the perimeter. */
  placeRoom(room: Room) {
    gridLogger.log(`Placing room at (${room.x}, ${room.y}) with size ${room.width}x${room.height}`);
    for (let x = room.x; x < room.x + room.width; x++) {
      for (let y = room.y; y < room.y + room.height; y++) {
        const cell = BuilderCell.new(x, y);
        cell.visited = true
        if (x === room.x) cell.walls.left = true;
        if (y === room.y) cell.walls.top = true;
        if (x === room.x + room.width - 1) cell.walls.right = true;
        if (y === room.y + room.height - 1) cell.walls.bottom = true;
        this.grid.setCell(x, y, cell);
        room.addCell(cell);
      }
    }
  }

  /**
   * Construct a RoomBuilder from options.
   */
  static new(grid: Grid, options?: RoomBuilderOptions) {
    options = { ...roomOptionsDefaults, ...options };
    return new RoomBuilder(
      grid,
      options.minRoomWidth!,
      options.minRoomHeight!,
      options.maxRoomWidth!,
      options.maxRoomHeight!,
      options.maxAttempts!
    );
  }
}
