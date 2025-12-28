// RenderingSystem - Centralized rendering management
// Handles all canvas drawing operations with proper layering

export class RenderingSystem {
    constructor(canvas, ctx) {
        this.canvas = canvas;
        this.ctx = ctx;
        
        // Rendering layers (drawn in order)
        this.layers = {
            BACKGROUND: 0,
            ENVIRONMENT: 1,
            ENTITIES: 2,
            EFFECTS: 3,
            UI: 4,
            DEBUG: 5
        };
        
        // Render queue for each layer
        this.renderQueue = new Map();
        this.initializeRenderQueue();
        
        // Performance tracking
        this.renderStats = {
            drawCalls: 0,
            lastFrameTime: 0,
            averageFrameTime: 16
        };
        
        console.log('🎨 RenderingSystem initialized');
    }
    
    /**
     * Initialize render queue for each layer
     */
    initializeRenderQueue() {
        Object.values(this.layers).forEach(layer => {
            this.renderQueue.set(layer, []);
        });
    }
    
    /**
     * Clear the canvas
     */
    clear() {
        this.ctx.fillStyle = '#000000';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }
    
    /**
     * Add a render command to the queue
     */
    addToQueue(layer, renderFunction, priority = 0) {
        if (!this.renderQueue.has(layer)) {
            console.warn(`Unknown render layer: ${layer}`);
            return;
        }
        
        this.renderQueue.get(layer).push({
            render: renderFunction,
            priority: priority
        });
    }
    
    /**
     * Execute all render commands
     */
    render() {
        const startTime = performance.now();
        this.renderStats.drawCalls = 0;
        
        // Clear canvas
        this.clear();
        
        // Render each layer in order
        Object.values(this.layers).sort((a, b) => a - b).forEach(layer => {
            this.renderLayer(layer);
        });
        
        // Clear render queue for next frame
        this.clearRenderQueue();
        
        // Update performance stats
        const endTime = performance.now();
        this.updateRenderStats(endTime - startTime);
    }
    
    /**
     * Render a specific layer
     */
    renderLayer(layer) {
        const commands = this.renderQueue.get(layer);
        if (!commands || commands.length === 0) return;
        
        // Sort by priority (higher priority renders last)
        commands.sort((a, b) => a.priority - b.priority);
        
        // Execute render commands
        commands.forEach(command => {
            try {
                command.render(this.ctx);
                this.renderStats.drawCalls++;
            } catch (error) {
                console.error('Render command failed:', error);
            }
        });
    }
    
    /**
     * Clear render queue for next frame
     */
    clearRenderQueue() {
        this.renderQueue.forEach(queue => queue.length = 0);
    }
    
    /**
     * Update rendering performance statistics
     */
    updateRenderStats(frameTime) {
        this.renderStats.lastFrameTime = frameTime;
        this.renderStats.averageFrameTime = 
            (this.renderStats.averageFrameTime * 0.9) + (frameTime * 0.1);
    }
    
    /**
     * Get rendering statistics
     */
    getStats() {
        return {
            drawCalls: this.renderStats.drawCalls,
            frameTime: this.renderStats.lastFrameTime,
            averageFrameTime: this.renderStats.averageFrameTime,
            fps: Math.round(1000 / this.renderStats.averageFrameTime)
        };
    }
    
    /**
     * Render background with starfield
     */
    renderBackground(locationSystem, gameTime) {
        this.addToQueue(this.layers.BACKGROUND, (ctx) => {
            locationSystem.renderEnvironmentBackground(ctx);
        });
    }
    
    /**
     * Render environment effects
     */
    renderEnvironment(locationSystem) {
        this.addToQueue(this.layers.ENVIRONMENT, (ctx) => {
            locationSystem.renderEnvironmentEffects(ctx);
        });
    }
    
    /**
     * Render game entities
     */
    renderEntities(entities) {
        entities.forEach((entity, index) => {
            this.addToQueue(this.layers.ENTITIES, (ctx) => {
                if (entity.render && typeof entity.render === 'function') {
                    entity.render(ctx);
                }
            }, index);
        });
    }
    
    /**
     * Render player ship
     */
    renderPlayer(player) {
        if (!player) return;
        
        this.addToQueue(this.layers.ENTITIES, (ctx) => {
            player.render(ctx);
        }, 1000); // High priority for player
    }
    
    /**
     * Render bullets
     */
    renderBullets(shootingSystem) {
        this.addToQueue(this.layers.ENTITIES, (ctx) => {
            shootingSystem.render(ctx);
        }, 500);
    }
    
    /**
     * Render enemies and rocks
     */
    renderSpawnedObjects(spawningSystem, scannerSystem) {
        this.addToQueue(this.layers.ENTITIES, (ctx) => {
            spawningSystem.render(ctx, scannerSystem.isScanning(), scannerSystem);
        }, 100);
    }
    
    /**
     * Render collision effects
     */
    renderEffects(collisionSystem) {
        this.addToQueue(this.layers.EFFECTS, (ctx) => {
            collisionSystem.renderCollisionEffects(ctx);
        });
    }
    
    /**
     * Render energy warnings
     */
    renderEnergyWarnings(energySystem, gameTime) {
        if (!energySystem.isCritical()) return;
        
        this.addToQueue(this.layers.UI, (ctx) => {
            // Red pulsing border effect
            const pulseAlpha = 0.3 + 0.2 * Math.sin(gameTime * 0.01);
            ctx.strokeStyle = `rgba(255, 0, 0, ${pulseAlpha})`;
            ctx.lineWidth = 8;
            ctx.strokeRect(4, 4, this.canvas.width - 8, this.canvas.height - 8);
            
            // Critical energy text
            ctx.fillStyle = '#ff0000';
            ctx.font = 'bold 24px Orbitron, monospace';
            ctx.textAlign = 'center';
            ctx.fillText('ENERGY CRITICAL!', this.canvas.width / 2, 50);
            ctx.textAlign = 'left';
        });
    }
    
    /**
     * Render pause screen
     */
    renderPauseScreen() {
        this.addToQueue(this.layers.UI, (ctx) => {
            // Semi-transparent overlay
            ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
            ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            
            // Pause text
            ctx.fillStyle = '#00ff00';
            ctx.font = 'bold 48px Orbitron, monospace';
            ctx.textAlign = 'center';
            ctx.fillText('PAUSED', this.canvas.width / 2, this.canvas.height / 2);
            
            ctx.font = '16px Orbitron, monospace';
            ctx.fillText('Press P to continue', this.canvas.width / 2, this.canvas.height / 2 + 40);
            
            ctx.textAlign = 'left';
        });
    }
    
    /**
     * Render start screen
     */
    renderStartScreen(gameTime) {
        this.addToQueue(this.layers.UI, (ctx) => {
            // Main title
            ctx.fillStyle = '#00ff00';
            ctx.font = 'bold 72px Orbitron, monospace';
            ctx.textAlign = 'center';
            ctx.fillText('SPYSHOOT', this.canvas.width / 2, this.canvas.height / 2 - 80);
            
            // Pulsing "CLICK TO START"
            const pulseAlpha = 0.5 + 0.5 * Math.sin(gameTime * 0.003);
            ctx.fillStyle = `rgba(0, 255, 0, ${pulseAlpha})`;
            ctx.font = 'bold 32px Orbitron, monospace';
            ctx.fillText('CLICK OR PRESS SPACE TO START', this.canvas.width / 2, this.canvas.height / 2 + 20);
            
            // Instructions (simplified - no control text)
            ctx.fillStyle = '#00aa00';
            ctx.font = '18px Orbitron, monospace';
            ctx.fillText('Arrow keys or WASD to move', this.canvas.width / 2, this.canvas.width / 2 + 100);
            
            // Subtitle
            ctx.fillStyle = '#006600';
            ctx.font = '16px Orbitron, monospace';
            ctx.fillText('Space Reconnaissance Mission', this.canvas.width / 2, this.canvas.height / 2 - 40);
            
            ctx.textAlign = 'left';
        });
    }
    
    /**
     * Render game over screen
     */
    renderGameOverScreen(score) {
        this.addToQueue(this.layers.UI, (ctx) => {
            // Semi-transparent overlay
            ctx.fillStyle = 'rgba(0, 0, 0, 0.9)';
            ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            
            // Game Over title
            ctx.fillStyle = '#ff0000';
            ctx.font = 'bold 48px Orbitron, monospace';
            ctx.textAlign = 'center';
            ctx.fillText('Game Over', this.canvas.width / 2, this.canvas.height / 2 - 40);
            
            // Final score
            ctx.fillStyle = '#ffffff';
            ctx.font = '24px Orbitron, monospace';
            ctx.fillText(`Final Score: ${score}`, this.canvas.width / 2, this.canvas.height / 2 + 10);
            
            // Restart instruction
            ctx.fillStyle = '#00ff00';
            ctx.font = '20px Orbitron, monospace';
            ctx.fillText('Press R to Restart', this.canvas.width / 2, this.canvas.height / 2 + 60);
            
            ctx.textAlign = 'left';
        });
    }
}