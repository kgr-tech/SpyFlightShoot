// ECS Rendering System - Handles entity rendering
import { System } from '../../core/EntityComponentSystem.js';
import { Transform, Sprite, PlayerController, EnemyAI, Player, Enemy, Bullet } from '../../components/CoreComponents.js';

export class ECSRenderingSystem extends System {
    constructor(ctx) {
        super();
        this.requiredComponents = [Transform, Sprite];
        this.priority = 100; // Lowest priority, render last
        this.ctx = ctx;
    }
    
    update(deltaTime) {
        // Sort entities by render order (y-position for depth)
        const sortedEntities = Array.from(this.entities).sort((a, b) => {
            const transformA = a.getComponent(Transform);
            const transformB = b.getComponent(Transform);
            return transformA.y - transformB.y;
        });
        
        // Render all entities
        for (const entity of sortedEntities) {
            this.renderEntity(entity);
        }
    }
    
    renderEntity(entity) {
        const transform = entity.getComponent(Transform);
        const sprite = entity.getComponent(Sprite);
        
        if (!sprite.visible) return;
        
        // Check if context methods exist (for testing compatibility)
        if (!this.ctx.save || !this.ctx.restore) {
            console.warn('Canvas context methods not available - skipping render');
            return;
        }
        
        this.ctx.save();
        
        // Apply transform
        if (this.ctx.translate) {
            this.ctx.translate(transform.x + sprite.width / 2, transform.y + sprite.height / 2);
            this.ctx.rotate(transform.rotation);
            this.ctx.translate(-sprite.width / 2, -sprite.height / 2);
        }
        
        // Render based on entity type
        if (entity.hasComponent(Player)) {
            this.renderPlayer(entity, sprite);
        } else if (entity.hasComponent(Enemy)) {
            this.renderEnemy(entity, sprite);
        } else if (entity.hasComponent(Bullet)) {
            this.renderBullet(entity, sprite);
        } else {
            // Default rendering
            if (this.ctx.fillRect) {
                this.ctx.fillStyle = sprite.color;
                this.ctx.fillRect(0, 0, sprite.width, sprite.height);
            }
        }
        
        this.ctx.restore();
    }
    
    renderPlayer(entity, sprite) {
        const controller = entity.getComponent(PlayerController);
        const centerX = sprite.width / 2;
        const centerY = sprite.height / 2;
        
        // Main ship colors
        this.ctx.fillStyle = '#00cc00';
        this.ctx.strokeStyle = '#ffffff';
        this.ctx.lineWidth = 2;
        
        // Draw main fuselage (body)
        this.ctx.fillStyle = '#00cc00';
        this.ctx.fillRect(centerX - 3, 8, 6, sprite.height - 16);
        
        // Draw cockpit/nose section
        this.ctx.fillStyle = '#00ff00';
        this.ctx.beginPath();
        this.ctx.moveTo(centerX, 0); // Nose point
        this.ctx.lineTo(centerX - 4, 12); // Left side
        this.ctx.lineTo(centerX + 4, 12); // Right side
        this.ctx.closePath();
        this.ctx.fill();
        this.ctx.stroke();
        
        // Draw main wings
        this.ctx.fillStyle = '#009900';
        // Left wing
        this.ctx.beginPath();
        this.ctx.moveTo(centerX - 4, centerY - 2);
        this.ctx.lineTo(-2, centerY + 4);
        this.ctx.lineTo(2, centerY + 8);
        this.ctx.lineTo(centerX - 4, centerY + 6);
        this.ctx.closePath();
        this.ctx.fill();
        this.ctx.stroke();
        
        // Right wing
        this.ctx.beginPath();
        this.ctx.moveTo(centerX + 4, centerY - 2);
        this.ctx.lineTo(sprite.width + 2, centerY + 4);
        this.ctx.lineTo(sprite.width - 2, centerY + 8);
        this.ctx.lineTo(centerX + 4, centerY + 6);
        this.ctx.closePath();
        this.ctx.fill();
        this.ctx.stroke();
        
        // Draw enhanced engine thrusters based on movement
        if (controller && controller.thrusterIntensity > 0.1) {
            const thrusterAlpha = controller.thrusterIntensity;
            const thrusterLength = 6 + (controller.thrusterIntensity * 12);
            
            // Main engine thrusters
            this.ctx.fillStyle = `rgba(255, 102, 0, ${thrusterAlpha})`;
            this.ctx.fillRect(centerX - 8, sprite.height - 2, 3, thrusterLength);
            this.ctx.fillRect(centerX + 5, sprite.height - 2, 3, thrusterLength);
        }
        
        // Draw muzzle flash when shooting
        if (controller && controller.showMuzzleFlash) {
            this.ctx.fillStyle = '#ffff00';
            this.ctx.shadowColor = '#ffff00';
            this.ctx.shadowBlur = 10;
            
            // Draw muzzle flash at nose
            this.ctx.beginPath();
            this.ctx.arc(centerX, -3, 8, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.shadowBlur = 0;
        }
    }
    
    renderEnemy(entity, sprite) {
        const ai = entity.getComponent(EnemyAI);
        const centerX = sprite.width / 2;
        const centerY = sprite.height / 2;
        
        if (ai && ai.type === 'enemy') {
            // Enhanced enemy ship design - angular red ship
            this.ctx.fillStyle = '#cc0000';
            this.ctx.strokeStyle = '#ff3333';
            this.ctx.lineWidth = 2;
            
            // Main angular body
            this.ctx.beginPath();
            this.ctx.moveTo(centerX, 0); // Top point
            this.ctx.lineTo(sprite.width - 2, 8); // Top right wing
            this.ctx.lineTo(sprite.width, centerY + 5); // Right side
            this.ctx.lineTo(sprite.width - 5, sprite.height); // Bottom right
            this.ctx.lineTo(5, sprite.height); // Bottom left
            this.ctx.lineTo(0, centerY + 5); // Left side
            this.ctx.lineTo(2, 8); // Top left wing
            this.ctx.closePath();
            this.ctx.fill();
            this.ctx.stroke();
            
            // Blue energy core
            this.ctx.fillStyle = '#0066ff';
            this.ctx.shadowColor = '#0066ff';
            this.ctx.shadowBlur = 8;
            this.ctx.beginPath();
            this.ctx.ellipse(centerX, centerY, 4, 6, 0, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.shadowBlur = 0;
        } else if (ai && ai.type === 'spy') {
            // Spy alien - yellow variant
            this.ctx.fillStyle = '#cccc00';
            this.ctx.strokeStyle = '#ffff66';
            this.ctx.lineWidth = 2;
            
            // Similar design but yellow
            this.ctx.beginPath();
            this.ctx.moveTo(centerX, 0);
            this.ctx.lineTo(sprite.width - 2, 8);
            this.ctx.lineTo(sprite.width, centerY + 5);
            this.ctx.lineTo(sprite.width - 5, sprite.height);
            this.ctx.lineTo(5, sprite.height);
            this.ctx.lineTo(0, centerY + 5);
            this.ctx.lineTo(2, 8);
            this.ctx.closePath();
            this.ctx.fill();
            this.ctx.stroke();
            
            // Green energy core
            this.ctx.fillStyle = '#00ff00';
            this.ctx.shadowColor = '#00ff00';
            this.ctx.shadowBlur = 6;
            this.ctx.beginPath();
            this.ctx.ellipse(centerX, centerY, 3, 5, 0, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.shadowBlur = 0;
        }
        
        // Add pulsing effect
        if (ai) {
            const pulseAlpha = 0.3 + 0.2 * Math.sin(ai.pulseTimer);
            this.ctx.fillStyle = `rgba(255, 255, 255, ${pulseAlpha})`;
            this.ctx.fillRect(centerX - 1, 3, 2, 4);
        }
    }
    
    renderBullet(entity, sprite) {
        // Draw bullet trail effect
        const gradient = this.ctx.createLinearGradient(0, 0, 0, sprite.height);
        gradient.addColorStop(0, '#ffffff');
        gradient.addColorStop(0.5, '#ffff00');
        gradient.addColorStop(1, 'rgba(255, 255, 0, 0.3)');
        
        // Draw bullet body with gradient
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, sprite.width, sprite.height);
        
        // Add bright core
        this.ctx.fillStyle = '#ffffff';
        this.ctx.fillRect(1, 1, sprite.width - 2, sprite.height - 2);
        
        // Add glow effect
        this.ctx.shadowColor = '#ffff00';
        this.ctx.shadowBlur = 6;
        this.ctx.fillStyle = '#ffff00';
        this.ctx.fillRect(1, 2, sprite.width - 2, 2);
        this.ctx.shadowBlur = 0;
    }
}