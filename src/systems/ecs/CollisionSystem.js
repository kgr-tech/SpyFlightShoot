// Collision System - Handles collision detection and response
import { System } from '../../core/EntityComponentSystem.js';
import { Transform, Collider, Health, Score, Energy } from '../../components/CoreComponents.js';

export class CollisionSystem extends System {
    constructor() {
        super();
        this.requiredComponents = [Transform, Collider];
        this.priority = 15; // After movement
        this.collisions = [];
    }
    
    update(deltaTime) {
        this.collisions.length = 0;
        
        // Get all entities with colliders
        const entities = Array.from(this.entities);
        
        // Check all pairs for collisions
        for (let i = 0; i < entities.length; i++) {
            for (let j = i + 1; j < entities.length; j++) {
                const entityA = entities[i];
                const entityB = entities[j];
                
                if (this.checkCollision(entityA, entityB)) {
                    this.collisions.push({ entityA, entityB });
                    this.handleCollision(entityA, entityB);
                }
            }
        }
    }
    
    checkCollision(entityA, entityB) {
        const transformA = entityA.getComponent(Transform);
        const colliderA = entityA.getComponent(Collider);
        const transformB = entityB.getComponent(Transform);
        const colliderB = entityB.getComponent(Collider);
        
        // Check if collision layers match
        if ((colliderA.collisionMask & colliderB.collisionLayer) === 0 &&
            (colliderB.collisionMask & colliderA.collisionLayer) === 0) {
            return false;
        }
        
        // AABB collision detection
        const aLeft = transformA.x + colliderA.offsetX;
        const aRight = aLeft + colliderA.width;
        const aTop = transformA.y + colliderA.offsetY;
        const aBottom = aTop + colliderA.height;
        
        const bLeft = transformB.x + colliderB.offsetX;
        const bRight = bLeft + colliderB.width;
        const bTop = transformB.y + colliderB.offsetY;
        const bBottom = bTop + colliderB.height;
        
        return !(aRight < bLeft || aLeft > bRight || aBottom < bTop || aTop > bBottom);
    }
    
    handleCollision(entityA, entityB) {
        const healthA = entityA.getComponent(Health);
        const healthB = entityB.getComponent(Health);
        const scoreA = entityA.getComponent(Score);
        const scoreB = entityB.getComponent(Score);
        const energyA = entityA.getComponent(Energy);
        const energyB = entityB.getComponent(Energy);
        
        // Handle damage
        if (healthA && healthB) {
            healthA.takeDamage(1);
            healthB.takeDamage(1);
        }
        
        // Handle scoring
        if (scoreA && healthB && healthB.isDead()) {
            // Entity A gets points for destroying entity B
            scoreA.value += scoreB ? scoreB.value : 10;
        }
        if (scoreB && healthA && healthA.isDead()) {
            // Entity B gets points for destroying entity A
            scoreB.value += scoreA ? scoreA.value : 10;
        }
        
        // Handle energy transfer
        if (energyA && scoreB && healthB && healthB.isDead()) {
            // Restore energy when destroying enemies
            energyA.restore(scoreB.value);
        }
        
        // Destroy dead entities
        if (healthA && healthA.isDead()) {
            entityA.destroy();
        }
        if (healthB && healthB.isDead()) {
            entityB.destroy();
        }
    }
    
    getCollisions() {
        return this.collisions;
    }
}