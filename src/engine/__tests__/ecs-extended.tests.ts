import { describe, it, expect, beforeEach, vi } from 'vitest'
import type { Entity } from '../ecs'
import { ECS, Component, System, ComponentContainer } from '../ecs'

class Position extends Component {
    static typeName = 'Position'
    public x = 0
    public y = 0
    constructor(x = 0, y = 0) {
        super()
        this.x = x
        this.y = y
    }
    toJSON() {
        return { x: this.x, y: this.y }
    }
    static fromJSON(data: any) {
        return new Position(data.x, data.y)
    }
}

class Velocity extends Component {
    static typeName = 'Velocity'
    public vx = 0
    public vy = 0
    constructor(vx = 0, vy = 0) {
        super()
        this.vx = vx
        this.vy = vy
    }
    toJSON() {
        return { vx: this.vx, vy: this.vy }
    }
    static fromJSON(data: any) {
        return new Velocity(data.vx, data.vy)
    }
}

class PhysicsSystem extends System {
    public componentsRequired = new Set([Position, Velocity])
    public update(delta: number, entities: Set<Entity>) {
        for (const e of entities) {
            const container = this.ecs.getComponents(e)!
            const pos = container.get(Position)
            const vel = container.get(Velocity)
            pos.x += vel.vx * delta
            pos.y += vel.vy * delta
        }
    }
}

describe('ComponentContainer', () => {
    let container: ComponentContainer
    let ecs: ECS

    beforeEach(() => {
        ecs = new ECS()
        container = new ComponentContainer(0, ecs)
    })

    it('adds and retrieves components', () => {
        const pos = new Position(1, 2)
        container.add(pos)
        expect(container.get(Position)).toBe(pos)
    })

    it('has() returns true for added components', () => {
        container.add(new Position(1, 2))
        expect(container.has(Position)).toBe(true)
    })

    it('has() returns false for missing components', () => {
        expect(container.has(Position)).toBe(false)
    })

    it('hasAll() checks multiple components', () => {
        container.add(new Position(1, 2))
        container.add(new Velocity(1, 1))
        expect(container.hasAll([Position, Velocity])).toBe(true)
    })

    it('hasAll() returns false if any component is missing', () => {
        container.add(new Position(1, 2))
        expect(container.hasAll([Position, Velocity])).toBe(false)
    })

    it('deletes components', () => {
        container.add(new Position(1, 2))
        container.delete(Position)
        expect(container.has(Position)).toBe(false)
    })

    it('getAllComponents returns all added components', () => {
        const pos = new Position(1, 2)
        const vel = new Velocity(3, 4)
        container.add(pos)
        container.add(vel)
        const all = container.getAllComponents()
        expect(all.length).toBe(2)
        expect(all).toContain(pos)
        expect(all).toContain(vel)
    })

    it('getOfType returns first matching component by instanceof', () => {
        container.add(new Position(1, 2))
        const found = container.getOfType(Position)
        expect(found).toBeDefined()
        expect(found?.x).toBe(1)
    })

    it('getOfType returns undefined if no match', () => {
        const found = container.getOfType(Position)
        expect(found).toBeUndefined()
    })
})

describe('ECS Entity Management', () => {
    let ecs: ECS

    beforeEach(() => {
        ecs = new ECS()
    })

    it('addEntity returns unique incremental ids', () => {
        const e1 = ecs.addEntity()
        const e2 = ecs.addEntity()
        const e3 = ecs.addEntity()
        expect(e1).toBe(0)
        expect(e2).toBe(1)
        expect(e3).toBe(2)
    })

    it('getComponents returns container for added entity', () => {
        const e = ecs.addEntity()
        const container = ecs.getComponents(e)
        expect(container).toBeDefined()
    })

    it('getComponents returns undefined for non-existent entity', () => {
        const container = ecs.getComponents(999)
        expect(container).toBeUndefined()
    })

    it('removeEntity marks entity for destruction and destroys on next update', () => {
        const e = ecs.addEntity()
        ecs.addComponent(e, new Position(1, 2))
        expect(ecs.getComponents(e)).toBeDefined()

        ecs.removeEntity(e)
        // entity still exists until update is called
        expect(ecs.getComponents(e)).toBeDefined()

        ecs.update(0)
        // after update, entity is gone
        expect(ecs.getComponents(e)).toBeUndefined()
    })
})

describe('ECS Component Registration', () => {
    let ecs: ECS

    beforeEach(() => {
        ecs = new ECS()
    })

    it('registerComponent stores component by typeName', () => {
        ecs.registerComponent(Position.typeName, Position)
        // we can verify indirectly via serialization
        const e = ecs.addEntity()
        ecs.addComponent(e, new Position(1, 2))
        const snapshot = JSON.parse(ecs.save())
        expect(snapshot.entities[0].components[0].type).toBe('Position')
    })

    it('unregisterComponent removes component from registry', () => {
        ecs.registerComponent(Position.typeName, Position)
        ecs.unregisterComponent(Position.typeName)
        // registering same name again should not throw
        ecs.registerComponent(Position.typeName, Position)
    })

    it('unregisterComponent on non-existent type is a no-op', () => {
        expect(() => {
            ecs.unregisterComponent('NonExistent')
        }).not.toThrow()
    })
})

describe('ECS Systems', () => {
    let ecs: ECS

    beforeEach(() => {
        ecs = new ECS()
        ecs.registerComponent(Position.typeName, Position)
        ecs.registerComponent(Velocity.typeName, Velocity)
    })

    it('addSystem with zero required components logs warning and returns', () => {
        const spy = vi.spyOn(console, 'warn')
        const emptySystem = new (class extends System {
            componentsRequired = new Set<Function>()
            update() {}
        })()

        ecs.addSystem(emptySystem)
        expect(spy).toHaveBeenCalled()
        spy.mockRestore()
    })

    it('addSystem assigns ecs reference to system', () => {
        const system = new PhysicsSystem()
        ecs.addSystem(system)
        expect(system.ecs).toBe(ecs)
    })

    it('update calls system.update with matching entities', () => {
        const e = ecs.addEntity()
        ecs.addComponent(e, new Position(0, 0))
        ecs.addComponent(e, new Velocity(1, 2))

        const system = new PhysicsSystem()
        const spy = vi.spyOn(system, 'update')
        ecs.addSystem(system)

        ecs.update(100)
        expect(spy).toHaveBeenCalledWith(100, expect.any(Set))
    })

    it('system only receives entities matching all required components', () => {
        const e1 = ecs.addEntity() // both components
        ecs.addComponent(e1, new Position(0, 0))
        ecs.addComponent(e1, new Velocity(1, 2))

        const e2 = ecs.addEntity() // only position
        ecs.addComponent(e2, new Position(5, 5))

        const system = new PhysicsSystem()
        let receivedEntities: Set<Entity> | null = null
        system.update = (_delta, entities) => {
            receivedEntities = entities
        }

        ecs.addSystem(system)
        ecs.update(0)

        expect(receivedEntities).toBeDefined()
        expect(receivedEntities!.has(e1)).toBe(true)
        expect(receivedEntities!.has(e2)).toBe(false)
    })
})

describe('ECS Serialization', () => {
    let ecs: ECS

    beforeEach(() => {
        ecs = new ECS()
        ecs.registerComponent(Position.typeName, Position)
        ecs.registerComponent(Velocity.typeName, Velocity)
    })

    it('save produces valid JSON with version and nextEntityId', () => {
        const snapshot = JSON.parse(ecs.save())
        expect(snapshot.version).toBe(1)
        expect(snapshot.nextEntityId).toBeDefined()
        expect(Array.isArray(snapshot.entities)).toBe(true)
    })

    it('save includes all entities and components', () => {
        const e1 = ecs.addEntity()
        ecs.addComponent(e1, new Position(1, 2))
        ecs.addComponent(e1, new Velocity(3, 4))

        const snapshot = JSON.parse(ecs.save())
        expect(snapshot.entities.length).toBe(1)
        expect(snapshot.entities[0].id).toBe(0)
        expect(snapshot.entities[0].components.length).toBe(2)
    })

    it('save warns for non-serializable components', () => {
        const spy = vi.spyOn(console, 'warn')
        class NoSerialize extends Component {}
        const e = ecs.addEntity()
        ecs.addComponent(e, new NoSerialize())

        ecs.save()
        expect(spy).toHaveBeenCalledWith(
            'Skipping non-serializable component',
            expect.objectContaining({ entity: e })
        )
        spy.mockRestore()
    })

    it('load from string parses JSON', () => {
        const e1 = ecs.addEntity()
        ecs.addComponent(e1, new Position(1, 2))
        const snapshot = ecs.save()

        const ecs2 = new ECS()
        ecs2.registerComponent(Position.typeName, Position)
        ecs2.load(snapshot)

        const c = ecs2.getComponents(0)
        expect(c).toBeDefined()
        expect(c!.get(Position).x).toBe(1)
    })

    it('load from object directly', () => {
        const obj = { version: 1, nextEntityId: 5, entities: [] }
        const ecs2 = new ECS()
        ecs2.load(obj)
        expect((ecs2 as any).nextEntityId).toBe(5)
    })

    it('load warns for unknown component types and skips them', () => {
        const spy = vi.spyOn(console, 'warn')
        const snapshot = {
            version: 1,
            nextEntityId: 1,
            entities: [{ id: 0, components: [{ type: 'Unknown', data: {} }] }],
        }

        ecs.load(snapshot)
        expect(spy).toHaveBeenCalledWith(
            'Unknown component type while loading; skipping',
            expect.any(Object)
        )
        spy.mockRestore()
    })

    it('load warns for unexpected version', () => {
        const spy = vi.spyOn(console, 'warn')
        const snapshot = {
            version: 99,
            nextEntityId: 0,
            entities: [],
        }

        ecs.load(snapshot)
        expect(spy).toHaveBeenCalledWith(
            'Loading snapshot with unexpected version',
            expect.any(Object)
        )
        spy.mockRestore()
    })

    it('load supports fromJSON static method for component construction', () => {
        const snapshot = {
            version: 1,
            nextEntityId: 1,
            entities: [{ id: 0, components: [{ type: 'Position', data: { x: 10, y: 20 } }] }],
        }

        const ecs2 = new ECS()
        ecs2.registerComponent(Position.typeName, Position)
        ecs2.load(snapshot)

        const c = ecs2.getComponents(0)
        expect(c!.get(Position).x).toBe(10)
        expect(c!.get(Position).y).toBe(20)
    })

    it('load falls back to constructor if fromJSON is not available', () => {
        class SimpleComp extends Component {
            data?: any
            constructor(data?: any) {
                super()
                this.data = data
            }
            toJSON() {
                return this.data
            }
        }

        ecs.registerComponent('SimpleComp', SimpleComp)
        const snapshot = {
            version: 1,
            nextEntityId: 1,
            entities: [{ id: 0, components: [{ type: 'SimpleComp', data: { foo: 'bar' } }] }],
        }

        ecs.load(snapshot)
        const c = ecs.getComponents(0)
        expect(c).toBeDefined()
    })

    it('load calls resolveReferences on components that implement it', () => {
        class WithResolve extends Component {
            resolved = false
            toJSON() {
                return {}
            }
            resolveReferences() {
                this.resolved = true
            }
        }

        ecs.registerComponent('WithResolve', WithResolve)
        const snapshot = {
            version: 1,
            nextEntityId: 1,
            entities: [{ id: 0, components: [{ type: 'WithResolve', data: {} }] }],
        }

        ecs.load(snapshot)
        const c = ecs.getComponents(0)
        const comp = c!.getAllComponents()[0] as any
        expect(comp.resolved).toBe(true)
    })
})

describe('ECS clear', () => {
    let ecs: ECS

    beforeEach(() => {
        ecs = new ECS()
        ecs.registerComponent(Position.typeName, Position)
    })

    it('clear removes all entities and resets state', () => {
        const e1 = ecs.addEntity()
        const e2 = ecs.addEntity()
        ecs.addComponent(e1, new Position(1, 2))
        ecs.addComponent(e2, new Position(3, 4))

        ecs.clear()

        expect(ecs.getComponents(e1)).toBeUndefined()
        expect(ecs.getComponents(e2)).toBeUndefined()
        expect((ecs as any).nextEntityId).toBe(0)
    })

    it('clear also clears system entity sets', () => {
        const system = new PhysicsSystem()
        ecs.addSystem(system)

        ecs.clear()

        // system should still exist but with empty entity set
        expect((ecs as any).systems.has(system)).toBe(true)
    })
})
