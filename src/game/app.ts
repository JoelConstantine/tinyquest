import type { Engine } from "../engine/engine";
import { useDebugPanel } from "./debug";
import { loadGameScreen } from "./screens";

/**
 * High level application entry point for the TinyQuest game.
 *
 * Responsible for wiring up the engine, attaching debug UI in development,
 * loading the initial game screen, and starting the engine main loop.
 */
export class TinyQuest {
    private engine: Engine
    constructor(engine: Engine) { this.engine = engine }

    start() {
        if (import.meta.env.MODE === 'development') {
            useDebugPanel('game')
        }

        const gameScreen = loadGameScreen()
        this.engine.changeScreen(gameScreen)
        this.engine.start()
    }
}