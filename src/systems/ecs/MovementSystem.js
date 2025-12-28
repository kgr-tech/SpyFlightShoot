// Movement System - Handles entity movement and physics
import { System } from '../../core/EntityComponentSystem.js';
import { Transform, Velocity, Acceleration, RigidBody } from '../../components/CoreComponents.js';

export class MovementSystem extends System {
    constructor() {
        super();
        this.requiredComponents = [Transform, Velocity];
        this.priority = 10; // High priority for movement
    }
    
    update(deltaTime) {
        const deltaSeconds = deltaTime / 1000;
        
        for (const entity of this.entities) {
            const transform = entity.getComponent(Transform);
            const velocity = entity.getComponent(Velocity);
            const acceleration = entity.getComponent(Acceleration);
            const rigidBody = entity.getComponent(RigidBody);
            
            // Store previous position for collision resolution
            transform.prevX = transform.x;
            transform.prevY = transform.y;
            
            // Apply acceleration if present
            if (acceleration) {
                // Apply friction/deceleration
                velocity.x *= acceleration.deceleration;
                velocity.y *= acceleration.deceleration;
            }
            
            // Apply forces from rigid body
            if (rigidBody) {
                for (const force of rigidBody.forces) {
                    velocity.x += (force.x / rigidBody.mass) * deltaSeconds;
                    velocity.y += (force.y / rigidBody.mass) * deltaSeconds;
                }
                rigidBody.clearForces();
                
                // Apply friction
                velocity.x *= rigidBody.friction;
                velocity.y *= rigidBody.friction;
            }
            
            // Limit velocity to max speed
            const currentSpeed = Math.sqrt(velocity.x * velocity.x + velocity.y * velocity.y);
            if (currentSpeed > velocity.maxSpeed) {
                velocity.x = (velocity.x / currentSpeed) * velocity.maxSpeed;
                velocity.y = (velocity.y / currentSpeed) * velocity.maxSpeed;
            }
            
            // Apply movement
            transform.x += velocity.x * deltaSeconds * 60; // 60 FPS baseline
            transform.y += velocity.y * deltaSeconds * 60;
        }
    }
}