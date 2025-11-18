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
}

/**
 * Represents a 2D grid of tiles.
 *
 * Use the static method `GameMap.new` to create and initialize a map.
 */
export class GameMap {
    /** The 2D array of tiles. */
    tiles: Tile[][]

    /** The dimensions of the map. */
    dimensions: Vector2D

    /**
     * Private constructor for creating a new game map.
     * @param width - The width of the map.
     * @param height - The height of the map.
     */
    private constructor(width: number, height: number) {
        this.tiles = []
        this.dimensions = new Vector2D(width, height)
    }

    /**
     * Initializes the game map by filling it with copies of the given tile.
     * @param fillTile - Tile to fill the map with.
     * @returns This game map.
     */
    init(fillTile: Tile = new Tile(0, 0)): GameMap {
        for (let y = 0; y < this.dimensions.y; y++) {
            this.tiles[y] = []
            for (let x = 0; x < this.dimensions.x; x++) {
                const tile = fillTile.copy()
                tile.position.set(x, y)
                this.tiles[y][x] = tile
            }
        }
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
        return this.tiles[y][x]
    }

    /**
     * Sets a tile in the map at the given coordinates.
     * @param x - The x coordinate.
     * @param y - The y coordinate.
     * @param tile - The tile to set.
     */
    setTile(x: number, y: number, tile: Tile) {
        this.tiles[y][x] = tile.copy()
    }

    /**
     * Creates a new game map with the given dimensions and fills it with the given tile.
     * @param width - The width of the map.
     * @param height - The height of the map.
     * @param fillTile - Tile to fill the map with.
     * @returns The new game map.
     */
    static new(width: number = 1, height: number = 1, fillTile?: Tile): GameMap {
        const map = new GameMap(width, height)
       
        return map.init(fillTile)
    }
}
