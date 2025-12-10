import type { Grid } from "./grid/grid";
import { gridLogger, type BuilderCell, type Room } from "./grid/roomBuilder";
import type { IBuilder } from "./grid/builders";
import { RoomsAndMazes, useRoomsAndMazes, type RoomsAndMazesOptions } from "./grid/roomsAndMazes";

const cardinalDirections = [[0, 1], [1, 0], [-1,0], [0,-1]] as [number, number][];

function findConnectors(room: Room, grid: Grid) {
  const borderingWalls = room.getBorders().reduce((acc, cell) => {
    for (const direction of cardinalDirections) {
      const neighboringCell = grid.getCell(cell.x + direction[0], cell.y + direction[1]) as BuilderCell

      if (neighboringCell?.visited && neighboringCell?.room !== room) {
        acc.push(neighboringCell)
        break
      }
    }

    return acc
  }, [] as BuilderCell[])
  return borderingWalls
}

const connectRooms = (grid: Grid, rooms: Room[]) => {
  for (const room of rooms) { 
    const borderCells = room.getBorders()

    const connector = borderCells[Math.floor(Math.random() * borderCells.length)]

    const neighborCells = []

    for (const direction of cardinalDirections) {
      const neighborCell = grid.getCell(connector.x + direction[0], connector.y + direction[1]) as BuilderCell

      if (neighborCell.room !== connector.room) {
        neighborCells.push({
          direction: direction,
          neighborCell
        })
      }
    }

    const neighbor = neighborCells[Math.floor(Math.random() * neighborCells.length)]

    connector.breakWall(neighbor.direction)

    neighbor.neighborCell.breakWall([-neighbor.direction[0], -neighbor.direction[1]])
  }

  return { grid, rooms }
}

interface IMapGenerator extends IBuilder {
  build(): { grid: Grid, rooms: Room[] }
}

type ForestGeneratorOptions = {
  rooms?: RoomsAndMazesOptions
}


export class ForestGenerator implements IMapGenerator {
  roomsAndMazes: RoomsAndMazes
  constructor(roomsAndMazes: RoomsAndMazes) {
    this.roomsAndMazes = roomsAndMazes;
  }

  init() {
    this.roomsAndMazes.start();
  }

  build() {
    const grid = this.roomsAndMazes.build();
    const rooms = this.roomsAndMazes.roomBuilder.rooms;

    return connectRooms(grid, rooms)
  }

  step(): boolean {
    return this.roomsAndMazes.step();
  }
}
 
export const useForestGenerator = (width: number, height: number, forestOptions?: ForestGeneratorOptions) => {
  const roomsAndMazes = useRoomsAndMazes(width / 2, height / 2, {
    minRoomWidth: (forestOptions?.rooms?.minRoomWidth  ?? 4) / 2,
    minRoomHeight: (forestOptions?.rooms?.minRoomHeight ?? 4) / 2,
    maxRoomWidth: (forestOptions?.rooms?.maxRoomWidth ?? 8) / 2,
    maxRoomHeight: (forestOptions?.rooms?.maxRoomHeight ?? 8) / 2,
    maxAttempts: forestOptions?.rooms?.maxAttempts ?? 100,
    pruneAmount: 0.2
  });
  const generator = new ForestGenerator(roomsAndMazes);
  generator.init();
  return generator;
}