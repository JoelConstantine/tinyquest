import { Vector2D } from "../engine/utils"

export class Tile {
    position: Vector2D = new Vector2D(0, 0)
    passable: boolean = false
    transparent: boolean = false
    constructor(x: number, y: number) { this.position.x = x; this.position.y = y }
    copy(): Tile {
        return new Tile(this.position.x, this.position.y)
    }
}

export class GameMap {
    tiles: Tile[][]
    dimensions: Vector2D
    private constructor(width: number, height: number) {
        this.tiles = []
        this.dimensions = new Vector2D(width, height)
    }

    init() {
        for (let y = 0; y < this.dimensions.y; y++) {
            this.tiles[y] = []
            for (let x = 0; x < this.dimensions.x; x++) {
                this.tiles[y][x] = new Tile(x, y)
            }
        }
        return this
    }

    getTile(x: number, y: number): Tile {
        return this.tiles[y][x]
    }

    setTile(x: number, y: number, tile: Tile) {
        this.tiles[y][x] = tile.copy()
    }

    static new(width: number = 1, height: number = 1) {
        const map = new GameMap(width, height)
       
        return map.init()
    }
}