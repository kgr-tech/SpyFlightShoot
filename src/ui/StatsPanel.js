// StatsPanel - Right-side game statistics display
// Handles the professional-looking stats panel with cyan styling

export class StatsPanel {
    constructor(canvas) {
        this.canvas = canvas;
        this.isVisible = true;
        
        // Panel styling
        this.style = {
            width: 180,
            height: 280,
            x: canvas.width - 180 - 10,
            y: 60,
            backgroundColor: 'rgba(0, 0, 0, 0.9)',
            borderColor: '#00ccff',
            innerBorderColor: '#0088cc',
            textColor: '#ffffff',
            accentColor: '#00ff88',
            warningColor: '#ffaa00',
            mutedColor: '#888888'
        };
        
        // Font settings
        this.fonts = {
            main: 'bold 12px Orbitron, monospace',
            small: '10px Orbitron, monospace',
            tiny: '9px Orbitron, monospace'
        };
    }
    
    /**
     * Toggle panel visibility
     */
    toggle() {
        this.isVisible = !this.isVisible;
    }
    
    /**
     * Set panel visibility
     */
    setVisible(visible) {
        this.isVisible = visible;
    }
    
    /**
     * Render the stats panel
     */
    render(ctx, gameData) {
        if (!this.isVisible) return;
        
        this.drawPanelBackground(ctx);
        this.drawGameStats(ctx, gameData);
        this.drawEnvironmentInfo(ctx, gameData);
        this.drawPerformanceInfo(ctx, gameData);
    }
    
    /**
     * Draw the panel background and borders
     */
    drawPanelBackground(ctx) {
        const { x, y, width, height } = this.style;
        
        // Main background
        ctx.fillStyle = this.style.backgroundColor;
        ctx.fillRect(x, y, width, height);
        
        // Outer border with glow effect
        ctx.strokeStyle = this.style.borderColor;
        ctx.lineWidth = 2;
        ctx.strokeRect(x, y, width, height);
        
        // Inner border for depth
        ctx.strokeStyle = this.style.innerBorderColor;
        ctx.lineWidth = 1;
        ctx.strokeRect(x + 2, y + 2, width - 4, height - 4);
    }
    
    /**
     * Draw main game statistics
     */
    drawGameStats(ctx, gameData) {
        const { x, width } = this.style;
        const labelX = x + width - 15;
        let currentY = this.style.y + 25;
        const lineHeight = 18;
        
        // Set text styling
        ctx.fillStyle = this.style.textColor;
        ctx.font = this.fonts.main;
        ctx.textAlign = 'right';
        
        // Game statistics
        const stats = [
            { label: 'Bullets', value: gameData.bullets || 0 },
            { label: 'Energy', value: Math.floor(gameData.energy || 0) },
            { label: 'Scanner', value: gameData.scannerStatus || 'READY' },
            { label: 'Enemies', value: gameData.enemies || 0 },
            { label: 'Rocks', value: gameData.rocks || 0 },
            { label: 'Difficulty', value: gameData.difficulty || 1 },
            { label: 'Score', value: gameData.score || 0 }
        ];
        
        stats.forEach(stat => {
            ctx.fillText(`${stat.label}: ${stat.value}`, labelX, currentY);
            currentY += lineHeight;
        });
        
        return currentY + 5;
    }
    
    /**
     * Draw environment information
     */
    drawEnvironmentInfo(ctx, gameData) {
        const { x, width } = this.style;
        const labelX = x + width - 15;
        let currentY = this.style.y + 25 + (7 * 18) + 5; // After main stats
        const lineHeight = 18;
        
        if (!gameData.environment) return currentY;
        
        // Environment header
        ctx.fillStyle = this.style.accentColor;
        ctx.font = 'bold 11px Orbitron, monospace';
        ctx.fillText('Environment:', labelX, currentY);
        currentY += lineHeight - 2;
        
        // Environment name
        ctx.fillStyle = this.style.textColor;
        ctx.font = this.fonts.small;
        ctx.fillText(gameData.environment.name || 'Unknown', labelX, currentY);
        currentY += lineHeight - 2;
        
        // Progress bar
        this.drawProgressBar(ctx, gameData.environment.progress || 0, currentY);
        currentY += lineHeight;
        
        // Spawn modifiers
        if (gameData.spawnModifiers) {
            ctx.fillStyle = this.style.warningColor;
            ctx.font = this.fonts.small;
            ctx.fillText('Spawn Rates:', labelX, currentY);
            currentY += lineHeight - 3;
            
            ctx.fillStyle = this.style.textColor;
            ctx.font = this.fonts.tiny;
            
            const modifiers = [
                { label: 'Rocks', value: gameData.spawnModifiers.rocks },
                { label: 'Enemies', value: gameData.spawnModifiers.enemies },
                { label: 'Spies', value: gameData.spawnModifiers.spies }
            ];
            
            modifiers.forEach(mod => {
                ctx.fillText(`${mod.label}: ${mod.value.toFixed(1)}x`, labelX, currentY);
                currentY += lineHeight - 4;
            });
        }
        
        return currentY;
    }
    
    /**
     * Draw performance information
     */
    drawPerformanceInfo(ctx, gameData) {
        const { x, width } = this.style;
        const labelX = x + width - 15;
        let currentY = this.style.y + this.style.height - 30;
        const lineHeight = 14;
        
        ctx.fillStyle = this.style.mutedColor;
        ctx.font = this.fonts.tiny;
        
        // Performance metrics
        ctx.fillText(`FPS: ${gameData.fps || 60}`, labelX, currentY);
        currentY += lineHeight;
        
        const timeSeconds = Math.floor((gameData.timePlayed || 0) / 1000);
        ctx.fillText(`Time: ${timeSeconds}s`, labelX, currentY);
    }
    
    /**
     * Draw environment progress bar
     */
    drawProgressBar(ctx, progress, y) {
        const { x } = this.style;
        const barWidth = 120;
        const barHeight = 8;
        const barX = x + 15;
        const barY = y - 6;
        
        // Background
        ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.fillRect(barX, barY, barWidth, barHeight);
        
        // Progress fill
        ctx.fillStyle = this.style.borderColor;
        ctx.fillRect(barX, barY, barWidth * Math.max(0, Math.min(1, progress)), barHeight);
        
        // Border
        ctx.strokeStyle = this.style.borderColor;
        ctx.lineWidth = 1;
        ctx.strokeRect(barX, barY, barWidth, barHeight);
    }
    
    /**
     * Reset text alignment after rendering
     */
    resetTextAlign(ctx) {
        ctx.textAlign = 'left';
    }
}