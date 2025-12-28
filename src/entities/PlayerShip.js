// PlayerShip entity class
import { GAME_CONFIG, KEYS } from '../utils/GameConstants.js';

export class PlayerShip {
    constructor(x, y, canvasWidth, canvasHeight) {
        this.x = x;
        this.y = y;
        this.width = 30;
        this.height = 40;
        this.maxSpeed = GAME_CONFIG.PLAYER_SPEED;
        this.energy = GAME_CONFIG.PLAYER_MAX_ENERGY;
        this.maxEnergy = GAME_CONFIG.PLAYER_MAX_ENERGY;
        
        // Canvas boundaries for movement constraints
        this.canvasWidth = canvasWidth;
        this.canvasHeight = canvasHeight;
        
        // Enhanced movement system
        this.velocity = { x: 0, y: 0 };
        this.acceleration = 0.8; // How fast ship accelerates
        this.deceleration = 0.85; // How fast ship slows down (friction)
        this.maxVelocity = this.maxSpeed;
        
        // Shooting effects
        this.muzzleFlashTime = 0;
        this.showMuzzleFlash = false;
        
        // Visual effects
        this.thrusterIntensity = 0;
    }
    
    update(deltaTime, inputSystem) {
        // Get input direction
        const inputVector = this.getInputVector(inputSystem);
        
        // Apply acceleration based on input
        if (inputVector.x !== 0 || inputVector.y !== 0) {
            // Normalize diagonal movement
            const magnitude = Math.sqrt(inputVector.x * inputVector.x + inputVector.y * inputVector.y);
            const normalizedX = inputVector.x / magnitude;
            const normalizedY = inputVector.y / magnitude;
            
            // Apply acceleration
            this.velocity.x += normalizedX * this.acceleration;
            this.velocity.y += normalizedY * this.acceleration;
            
            // Update thruster intensity for visual effects
            this.thrusterIntensity = Math.min(1.0, this.thrusterIntensity + 0.1);
        } else {
            // Apply deceleration when no input
            this.velocity.x *= this.deceleration;
            this.velocity.y *= this.deceleration;
            
            // Reduce thruster intensity
            this.thrusterIntensity = Math.max(0, this.thrusterIntensity - 0.05);
        }
        
        // Limit velocity to max speed
        const currentSpeed = Math.sqrt(this.velocity.x * this.velocity.x + this.velocity.y * this.velocity.y);
        if (currentSpeed > this.maxVelocity) {
            this.velocity.x = (this.velocity.x / currentSpeed) * this.maxVelocity;
            this.velocity.y = (this.velocity.y / currentSpeed) * this.maxVelocity;
        }
        
        // Apply movement with delta time for smooth frame-rate independent movement
        const deltaSeconds = deltaTime / 1000;
        this.x += this.velocity.x * deltaSeconds * 60; // 60 FPS baseline
        this.y += this.velocity.y * deltaSeconds * 60;
        
        // Enforce boundary constraints with bounce effect
        this.constrainToBounds();
        
        // Update muzzle flash
        if (this.showMuzzleFlash) {
            this.muzzleFlashTime -= deltaTime;
            if (this.muzzleFlashTime <= 0) {
                this.showMuzzleFlash = false;
            }
        }
    }
    
    getInputVector(inputSystem) {
        let x = 0;
        let y = 0;
        
        const leftPressed = inputSystem.isKeyPressed(KEYS.ARROW_LEFT) || inputSystem.isKeyPressed(KEYS.A);
        const rightPressed = inputSystem.isKeyPressed(KEYS.ARROW_RIGHT) || inputSystem.isKeyPressed(KEYS.D);
        const upPressed = inputSystem.isKeyPressed(KEYS.ARROW_UP) || inputSystem.isKeyPressed(KEYS.W);
        const downPressed = inputSystem.isKeyPressed(KEYS.ARROW_DOWN) || inputSystem.isKeyPressed(KEYS.S);
        
        if (leftPressed) {
            x -= 1;
        }
        if (rightPressed) {
            x += 1;
        }
        if (upPressed) {
            y -= 1;
        }
        if (downPressed) {
            y += 1;
        }
        
        // Debug logging
        if (x !== 0 || y !== 0) {
            console.log('PlayerShip input detected:', { x, y, leftPressed, rightPressed, upPressed, downPressed });
        }
        
        return { x, y };
    }
    
    constrainToBounds() {
        // Bounce off boundaries with velocity dampening
        if (this.x < 0) {
            this.x = 0;
            this.velocity.x = Math.abs(this.velocity.x) * 0.3; // Bounce with energy loss
        }
        if (this.x + this.width > this.canvasWidth) {
            this.x = this.canvasWidth - this.width;
            this.velocity.x = -Math.abs(this.velocity.x) * 0.3;
        }
        if (this.y < 0) {
            this.y = 0;
            this.velocity.y = Math.abs(this.velocity.y) * 0.3;
        }
        if (this.y + this.height > this.canvasHeight) {
            this.y = this.canvasHeight - this.height;
            this.velocity.y = -Math.abs(this.velocity.y) * 0.3;
        }
    }
    
    render(ctx) {
        // Draw player ship with realistic flight structure
        ctx.save();
        
        const centerX = this.x + this.width / 2;
        const centerY = this.y + this.height / 2;
        
        // Main ship colors
        ctx.fillStyle = GAME_CONFIG.COLORS.PLAYER;
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        
        // Draw main fuselage (body)
        ctx.fillStyle = '#00cc00';
        ctx.fillRect(centerX - 3, this.y + 8, 6, this.height - 16);
        
        // Draw cockpit/nose section
        ctx.fillStyle = '#00ff00';
        ctx.beginPath();
        ctx.moveTo(centerX, this.y); // Nose point
        ctx.lineTo(centerX - 4, this.y + 12); // Left side
        ctx.lineTo(centerX + 4, this.y + 12); // Right side
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        
        // Draw main wings
        ctx.fillStyle = '#009900';
        // Left wing
        ctx.beginPath();
        ctx.moveTo(centerX - 4, centerY - 2);
        ctx.lineTo(this.x - 2, centerY + 4);
        ctx.lineTo(this.x + 2, centerY + 8);
        ctx.lineTo(centerX - 4, centerY + 6);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        
        // Right wing
        ctx.beginPath();
        ctx.moveTo(centerX + 4, centerY - 2);
        ctx.lineTo(this.x + this.width + 2, centerY + 4);
        ctx.lineTo(this.x + this.width - 2, centerY + 8);
        ctx.lineTo(centerX + 4, centerY + 6);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        
        // Draw rear stabilizers
        ctx.fillStyle = '#007700';
        // Left stabilizer
        ctx.fillRect(centerX - 6, this.y + this.height - 8, 4, 6);
        // Right stabilizer
        ctx.fillRect(centerX + 2, this.y + this.height - 8, 4, 6);
        
        // Draw engine nacelles
        ctx.fillStyle = '#005500';
        ctx.fillRect(centerX - 8, this.y + this.height - 12, 3, 10);
        ctx.fillRect(centerX + 5, this.y + this.height - 12, 3, 10);
        
        // Draw enhanced engine thrusters based on movement
        if (this.thrusterIntensity > 0.1) {
            const thrusterAlpha = this.thrusterIntensity;
            const thrusterLength = 6 + (this.thrusterIntensity * 12);
            
            // Main engine thrusters (from nacelles)
            ctx.fillStyle = `rgba(255, 102, 0, ${thrusterAlpha})`;
            ctx.fillRect(centerX - 8, this.y + this.height - 2, 3, thrusterLength);
            ctx.fillRect(centerX + 5, this.y + this.height - 2, 3, thrusterLength);
            
            // Inner thruster core (hotter)
            ctx.fillStyle = `rgba(255, 255, 0, ${thrusterAlpha * 0.8})`;
            ctx.fillRect(centerX - 7, this.y + this.height - 1, 1, thrusterLength * 0.7);
            ctx.fillRect(centerX + 6, this.y + this.height - 1, 1, thrusterLength * 0.7);
            
            // Central main thruster
            ctx.fillStyle = `rgba(255, 150, 0, ${thrusterAlpha * 0.9})`;
            ctx.fillRect(centerX - 1, this.y + this.height - 1, 2, thrusterLength * 0.8);
            
            // Maneuvering thrusters for lateral movement
            if (Math.abs(this.velocity.x) > 1) {
                const sideIntensity = Math.min(1, Math.abs(this.velocity.x) / this.maxVelocity);
                ctx.fillStyle = `rgba(0, 150, 255, ${sideIntensity * 0.7})`;
                
                if (this.velocity.x > 0) {
                    // Moving right, show left maneuvering thruster
                    ctx.fillRect(this.x - 3, centerY, 5, 2);
                    ctx.fillRect(this.x - 2, centerY + 6, 4, 2);
                } else {
                    // Moving left, show right maneuvering thruster
                    ctx.fillRect(this.x + this.width - 2, centerY, 5, 2);
                    ctx.fillRect(this.x + this.width - 2, centerY + 6, 4, 2);
                }
            }
            
            // Forward thrusters when moving backward
            if (this.velocity.y > 2) {
                ctx.fillStyle = `rgba(100, 200, 255, ${thrusterAlpha * 0.6})`;
                ctx.fillRect(centerX - 2, this.y + 6, 1, 4);
                ctx.fillRect(centerX + 1, this.y + 6, 1, 4);
            }
        }
        
        // Draw cockpit details
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(centerX - 1, this.y + 4, 2, 3); // Cockpit window
        
        // Draw wing details/hardpoints
        ctx.fillStyle = '#666666';
        ctx.fillRect(this.x + 2, centerY + 2, 2, 2); // Left wing hardpoint
        ctx.fillRect(this.x + this.width - 4, centerY + 2, 2, 2); // Right wing hardpoint
        
        // Draw muzzle flash when shooting
        if (this.showMuzzleFlash) {
            ctx.fillStyle = '#ffff00';
            ctx.shadowColor = '#ffff00';
            ctx.shadowBlur = 10;
            
            // Draw muzzle flash at nose
            ctx.beginPath();
            ctx.arc(centerX, this.y - 3, 8, 0, Math.PI * 2);
            ctx.fill();
            
            // Draw flash lines
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(centerX - 10, this.y - 10);
            ctx.lineTo(centerX + 10, this.y + 6);
            ctx.moveTo(centerX + 10, this.y - 10);
            ctx.lineTo(centerX - 10, this.y + 6);
            ctx.stroke();
        }
        
        // Draw velocity indicator (subtle trail effect)
        if (this.velocity.x !== 0 || this.velocity.y !== 0) {
            ctx.strokeStyle = `rgba(0, 255, 0, 0.2)`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(centerX, centerY);
            ctx.lineTo(centerX - this.velocity.x * 1.5, centerY - this.velocity.y * 1.5);
            ctx.stroke();
        }
        
        // Draw ship outline for definition
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1;
        ctx.strokeRect(centerX - 3, this.y + 8, 6, this.height - 16); // Fuselage outline
        
        ctx.restore();
    }
    
    // Get the center position of the ship
    getCenterPosition() {
        return {
            x: this.x + this.width / 2,
            y: this.y + this.height / 2
        };
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
    
    // Consume energy (for shooting and scanning)
    consumeEnergy(amount) {
        if (this.energy >= amount) {
            this.energy -= amount;
            return true;
        }
        return false;
    }
    
    // Restore energy (when destroying enemies)
    restoreEnergy(amount) {
        this.energy = Math.min(this.maxEnergy, this.energy + amount);
    }
    
    // Check if player is out of energy
    isOutOfEnergy() {
        return this.energy <= 0;
    }
    
    // Trigger muzzle flash effect when shooting
    triggerMuzzleFlash() {
        this.showMuzzleFlash = true;
        this.muzzleFlashTime = 100; // Flash duration in milliseconds
    }
}