import { describe, it, expect, vi, beforeEach } from 'vitest'
import { BaseScreen, NullScreen } from '../screen'
import { Engine } from '../engine'

const mockViewport = { draw: vi.fn() }

describe('BaseScreen', () => {
    it('is abstract and cannot be instantiated directly', () => {
        // BaseScreen is abstract, so we can only test via subclasses
        const screen = new NullScreen()
        expect(screen).toBeInstanceOf(BaseScreen)
    })
})

describe('NullScreen', () => {
    let screen: NullScreen

    beforeEach(() => {
        screen = new NullScreen()
    })

    it('init returns this', () => {
        const result = screen.init()
        expect(result).toBe(screen)
    })

    it('pause returns this', () => {
        const result = screen.pause()
        expect(result).toBe(screen)
    })

    it('resume returns this', () => {
        const result = screen.resume()
        expect(result).toBe(screen)
    })

    it('render returns this', () => {
        const result = screen.render()
        expect(result).toBe(screen)
    })

    it('update returns this', () => {
        const result = screen.update()
        expect(result).toBe(screen)
    })

    it('all lifecycle methods can be chained', () => {
        const result = screen
            .init()
            .pause()
            .resume()
            .render()

        expect(result).toBe(screen)
    })
})

describe('Custom Screen Implementation', () => {
    class TestScreen extends BaseScreen {
        updateCalled = false
        renderCalled = false
        pauseCalled = false
        resumeCalled = false

        init(_engine: Engine) { return this }
        pause() {
            this.pauseCalled = true
            return this
        }
        resume() {
            this.resumeCalled = true
            return this
        }
        render(_engine: Engine) {
            this.renderCalled = true
            return this
        }
        update(_engine: Engine, _delta: number) {
            this.updateCalled = true
            return this
        }
    }

    it('custom screen implementations work correctly', () => {
        const engine = new Engine(mockViewport as any)
        const screen = new TestScreen()

        screen.init(engine)
        screen.update(engine, 16)
        screen.render(engine)
        screen.pause()
        screen.resume()

        expect(screen.updateCalled).toBe(true)
        expect(screen.renderCalled).toBe(true)
        expect(screen.pauseCalled).toBe(true)
        expect(screen.resumeCalled).toBe(true)
    })

    it('screen can transition to different screen', () => {
        class TransitionScreen extends BaseScreen {
            init() { return this }
            pause() { return this }
            resume() { return this }
            render() { return this }
            update() {
                return new NullScreen()
            }
        }

        const screen = new TransitionScreen()
        const next = screen.update()
        expect(next).toBeInstanceOf(NullScreen)
    })
})
