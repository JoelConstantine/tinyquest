import type { Engine } from "./engine";

export abstract class BaseScreen {
    abstract init(engine: Engine): this

    abstract pause(): this
    abstract resume(): this

    abstract render(engine: Engine): this
    abstract update(engine: Engine, delta: number): BaseScreen
}

// Implementing just a blank screen
export class NullScreen extends BaseScreen {
    init() { return this }
    pause() { return this }
    resume() { return this }
    render() { return this }
    update() { return this }
}