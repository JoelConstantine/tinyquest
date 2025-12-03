/**
 * @packageDocumentation
 * @document docs/engine-overview.md
 */

import { EventSystem } from "./events"
import type { CanvasViewport } from "./render/viewport"
import { NullScreen, type BaseScreen } from "./screen"

/**
 * Simple input manager placeholder.
 *
 * Replace or extend this class with real input handling (keyboard, mouse,
 * gamepad) as needed for the game.
 */
export class InputManager {
}


/**
 * Lightweight logger placeholder.
 */
export class Logger { }


/**
 * Abstract render engine interface.
 *
 * Concrete engines implement `draw` and `blank` to perform rendering each
 * frame. The `Engine` composes a concrete `RenderEngine` to do actual
 * drawing work.
 */
abstract class RenderEngine {
    abstract draw(delta?: number): void
    abstract blank(): void
}


/**
 * Basic canvas-backed render engine.
 */
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

/**
 * Main engine that drives the game loop and manages the active screen.
 *
 * Holds references to input, rendering, event and logger subsystems and
 * exposes `start()` to begin the animation loop.
 */
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
        // Update the current screen
        const screen = this._screen.update(this, delta)
        if (screen !== this._screen) this.changeScreen(screen)
        this._screen.render(this)

        // Draw the frame
        requestAnimationFrame((timeStamp) => {
            const delta = timeStamp - this._lastUpdated
            this._lastUpdated = timeStamp 
            this.update(delta)
        })
    }

    changeScreen(screen: BaseScreen) { this._screen = screen.init(this) }
}