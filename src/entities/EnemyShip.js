// EnemyShip entity class
import { GAME_CONFIG } from '../utils/GameConstants.js';

export class EnemyShip {
    constructor(x, y, type = 'enemy') {
        this.x = x;
        this.y = y;
        this.width = 25;
        this.height = 30;
        this.speed = 2;
        this.type = type; // 'enemy' or 'spy'
        this.active = true;
        
        // Zig-zag movement properties
        this.zigzagDirection = Math.random() > 0.5 ? 1 : -1; // Start moving left or right
        this.zigzagSpeed = 1.5; // Horizontal movement speed
        this.zigzagAmplitude = 60; // How far left/right to move
        this.centerX = x; // Remember starting X position
        this.zigzagTimer = 0;
        this.zigzagFrequency = 0.003; // How fast to change direction
        
        // Visual properties
        this.pulseTimer = Math.random() * Math.PI * 2; // Random start for pulsing effect
    }
    
    update(deltaTime, canvasWidth, canvasHeight) {
        // Move downward
        this.y += this.speed;
        
        // Update zig-zag movement
        this.updateZigzagMovement(deltaTime, canvasWidth);
        
        // Update visual effects
        this.pulseTimer += deltaTime * 0.005;
        
        // Mark as inactive if off-screen
        if (this.y > canvasHeight + 50) {
            this.active = false;
        }
    }
    
    updateZigzagMovement(deltaTime, canvasWidth) {
        // Update zig-zag timer
        this.zigzagTimer += deltaTime * this.zigzagFrequency;
        
        // Calculate zig-zag offset using sine wave
        const zigzagOffset = Math.sin(this.zigzagTimer) * this.zigzagAmplitude;
        
        // Apply zig-zag movement
        this.x = this.centerX + zigzagOffset;
        
        // Keep within canvas bounds
        if (this.x < 0) {
            this.x = 0;
            this.centerX = this.zigzagAmplitude;
        } else if (this.x + this.width > canvasWidth) {
            this.x = canvasWidth - this.width;
            this.centerX = canvasWidth - this.width - this.zigzagAmplitude;
        }
    }
    
    render(ctx, scannerActive = false, scannerSystem = null) {
        if (!this.active) return;
        
        ctx.save();
        
        // Draw scanner outline if scanner is active
        if (scannerActive && scannerSystem) {
            const outlineColor = scannerSystem.getShipOutlineColor(this);
            if (outlineColor) {
                ctx.strokeStyle = outlineColor;
                ctx.lineWidth = 3;
                ctx.strokeRect(this.x - 3, this.y - 3, this.width + 6, this.height + 6);
            }
        }
        
        const centerX = this.x + this.width / 2;
        const centerY = this.y + this.height / 2;
        
        if (this.type === 'enemy') {
            // Enhanced enemy ship design - angular red ship with blue core
            ctx.fillStyle = '#cc0000';
            ctx.strokeStyle = '#ff3333';
            ctx.lineWidth = 2;
            
            // Main angular body
            ctx.beginPath();
            ctx.moveTo(centerX, this.y); // Top point
            ctx.lineTo(this.x + this.width - 2, this.y + 8); // Top right wing
            ctx.lineTo(this.x + this.width, centerY + 5); // Right side
            ctx.lineTo(this.x + this.width - 5, this.y + this.height); // Bottom right
            ctx.lineTo(this.x + 5, this.y + this.height); // Bottom left
            ctx.lineTo(this.x, centerY + 5); // Left side
            ctx.lineTo(this.x + 2, this.y + 8); // Top left wing
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
            
            // Blue energy core
            ctx.fillStyle = '#0066ff';
            ctx.shadowColor = '#0066ff';
            ctx.shadowBlur = 8;
            ctx.beginPath();
            ctx.ellipse(centerX, centerY, 4, 6, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;
            
            // Wing details
            ctx.fillStyle = '#990000';
            ctx.fillRect(this.x + 2, this.y + 6, 4, 3);
            ctx.fillRect(this.x + this.width - 6, this.y + 6, 4, 3);
            
            // Engine glow
            ctx.fillStyle = '#ff6600';
            ctx.fillRect(this.x + 8, this.y + this.height - 2, 2, 4);
            ctx.fillRect(this.x + this.width - 10, this.y + this.height - 2, 2, 4);
            
        } else { // spy
            // Spy alien - similar but with different colors
            ctx.fillStyle = '#cccc00';
            ctx.strokeStyle = '#ffff66';
            ctx.lineWidth = 2;
            
            // Similar angular design but yellow
            ctx.beginPath();
            ctx.moveTo(centerX, this.y);
            ctx.lineTo(this.x + this.width - 2, this.y + 8);
            ctx.lineTo(this.x + this.width, centerY + 5);
            ctx.lineTo(this.x + this.width - 5, this.y + this.height);
            ctx.lineTo(this.x + 5, this.y + this.height);
            ctx.lineTo(this.x, centerY + 5);
            ctx.lineTo(this.x + 2, this.y + 8);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
            
            // Green energy core (different from enemy)
            ctx.fillStyle = '#00ff00';
            ctx.shadowColor = '#00ff00';
            ctx.shadowBlur = 6;
            ctx.beginPath();
            ctx.ellipse(centerX, centerY, 3, 5, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;
        }
        
        // Add pulsing effect for visual interest
        const pulseAlpha = 0.3 + 0.2 * Math.sin(this.pulseTimer);
        ctx.fillStyle = `rgba(255, 255, 255, ${pulseAlpha})`;
        ctx.fillRect(centerX - 1, this.y + 3, 2, 4);
        
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
    
    // Mark ship for removal
    destroy() {
        this.active = false;
    }
    
    // Check if ship is still active
    isActive() {
        return this.active;
    }
    
    // Get point value for scoring
    getPointValue() {
        return this.type === 'enemy' ? GAME_CONFIG.ENEMY_KILL_POINTS : GAME_CONFIG.SPY_ALIEN_PENALTY;
    }
    
    // Check if this is a spy alien
    isSpy() {
        return this.type === 'spy';
    }
    
    // Check if this is an enemy
    isEnemy() {
        return this.type === 'enemy';
    }
}