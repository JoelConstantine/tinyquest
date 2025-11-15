import { EventSystem } from "./events"
import type { CanvasViewport } from "./render/viewport"
import { NullScreen, type BaseScreen } from "./screen"


export class InputManager {

}

export class Logger { }



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
    private _screen: BaseScreen = new NullScreen()

    public input: any
    render: RenderEngine
    logger: Logger = new Logger()
    events: EventSystem = new EventSystem()
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

    changeScreen(screen: BaseScreen) { this._screen = screen.init(this) }
}