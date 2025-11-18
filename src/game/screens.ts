import type { Engine } from "../engine/engine";
import { BaseScreen } from "../engine/screen";
import { GameMap } from "../modules/map";

/**
 * Main game screen implementation.
 *
 * Holds the `GameMap` instance and implements the lifecycle methods used by
 * the `Engine` (`init`, `pause`, `resume`, `render`, `update`).
 */
export class GameScreen extends BaseScreen {
    map: GameMap | undefined
    init() {
        this.map = GameMap.new(30,30)
        return this
    }
    pause() { return this }
    resume() { return this }
    render(engine: Engine) {
            engine.render.blank()
            return this
        }
    update() { return this }
}

export const loadGameScreen = () => {
    const screen = new GameScreen().init()
    
    return screen
}