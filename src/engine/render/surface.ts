import { Vector2D } from "../utils";
import type { Color } from "./color"

/**
 * Abstract drawable surface.
 *
 * Concrete implementations provide methods to draw primitives and images
 * and manage an internal resolution. `CanvasSurface` is the browser-backed
 * implementation using an HTMLCanvasElement.
 */
export abstract class Surface {
    public resolution: Vector2D = new Vector2D(0, 0)
    abstract ctx: CanvasRenderingContext2D

    constructor(width: number, height: number) { this.resolution.x = width; this.resolution.y = height }

    adjustResolution(width: number, height: number) { this.resolution.x = width; this.resolution.y = height }


    abstract drawRect(x: number, y: number, width: number, height: number, color: Color | string): void
    abstract drawPoint(x: number, y: number, color: Color): void
    abstract drawImage(image: HTMLImageElement, x: number, y: number): void
    abstract clear(): void
}

/**
 * Canvas-backed surface implementation.
 */
export class CanvasSurface extends Surface {
    readonly canvas: HTMLCanvasElement
    ctx: CanvasRenderingContext2D

    constructor(
        canvas: HTMLCanvasElement,
        context: CanvasRenderingContext2D,
        width: number,
        height: number,
        ) {
        super(width, height)
        this.canvas = canvas
        this.ctx = context
    }

    public static new(width: number, height: number): CanvasSurface {
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d') as CanvasRenderingContext2D
        // disable pixel smoothing
        ctx.imageSmoothingEnabled = false
        return new CanvasSurface(canvas, ctx, width, height)
    }

    public static from(elem: HTMLCanvasElement | string): CanvasSurface {
        if (elem instanceof HTMLCanvasElement) return new CanvasSurface(elem, elem.getContext('2d') as CanvasRenderingContext2D, elem.width, elem.height)

        const canvas = document.getElementById(elem) as HTMLCanvasElement
        return new CanvasSurface(canvas, canvas.getContext('2d') as CanvasRenderingContext2D, canvas.width, canvas.height)
    }

    clear() {
        this.ctx.clearRect(0, 0, this.resolution.x, this.resolution.y)
    }

    drawPoint(x: number, y: number, color: Color) {
        this.ctx.fillStyle = color.toString()
        this.ctx.fillRect(x, y, 1, 1)
    }

    drawImage(image: HTMLImageElement, x: number, y: number) {
        this.ctx.drawImage(image, x, y)
    }

    drawRect(x: number, y: number, width: number, height: number, color: Color | string, filled: boolean = true) {
        if (filled) {
            this.ctx.fillStyle = color.toString()
            this.ctx.fillRect(x, y, width, height)
            return
        }
        this.ctx.strokeStyle = color.toString()
        this.ctx.strokeRect(x, y, width, height)
    }

    adjustResolution(width: number, height: number) {
        super.adjustResolution(width, height)
        this.canvas.width = width
        this.canvas.height = height
    }
}
