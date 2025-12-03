import { describe, expect, it, vi } from 'vitest'
import { EventSystem } from '../events'

describe('EventSystem', () => {
    it('calls subscribers when an event is emitted with args', () => {
        const es = new EventSystem()
        const fn = vi.fn()
        es.subscribe('tick', fn)
        es.emit('tick', 1, 'a')
        expect(fn).toHaveBeenCalledTimes(1)
        expect(fn).toHaveBeenCalledWith(1, 'a')
    })

    it('invokes subscribers in subscription order', () => {
        const es = new EventSystem()
        const calls: number[] = []
        es.subscribe('order', () => calls.push(1))
        es.subscribe('order', () => calls.push(2))
        es.emit('order')
        expect(calls).toEqual([1, 2])
    })

    it('removes a subscriber with unsubscribe', () => {
        const es = new EventSystem()
        const a = vi.fn()
        const b = vi.fn()
        es.subscribe('evt', a)
        es.subscribe('evt', b)
        es.unsubscribe('evt', a)
        es.emit('evt')
        expect(a).toHaveBeenCalledTimes(0)
        expect(b).toHaveBeenCalledTimes(1)
    })

    it('unsubscribing a non-existent callback or event is a no-op', () => {
        const es = new EventSystem()
        const fn = vi.fn()
        // should not throw
        es.unsubscribe('no-such-event', fn)
        es.subscribe('x', fn)
        // different function reference
        es.unsubscribe('x', () => {})
        es.emit('x')
        expect(fn).toHaveBeenCalledTimes(1)
    })

    it('emitting an event with no subscribers does nothing', () => {
        const es = new EventSystem()
        // should not throw
        es.emit('empty')
    })
})
