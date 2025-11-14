import type { Engine } from "./engine";

export abstract class GameScreen {
    abstract init(engine: Engine): this

    abstract pause(): this
    abstract resume(): this

    abstract render(engine: Engine): this
    abstract update(engine: Engine, delta: number): GameScreen
}

// Implementing just a blank screen
export class NullScreen {
    init() { return this }
    pause() { return this }
    resume() { return this }
    render() { return this }
    update() { return this }
}