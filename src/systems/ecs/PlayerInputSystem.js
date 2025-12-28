// Player Input System - Handles player input and movement
import { System } from '../../core/EntityComponentSystem.js';
import { Transform, Velocity, Acceleration, PlayerController, Player } from '../../components/CoreComponents.js';
import { KEYS } from '../../utils/GameConstants.js';

export class PlayerInputSystem extends System {
    constructor(inputSystem) {
        super();
        this.requiredComponents = [Transform, Velocity, PlayerController, Player];
        this.priority = 5; // High priority, before movement
        this.inputSystem = inputSystem;
    }
    
    update(deltaTime) {
        for (const entity of this.entities) {
            const transform = entity.getComponent(Transform);
            const velocity = entity.getComponent(Velocity);
            const acceleration = entity.getComponent(Acceleration);
            const controller = entity.getComponent(PlayerController);
            
            // Get input direction
            const inputVector = this.getInputVector();
            
            // Apply acceleration based on input
            if (inputVector.x !== 0 || inputVector.y !== 0) {
                // Normalize diagonal movement
                const magnitude = Math.sqrt(inputVector.x * inputVector.x + inputVector.y * inputVector.y);
                const normalizedX = inputVector.x / magnitude;
                const normalizedY = inputVector.y / magnitude;
                
                // Apply acceleration
                if (acceleration) {
                    velocity.x += normalizedX * acceleration.rate;
                    velocity.y += normalizedY * acceleration.rate;
                }
                
                // Update thruster intensity for visual effects
                controller.thrusterIntensity = Math.min(1.0, controller.thrusterIntensity + 0.1);
            } else {
                // Reduce thruster intensity when no input
                controller.thrusterIntensity = Math.max(0, controller.thrusterIntensity - 0.05);
            }
            
            // Update muzzle flash
            if (controller.showMuzzleFlash) {
                controller.muzzleFlashTime -= deltaTime;
                if (controller.muzzleFlashTime <= 0) {
                    controller.showMuzzleFlash = false;
                }
            }
        }
    }
    
    getInputVector() {
        let x = 0;
        let y = 0;
        
        const leftPressed = this.inputSystem.isKeyPressed(KEYS.ARROW_LEFT) || this.inputSystem.isKeyPressed(KEYS.A);
        const rightPressed = this.inputSystem.isKeyPressed(KEYS.ARROW_RIGHT) || this.inputSystem.isKeyPressed(KEYS.D);
        const upPressed = this.inputSystem.isKeyPressed(KEYS.ARROW_UP) || this.inputSystem.isKeyPressed(KEYS.W);
        const downPressed = this.inputSystem.isKeyPressed(KEYS.ARROW_DOWN) || this.inputSystem.isKeyPressed(KEYS.S);
        
        if (leftPressed) x -= 1;
        if (rightPressed) x += 1;
        if (upPressed) y -= 1;
        if (downPressed) y += 1;
        
        return { x, y };
    }
}