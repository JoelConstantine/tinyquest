import type { Cell, Grid } from "./grid/grid";
import { type Room } from "./grid/roomBuilder";
import type { IBuilder } from "./grid/builders";
import { RoomsAndMazes, useRoomsAndMazes, type RoomsAndMazesOptions } from "./grid/roomsAndMazes";
import { connectRooms } from "./grid/utils";
import { GameMap, Terrain, Tile } from "../map";
import { Rect } from "../../engine/utils";


interface IMapGenerator extends IBuilder {
  build(): { grid: Grid, rooms: Room[] }
}

type ForestGeneratorOptions = {
  rooms?: RoomsAndMazesOptions
}

const pruneDeadEnds = (terrain: Terrain) => {
  const deadends = terrain.tiles.filter(tile => {
    if (!tile || !tile.passable) return false
  
    const wallCount = terrain.getNeighbors(tile.position.x, tile.position.y).reduce(
      (count, neighbor) => count + (neighbor && !neighbor.passable ? 1 : 0),0)
  
    return wallCount >= 3
  }) as Tile[];

  for (const deadend of deadends) {
    deadend.passable = false
    deadend.transparent = false
    //grid.setCell(deadend.x, deadend.y, null);
  }
}

const WALL_TILE = new Tile(0,0, false, false)
const FLOOR_TILE = new Tile(0,0, true, true)

const wallToTile = (wall: boolean) => wall ? WALL_TILE : FLOOR_TILE

class ForestMap extends GameMap {
  path: Set<Tile> = new Set()
  rooms: Set<TerrainRoom> = new Set()
  constructor(width: number, height: number) {
    super(width, height)
  }

  static fromTerrain(terrain: Terrain) {
    const map = new ForestMap(terrain.width, terrain.height)
    map.terrain = terrain
    return map
  }

  addRoom(room: TerrainRoom) {
    for (let x = room.x; x < room.x + room.width; x++) {
      for (let y = room.y; y < room.y + room.height; y++) {
        const tile = this.terrain.getTile(x, y)
        if (tile) room.addTile(tile)
      }
    }
  }
}

class TerrainRoom extends Rect {
  tiles: Tile[] = []
  constructor(x: number, y: number, width: number, height: number) {
    super(x, y, width, height)
  }

  addTile(tile: Tile) {
    this.tiles.push(tile)
  }
}

const cellsToTerrain = (grid: Grid, cells?: Cell[]) => {
  const terrain = Terrain.new(grid.width * 2, grid.height * 2)
  terrain.fillTile(WALL_TILE)

  for (const cell of cells ?? grid.cells) {
    if (cell === null) continue
    terrain.setTile(FLOOR_TILE.copy(), cell.x * 2, cell.y * 2)

    terrain.setTile(wallToTile(cell.walls.top),cell.x * 2, cell.y * 2 - 1)
    terrain.setTile(wallToTile(cell.walls.right),cell.x * 2 + 1, cell.y * 2)
    terrain.setTile(wallToTile(cell.walls.bottom),cell.x * 2, cell.y * 2 + 1)
    terrain.setTile(wallToTile(cell.walls.left),cell.x * 2 - 1, cell.y * 2)
  }

  return terrain
}


export class ForestGenerator implements IMapGenerator {
  roomsAndMazes: RoomsAndMazes
  constructor(roomsAndMazes: RoomsAndMazes) {
    this.roomsAndMazes = roomsAndMazes;
  }

  init() {
    this.roomsAndMazes.init();
  }

  build() {
    this.init()
    while(this.step()) {}
    connectRooms(this.roomsAndMazes.grid, this.roomsAndMazes.roomBuilder.rooms)
    
    const terrain = cellsToTerrain(this.roomsAndMazes.grid, Array.from(this.roomsAndMazes.mazeBuilder.maze))
    const map = ForestMap.fromTerrain(terrain)

    for (const room of this.roomsAndMazes.roomBuilder.rooms) {
      const terrainRoom = new TerrainRoom(room.x * 2, room.y * 2, room.width * 2 - 1, room.height * 2 - 1)

      map.addRoom(terrainRoom)

      terrainRoom.tiles.forEach(tile => tile.passable = true)
    }

    for(let i = 0; i < 30; i++) {
      pruneDeadEnds(terrain)
    }

    return { grid: this.roomsAndMazes.grid, rooms: this.roomsAndMazes.roomBuilder.rooms, terrain, map };
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