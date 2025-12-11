/**
 * @packageDocumentation
 * Composite generator that places rectangular rooms first and then carves
 * mazes in remaining space. This module exports a builder implementing the
 * `IGridBuilder` interface as well as a small factory helper for convenience.
 */
import type { IGridBuilder } from "./builders";
import { Grid } from "./grid";
import { MazeBuilder } from "./mazeBuilder";
import { BuilderCell, RoomBuilder } from "./roomBuilder";

/**
 * Composite generator that first places rooms using a RoomBuilder, then
 * carves mazes to connect remaining areas using a MazeBuilder.
 *
 * Implements {@link IGridBuilder} so it can be stepped through incrementally
 * (useful for visualizing generation) or built in one shot via `build()`.
 */
export class RoomsAndMazes implements IGridBuilder {
  roomBuilder: RoomBuilder
  mazeBuilder: MazeBuilder
  grid: Grid
  /**
   * Create a new RoomsAndMazes generator.
   * @param grid - The grid to generate into.
   * @param roomBuilder - Preconfigured RoomBuilder instance.
   * @param mazeBuilder - Preconfigured MazeBuilder instance.
   */
  constructor(grid: Grid,
    roomBuilder: RoomBuilder, mazeBuilder: MazeBuilder) { 
    this.grid = grid
    this.roomBuilder = roomBuilder;
    this.mazeBuilder = mazeBuilder;
  }

  /**
   * Initialize internal builders. Should be called before stepping/building.
   */
  init() {
    this.mazeBuilder.init()
  }

  /**
   * Run the full generation: place rooms then carve mazes.
   * @returns The generated `Grid` instance.
   */
  build(): Grid {
    this.roomBuilder.build()
    this.mazeBuilder.build()
    return this.grid;
  }

  /**
   * Perform a single generation step. Returns `true` while generation is
   * still in progress, `false` when complete. Steps through the room
   * placement first; once rooms are finished the maze builder is initialized
   * and stepped.
   */
  step() {
    const working = this.roomBuilder.step();
    if (working) return true
    this.mazeBuilder.init()
    return this.mazeBuilder.step()
  }
}
/**
 * Options used to configure the room placement stage when creating a
 * RoomsAndMazes generator via `useRoomsAndMazes`.
 */
export type RoomsAndMazesOptions = {
  /** Minimum room width (inclusive). */
  minRoomWidth?: number,
  /** Minimum room height (inclusive). */
  minRoomHeight?: number,
  /** Maximum room width (inclusive). */
  maxRoomWidth?: number,
  /** Maximum room height (inclusive). */
  maxRoomHeight?: number,
  /** Maximum attempts to place rooms. */
  maxAttempts?: number,
  /** Number of rooms to prune after placement (optional). */
  pruneAmount?: number
}

/**
 * Convenience factory to create and initialize a `RoomsAndMazes` generator.
 *
 * @param width - Grid width in cells.
 * @param height - Grid height in cells.
 * @param options - Optional configuration for room placement.
 * @returns An initialized `RoomsAndMazes` instance ready for `build()` or `step()`.
 */
export const useRoomsAndMazes = (width: number, height: number, options?: RoomsAndMazesOptions) => {
  const roomOptions = {
    minRoomWidth: options?.minRoomWidth ?? 3,
    minRoomHeight: options?.minRoomHeight ?? 3,
    maxRoomWidth: options?.maxRoomWidth ?? 10,
    maxRoomHeight: options?.maxRoomHeight ?? 10,
    maxAttempts: options?.maxAttempts ?? 200
  }

  const grid = Grid.new<BuilderCell>(width, height)
  const roomBuilder = RoomBuilder.new(grid, roomOptions);
  const mazeBuilder = new MazeBuilder(grid);
  const generator = new RoomsAndMazes(grid, roomBuilder, mazeBuilder);
  return generator;
}