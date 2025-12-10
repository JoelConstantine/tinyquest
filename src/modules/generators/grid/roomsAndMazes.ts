import type { IGridBuilder } from "./builders";
import { Grid } from "./grid";
import { MazeBuilder } from "./mazeBuilder";
import { BuilderCell, RoomBuilder } from "./roomBuilder";

export class RoomsAndMazes implements IGridBuilder {
  roomBuilder: RoomBuilder
  mazeBuilder: MazeBuilder
  grid: Grid
  constructor(grid: Grid,
    roomBuilder: RoomBuilder, mazeBuilder: MazeBuilder) { 
    this.grid = grid
    this.roomBuilder = roomBuilder;
    this.mazeBuilder = mazeBuilder;
  }

  start() {
  }

  build(): Grid {
    this.roomBuilder.build()
    this.mazeBuilder.build()
    return this.grid;
  }
  step() {
    const working = this.roomBuilder.step();
    if (working) return true
    return this.mazeBuilder.step()
  }
}
export type RoomsAndMazesOptions = {
    minRoomWidth?: number,
    minRoomHeight?: number,
    maxRoomWidth?: number,
    maxRoomHeight?: number,
    maxAttempts?: number,
    pruneAmount?: number
}

export const useRoomsAndMazes = (width: number, height: number, options?: RoomsAndMazesOptions) => {
  const roomOptions = {
    minRoomWidth: options?.minRoomWidth ?? 3,
    minRoomHeight: options?.minRoomHeight ?? 3,
    maxRoomWidth: options?.maxRoomWidth ?? 10,
    maxRoomHeight: options?.maxRoomHeight ?? 10,
    maxAttempts: options?.maxAttempts ?? 200
  }

  const grid = Grid.new<BuilderCell>(width, height).fill(new BuilderCell(0,0));
  const roomBuilder = RoomBuilder.new(grid, roomOptions);
  const mazeBuilder = new MazeBuilder(grid);
  const generator = new RoomsAndMazes(grid, roomBuilder, mazeBuilder);
  return generator;
}