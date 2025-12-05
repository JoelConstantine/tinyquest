/**
 * @packageDocumentation
 * Game map and tile system for dungeon/grid-based navigation.
 */

import { Vector2D } from "../engine/utils"

/**
 * Represents a single tile in a game map.
 * Stores position, passability, and transparency properties.
 */
export class Tile {
    position: Vector2D = new Vector2D(0, 0)
    passable: boolean
    transparent: boolean
    /**
     * Creates a new tile at the specified coordinates.
     * @param x - X position of the tile.
     * @param y - Y position of the tile.
     * @param passable - Whether the tile can be walked through.
     * @param transparent - Whether the tile allows light to pass through.
     */
    constructor(x: number, y: number, passable: boolean = false, transparent: boolean = false) { 
        this.position.set(x, y)
        this.passable = passable
        this.transparent = transparent
    }

    /**
     * Copies properties from another tile to this one.
     * @param tile - Source tile to copy from.
     */
    becomeTile(tile: Tile) {
        this.passable = tile.passable
        this.transparent = tile.transparent
    }

    /**
     * Creates a deep copy of this tile.
     * @returns A new tile with the same properties.
     */
    copy(): Tile {
        const tile = new Tile(this.position.x, this.position.y)
        tile.passable = this.passable
        tile.transparent = this.transparent
        return tile
    }
}

const blankTile = new Tile(0, 0, false, false)

/**
 * Internal terrain data structure managing a 2D array of tiles.
 * Handles tile storage, retrieval, and boundary checking.
 */
class Terrain {
    tiles: Array<Tile | null>
    dimensions: Vector2D
    fillTile: Tile = new Tile(0, 0)
    /**
     * Creates a new terrain with the specified dimensions.
     * @param width - Width of the terrain.
     * @param height - Height of the terrain.
     * @param fillTile - Optional tile to use as default fill.
     */
    constructor(width: number, height: number, fillTile?: Tile) {
        this.tiles = []
        this.dimensions = new Vector2D(width, height)
        if (fillTile) this.fillTile = fillTile
    }

    /**
     * Sets a tile at the specified coordinates.
     * @param newTile - The tile to set.
     * @param x - X coordinate.
     * @param y - Y coordinate.
     */
    setTile(newTile: Tile, x: number, y: number) {
        let tile = this.getTile(x, y)
        if (!tile) { 
            tile = blankTile.copy()
            this.tiles[y * this.dimensions.x + x] = tile
        }
        tile.becomeTile(newTile)
        tile.position.set(x, y)
    }

    /**
     * Gets a tile at the specified coordinates.
     * @param x - X coordinate.
     * @param y - Y coordinate.
     * @returns The tile at the coordinates, or null if out of bounds.
     */
    getTile(x: number, y: number): Tile | null {
        if (!this.inBounds(x, y)) return null
        return this.tiles[y * this.dimensions.x + x]
    }

    /**
     * Checks if coordinates are within terrain bounds.
     * @param x - X coordinate.
     * @param y - Y coordinate.
     * @returns True if within bounds, false otherwise.
     */
    inBounds(x: number, y: number): boolean {
        return x >= 0 && x < this.dimensions.x && y >= 0 && y < this.dimensions.y
    }

    /**
     * Creates and initializes a new terrain with the specified dimensions.
     * @param width - Width of the terrain.
     * @param height - Height of the terrain.
     * @returns A new terrain instance.
     */
    static new(width: number, height: number): Terrain {
        const terrain = new Terrain(width, height)
      
        return terrain
    }

    /**
     * Fills the entire terrain with the fill tile.
     */
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
