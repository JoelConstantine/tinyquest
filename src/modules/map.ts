import { Vector2D } from "../engine/utils"

export class Tile {
    position: Vector2D = new Vector2D(0, 0)
    passable: boolean
    transparent: boolean
    constructor(x: number, y: number, passable: boolean = false, transparent: boolean = false) { 
        this.position.set(x, y)
        this.passable = passable
        this.transparent = transparent
    }

    becomeTile(tile: Tile) {
        this.passable = tile.passable
        this.transparent = tile.transparent
    }

    copy(): Tile {
        const tile = new Tile(this.position.x, this.position.y)
        tile.passable = this.passable
        tile.transparent = this.transparent
        return tile
    }
}

const blankTile = new Tile(0, 0, false, false)

class Terrain {
    tiles: Array<Tile | null>
    dimensions: Vector2D
    fillTile: Tile = new Tile(0, 0)
    constructor(width: number, height: number, fillTile?: Tile) {
        this.tiles = []
        this.dimensions = new Vector2D(width, height)
        if (fillTile) this.fillTile = fillTile
    }

    setTile(newTile: Tile, x: number, y: number) {
        let tile = this.getTile(x, y)
        if (!tile) { 
            tile = blankTile.copy()
            this.tiles[y * this.dimensions.x + x] = tile
        }
        tile.becomeTile(newTile)
        tile.position.set(x, y)
    }

    getTile(x: number, y: number): Tile | null {
        if (!this.inBounds(x, y)) return null
        return this.tiles[y * this.dimensions.x + x]
    }

    inBounds(x: number, y: number): boolean {
        return x >= 0 && x < this.dimensions.x && y >= 0 && y < this.dimensions.y
    }

    static new(width: number, height: number): Terrain {
        const terrain = new Terrain(width, height)
      
        return terrain
    }

    init() {
        for (let y = 0; y < this.dimensions.y; y++) {
            for (let x = 0; x < this.dimensions.x; x++) {
                this.setTile(this.fillTile, x, y)
            }
        }
    }
}

/**
 * Represents a 2D grid of tiles.
 *
 * Use the static method `GameMap.new` to create and initialize a map.
 */
export class GameMap {
    /** The 2D array of tiles. */
    terrain: Terrain
    /** The dimensions of the map. */
    dimensions: Vector2D

    /**
     * Private constructor for creating a new game map.
     * @param width - The width of the map.
     * @param height - The height of the map.
     */
    private constructor(width: number, height: number) {
        this.dimensions = new Vector2D(width, height)
        this.terrain = Terrain.new(width, height)
    }

    /**
     * Initializes the game map by filling it with copies of the given tile.
     * @param fillTile - Tile to fill the map with.
     * @returns This game map.
     */
    init(): GameMap {
        this.terrain.init()
        return this
    }

    /**
     * Checks if the given coordinates are within the bounds of the map.
     * @param x - The x coordinate.
     * @param y - The y coordinate.
     * @returns True if the coordinates are within bounds, false otherwise.
     */
    inBounds(x: number, y: number): boolean {
        return x >= 0 && x < this.dimensions.x && y >= 0 && y < this.dimensions.y
    }

    /**
     * Gets a tile from the map at the given coordinates.
     * @param x - The x coordinate.
     * @param y - The y coordinate.
     * @returns The tile at the given coordinates, or `undefined` if out of bounds.
     */
    getTile(x: number, y: number): Tile | undefined {
        if (!this.inBounds(x, y)) return undefined
        return this.terrain.getTile(x, y) || undefined
    }

    /**
     * Sets a tile in the map at the given coordinates.
     * @param x - The x coordinate.
     * @param y - The y coordinate.
     * @param tile - The tile to set.
     */
    setTile(x: number, y: number, tile: Tile) {
        this.terrain.setTile(tile.copy(), x, y)
    }

    /**
     * Creates a new game map with the given dimensions and fills it with the given tile.
     * @param width - The width of the map.
     * @param height - The height of the map.
     * @param fillTile - Tile to fill the map with.
     * @returns The new game map.
     */
    static new(width: number = 1, height: number = 1): GameMap {
        const map = new GameMap(width, height)
       
        return map.init()
    }
}
