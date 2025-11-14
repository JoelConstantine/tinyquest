import type { CanvasViewport } from "./render/viewport"
import { NullScreen, type GameScreen } from "./screen"


export class InputManager {

}

abstract class RenderEngine {
    abstract draw(delta?: number): void
    abstract blank(): void
}

export class BasicCanvasEngine extends RenderEngine {
    viewport: CanvasViewport
    constructor(viewport: CanvasViewport) {
        super()
        this.viewport = viewport
    }

    draw(_delta: number) {
        this.viewport.draw()
    }

    blank() {
        this.viewport.draw()
    }
}

export class Engine {
    private _lastUpdated: number = 0
    private _screen: GameScreen = new NullScreen()

    public input: any
    public render: RenderEngine
    logger: any
    constructor(viewport: CanvasViewport) { 
        this.input = new InputManager()
        this.render = new BasicCanvasEngine(viewport)
    }
    
    start() { 
        requestAnimationFrame(() => this.update())
    }

    update(delta: number = 0) {
        const screen = this._screen.update(this, delta)
        if (screen !== this._screen) this.changeScreen(screen)
        this._screen.render(this)
        requestAnimationFrame((timeStamp) => {
            const delta = timeStamp - this._lastUpdated
            this._lastUpdated = timeStamp 
            this.update(delta)
        })
    }

    changeScreen(screen: GameScreen) { this._screen = screen.init(this) }
}