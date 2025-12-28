// Enemy AI System - Handles enemy movement and behavior
import { System } from '../../core/EntityComponentSystem.js';
import { Transform, Velocity, EnemyAI, Enemy } from '../../components/CoreComponents.js';

export class EnemyAISystem extends System {
    constructor(canvasWidth, canvasHeight) {
        super();
        this.requiredComponents = [Transform, Velocity, EnemyAI, Enemy];
        this.priority = 8; // Before movement system
        this.canvasWidth = canvasWidth;
        this.canvasHeight = canvasHeight;
    }
    
    update(deltaTime) {
        for (const entity of this.entities) {
            const transform = entity.getComponent(Transform);
            const velocity = entity.getComponent(Velocity);
            const ai = entity.getComponent(EnemyAI);
            
            // Move downward
            velocity.y = ai.speed;
            
            // Update zig-zag movement
            this.updateZigzagMovement(transform, velocity, ai, deltaTime);
            
            // Update visual effects
            ai.pulseTimer += deltaTime * 0.005;
            
            // Mark for removal if off-screen
            if (transform.y > this.canvasHeight + 50) {
                entity.destroy();
            }
        }
    }
    
    updateZigzagMovement(transform, velocity, ai, deltaTime) {
        // Update zig-zag timer
        ai.zigzagTimer += deltaTime * ai.zigzagFrequency;
        
        // Calculate zig-zag offset using sine wave
        const zigzagOffset = Math.sin(ai.zigzagTimer) * ai.zigzagAmplitude;
        
        // Apply zig-zag movement
        const targetX = ai.centerX + zigzagOffset;
        
        // Keep within canvas bounds
        if (targetX < 0) {
            ai.centerX = ai.zigzagAmplitude;
        } else if (targetX + 25 > this.canvasWidth) { // Assuming enemy width of 25
            ai.centerX = this.canvasWidth - 25 - ai.zigzagAmplitude;
        }
        
        // Set horizontal velocity for smooth movement
        const newTargetX = ai.centerX + Math.sin(ai.zigzagTimer) * ai.zigzagAmplitude;
        velocity.x = (newTargetX - transform.x) * 0.1; // Smooth interpolation
    }
}