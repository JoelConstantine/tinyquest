import { describe, it, expect, beforeEach } from 'vitest'
import { ECS, Component } from '../ecs'

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

describe("ECS Component Operations", () => {
    const ecs = new ECS()

    it("adds and retrieve component", () => {
       
        ecs.registerComponent(Position.typeName, Position)

        const e = ecs.addEntity()
        ecs.addComponent(e, new Position(1, 2))

        const container = ecs.getComponents(e)
        expect(container).toBeDefined()
        expect(container!.get(Position).x).toBe(1)
        expect(container!.get(Position).y).toBe(2)
    })

    it("removes a component", () => {
        ecs.registerComponent(Position.typeName, Position)
        const e = ecs.addEntity()
        ecs.addComponent(e, new Position(1, 2))
        ecs.removeComponent(e, Position)
        const container = ecs.getComponents(e)
        expect(container).toBeDefined()
        expect(container!.get(Position)).toBeUndefined()
    })
})

describe('ECS serialization', () => {
  it('ComponentContainer.getAllComponents returns components', () => {
    const ecs = new ECS()
    ecs.registerComponent(Position.typeName, Position)

    const e = ecs.addEntity()
    ecs.addComponent(e, new Position(1, 2))

    const container = ecs.getComponents(e)
    expect(container).toBeDefined()
    const all = container!.getAllComponents()
    expect(all.length).toBe(1)
    expect(container!.get(Position).x).toBe(1)
    expect(container!.get(Position).y).toBe(2)
  })

  it('save and load roundtrip preserves entities and components', () => {
    const ecs = new ECS()
    ecs.registerComponent(Position.typeName, Position)

    const a = ecs.addEntity()
    const b = ecs.addEntity()
    ecs.addComponent(a, new Position(5, 6))
    ecs.addComponent(b, new Position(7, 8))

    const snapshot = ecs.save()

    const ecs2 = new ECS()
    ecs2.registerComponent(Position.typeName, Position)
    ecs2.load(snapshot)

    // ensure nextEntityId was restored
    expect((ecs2 as any).nextEntityId).toBe((ecs as any).nextEntityId)

    const ca = ecs2.getComponents(a)
    const cb = ecs2.getComponents(b)
    expect(ca).toBeDefined()
    expect(cb).toBeDefined()
    expect(ca!.get(Position).x).toBe(5)
    expect(ca!.get(Position).y).toBe(6)
    expect(cb!.get(Position).x).toBe(7)
    expect(cb!.get(Position).y).toBe(8)
  })
})
