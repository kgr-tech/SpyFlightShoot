// Shooting system for managing bullets and firing mechanics
import { Bullet } from '../entities/Bullet.js';
import { GAME_CONFIG, KEYS } from '../utils/GameConstants.js';

export class ShootingSystem {
    constructor() {
        this.bullets = [];
        this.lastShotTime = 0;
        this.fireRate = 200; // Milliseconds between shots (5 shots per second)
        
        // Track recent shots for dynamic music system
        this.recentShots = [];
        this.recentShotWindow = 5000; // 5 seconds
    }
    
    update(deltaTime, inputSystem, player, gameState, canvasHeight) {
        // Handle shooting input
        this.handleShooting(inputSystem, player, gameState);
        
        // Update all bullets
        this.updateBullets(deltaTime, canvasHeight);
        
        // Clean up inactive bullets
        this.cleanupBullets();
    }
    
    handleShooting(inputSystem, player, gameState) {
        const currentTime = Date.now();
        
        // Check if player wants to shoot and can shoot
        if (inputSystem.isKeyPressed(KEYS.SPACE) && 
            currentTime - this.lastShotTime >= this.fireRate &&
            gameState.gameStatus === 'playing') {
            
            // Try to consume energy for shooting
            if (player.consumeEnergy(GAME_CONFIG.ENERGY_PER_SHOT)) {
                this.createBullet(player);
                this.lastShotTime = currentTime;
            }
        }
    }
    
    createBullet(player) {
        const playerCenter = player.getCenterPosition();
        
        // Create bullet at player's center, slightly above the ship
        const bullet = new Bullet(
            playerCenter.x - 2, // Center bullet horizontally
            player.y - 5 // Position bullet above player ship
        );
        
        this.bullets.push(bullet);
        
        // Track recent shot for dynamic music system
        this.recentShots.push(Date.now());
        
        // Trigger muzzle flash effect
        player.triggerMuzzleFlash();
    }
    
    updateBullets(deltaTime, canvasHeight) {
        // Update recent shots tracking
        this.updateRecentShots();
        
        for (const bullet of this.bullets) {
            if (bullet.isActive()) {
                bullet.update(deltaTime, canvasHeight);
            }
        }
    }
    
    /**
     * Update recent shots tracking for dynamic music system
     */
    updateRecentShots() {
        const currentTime = Date.now();
        this.recentShots = this.recentShots.filter(shotTime => 
            currentTime - shotTime <= this.recentShotWindow
        );
    }
    
    /**
     * Get recent shot count for dynamic music system
     */
    getRecentShotCount() {
        return this.recentShots.length;
    }
    
    cleanupBullets() {
        // Remove inactive bullets from array
        this.bullets = this.bullets.filter(bullet => bullet.isActive());
    }
    
    render(ctx) {
        // Render all active bullets
        for (const bullet of this.bullets) {
            if (bullet.isActive()) {
                bullet.render(ctx);
            }
        }
    }
    
    // Get all active bullets (for collision detection)
    getActiveBullets() {
        return this.bullets.filter(bullet => bullet.isActive());
    }
    
    // Remove a specific bullet (for collision handling)
    removeBullet(bulletToRemove) {
        const index = this.bullets.indexOf(bulletToRemove);
        if (index > -1) {
            bulletToRemove.destroy();
        }
    }
    
    // Clear all bullets (for game restart)
    clearAllBullets() {
        this.bullets = [];
    }
    
    // Get bullet count for debugging
    getBulletCount() {
        return this.bullets.length;
    }
}