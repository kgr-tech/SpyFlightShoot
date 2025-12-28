// Bullet entity class
import { GAME_CONFIG } from '../utils/GameConstants.js';

export class Bullet {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 4;
        this.height = 12;
        this.speed = 8; // Bullets move faster than player
        this.active = true;
    }
    
    update(deltaTime, canvasHeight) {
        // Move bullet upward
        this.y -= this.speed;
        
        // Mark bullet as inactive if it goes off-screen
        if (this.y + this.height < 0) {
            this.active = false;
        }
    }
    
    render(ctx) {
        if (!this.active) return;
        
        ctx.save();
        
        // Draw bullet trail effect
        const gradient = ctx.createLinearGradient(this.x, this.y, this.x, this.y + this.height);
        gradient.addColorStop(0, '#ffffff');
        gradient.addColorStop(0.5, '#ffff00');
        gradient.addColorStop(1, 'rgba(255, 255, 0, 0.3)');
        
        // Draw bullet body with gradient
        ctx.fillStyle = gradient;
        ctx.fillRect(this.x, this.y, this.width, this.height);
        
        // Add bright core
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(this.x + 1, this.y + 1, this.width - 2, this.height - 2);
        
        // Add glow effect
        ctx.shadowColor = '#ffff00';
        ctx.shadowBlur = 6;
        ctx.fillStyle = '#ffff00';
        ctx.fillRect(this.x + 1, this.y + 2, this.width - 2, 2);
        
        ctx.restore();
    }
    
    // Get bounding box for collision detection
    getBounds() {
        return {
            x: this.x,
            y: this.y,
            width: this.width,
            height: this.height
        };
    }
    
    // Get center position
    getCenterPosition() {
        return {
            x: this.x + this.width / 2,
            y: this.y + this.height / 2
        };
    }
    
    // Mark bullet for removal
    destroy() {
        this.active = false;
    }
    
    // Check if bullet is still active
    isActive() {
        return this.active;
    }
}