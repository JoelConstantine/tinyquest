/**
 * @packageDocumentation
 * Game screens and UI implementations for different game states.
 */

import { ECS } from "../engine/ecs";
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
    map: GameMap
    ecs: ECS
    constructor() {
        super()
        this.map = GameMap.new(30,30)
        this.ecs = new ECS()
    }
    init() {
        // add the player entity
        const player = this.ecs.addEntity()
        this.map.init()

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

/**
 * Factory function to create and initialize a game screen.
 * @returns An initialized GameScreen instance.
 */
export const loadGameScreen = () => {
    const screen = new GameScreen().init()
    
    return screen
}

/**
 * Main menu screen implementation.
 * Serves as the starting screen for the game.
 */
export class MainMenuScreen extends BaseScreen {
    init() { return this }  
    pause() { return this }
    resume() { return this }
    render(engine: Engine) {
        engine.render.blank()
        return this
    }
    update() { return this }
}