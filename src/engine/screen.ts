import type { Engine } from "./engine";

/**
 * Base interface for game screens managed by the `Engine`.
 *
 * Implementations should provide lifecycle methods used by the engine
 * (`init`, `pause`, `resume`, `render`, `update`). Screens are responsible
 * for drawing and updating game state while they are active.
 */
export abstract class BaseScreen {
    abstract init(engine: Engine): this

    abstract pause(): this
    abstract resume(): this

    abstract render(engine: Engine): this
    abstract update(engine: Engine, delta: number): BaseScreen
}

/**
 * A no-op screen implementation that does nothing. Useful as a safe
 * default when the engine has no active screen.
 */
export class NullScreen extends BaseScreen {
    init() { return this }
    pause() { return this }
    resume() { return this }
    render() { return this }
    update() { return this }
}