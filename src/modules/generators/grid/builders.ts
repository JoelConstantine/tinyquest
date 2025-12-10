import type { Grid } from "./grid";

export interface IBuilder {
  build(): any;
  step(): boolean;
}

export interface IGridBuilder extends IBuilder {
  grid: Grid;
  build(): Grid
  step(): boolean
}
