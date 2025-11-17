import { describe, expect, it } from 'vitest'
import { GameMap, Tile } from '../map.js'

describe('Map Class', () => {
    it('should create a map with specified dimensions', () => {
        const width = 10
        const height = 5
        const gameMap = GameMap.new(width, height)
        expect(gameMap.dimensions.x).toBe(width)
        expect(gameMap.dimensions.y).toBe(height)
    })

    it('should initialize all tiles as passable and transparent by default', () => {
        const gameMap = GameMap.new(3, 3)
        for (let y = 0; y < gameMap.dimensions.y; y++) {
            for (let x = 0; x < gameMap.dimensions.x; x++) {
                const tile = gameMap.getTile(x, y)
                expect(tile).toBeDefined()
                expect(tile!.passable).toBe(true)
                expect(tile!.transparent).toBe(true)
            }
        }
    })
})

describe('Tile class', () => {
    it('should create a new tile with specified position and properties', () => {
        const x = 5
        const y = 5
        const tile = new Tile(x, y)
        expect(tile.position.x).toBe(x)
        expect(tile.position.y).toBe(y)
        expect(tile.passable).toBe(false)
        expect(tile.transparent).toBe(false)
    })

    it('should create a copy of the tile with the same position and properties', () => {
        const x = 5
        const y = 5
        const tile = new Tile(x, y)
        const copyTile = tile.copy()
        expect(copyTile.position.x).toBe(x)
        expect(copyTile.position.y).toBe(y)
        expect(copyTile.passable).toBe(tile.passable)
        expect(copyTile.transparent).toBe(tile.transparent)
    })
})
