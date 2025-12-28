// Enhanced SpyShoot Game with ECS Integration
// This provides a better architecture while maintaining compatibility

import { ECSGameManager } from './ECSGameManager.js';
import { GameStateManager } from './GameStateManager.js';
import { GAME_CONFIG, KEYS } from '../utils/GameConstants.js';

export class EnhancedSpyShootGame {
    constructor(canvas, ctx, inputSystem, audioSystems) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.inputSystem = inputSystem;
        
        // Audio systems (passed from main game)
        this.audioSystem = audioSystems.audioSystem;
        this.soundEffectManager = audioSystems.soundEffectManager;
        this.enhancedSoundEffects = audioSystems.enhancedSoundEffects;
        this.advancedAudioManager = audioSystems.advancedAudioManager;
        
        // Core systems
        this.gameState = new GameStateManager();
        this.ecsManager = new ECSGameManager(canvas, ctx, inputSystem);
        
        // Game timing
        this.lastTime = 0;
        this.deltaTime = 0;
        
        // Performance tracking
        this.performanceStats = {
            fps: 60,
            frameTime: 16.67,
            updateTime: 0,
            renderTime: 0,
            entityCount: 0,
            systemCount: 0
        };
        
        console.log('🚀 Enhanced SpyShoot Game initialized with ECS');
    }
    
    init() {
        // Initialize player
        this.initPlayer();
        
        // Set up game state listeners
        this.setupGameStateListeners();
        
        console.log('✅ Enhanced SpyShoot Game ready');
    }
    
    initPlayer() {
        const startX = this.canvas.width / 2 - 15;
        const startY = this.canvas.height - 60;
        this.ecsManager.createPlayer(startX, startY);
    }
    
    setupGameStateListeners() {
        // Listen for game state changes
        this.gameState.addListener('gameStatus', (newStatus, oldStatus) => {
            console.log(`Game status changed: ${oldStatus} → ${newStatus}`);
            
            if (newStatus === 'playing' && oldStatus !== 'paused') {
                this.startNewGame();
            } else if (newStatus === 'game_over') {
                this.handleGameOver();
            }
        });
    }
    
    startNewGame() {
        // Clear all entities
        this.ecsManager.clearAll();
        
        // Recreate player
        this.initPlayer();
        
        console.log('🎮 New ECS game started');
    }
    
    handleGameOver() {
        // Handle game over logic
        console.log('💀 ECS game over');
    }
    
    update(deltaTime) {
        const updateStartTime = performance.now();
        
        // Update input system
        this.inputSystem.update();
        
        // Handle input
        this.handleInput();
        
        const gameStatus = this.gameState.get('gameStatus');
        
        if (gameStatus === 'start_screen') {
            // Only update time for animations on start screen
            this.gameState.set('timePlayed', this.gameState.get('timePlayed') + deltaTime);
            return;
        }
        
        if (gameStatus !== 'playing') return;
        
        // Update game time and difficulty
        const newTime = this.gameState.get('timePlayed') + deltaTime;
        this.gameState.set('timePlayed', newTime);
        
        // Update difficulty level
        const newDifficulty = Math.floor(newTime / 30000) + 1;
        if (newDifficulty !== this.gameState.get('difficultyLevel')) {
            this.gameState.set('difficultyLevel', newDifficulty);
        }
        
        // Update ECS world
        this.ecsManager.update(deltaTime);
        
        // Handle shooting
        this.updateShooting(deltaTime);
        
        // Spawn enemies and obstacles
        this.updateSpawning(deltaTime, newTime, newDifficulty);
        
        // Check game over conditions
        if (this.ecsManager.isPlayerEnergyEmpty()) {
            this.gameState.endGame();
        }
        
        // Update game state with current stats
        this.updateGameState();
        
        // Update performance stats
        this.performanceStats.updateTime = performance.now() - updateStartTime;
        this.performanceStats.entityCount = this.ecsManager.getEntityCount();
        this.performanceStats.systemCount = this.ecsManager.getSystemCount();
    }
    
    handleInput() {
        const gameStatus = this.gameState.get('gameStatus');
        
        if (gameStatus === 'start_screen') {
            // Check for start inputs
            const spacePressed = this.inputSystem.isKeyJustPressed('Space');
            const enterPressed = this.inputSystem.isKeyJustPressed('Enter');
            const numpadEnterPressed = this.inputSystem.isKeyJustPressed('NumpadEnter');
            const mouseClicked = this.inputSystem.isMouseClicked();
            
            // Start game if any input detected
            if (spacePressed || enterPressed || numpadEnterPressed || mouseClicked) {
                console.log('🎮 Starting Enhanced Game!');
                this.startGame();
            }
            return;
        }
        
        if (gameStatus !== 'playing') {
            // Handle restart in game over state
            if (this.inputSystem.isKeyJustPressed('KeyR') && gameStatus === 'game_over') {
                console.log('Restarting enhanced game');
                this.restartGame();
            }
            return;
        }
        
        // Handle pause during gameplay
        if (this.inputSystem.isKeyJustPressed('KeyP')) {
            this.gameState.pauseGame();
        }
        
        // Toggle debug panel with D key
        if (this.inputSystem.isKeyJustPressed('KeyD')) {
            this.gameState.toggleDebugPanel();
        }
    }
    
    updateShooting(deltaTime) {
        const currentTime = Date.now();
        const fireRate = 150; // milliseconds between shots
        
        // Check for shooting input
        const spacePressed = this.inputSystem.isKeyPressed(KEYS.SPACE);
        
        if (spacePressed && currentTime - (this.lastShotTime || 0) >= fireRate) {
            // Try to consume energy for shooting
            if (this.ecsManager.consumePlayerEnergy(GAME_CONFIG.ENERGY_PER_SHOT)) {
                const playerPos = this.ecsManager.getPlayerPosition();
                
                // Create bullet at player position
                this.ecsManager.createBullet(
                    playerPos.x + 15 - 2, // Center bullet on player
                    playerPos.y,
                    { x: 0, y: -1 } // Shoot upward
                );
                
                this.lastShotTime = currentTime;
                this.ecsManager.triggerPlayerMuzzleFlash();
                
                // Play enhanced laser sound effect
                if (this.enhancedSoundEffects) {
                    this.enhancedSoundEffects.playLaserSound({
                        pitchVariation: 0.1
                    });
                }
                
                console.log('ECS bullet fired!');
            } else {
                console.log('Not enough energy to shoot');
                
                // Play error sound when out of energy
                if (this.enhancedSoundEffects) {
                    this.enhancedSoundEffects.playUIError();
                }
            }
        }
    }
    
    updateSpawning(deltaTime, timePlayed, difficulty) {
        // Simple spawning logic - can be enhanced later
        const spawnRate = Math.max(2000 - (difficulty * 200), 500); // Faster spawning with difficulty
        
        if (!this.lastSpawnTime) this.lastSpawnTime = 0;
        
        if (timePlayed - this.lastSpawnTime > spawnRate) {
            // Spawn enemy
            const x = Math.random() * (this.canvas.width - 25);
            const type = Math.random() < 0.1 ? 'spy' : 'enemy'; // 10% chance for spy
            
            this.ecsManager.createEnemy(x, -30, type);
            this.lastSpawnTime = timePlayed;
            
            // Occasionally spawn rocks
            if (Math.random() < 0.3) {
                const rockX = Math.random() * (this.canvas.width - 30);
                this.ecsManager.createRock(rockX, -40, 'medium');
            }
        }
    }
    
    updateGameState() {
        this.gameState.updateGameStats({
            bullets: this.ecsManager.getBulletCount(),
            enemies: this.ecsManager.getEnemyCount(),
            rocks: this.ecsManager.getRockCount(),
            energy: this.ecsManager.getPlayerEnergy(),
            score: this.ecsManager.getPlayerScore(),
            scannerActive: false, // TODO: Implement scanner in ECS
            scannerStatus: 'READY'
        });
        
        // Update performance metrics
        this.gameState.updatePerformance(this.performanceStats.fps, this.deltaTime);
    }
    
    render() {
        const renderStartTime = performance.now();
        
        // Clear canvas
        this.ctx.fillStyle = '#000011';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw starfield background
        this.drawStarfield();
        
        // ECS handles entity rendering
        this.ecsManager.render();
        
        // Draw UI based on game state
        const gameStatus = this.gameState.get('gameStatus');
        
        if (gameStatus === 'start_screen') {
            this.drawStartScreen();
        } else if (gameStatus === 'paused') {
            this.drawPauseScreen();
        } else if (gameStatus === 'game_over') {
            this.drawGameOverScreen();
        }
        
        // Draw energy warnings
        if (this.ecsManager.isPlayerEnergyCritical()) {
            this.drawEnergyWarnings();
        }
        
        // Update performance stats
        this.performanceStats.renderTime = performance.now() - renderStartTime;
        this.performanceStats.frameTime = this.deltaTime;
        this.performanceStats.fps = Math.round(1000 / (this.deltaTime || 16));
    }
    
    drawStarfield() {
        // Simple animated starfield
        this.ctx.fillStyle = '#ffffff';
        
        for (let i = 0; i < 100; i++) {
            const x = (i * 37) % this.canvas.width;
            const y = (i * 73 + this.gameState.get('timePlayed') * 0.02) % this.canvas.height;
            const size = (i % 3) + 1;
            const alpha = 0.3 + (i % 5) * 0.1;
            
            this.ctx.globalAlpha = alpha;
            this.ctx.fillRect(x, y, size, size);
        }
        
        this.ctx.globalAlpha = 1.0;
    }
    
    drawStartScreen() {
        this.ctx.fillStyle = '#00ff00';
        this.ctx.font = 'bold 72px Orbitron, monospace';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('SPYSHOOT ECS', this.canvas.width / 2, this.canvas.height / 2 - 80);
        
        const pulseAlpha = 0.5 + 0.5 * Math.sin(this.gameState.get('timePlayed') * 0.003);
        this.ctx.fillStyle = `rgba(0, 255, 0, ${pulseAlpha})`;
        this.ctx.font = 'bold 32px Orbitron, monospace';
        this.ctx.fillText('CLICK OR PRESS SPACE TO START', this.canvas.width / 2, this.canvas.height / 2 + 20);
        
        this.ctx.fillStyle = '#006600';
        this.ctx.font = '16px Orbitron, monospace';
        this.ctx.fillText('Enhanced with Entity-Component-System', this.canvas.width / 2, this.canvas.height / 2 - 40);
        
        this.ctx.textAlign = 'left';
    }
    
    drawPauseScreen() {
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.ctx.fillStyle = '#00ff00';
        this.ctx.font = 'bold 48px Orbitron, monospace';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('PAUSED', this.canvas.width / 2, this.canvas.height / 2);
        
        this.ctx.font = '16px Orbitron, monospace';
        this.ctx.fillText('Press P to continue', this.canvas.width / 2, this.canvas.height / 2 + 40);
        
        this.ctx.textAlign = 'left';
    }
    
    drawGameOverScreen() {
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.9)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.ctx.fillStyle = '#ff0000';
        this.ctx.font = 'bold 48px Orbitron, monospace';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('Game Over', this.canvas.width / 2, this.canvas.height / 2 - 40);
        
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = '24px Orbitron, monospace';
        this.ctx.fillText(`Final Score: ${this.ecsManager.getPlayerScore()}`, this.canvas.width / 2, this.canvas.height / 2 + 10);
        
        this.ctx.fillStyle = '#00ff00';
        this.ctx.font = '20px Orbitron, monospace';
        this.ctx.fillText('Press R to Restart', this.canvas.width / 2, this.canvas.height / 2 + 60);
        
        this.ctx.textAlign = 'left';
    }
    
    drawEnergyWarnings() {
        const pulseAlpha = 0.3 + 0.2 * Math.sin(this.gameState.get('timePlayed') * 0.01);
        this.ctx.strokeStyle = `rgba(255, 0, 0, ${pulseAlpha})`;
        this.ctx.lineWidth = 8;
        this.ctx.strokeRect(4, 4, this.canvas.width - 8, this.canvas.height - 8);
        
        this.ctx.fillStyle = '#ff0000';
        this.ctx.font = 'bold 24px Orbitron, monospace';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('ENERGY CRITICAL!', this.canvas.width / 2, 50);
        this.ctx.textAlign = 'left';
    }
    
    // Game state methods
    startGame() {
        this.gameState.startGame();
    }
    
    restartGame() {
        this.gameState.restartGame();
        this.ecsManager.reset();
        this.initPlayer();
    }
    
    // Compatibility methods for existing systems
    getGameState() {
        return this.gameState;
    }
    
    getECSManager() {
        return this.ecsManager;
    }
    
    getPerformanceStats() {
        return { ...this.performanceStats };
    }
    
    // Debug methods
    getDebugInfo() {
        return {
            entities: this.ecsManager.getEntityCount(),
            systems: this.ecsManager.getSystemCount(),
            performance: this.performanceStats,
            gameState: this.gameState.getState()
        };
    }
}