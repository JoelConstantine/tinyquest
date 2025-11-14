import type { Engine } from "../engine/engine";
import type { GameScreen } from "../engine/screen";

class BlankScreen implements GameScreen {
    init(_engine: Engine) { return this }
    pause() { return this }
    resume() { return this }
    render(engine: Engine) {
        engine.render.blankScreen()
        return this
    }
    update(_engine: Engine, _delta: number) { return this }
}

const blankScreen = new BlankScreen()

export class TinyQuest {
    private engine: Engine
    constructor(engine: Engine) { this.engine = engine }

    start() {
        this.engine.start()
        this.engine.changeScreen(blankScreen)
    }
}