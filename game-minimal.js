// Minimal SpyShoot Game Test
import { GAME_CONFIG, KEYS } from './src/utils/GameConstants.js';

console.log('🚀 Starting minimal SpyShoot test...');

class MinimalSpyShootGame {
    constructor() {
        console.log('Initializing minimal game...');
        
        this.canvas = document.getElementById('gameCanvas');
        if (!this.canvas) {
            throw new Error('Canvas element not found!');
        }
        
        this.ctx = this.canvas.getContext('2d');
        if (!this.ctx) {
            throw new Error('Canvas context not available!');
        }
        
        // Set canvas size
        this.canvas.width = GAME_CONFIG.CANVAS_WIDTH;
        this.canvas.height = GAME_CONFIG.CANVAS_HEIGHT;
        
        // Game state
        this.gameState = {
            gameStatus: 'start_screen',
            timePlayed: 0
        };
        
        // Start game loop
        this.gameLoop();
        
        console.log('✅ Minimal game initialized successfully!');
    }
    
    update(deltaTime) {
        this.gameState.timePlayed += deltaTime;
    }
    
    render() {
        // Clear canvas
        this.ctx.fillStyle = '#000011';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw animated starfield
        this.ctx.fillStyle = '#ffffff';
        for (let i = 0; i < 100; i++) {
            const x = (i * 37) % this.canvas.width;
            const y = (i * 73 + this.gameState.timePlayed * 0.02) % this.canvas.height;
            const size = (i % 3) + 1;
            this.ctx.fillRect(x, y, size, size);
        }
        
        // Draw title
        this.ctx.fillStyle = '#00ff00';
        this.ctx.font = 'bold 72px monospace';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('SPYSHOOT', this.canvas.width / 2, this.canvas.height / 2 - 80);
        
        // Draw pulsing start text
        const pulseAlpha = 0.5 + 0.5 * Math.sin(this.gameState.timePlayed * 0.003);
        this.ctx.fillStyle = `rgba(0, 255, 0, ${pulseAlpha})`;
        this.ctx.font = 'bold 32px monospace';
        this.ctx.fillText('MINIMAL TEST VERSION', this.canvas.width / 2, this.canvas.height / 2 + 20);
        
        // Draw status
        this.ctx.fillStyle = '#00aa00';
        this.ctx.font = '18px monospace';
        this.ctx.fillText('Game is working! Check console for details.', this.canvas.width / 2, this.canvas.height / 2 + 80);
        
        // Reset text alignment
        this.ctx.textAlign = 'left';
    }
    
    gameLoop(currentTime = 0) {
        const deltaTime = currentTime - (this.lastTime || 0);
        this.lastTime = currentTime;
        
        this.update(deltaTime);
        this.render();
        
        requestAnimationFrame((time) => this.gameLoop(time));
    }
}

// Initialize game when page loads
document.addEventListener('DOMContentLoaded', () => {
    try {
        const game = new MinimalSpyShootGame();
        window.minimalGame = game;
        console.log('✅ Minimal game started successfully!');
    } catch (error) {
        console.error('❌ Minimal game failed to start:', error);
    }
});