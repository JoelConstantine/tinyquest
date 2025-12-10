import { Rect } from "../../../engine/utils";
import type { IGridBuilder } from "./builders";
import { Grid, Cell } from "./grid";

export class BuilderCell extends Cell {
  visited: boolean = false
  room!: Room
  constructor(x: number, y: number) {
    super(x, y,)
  }
  static new(x: number, y: number) {
    return new BuilderCell(x, y)
  }

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

  copy() {
    return new BuilderCell(this.x, this.y)
  }
}

class Logger {
  logFn = console.info;

  log(message: string) {
    this.logFn(message);
  }
}
export const gridLogger = new Logger();

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
export class Room extends Rect {
  cells: BuilderCell[] = [];
  exits: Set<BuilderCell> = new Set()

  constructor(x: number, y: number, width: number, height: number) {
    super(x, y, width, height);
  }

  addCell(cell: BuilderCell) {
    cell.room = this
    this.cells.push(cell);
  }

  getBorders(): BuilderCell[] {
      const borderCells: BuilderCell[] = []
      for (const cell of this.cells) {
          if (cell.x === this.x || cell.x === this.x + this.width - 1 || cell.y === this.y || cell.y === this.y + this.height - 1) {
              borderCells.push(cell)
          }
      }

      return borderCells
  }

  addExit(cell: BuilderCell) {
    this.exits.add(cell)
    this.addCell(cell)
  }
}

const generateRandomRoom = (grid: Grid, minWidth: number, minHeight: number, maxWidth: number, maxHeight: number): Room => {
  const width = Math.floor(Math.random() * (maxWidth - minWidth + 1)) + minWidth;
  const height = Math.floor(Math.random() * (maxHeight - minHeight + 1)) + minHeight;
  const x = Math.floor(Math.random() * (grid.width - width));
  const y = Math.floor(Math.random() * (grid.height - height));
  return new Room(x, y, width, height);
};

export class RoomBuilder implements IGridBuilder {
  grid: Grid;
  minRoomWidth: number;
  minRoomHeight: number;
  maxRoomWidth: number;
  maxRoomHeight: number;
  maxAttempts: number;
  protected attempts: number = 0;
  readonly rooms: Room[] = [];
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

  build(): Grid {
    // Implementation for building rooms in the grid
    while (this.step()) { }
    return this.grid;
  }

  // Implementation for stepping through the room building process
  step() {
    if (this.attempts < this.maxAttempts) {
      gridLogger.log(`RoomBuilder Step: Attempt ${this.attempts + 1} of ${this.maxAttempts}`);
      this.attempts++;
      // Attempt to add a room
      const room = generateRandomRoom(this.grid, this.minRoomWidth, this.minRoomHeight, this.maxRoomWidth, this.maxRoomHeight);

      gridLogger.log(`Generated room at (${room.x}, ${room.y}) with size ${room.width}x${room.height}`);
      // Check for overlaps and add the room if it doesn't overlap
      if (!Room.doesNotOverlap(room, this.rooms)) {
        this.step();
        return true;
      }

      gridLogger.log(`Adding room at (${room.x}, ${room.y}) with size ${room.width}x${room.height}`);
      this.addRoom(room);
      return true;
    }
    gridLogger.log(`RoomBuilder: Max attempts reached (${this.maxAttempts}). Stopping.`);
    return false;
  }

  addRoom(room: Room) {
    this.rooms.push(room);
    this.placeRoom(room);
  }

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
