// Entity-Component-System (ECS) Architecture
// Modern game engine pattern for better performance and modularity

export class Entity {
    constructor(id = null) {
        this.id = id || Entity.generateId();
        this.components = new Map();
        this.active = true;
    }
    
    static generateId() {
        return `entity_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    
    addComponent(component) {
        this.components.set(component.constructor.name, component);
        component.entity = this;
        return this;
    }
    
    getComponent(componentType) {
        const name = typeof componentType === 'string' ? componentType : componentType.name;
        return this.components.get(name);
    }
    
    hasComponent(componentType) {
        const name = typeof componentType === 'string' ? componentType : componentType.name;
        return this.components.has(name);
    }
    
    removeComponent(componentType) {
        const name = typeof componentType === 'string' ? componentType : componentType.name;
        const component = this.components.get(name);
        if (component) {
            component.entity = null;
            this.components.delete(name);
        }
        return this;
    }
    
    destroy() {
        this.active = false;
        this.components.clear();
    }
}

export class Component {
    constructor() {
        this.entity = null;
    }
}

export class System {
    constructor() {
        this.entities = new Set();
        this.requiredComponents = [];
        this.priority = 0;
    }
    
    addEntity(entity) {
        if (this.matchesRequirements(entity)) {
            this.entities.add(entity);
            this.onEntityAdded(entity);
        }
    }
    
    removeEntity(entity) {
        if (this.entities.has(entity)) {
            this.entities.delete(entity);
            this.onEntityRemoved(entity);
        }
    }
    
    matchesRequirements(entity) {
        return this.requiredComponents.every(componentType => 
            entity.hasComponent(componentType)
        );
    }
    
    update(deltaTime) {
        // Override in subclasses
    }
    
    onEntityAdded(entity) {
        // Override in subclasses
    }
    
    onEntityRemoved(entity) {
        // Override in subclasses
    }
}

export class World {
    constructor() {
        this.entities = new Map();
        this.systems = new Map();
        this.systemsArray = [];
        this.toAdd = [];
        this.toRemove = [];
    }
    
    createEntity() {
        const entity = new Entity();
        this.toAdd.push(entity);
        return entity;
    }
    
    addEntity(entity) {
        this.entities.set(entity.id, entity);
        
        // Add to matching systems
        this.systemsArray.forEach(system => {
            system.addEntity(entity);
        });
    }
    
    removeEntity(entityId) {
        const entity = this.entities.get(entityId);
        if (entity) {
            this.toRemove.push(entity);
        }
    }
    
    getEntity(entityId) {
        return this.entities.get(entityId);
    }
    
    addSystem(system) {
        const name = system.constructor.name;
        this.systems.set(name, system);
        this.systemsArray.push(system);
        
        // Sort by priority
        this.systemsArray.sort((a, b) => a.priority - b.priority);
        
        // Add existing entities to new system
        this.entities.forEach(entity => {
            system.addEntity(entity);
        });
        
        return system;
    }
    
    getSystem(systemType) {
        const name = typeof systemType === 'string' ? systemType : systemType.name;
        return this.systems.get(name);
    }
    
    update(deltaTime) {
        // Process pending additions
        this.toAdd.forEach(entity => this.addEntity(entity));
        this.toAdd.length = 0;
        
        // Process pending removals
        this.toRemove.forEach(entity => {
            this.systemsArray.forEach(system => system.removeEntity(entity));
            this.entities.delete(entity.id);
            entity.destroy();
        });
        this.toRemove.length = 0;
        
        // Update all systems
        this.systemsArray.forEach(system => {
            system.update(deltaTime);
        });
    }
    
    getEntitiesWith(...componentTypes) {
        const result = [];
        this.entities.forEach(entity => {
            if (componentTypes.every(type => entity.hasComponent(type))) {
                result.push(entity);
            }
        });
        return result;
    }
    
    clear() {
        this.entities.clear();
        this.systems.clear();
        this.systemsArray.length = 0;
        this.toAdd.length = 0;
        this.toRemove.length = 0;
    }
}