import { Color } from "./color"
import { CanvasSurface } from "./surface"

export class CanvasViewport {
    public surface: CanvasSurface
    backgroundColor = new Color(0, 0, 0, 1)

    constructor(surface: CanvasSurface) { 
        this.surface = surface
    }

    get resolution()  { 
        return this.surface.resolution
    }

    adjustResolution(width: number, height: number) { 
        this.surface.resolution.x = width
        this.surface.resolution.y = height
    }

    attachTo(element: HTMLElement) { 
        element.appendChild(this.surface.canvas)
    }

    static new(width: number, height: number) {
        return new CanvasViewport(CanvasSurface.new(width, height))
    }

    static from(surface: CanvasSurface, width: number, height: number) {
        const viewport = new CanvasViewport(surface)
        viewport.adjustResolution(width, height)
        return viewport
    }

    draw() {
        this.surface.clear()
        this.surface.drawRect(0, 0, this.resolution.x, this.resolution.y, this.backgroundColor)
    }
}
