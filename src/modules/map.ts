import { Vector2D } from "../engine/utils"

export class Tile {
    position: Vector2D = new Vector2D(0, 0)
    passable: boolean = false
    transparent: boolean = false
    constructor(x: number, y: number) { this.position.x = x; this.position.y = y }
    copy(): Tile {
        const tile = new Tile(this.position.x, this.position.y)
        tile.passable = this.passable
        tile.transparent = this.transparent
        return tile
    }

    setPosition(x: number, y: number) {
        this.position.x = x
        this.position.y = y
        return this
    }
}

export class GameMap {
    tiles: Tile[][]
    dimensions: Vector2D
    private constructor(width: number, height: number) {
        this.tiles = []
        this.dimensions = new Vector2D(width, height)
    }

    init(fillTyle?: Tile): GameMap {
        if (!fillTyle) {
            fillTyle = new Tile(0, 0)
            fillTyle.passable = true
            fillTyle.transparent = true
        }

        for (let y = 0; y < this.dimensions.y; y++) {
            this.tiles[y] = []
            for (let x = 0; x < this.dimensions.x; x++) {
                this.tiles[y][x] = fillTyle.copy().setPosition(x, y)
            }
        }
        return this
    }

    inBounds(x: number, y: number): boolean {
        return x >= 0 && x < this.dimensions.x && y >= 0 && y < this.dimensions.y
    }

    getTile(x: number, y: number): Tile | undefined{
        if (!this.inBounds(x, y)) return 
        return this.tiles[y][x]
    }

    setTile(x: number, y: number, tile: Tile) {
        this.tiles[y][x] = tile.copy()
    }

    static new(width: number = 1, height: number = 1, fillTyle?: Tile): GameMap {
        const map = new GameMap(width, height)
       
        return map.init(fillTyle)
    }
}