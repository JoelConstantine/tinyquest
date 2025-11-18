
export type Point = [number, number]

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
