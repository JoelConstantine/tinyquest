import { describe, expect, it } from 'vitest'
import { Vector2D } from '../utils'

describe('Vector2D', () => { 
    it('should initialize with correct values', () => {
        const vector = new Vector2D(1, 2)
        expect(vector.x).toBe(1)
        expect(vector.y).toBe(2)
    })

    it('should correctly set and get x and y values', () => {
        const vector = new Vector2D(1, 2)
        vector.x = 3
        vector.y = 4
        expect(vector.x).toBe(3)
        expect(vector.y).toBe(4)
    })

    it('should return correct string representation', () => {
        const vector = new Vector2D(1, 2)
        expect(vector.toString()).toBe('(1, 2)')
    })
})