/**
 * Simple RGBA color utility.
 *
 * Provides numeric r/g/b/a channels and a `toString()` helper to produce
 * CSS `rgba(...)` strings for canvas drawing.
 */
export class Color {
    r: number = 0
    g: number = 0
    b: number = 0
    a: number = 0
    constructor(r: number, g: number, b: number, a: number) { 
        this.r = r
        this.g = g
        this.b = b
        this.a = a
    }

    toString() {
        return `rgba(${this.r}, ${this.g}, ${this.b}, ${this.a})`
    }
}