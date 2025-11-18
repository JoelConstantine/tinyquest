/**
 * Type alias for an entity id.
 */
export type Entity = number

/**
 * Abstract class for all components.
 */
export abstract class Component { }

/**
 * Abstract class for all systems.
 */
export abstract class System {
    /**
     * Set of component classes required for the system to update the entity.
     */
    public abstract componentsRequired: Set<Function>

    /**
     * Updates the entities that the system is aware of.
     * @param entities - Set of entities that the system is aware of.
     */
    public abstract update(delta: number,entities: Set<Entity>): void

    /**
     * ECS instance associated with the system.
     */
    public ecs!: ECS
}

/**
 * Type alias for a component class.
 * @template T - Type of component.
 */
export type ComponentClass<T extends Component> = new (...args: any[]) => T

/**
 * Container for components associated with an entity.
 */
export class ComponentContainer {
    /**
     * Map of component constructor to component instance.
     */
    private map = new Map<Function, Component>()
    readonly entity: Entity
    ecs: ECS
    constructor(entity: Entity, ecs: ECS) {
        this.entity = entity
        this.ecs = ecs
     }
    /**
     * Adds a component to the container.
     * @param component - Component to add.
     */
    public add(component: Component): void {
        this.map.set(component.constructor, component)
    }

    /**
     * Gets a component from the container.
     * @param c - Component class.
     * @returns Component instance.
     */
    public get<T extends Component>(c: ComponentClass<T>): T {
        return this.map.get(c) as T
    }

    public getOfType<T extends Component>(c: ComponentClass<T>): T | undefined {
        for (const component of this.map.values()) {
            if (component instanceof c) {
                return component as T
            }
        }
    }
    /**
     * Checks if the container has all the components of the given component classes.
     * @param componentClasses - Iterable of component classes.
     * @returns True if the container has all the components, false otherwise.
     */
    public hasAll(componentClasses: Iterable<Function>): boolean {
        for (let componentClass of componentClasses) {
            if (!this.has(componentClass)) {
                return false
            }
        }
        return true
    }

    /**
     * Checks if the container has the given component.
     * @param componentClass - Component class.
     * @returns True if the container has the component, false otherwise.
     */
    public has(componentClass: Function): boolean {
        for (const component of this.map.values()) {
            if (component instanceof componentClass) {
                return true
            }
        }
        return this.map.has(componentClass)
    }

    /**
     * Removes a component from the container.
     * @param componentClass - Component class.
     */
    public delete(componentClass: Function): void {
        this.map.delete(componentClass)
    }

    /**
     * Returns all component instances in this container.
     */
    public getAllComponents(): Component[] {
        return Array.from(this.map.values())
    }
}

/**
 * ECS (Entity Component System) class.
 */
export class ECS {
    /**
     * Map of entity id to component container.
     */
    private entities = new Map<Entity, ComponentContainer>()

    /**
     * Map of system to set of entities that the system is aware of.
     */
    private systems = new Map<System, Set<Entity>>()

    /**
     * Next entity id to use.
     */
    private nextEntityId = 0

    /**
     * Array of entity ids to destroy on the next update.
     */
    private entitiesToDestroy = new Array<Entity>()

    /**
     * Registry mapping stable type names to component classes.
     */
    private componentRegistry = new Map<string, ComponentClass<Component>>()

    /**
     * Reverse lookup from component constructor to registered type name.
     */
    private componentTypeToName = new Map<Function, string>()

    /**
     * Adds an entity to the ECS.
     * @returns Entity id of the added entity.
     */
    public addEntity(): Entity {
        const entity = this.nextEntityId;
        this.nextEntityId++;
        this.entities.set(entity, new ComponentContainer(entity, this))
        return entity
    }

    /**
     * Removes an entity from the ECS.
     * @param entity - Entity id to remove.
     */
    public removeEntity(entity: Entity): void {
        this.entitiesToDestroy.push(entity)
    }

    /**
     * Adds a component to the given entity.
     * @param entity - Entity id.
     * @param component - Component to add.
     */
    public addComponent(entity: Entity, component: Component): void {
        this.entities.get(entity)?.add(component)
        this.checkE(entity)
    }

    /**
     * Register a component class with a stable type name used for serialization.
     * The `typeName` should be unique and stable across builds (avoid minified names).
     */
    public registerComponent<T extends Component>(typeName: string, cls: ComponentClass<T>): void {
        this.componentRegistry.set(typeName, cls as ComponentClass<Component>)
        this.componentTypeToName.set(cls, typeName)
    }

    /**
     * Unregister a previously registered component type.
     */
    public unregisterComponent(typeName: string): void {
        const cls = this.componentRegistry.get(typeName)
        if (cls) {
            this.componentTypeToName.delete(cls)
            this.componentRegistry.delete(typeName)
        }
    }

    /**
     * Gets the components associated with the given entity.
     * @param entity - Entity id.
     * @returns Component container associated with the entity.
     */
    public getComponents(entity: Entity): ComponentContainer | undefined {
        return this.entities.get(entity)
    }

    /**
     * Removes a component from the given entity.
     * @param entity - Entity id.
     * @param componentClass - Component class.
     */
    public removeComponent(entity: Entity, componentClass: Function): void {
        this.entities.get(entity)?.delete(componentClass)
        this.checkE(entity)
    }

    /**
     * Adds a system to the ECS.
     * @param system - System to add.
     */
    public addSystem(system: System): void {
        if (system.componentsRequired.size === 0) {
            console.warn("System not added: empty Component list", { system })
            return
        }
        
        system.ecs = this
        this.systems.set(system, new Set<Entity>())
        for (let entity of this.entities.keys()) {
            this.checkES(entity, system)
        }
    }

    /**
     * Updates the ECS.
     */
    public update(delta: number): void {
        for (let [system, entities] of this.systems) { 
            system.update(delta, entities)
        }

        while (this.entitiesToDestroy.length > 0) {
            this.destroyEntity(this.entitiesToDestroy.pop()!)
        }
    }

    /**
     * Produce a JSON string snapshot of the current ECS state (entities + components + nextEntityId).
     * Components must implement `toJSON()` instance method; their constructor should be registered
     * with `registerComponent(typeName, Constructor)` so the loader can map type names back to classes.
     */
    public save(): string {
        const snapshot: any = {
            version: 1,
            nextEntityId: this.nextEntityId,
            entities: [] as any[],
        }

        for (const [id, container] of this.entities) {
            const comps: any[] = []
            for (const component of container.getAllComponents()) {
                const ctor = (component as any).constructor as Function
                const type = this.componentTypeToName.get(ctor) ?? (ctor as any).typeName ?? (ctor as any).name
                if (typeof (component as any).toJSON !== 'function') {
                    console.warn('Skipping non-serializable component', { entity: id, type })
                    continue
                }
                const data = (component as any).toJSON()
                comps.push({ type, data })
            }
            snapshot.entities.push({ id, components: comps })
        }

        return JSON.stringify(snapshot)
    }

    /**
     * Load a snapshot previously produced by `save()`.
     * If the snapshot contains unknown component types they will be skipped with a warning.
     */
    public load(serialized: string | object): void {
        const snapshot = typeof serialized === 'string' ? JSON.parse(serialized) : serialized
        const version = snapshot.version ?? 1
        if (version !== 1) {
            console.warn('Loading snapshot with unexpected version', { version })
        }

        // clear existing entities and reset system entity sets
        this.entities.clear()
        for (const system of this.systems.keys()) {
            this.systems.set(system, new Set<Entity>())
        }

        this.nextEntityId = snapshot.nextEntityId ?? 0

        // First pass: create containers for every entity id
        for (const e of snapshot.entities ?? []) {
            this.entities.set(e.id, new ComponentContainer(e.id, this))
        }

        // Second pass: instantiate components and add to containers
        for (const e of snapshot.entities ?? []) {
            const container = this.entities.get(e.id)!
            for (const c of e.components ?? []) {
                const cls = this.componentRegistry.get(c.type)
                if (!cls) {
                    console.warn('Unknown component type while loading; skipping', { type: c.type })
                    continue
                }

                let comp: Component
                if (typeof (cls as any).fromJSON === 'function') {
                    comp = (cls as any).fromJSON(c.data, this, e.id)
                } else {
                    // best-effort: try to construct with the data as a single arg
                    try {
                        comp = new (cls as any)(c.data)
                    } catch (err) {
                        console.warn('Failed to construct component from data; skipping', { type: c.type, err })
                        continue
                    }
                }

                container.add(comp)
            }

            // update systems membership for this entity
            this.checkE(e.id)
        }

        // Optional third pass: resolve references inside components that need it
        for (const container of this.entities.values()) {
            for (const comp of container.getAllComponents()) {
                if (typeof (comp as any).resolveReferences === 'function') {
                    try {
                        (comp as any).resolveReferences(this)
                    } catch (err) {
                        console.warn('resolveReferences failed on component', { entity: container.entity, comp, err })
                    }
                }
            }
        }
    }

    /**
     * Destroys an entity.
     * @param entity - Entity id to destroy.
     */
    private destroyEntity(entity: Entity): void {
        this.entities.delete(entity)
        for (let entities of this.systems.values()) {
            entities.delete(entity)
        }
    }

    /**
     * Checks if the entity has all the components of the given system.
     * @param entity - Entity id.
     * @param system - System to check.
     */
    private checkE(entity: Entity) {
        for (let system of this.systems.keys()) {
            this.checkES(entity, system)
        }
    }

    /**
     * Checks if the entity has all the components of the given system and adds or removes the entity from the system's entities set accordingly.
     * @param entity - Entity id.
     * @param system - System to check.
     */
    private checkES(entity: Entity, system: System) {
        let have = this.entities.get(entity)
        let need = system.componentsRequired

        if (have?.hasAll(need)) {
            this.systems.get(system)!.add(entity)
        } else {
            this.systems.get(system)!.delete(entity)
        }
    }

    clear() {
        this.entities.clear()
        for (let entities of this.systems.values()) {
            entities.clear()
        }
        this.nextEntityId = 0
        this.systems.clear()
        this.entitiesToDestroy = []
    }
}