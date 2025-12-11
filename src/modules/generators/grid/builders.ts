/**
 * @packageDocumentation
 * Common builder interfaces used by grid-based dungeon generators.
 */
import type { Grid } from "./grid";

/**
 * Minimal builder interface that produces a `any` when `build()` is
 * invoked. Implementations may perform synchronous or batched work.
 */
export interface IBuilder {
  /** Produce or modify the grid and return it. */
  build(): any;
}

/**
 * Builder interface for grid builders that can make incremental progress.
 * The `step()` method should perform a single unit of work and return
 * true if more work remains, or false when finished.
 */
export interface IGridBuilder extends IBuilder {
  build(): Grid;
  /** Perform one step of the build process; return true when work remains. */
  step(): boolean;
}
