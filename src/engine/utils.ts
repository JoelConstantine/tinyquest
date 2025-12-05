
export type Point = [number, number]

export type Dimensions = [number, number, number, number]
/**
 * 2D vector utility.
 *
 * Small immutable-ish wrapper around a numeric `[x,y]` tuple exposing
 * convenient getters/setters and utility methods used by maps, viewports and
 * other geometry code.
 */
export class Vector2D {
    private point: Point
    constructor(x: number, y: number) { this.point = [x, y] }

    get x(): number { return this.point[0] }
    get y(): number { return this.point[1] }
    set x(x: number) { this.point[0] = x }
    set y(y: number) { this.point[1] = y }

    set(x: number, y: number) { this.x = x; this.y = y; return this }
    toString() {
        return `(${this.x}, ${this.y})`
    }
}

export class Rect {
    dimensions: Dimensions
    constructor(x: number, y: number, width: number, height: number) {
        this.dimensions = [x, y, width, height]
    }
    get x(): number { return this.dimensions[0] }
    get y(): number { return this.dimensions[1] }
    get width(): number { return this.dimensions[2] }
    get height(): number { return this.dimensions[3] }

    static fromDimensions(dimensions: Dimensions): Rect {
        return new Rect(dimensions[0], dimensions[1], dimensions[2], dimensions[3])
    }

    static checkIntersection(a: Rect, b: Rect): boolean {
        return (
            a.x < b.x + b.width &&
            a.x + a.width > b.x &&
            a.y < b.y + b.height &&
            a.y + a.height > b.y
        )
    }

    static doesNotOverlap(a: Rect, b: Rect[]): boolean {
        for (const other of b) {
            if (Rect.checkIntersection(a, other)) {
                return false
            }
        }
        return true
    }
}