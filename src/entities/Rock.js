// Rock entity class - environmental hazards
import { GAME_CONFIG } from '../utils/GameConstants.js';

export class Rock {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.size = 20 + Math.random() * 15; // Random size between 20-35
        this.width = this.size;
        this.height = this.size;
        this.speed = 1.5 + Math.random() * 1; // Slightly slower than enemies
        this.active = true;
        
        // Visual properties
        this.rotationAngle = 0;
        this.rotationSpeed = (Math.random() - 0.5) * 0.01; // Random rotation
        this.rockType = Math.floor(Math.random() * 3); // Different rock shapes
        
        // Collision properties
        this.health = 2; // Takes 2 bullets to destroy
    }
    
    update(deltaTime, canvasWidth, canvasHeight) {
        // Move downward
        this.y += this.speed;
        
        // Rotate rock
        this.rotationAngle += this.rotationSpeed * deltaTime;
        
        // Mark as inactive if off-screen
        if (this.y > canvasHeight + 50) {
            this.active = false;
        }
    }
    
    render(ctx) {
        if (!this.active) return;
        
        ctx.save();
        
        // Move to rock center for rotation
        const centerX = this.x + this.width / 2;
        const centerY = this.y + this.height / 2;
        ctx.translate(centerX, centerY);
        ctx.rotate(this.rotationAngle);
        
        // Enhanced rock colors with texture
        const baseColor = '#888888';
        const darkColor = '#555555';
        const lightColor = '#aaaaaa';
        
        ctx.fillStyle = baseColor;
        ctx.strokeStyle = '#666666';
        ctx.lineWidth = 2;
        
        // Draw different rock shapes based on type
        switch (this.rockType) {
            case 0:
                this.drawEnhancedRockType1(ctx, darkColor, lightColor);
                break;
            case 1:
                this.drawEnhancedRockType2(ctx, darkColor, lightColor);
                break;
            case 2:
                this.drawEnhancedRockType3(ctx, darkColor, lightColor);
                break;
        }
        
        // Add damage cracks if health is low
        if (this.health === 1) {
            this.drawEnhancedCracks(ctx);
        }
        
        ctx.restore();
    }
    
    drawEnhancedRockType1(ctx, darkColor, lightColor) {
        // Irregular polygon rock with texture
        const radius = this.size / 2;
        ctx.beginPath();
        ctx.moveTo(radius * 0.8, 0);
        ctx.lineTo(radius * 0.3, radius * 0.7);
        ctx.lineTo(-radius * 0.6, radius * 0.9);
        ctx.lineTo(-radius * 0.9, radius * 0.2);
        ctx.lineTo(-radius * 0.7, -radius * 0.5);
        ctx.lineTo(-radius * 0.2, -radius * 0.8);
        ctx.lineTo(radius * 0.4, -radius * 0.9);
        ctx.lineTo(radius * 0.9, -radius * 0.3);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        
        // Add surface texture
        ctx.fillStyle = darkColor;
        ctx.beginPath();
        ctx.arc(radius * 0.2, -radius * 0.3, radius * 0.15, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.fillStyle = lightColor;
        ctx.beginPath();
        ctx.arc(-radius * 0.3, radius * 0.2, radius * 0.1, 0, Math.PI * 2);
        ctx.fill();
    }
    
    drawEnhancedRockType2(ctx, darkColor, lightColor) {
        // More angular rock with enhanced details
        const radius = this.size / 2;
        ctx.beginPath();
        ctx.moveTo(radius, 0);
        ctx.lineTo(radius * 0.5, radius * 0.8);
        ctx.lineTo(-radius * 0.3, radius);
        ctx.lineTo(-radius, radius * 0.4);
        ctx.lineTo(-radius * 0.8, -radius * 0.2);
        ctx.lineTo(-radius * 0.2, -radius);
        ctx.lineTo(radius * 0.6, -radius * 0.7);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        
        // Add craters and texture
        ctx.fillStyle = darkColor;
        ctx.beginPath();
        ctx.arc(radius * 0.1, radius * 0.3, radius * 0.12, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.fillStyle = lightColor;
        ctx.beginPath();
        ctx.arc(-radius * 0.4, -radius * 0.1, radius * 0.08, 0, Math.PI * 2);
        ctx.fill();
    }
    
    drawEnhancedRockType3(ctx, darkColor, lightColor) {
        // Rounder rock with enhanced surface details
        const radius = this.size / 2;
        ctx.beginPath();
        ctx.arc(0, 0, radius * 0.9, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        
        // Add multiple surface details for realism
        ctx.fillStyle = darkColor;
        ctx.beginPath();
        ctx.arc(radius * 0.3, -radius * 0.2, radius * 0.2, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.beginPath();
        ctx.arc(-radius * 0.4, radius * 0.3, radius * 0.15, 0, Math.PI * 2);
        ctx.fill();
        
        // Add bright spots
        ctx.fillStyle = lightColor;
        ctx.beginPath();
        ctx.arc(radius * 0.1, radius * 0.4, radius * 0.08, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.beginPath();
        ctx.arc(-radius * 0.2, -radius * 0.4, radius * 0.06, 0, Math.PI * 2);
        ctx.fill();
    }
    
    drawEnhancedCracks(ctx) {
        // Enhanced damage cracks with more detail
        ctx.strokeStyle = '#333333';
        ctx.lineWidth = 2;
        
        const radius = this.size / 2;
        
        // Main crack 1
        ctx.beginPath();
        ctx.moveTo(-radius * 0.3, -radius * 0.5);
        ctx.lineTo(radius * 0.1, 0);
        ctx.lineTo(radius * 0.2, radius * 0.4);
        ctx.stroke();
        
        // Main crack 2
        ctx.beginPath();
        ctx.moveTo(radius * 0.4, -radius * 0.3);
        ctx.lineTo(0, radius * 0.1);
        ctx.lineTo(-radius * 0.1, radius * 0.6);
        ctx.stroke();
        
        // Smaller cracks
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(radius * 0.2, -radius * 0.1);
        ctx.lineTo(radius * 0.4, radius * 0.1);
        ctx.stroke();
        
        ctx.beginPath();
        ctx.moveTo(-radius * 0.2, -radius * 0.2);
        ctx.lineTo(-radius * 0.4, radius * 0.1);
        ctx.stroke();
    }
    
    // Handle bullet collision
    takeDamage() {
        this.health--;
        if (this.health <= 0) {
            this.destroy();
            return true; // Rock destroyed
        }
        return false; // Rock damaged but not destroyed
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
    
    // Mark rock for removal
    destroy() {
        this.active = false;
    }
    
    // Check if rock is still active
    isActive() {
        return this.active;
    }
    
    // Get point value for destroying rock
    getPointValue() {
        return 10; // Small points for destroying rocks
    }
}