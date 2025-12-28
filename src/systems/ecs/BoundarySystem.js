// Boundary System - Handles entity boundaries and screen wrapping
import { System } from '../../core/EntityComponentSystem.js';
import { Transform, Velocity, Sprite, PlayerController, Player } from '../../components/CoreComponents.js';

export class BoundarySystem extends System {
    constructor(canvasWidth, canvasHeight) {
        super();
        this.requiredComponents = [Transform, Sprite];
        this.priority = 12; // After movement, before collision
        this.canvasWidth = canvasWidth;
        this.canvasHeight = canvasHeight;
    }
    
    update(deltaTime) {
        for (const entity of this.entities) {
            const transform = entity.getComponent(Transform);
            const sprite = entity.getComponent(Sprite);
            const velocity = entity.getComponent(Velocity);
            
            // Handle player boundaries with bounce
            if (entity.hasComponent(Player)) {
                this.handlePlayerBoundaries(transform, sprite, velocity);
            } else {
                // Handle other entities (destroy if off-screen)
                this.handleEntityBoundaries(entity, transform, sprite);
            }
        }
    }
    
    handlePlayerBoundaries(transform, sprite, velocity) {
        // Bounce off boundaries with velocity dampening
        if (transform.x < 0) {
            transform.x = 0;
            if (velocity) {
                velocity.x = Math.abs(velocity.x) * 0.3; // Bounce with energy loss
            }
        }
        
        if (transform.x + sprite.width > this.canvasWidth) {
            transform.x = this.canvasWidth - sprite.width;
            if (velocity) {
                velocity.x = -Math.abs(velocity.x) * 0.3;
            }
        }
        
        if (transform.y < 0) {
            transform.y = 0;
            if (velocity) {
                velocity.y = Math.abs(velocity.y) * 0.3;
            }
        }
        
        if (transform.y + sprite.height > this.canvasHeight) {
            transform.y = this.canvasHeight - sprite.height;
            if (velocity) {
                velocity.y = -Math.abs(velocity.y) * 0.3;
            }
        }
    }
    
    handleEntityBoundaries(entity, transform, sprite) {
        // Destroy entities that go off-screen
        const margin = 50; // Allow some margin before destroying
        
        if (transform.x + sprite.width < -margin ||
            transform.x > this.canvasWidth + margin ||
            transform.y + sprite.height < -margin ||
            transform.y > this.canvasHeight + margin) {
            entity.destroy();
        }
    }
}