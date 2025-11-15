import type { Engine } from "../engine/engine";
import { useDebugPanel } from "./debug";
import { loadGameScreen } from "./screens";



export class TinyQuest {
    private engine: Engine
    constructor(engine: Engine) { this.engine = engine }

    start() {
        if (import.meta.env.MODE === 'development') {
            useDebugPanel('debugPanel')
        }

        const gameScreen = loadGameScreen()
        this.engine.changeScreen(gameScreen)
        this.engine.start()
    }
}