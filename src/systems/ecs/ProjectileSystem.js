// Projectile System - Handles bullet movement and lifecycle
import { System } from '../../core/EntityComponentSystem.js';
import { Transform, Velocity, Projectile, Bullet } from '../../components/CoreComponents.js';

export class ProjectileSystem extends System {
    constructor(canvasWidth, canvasHeight) {
        super();
        this.requiredComponents = [Transform, Velocity, Projectile, Bullet];
        this.priority = 9; // Before movement system
        this.canvasWidth = canvasWidth;
        this.canvasHeight = canvasHeight;
    }
    
    update(deltaTime) {
        for (const entity of this.entities) {
            const transform = entity.getComponent(Transform);
            const velocity = entity.getComponent(Velocity);
            const projectile = entity.getComponent(Projectile);
            
            // Set velocity based on projectile direction and speed
            velocity.x = projectile.direction.x * projectile.speed;
            velocity.y = projectile.direction.y * projectile.speed;
            
            // Remove bullets that go off-screen
            if (transform.y + 12 < 0 || // Above screen (assuming bullet height of 12)
                transform.y > this.canvasHeight + 50 || // Below screen
                transform.x < -50 || // Left of screen
                transform.x > this.canvasWidth + 50) { // Right of screen
                entity.destroy();
            }
        }
    }
}