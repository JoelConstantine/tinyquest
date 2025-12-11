import type { Grid } from "./grid";
import type { BuilderCell, Room } from "./roomBuilder";

/**
 * Utility helpers used by grid generators.
 */
const cardinalDirections: [number, number][] = [
  [1, 0],
  [-1, 0],
  [0, 1],
  [0, -1]
] as const;

/**
 * Collect border cells from a list of rooms. These cells are potential
 * connectors when linking two rooms together.
 *
 * @param rooms - Array of Room-like objects exposing `getBorders()`.
 */
export function findConnectors(rooms: Room[], grid: Grid) {
  const borderingWalls = rooms.reduce((acc, room) => {
    for (const cell of room.getBorders()) {
      for (const direction of cardinalDirections) {
        const neighboringCell = grid.getCell(cell.x + direction[0], cell.y + direction[1]) as BuilderCell;

        if (neighboringCell?.visited && neighboringCell?.room !== room) {
          acc.push(neighboringCell);
          break;
        }
      }
    }
    return acc;
  }, [] as BuilderCell[]);
  return borderingWalls;
}

/**
 * Connect two rooms by removing the wall between adjacent border cells.
 * This implementation expects the rooms to have border cells that are
 * cardinally adjacent; returns the pair of connected cells or `null` if
 * no direct adjacency exists.
 */
export const connectRooms = (grid: Grid, rooms: Room[]) => {
  for (const room of rooms) { 
    const borderCells = room.getBorders();

    const connector = borderCells[Math.floor(Math.random() * borderCells.length)];

    const neighborCells = [];

    for (const direction of cardinalDirections) {
      const neighborCell = grid.getCell(connector.x + direction[0], connector.y + direction[1]) as BuilderCell;

      if (neighborCell && neighborCell.room !== connector.room) {
        neighborCells.push({
          direction: direction,
          neighborCell
        });
      }
    }

    if (neighborCells.length === 0) {
      continue;
    }

    const neighbor = neighborCells[Math.floor(Math.random() * neighborCells.length)];

    connector.breakWall(neighbor.direction);

    neighbor.neighborCell.breakWall([-neighbor.direction[0], -neighbor.direction[1]]);
  }

  return { grid, rooms };
}