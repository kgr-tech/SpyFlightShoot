// SpyShoot - Space Reconnaissance Game
// Core game implementation with modular architecture

import { PlayerShip } from './src/entities/PlayerShip.js';
import { InputSystem } from './src/systems/InputSystem.js';
import { ShootingSystem } from './src/systems/ShootingSystem.js';
import { EnergySystem } from './src/systems/EnergySystem.js';
import { ScannerSystem } from './src/systems/ScannerSystem.js';
import { SpawningSystem } from './src/systems/SpawningSystem.js';
import { CollisionSystem } from './src/systems/CollisionSystem.js';
import { ScoreSystem } from './src/systems/ScoreSystem.js';
import { AudioSystem } from './src/systems/AudioSystem.js';
import { SoundEffectManager } from './src/systems/SoundEffectManager.js';
import { MusicManager } from './src/systems/MusicManager.js';
import { AudioSettingsManager } from './src/systems/AudioSettingsManager.js';
import { EnhancedSoundEffects } from './src/systems/EnhancedSoundEffects.js';
import { LocationSystem } from './src/systems/LocationSystem.js';
import { EnvironmentRenderer } from './src/systems/EnvironmentRenderer.js';
import { EnvironmentalAudioManager } from './src/systems/EnvironmentalAudioManager.js';
import { DynamicMusicManager } from './src/systems/DynamicMusicManager.js';
import { AdvancedAudioManager } from './src/systems/AdvancedAudioManager.js';

// New modular UI and core systems
import { GameStateManager } from './src/core/GameStateManager.js';
import { RenderingSystem } from './src/systems/rendering/RenderingSystem.js';
import { HUD } from './src/ui/HUD.js';
import { StatsPanel } from './src/ui/StatsPanel.js';

// Enhanced ECS system (optional)
import { EnhancedSpyShootGame } from './src/core/EnhancedSpyShootGame.js';

import { GAME_CONFIG, KEYS } from './src/utils/GameConstants.js';
import { AUDIO_ASSETS, getSoundEffectAssets, getAmbientAssets } from './src/utils/AudioAssets.js';

class SpyShootGame {
    constructor() {
        try {
            console.log('🚀 Initializing SpyShoot game...');
            
            this.canvas = document.getElementById('gameCanvas');
            if (!this.canvas) {
                throw new Error('Canvas element not found!');
            }
            
            this.ctx = this.canvas.getContext('2d');
            if (!this.ctx) {
                throw new Error('Canvas context not available!');
            }
            
            // Configuration - Enable ECS for better performance
            this.useECS = window.FORCE_ECS_MODE || true; // Set to false to use original system
            
            // Core systems
            this.gameState = new GameStateManager();
            this.renderingSystem = new RenderingSystem(this.canvas, this.ctx);
            
            // UI systems
            this.hud = new HUD();
            this.statsPanel = new StatsPanel(this.canvas);
            
            // Game systems
            this.inputSystem = new InputSystem();
            this.shootingSystem = new ShootingSystem();
            this.energySystem = new EnergySystem();
            this.scannerSystem = new ScannerSystem();
            this.spawningSystem = new SpawningSystem(GAME_CONFIG.CANVAS_WIDTH, GAME_CONFIG.CANVAS_HEIGHT);
            this.collisionSystem = new CollisionSystem();
            this.scoreSystem = new ScoreSystem();
            
            // Audio systems
            this.audioSystem = new AudioSystem();
            this.soundEffectManager = new SoundEffectManager(this.audioSystem);
            this.musicManager = new MusicManager(this.audioSystem);
            this.audioSettingsManager = new AudioSettingsManager(this.audioSystem);
            this.enhancedSoundEffects = new EnhancedSoundEffects(this.soundEffectManager);
            this.dynamicMusicManager = new DynamicMusicManager(this.musicManager, this.audioSystem);
            this.advancedAudioManager = new AdvancedAudioManager(this.audioSystem, this.soundEffectManager, this.enhancedSoundEffects);
            
            // Location system
            this.locationSystem = new LocationSystem(
                this.canvas, 
                this.audioSystem, 
                this.spawningSystem, 
                this.musicManager,
                this.dynamicMusicManager
            );
            
            // Game entities
            this.player = null;
            
            // Enhanced ECS Game (optional)
            if (this.useECS) {
                // Prepare audio systems for ECS
                const audioSystems = {
                    audioSystem: this.audioSystem,
                    soundEffectManager: this.soundEffectManager,
                    enhancedSoundEffects: this.enhancedSoundEffects,
                    advancedAudioManager: this.advancedAudioManager
                };
                
                this.enhancedGame = new EnhancedSpyShootGame(
                    this.canvas, 
                    this.ctx, 
                    this.inputSystem, 
                    audioSystems
                );
                
                console.log('✅ ECS system enabled');
            }
            
            // Game timing
            this.lastTime = 0;
            this.deltaTime = 0;
            
            // Initialize game
            this.init();
            
            console.log('✅ SpyShoot game constructor completed');
        } catch (error) {
            console.error('❌ Error in SpyShoot constructor:', error);
            alert('Game initialization failed: ' + error.message);
        }
    }
    
    init() {
        // Set up canvas
        this.setupCanvas();
        
        // Initialize player (original system)
        if (!this.useECS) {
            this.initPlayer();
        }
        
        // Initialize audio system
        this.initAudioSystem();
        
        // Initialize audio settings UI
        this.audioSettingsManager.initializeUI();
        
        // Set up HUD event listeners
        this.hud.setupEventListeners({
            onAudioSettings: () => {
                this.audioSettingsManager.toggleSettingsPanel();
            }
        });
        
        // Add UI sounds to interactive elements
        setTimeout(() => {
            this.enhancedSoundEffects.addUISounds();
        }, 100);
        
        // Add direct event listeners for testing
        this.setupDirectEventListeners();
        
        // Initialize ECS game if enabled
        if (this.useECS && this.enhancedGame) {
            this.enhancedGame.init();
        }
        
        // Update HUD
        this.updateHUD();
        
        // Start game loop
        this.gameLoop();
        
        console.log(`SpyShoot game initialized successfully! ${this.useECS ? '(ECS Mode)' : '(Original Mode)'}`);
    }
    
    setupDirectEventListeners() {
        // Add direct event listeners as backup
        document.addEventListener('keydown', async (e) => {
            console.log('Direct keydown:', e.code, e.key);
            
            // Initialize audio on any user interaction
            if (!this.audioSystem.isInitialized) {
                console.log('🎵 Initializing audio on user interaction...');
                await this.audioSystem.initialize();
                if (this.audioSystem.isInitialized) {
                    await this.audioSystem.preloadAssets();
                    console.log('✅ Audio system ready!');
                }
            }
            
            if (this.gameState.gameStatus === 'start_screen') {
                if (e.code === 'Space' || e.code === 'Enter' || e.code === 'NumpadEnter') {
                    console.log('🚀 Direct key start!');
                    this.startGame();
                    e.preventDefault();
                }
            }
        });
        
        document.addEventListener('click', async (e) => {
            console.log('Direct click detected');
            
            // Initialize audio on any user interaction
            if (!this.audioSystem.isInitialized) {
                console.log('🎵 Initializing audio on user interaction...');
                await this.audioSystem.initialize();
                if (this.audioSystem.isInitialized) {
                    await this.audioSystem.preloadAssets();
                    console.log('✅ Audio system ready!');
                }
            }
            
            if (this.gameState.gameStatus === 'start_screen') {
                console.log('🚀 Direct click start!');
                this.startGame();
                e.preventDefault();
            }
        });
        
        // Canvas specific click
        this.canvas.addEventListener('click', async (e) => {
            console.log('Canvas click detected');
            
            // Initialize audio on any user interaction
            if (!this.audioSystem.isInitialized) {
                console.log('🎵 Initializing audio on user interaction...');
                await this.audioSystem.initialize();
                if (this.audioSystem.isInitialized) {
                    await this.audioSystem.preloadAssets();
                    console.log('✅ Audio system ready!');
                }
            }
            
            if (this.gameState.gameStatus === 'start_screen') {
                console.log('🚀 Canvas click start!');
                this.startGame();
                e.preventDefault();
            }
        });
        
        // Audio settings button
        const audioSettingsButton = document.getElementById('audioSettingsButton');
        if (audioSettingsButton) {
            audioSettingsButton.addEventListener('click', async (e) => {
                // Initialize audio on any user interaction
                if (!this.audioSystem.isInitialized) {
                    console.log('🎵 Initializing audio on user interaction...');
                    await this.audioSystem.initialize();
                    if (this.audioSystem.isInitialized) {
                        await this.audioSystem.preloadAssets();
                        console.log('✅ Audio system ready!');
                    }
                }
                
                this.audioSettingsManager.toggleSettingsPanel();
                e.stopPropagation();
            });
        }
    }
    
    setupCanvas() {
        // Ensure canvas is properly sized
        this.canvas.width = GAME_CONFIG.CANVAS_WIDTH;
        this.canvas.height = GAME_CONFIG.CANVAS_HEIGHT;
        
        // Set up canvas context properties
        this.ctx.imageSmoothingEnabled = false; // Pixel-perfect rendering
    }
    
    initPlayer() {
        // Initialize player ship at bottom center
        const startX = this.canvas.width / 2 - 15;
        const startY = this.canvas.height - 60;
        this.player = new PlayerShip(startX, startY, this.canvas.width, this.canvas.height);
    }
    
    async initAudioSystem() {
        try {
            console.log('🎵 Initializing audio system...');
            
            // Register all sound effect assets
            getSoundEffectAssets().forEach(asset => {
                this.soundEffectManager.registerSoundEffect(asset.id, asset);
            });
            
            // Register music and ambient assets with main audio system
            Object.values(AUDIO_ASSETS).forEach(asset => {
                if (asset.type === 'music' || asset.type === 'ambient') {
                    this.audioSystem.registerAsset(asset.id, asset);
                }
            });
            
            // Register ambient assets for environmental audio
            getAmbientAssets().forEach(asset => {
                this.audioSystem.registerAsset(asset.id, asset);
            });
            
            console.log('✅ Audio assets registered');
            
            // Note: Audio system will be initialized on first user interaction
            // due to browser autoplay policies
            
        } catch (error) {
            console.error('❌ Audio system initialization failed:', error);
        }
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
                console.log('🎮 STARTING GAME!');
                this.startGame();
            }
            return;
        }
        
        if (gameStatus !== 'playing') {
            // Handle restart in game over state
            if (this.inputSystem.isKeyJustPressed('KeyR') && gameStatus === 'game_over') {
                console.log('Restarting game');
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
    
    /**
     * Update game state with current system data
     */
    updateGameState() {
        this.gameState.updateGameStats({
            bullets: this.shootingSystem.getBulletCount(),
            enemies: this.spawningSystem.getEnemyCount(),
            rocks: this.spawningSystem.getRockCount(),
            energy: this.energySystem.getCurrentEnergy(),
            score: this.scoreSystem.getCurrentScore(),
            scannerActive: this.scannerSystem.isScanning(),
            scannerStatus: this.scannerSystem.getStatus()
        });
        
        // Update environment info
        const currentEnv = this.locationSystem.getCurrentEnvironment();
        if (currentEnv) {
            const envStats = this.locationSystem.environmentManager.getStats();
            this.gameState.updateEnvironment({
                name: currentEnv.name,
                progress: envStats.progress
            });
        }
        
        // Update performance metrics
        const renderStats = this.renderingSystem.getStats();
        this.gameState.updatePerformance(renderStats.fps, this.deltaTime);
    }
    
    update(deltaTime) {
        // Use ECS system if enabled
        if (this.useECS && this.enhancedGame) {
            this.enhancedGame.update(deltaTime);
            
            // Update HUD with ECS data
            this.updateHUDFromECS();
            return;
        }
        
        // Original update logic
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
        
        // Update location system (dynamic environments)
        this.locationSystem.update(deltaTime, newTime);
        
        // Update energy system
        this.energySystem.update(deltaTime, this.scannerSystem.isScanning(), this.soundEffectManager, this.enhancedSoundEffects, this.advancedAudioManager);
        
        // Update scanner system
        this.scannerSystem.update(deltaTime, this.inputSystem, this.energySystem, this.soundEffectManager, this.enhancedSoundEffects);
        
        // Update player
        this.player.update(deltaTime, this.inputSystem);
        
        // Update spawning system
        this.spawningSystem.update(deltaTime, { 
            timePlayed: newTime, 
            difficultyLevel: this.gameState.get('difficultyLevel'),
            gameStatus: gameStatus
        });
        
        // Update shooting system
        this.updateShooting(deltaTime);
        
        // Update collision system
        this.collisionSystem.update(this.shootingSystem, this.spawningSystem, this.player, this.energySystem, this.scoreSystem, this.soundEffectManager, this.enhancedSoundEffects);
        
        // Update dynamic music system
        this.dynamicMusicManager.update(deltaTime, {
            enemyCount: this.spawningSystem.getEnemyCount(),
            energyPercentage: this.energySystem.getEnergyPercentage(),
            recentShots: this.shootingSystem.getRecentShotCount ? this.shootingSystem.getRecentShotCount() : 0,
            scannerActive: this.scannerSystem.isScanning()
        });
        
        // Update advanced audio system
        this.advancedAudioManager.update(deltaTime, {
            player: this.player,
            enemies: this.spawningSystem.getActiveEnemies(),
            energyPercentage: this.energySystem.getEnergyPercentage(),
            scannerActive: this.scannerSystem.isScanning()
        });
        
        // Check game over conditions
        if (this.energySystem.isEmpty()) {
            this.gameState.endGame();
            this.dynamicMusicManager.handleGameEvent('game_over');
        }
        
        // Update game state with current stats
        this.updateGameState();
        
        // Update HUD
        this.updateHUD();
    }
    
    updateShooting(deltaTime) {
        const currentTime = Date.now();
        
        // Debug shooting input
        const spacePressed = this.inputSystem.isKeyPressed(KEYS.SPACE);
        if (spacePressed) {
            console.log('Space key detected for shooting');
        }
        
        // Handle shooting input with energy validation
        if (spacePressed && 
            currentTime - this.shootingSystem.lastShotTime >= this.shootingSystem.fireRate) {
            
            console.log('Attempting to shoot - Energy:', this.energySystem.getCurrentEnergy());
            
            // Try to consume energy for shooting
            if (this.energySystem.consumeEnergy(GAME_CONFIG.ENERGY_PER_SHOT)) {
                this.shootingSystem.createBullet(this.player);
                this.shootingSystem.lastShotTime = currentTime;
                this.player.triggerMuzzleFlash();
                
                // Play enhanced laser sound effect with variation
                console.log('🔊 Playing laser sound...');
                this.enhancedSoundEffects.playLaserSound({
                    pitchVariation: 0.1
                });
                
                console.log('Shot fired!');
            } else {
                console.log('Not enough energy to shoot');
                
                // Play error sound when out of energy
                this.enhancedSoundEffects.playUIError();
            }
        }
        
        // Update bullets
        this.shootingSystem.updateBullets(deltaTime, this.canvas.height);
        this.shootingSystem.cleanupBullets();
    }
    
    render() {
        // Use ECS rendering if enabled
        if (this.useECS && this.enhancedGame) {
            this.enhancedGame.render();
            
            // Render stats panel if enabled
            if (this.gameState.get('showDebugPanel')) {
                this.renderECSStatsPanel();
            }
            return;
        }
        
        // Original rendering logic
        // Use the new rendering system
        const gameTime = this.gameState.get('timePlayed');
        const gameStatus = this.gameState.get('gameStatus');
        
        // Queue background rendering
        this.renderingSystem.renderBackground(this.locationSystem, gameTime);
        this.renderingSystem.renderEnvironment(this.locationSystem);
        
        // Queue entity rendering (only during gameplay)
        if (gameStatus === 'playing' || gameStatus === 'paused') {
            this.renderingSystem.renderPlayer(this.player);
            this.renderingSystem.renderBullets(this.shootingSystem);
            this.renderingSystem.renderSpawnedObjects(this.spawningSystem, this.scannerSystem);
            this.renderingSystem.renderEffects(this.collisionSystem);
            this.renderingSystem.renderEnergyWarnings(this.energySystem, gameTime);
        }
        
        // Queue UI rendering based on game state
        if (gameStatus === 'start_screen') {
            this.renderingSystem.renderStartScreen(gameTime);
        } else if (gameStatus === 'paused') {
            this.renderingSystem.renderPauseScreen();
        } else if (gameStatus === 'game_over') {
            this.renderingSystem.renderGameOverScreen(this.gameState.get('score'));
        }
        
        // Render stats panel if enabled
        if (this.gameState.get('showDebugPanel') && gameStatus !== 'start_screen') {
            this.renderingSystem.addToQueue(this.renderingSystem.layers.DEBUG, (ctx) => {
                const uiData = this.gameState.getUIData();
                // Add spawn modifiers data
                const spawnInfo = this.spawningSystem.getDifficultyInfo();
                uiData.spawnModifiers = spawnInfo.environmentModifiers;
                
                this.statsPanel.render(ctx, uiData);
            });
        }
        
        // Execute all rendering
        this.renderingSystem.render();
    }
    
    drawStarfield() {
        // Enhanced animated starfield with nebula effects
        this.ctx.fillStyle = '#ffffff';
        
        // Draw background nebula effect
        const gradient = this.ctx.createRadialGradient(
            this.canvas.width * 0.3, this.canvas.height * 0.4, 0,
            this.canvas.width * 0.3, this.canvas.height * 0.4, this.canvas.width * 0.6
        );
        gradient.addColorStop(0, 'rgba(0, 50, 100, 0.3)');
        gradient.addColorStop(0.5, 'rgba(0, 20, 60, 0.2)');
        gradient.addColorStop(1, 'rgba(0, 0, 20, 0.1)');
        
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw stars with different sizes and brightness
        for (let i = 0; i < 200; i++) {
            const x = (i * 37) % this.canvas.width;
            const y = (i * 73 + this.gameState.timePlayed * 0.02) % this.canvas.height;
            const size = (i % 4) + 1;
            const alpha = 0.2 + (i % 8) * 0.1;
            const brightness = 0.5 + (i % 5) * 0.1;
            
            this.ctx.globalAlpha = alpha;
            this.ctx.fillStyle = `rgba(${255 * brightness}, ${255 * brightness}, 255, ${alpha})`;
            
            if (size > 2) {
                // Larger stars get a glow effect
                this.ctx.shadowColor = '#ffffff';
                this.ctx.shadowBlur = size * 2;
            }
            
            this.ctx.fillRect(x, y, size, size);
            this.ctx.shadowBlur = 0;
        }
        
        // Add some distant galaxies/nebulae
        for (let i = 0; i < 5; i++) {
            const x = (i * 150) % this.canvas.width;
            const y = (i * 200 + this.gameState.timePlayed * 0.01) % this.canvas.height;
            const size = 20 + (i * 10);
            
            const nebulaGradient = this.ctx.createRadialGradient(x, y, 0, x, y, size);
            nebulaGradient.addColorStop(0, `rgba(${100 + i * 30}, ${50 + i * 20}, 150, 0.1)`);
            nebulaGradient.addColorStop(1, 'rgba(0, 0, 50, 0)');
            
            this.ctx.fillStyle = nebulaGradient;
            this.ctx.fillRect(x - size, y - size, size * 2, size * 2);
        }
        
        this.ctx.globalAlpha = 1.0;
    }
    
    drawEnergyWarnings() {
        // Draw energy warning effects when energy is critical
        if (this.energySystem.isCritical()) {
            // Red pulsing border effect
            const pulseAlpha = 0.3 + 0.2 * Math.sin(this.gameState.timePlayed * 0.01);
            this.ctx.strokeStyle = `rgba(255, 0, 0, ${pulseAlpha})`;
            this.ctx.lineWidth = 8;
            this.ctx.strokeRect(4, 4, this.canvas.width - 8, this.canvas.height - 8);
            
            // Critical energy text
            this.ctx.fillStyle = '#ff0000';
            this.ctx.font = 'bold 24px Orbitron, monospace';
            this.ctx.textAlign = 'center';
            this.ctx.fillText('ENERGY CRITICAL!', this.canvas.width / 2, 50);
            this.ctx.textAlign = 'left';
        }
    }
    
    drawDebugInfo() {
        // Enhanced right-side stats panel like in the image
        const panelWidth = 180;
        const panelHeight = 280;
        const panelX = this.canvas.width - panelWidth - 10;
        const panelY = 60;
        
        // Draw panel background with rounded corners effect
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.9)';
        this.ctx.fillRect(panelX, panelY, panelWidth, panelHeight);
        
        // Draw bright cyan/blue border like in the image
        this.ctx.strokeStyle = '#00ccff';
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(panelX, panelY, panelWidth, panelHeight);
        
        // Add inner glow effect
        this.ctx.strokeStyle = '#0088cc';
        this.ctx.lineWidth = 1;
        this.ctx.strokeRect(panelX + 2, panelY + 2, panelWidth - 4, panelHeight - 4);
        
        // Stats text styling
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = 'bold 12px Orbitron, monospace';
        this.ctx.textAlign = 'right';
        
        const labelX = panelX + panelWidth - 15;
        let currentY = panelY + 25;
        const lineHeight = 18;
        
        // Game statistics
        this.ctx.fillText(`Bullets: ${this.shootingSystem.getBulletCount()}`, labelX, currentY);
        currentY += lineHeight;
        
        this.ctx.fillText(`Energy: ${Math.floor(this.energySystem.getCurrentEnergy())}`, labelX, currentY);
        currentY += lineHeight;
        
        this.ctx.fillText(`Scanner: ${this.scannerSystem.getStatus()}`, labelX, currentY);
        currentY += lineHeight;
        
        this.ctx.fillText(`Enemies: ${this.spawningSystem.getEnemyCount()}`, labelX, currentY);
        currentY += lineHeight;
        
        this.ctx.fillText(`Rocks: ${this.spawningSystem.getRockCount()}`, labelX, currentY);
        currentY += lineHeight;
        
        this.ctx.fillText(`Difficulty: ${this.gameState.difficultyLevel}`, labelX, currentY);
        currentY += lineHeight;
        
        this.ctx.fillText(`Score: ${this.scoreSystem.getCurrentScore()}`, labelX, currentY);
        currentY += lineHeight + 5;
        
        // Environment section with different color
        const currentEnv = this.locationSystem.getCurrentEnvironment();
        if (currentEnv) {
            this.ctx.fillStyle = '#00ff88';
            this.ctx.font = 'bold 11px Orbitron, monospace';
            this.ctx.fillText(`Environment:`, labelX, currentY);
            currentY += lineHeight - 2;
            
            this.ctx.fillStyle = '#ffffff';
            this.ctx.font = '10px Orbitron, monospace';
            this.ctx.fillText(`${currentEnv.name}`, labelX, currentY);
            currentY += lineHeight - 2;
            
            // Environment progress bar
            const envStats = this.locationSystem.environmentManager.getStats();
            const progress = envStats.progress;
            const barWidth = 120;
            const barHeight = 8;
            const barX = panelX + 15;
            
            // Progress bar background
            this.ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
            this.ctx.fillRect(barX, currentY - 6, barWidth, barHeight);
            
            // Progress bar fill
            this.ctx.fillStyle = '#00ccff';
            this.ctx.fillRect(barX, currentY - 6, barWidth * progress, barHeight);
            
            // Progress bar border
            this.ctx.strokeStyle = '#00ccff';
            this.ctx.lineWidth = 1;
            this.ctx.strokeRect(barX, currentY - 6, barWidth, barHeight);
            
            currentY += lineHeight;
            
            // Spawn modifiers
            const spawnInfo = this.spawningSystem.getDifficultyInfo();
            this.ctx.fillStyle = '#ffaa00';
            this.ctx.font = 'bold 10px Orbitron, monospace';
            this.ctx.fillText(`Spawn Rates:`, labelX, currentY);
            currentY += lineHeight - 3;
            
            this.ctx.fillStyle = '#ffffff';
            this.ctx.font = '9px Orbitron, monospace';
            this.ctx.fillText(`Rocks: ${spawnInfo.environmentModifiers.rocks.toFixed(1)}x`, labelX, currentY);
            currentY += lineHeight - 4;
            this.ctx.fillText(`Enemies: ${spawnInfo.environmentModifiers.enemies.toFixed(1)}x`, labelX, currentY);
            currentY += lineHeight - 4;
            this.ctx.fillText(`Spies: ${spawnInfo.environmentModifiers.spies.toFixed(1)}x`, labelX, currentY);
            currentY += lineHeight;
        }
        
        // Performance info at bottom
        this.ctx.fillStyle = '#888888';
        this.ctx.font = '9px Orbitron, monospace';
        const fps = Math.round(1000 / (this.deltaTime || 16));
        this.ctx.fillText(`FPS: ${fps}`, labelX, currentY);
        currentY += lineHeight - 4;
        
        const timeSeconds = Math.floor(this.gameState.timePlayed / 1000);
        this.ctx.fillText(`Time: ${timeSeconds}s`, labelX, currentY);
        
        // Reset text alignment
        this.ctx.textAlign = 'left';
    }
    
    drawPauseScreen() {
        // Semi-transparent overlay
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Pause text
        this.ctx.fillStyle = '#00ff00';
        this.ctx.font = 'bold 48px Orbitron, monospace';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('PAUSED', this.canvas.width / 2, this.canvas.height / 2);
        
        this.ctx.font = '16px Orbitron, monospace';
        this.ctx.fillText('Press P to continue', this.canvas.width / 2, this.canvas.height / 2 + 40);
        
        // Reset text alignment
        this.ctx.textAlign = 'left';
    }
    
    drawStartScreen() {
        // Draw the main title
        this.ctx.fillStyle = '#00ff00';
        this.ctx.font = 'bold 72px Orbitron, monospace';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('SPYSHOOT', this.canvas.width / 2, this.canvas.height / 2 - 80);
        
        // Draw "CLICK TO START" with pulsing effect
        const pulseAlpha = 0.5 + 0.5 * Math.sin(this.gameState.timePlayed * 0.003);
        this.ctx.fillStyle = `rgba(0, 255, 0, ${pulseAlpha})`;
        this.ctx.font = 'bold 32px Orbitron, monospace';
        this.ctx.fillText('CLICK OR PRESS SPACE TO START', this.canvas.width / 2, this.canvas.height / 2 + 20);
        
        // Audio status indicator
        if (!this.audioSystem.isInitialized) {
            this.ctx.fillStyle = '#ffaa00';
            this.ctx.font = '16px Orbitron, monospace';
            this.ctx.fillText('🔊 Audio will be enabled on first interaction', this.canvas.width / 2, this.canvas.height / 2 + 60);
        } else {
            this.ctx.fillStyle = '#00ff00';
            this.ctx.font = '16px Orbitron, monospace';
            this.ctx.fillText('🔊 Audio System Ready!', this.canvas.width / 2, this.canvas.height / 2 + 60);
        }
        
        // Draw instructions
        this.ctx.fillStyle = '#00aa00';
        this.ctx.font = '18px Orbitron, monospace';
        this.ctx.fillText('SHOOT: Space | SCAN: Q | PAUSE: P | RESTART: R | AUDIO: M | STATS: D', this.canvas.width / 2, this.canvas.height / 2 + 100);
        this.ctx.fillText('Arrow keys or WASD to move', this.canvas.width / 2, this.canvas.height / 2 + 130);
        
        // Add subtitle
        this.ctx.fillStyle = '#006600';
        this.ctx.font = '16px Orbitron, monospace';
        this.ctx.fillText('Space Reconnaissance Mission', this.canvas.width / 2, this.canvas.height / 2 - 40);
        
        // Debug info - show current status
        this.ctx.fillStyle = '#666666';
        this.ctx.font = '12px monospace';
        this.ctx.fillText(`Status: ${this.gameState.gameStatus}`, this.canvas.width / 2, this.canvas.height - 60);
        this.ctx.fillText('Controls: Space=Shoot | Q=Scan | P=Pause | R=Restart', this.canvas.width / 2, this.canvas.height - 40);
        this.ctx.fillText('Check browser console (F12) for debug info', this.canvas.width / 2, this.canvas.height - 20);
        
        // Reset text alignment
        this.ctx.textAlign = 'left';
    }
    
    updateHUD() {
        const gameStatus = this.gameState.get('gameStatus');
        
        // Hide HUD on start screen
        if (gameStatus === 'start_screen') {
            this.hud.setVisibility(false);
            return;
        }
        
        // Show HUD during gameplay
        this.hud.setVisibility(true);
        
        // Update HUD with current game data
        const uiData = this.gameState.getUIData();
        this.hud.updateAll(uiData);
    }
    
    updateHUDFromECS() {
        if (!this.enhancedGame) return;
        
        const gameStatus = this.enhancedGame.getGameState().get('gameStatus');
        
        // Hide HUD on start screen
        if (gameStatus === 'start_screen') {
            this.hud.setVisibility(false);
            return;
        }
        
        // Show HUD during gameplay
        this.hud.setVisibility(true);
        
        // Update HUD with ECS data
        const ecsManager = this.enhancedGame.getECSManager();
        const uiData = {
            score: ecsManager.getPlayerScore(),
            energyPercentage: ecsManager.getPlayerEnergyPercentage(),
            energyLow: ecsManager.getPlayerEnergyPercentage() < 20,
            energyCritical: ecsManager.isPlayerEnergyCritical(),
            scannerStatus: 'READY', // TODO: Implement scanner in ECS
            scannerActive: false
        };
        
        this.hud.updateAll(uiData);
    }
    
    renderECSStatsPanel() {
        if (!this.enhancedGame) return;
        
        const ecsManager = this.enhancedGame.getECSManager();
        const gameState = this.enhancedGame.getGameState();
        const performanceStats = this.enhancedGame.getPerformanceStats();
        
        const uiData = {
            bullets: ecsManager.getBulletCount(),
            energy: ecsManager.getPlayerEnergy(),
            enemies: ecsManager.getEnemyCount(),
            rocks: ecsManager.getRockCount(),
            difficulty: gameState.get('difficultyLevel'),
            fps: performanceStats.fps,
            timePlayed: gameState.get('timePlayed'),
            environment: {
                name: 'ECS Mode',
                progress: 1.0
            },
            // ECS-specific stats
            entityCount: ecsManager.getEntityCount(),
            systemCount: ecsManager.getSystemCount(),
            updateTime: performanceStats.updateTime,
            renderTime: performanceStats.renderTime
        };
        
        this.statsPanel.render(this.ctx, uiData);
    }
    
    showGameOver() {
        document.getElementById('finalScore').textContent = this.scoreSystem.getCurrentScore();
        document.getElementById('gameOverScreen').classList.remove('hidden');
    }
    
    drawGameOverScreen() {
        // Ensure HTML game over screen is hidden
        const htmlGameOver = document.getElementById('gameOverScreen');
        if (htmlGameOver) {
            htmlGameOver.classList.add('hidden');
        }
        
        // Semi-transparent overlay
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.9)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Game Over title - exactly as requested
        this.ctx.fillStyle = '#ff0000';
        this.ctx.font = 'bold 48px Orbitron, monospace';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('Game Over', this.canvas.width / 2, this.canvas.height / 2 - 40);
        
        // Final score - exactly as requested
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = '24px Orbitron, monospace';
        this.ctx.fillText(`Final Score: ${this.scoreSystem.getCurrentScore()}`, this.canvas.width / 2, this.canvas.height / 2 + 10);
        
        // Restart instruction - exactly as requested
        this.ctx.fillStyle = '#00ff00';
        this.ctx.font = '20px Orbitron, monospace';
        this.ctx.fillText('Press R to Restart', this.canvas.width / 2, this.canvas.height / 2 + 60);
        
        // Reset text alignment
        this.ctx.textAlign = 'left';
    }
    
    restartGame() {
        // Use ECS restart if enabled
        if (this.useECS && this.enhancedGame) {
            this.enhancedGame.restartGame();
            this.updateHUDFromECS();
            return;
        }
        
        // Original restart logic
        // Reset game state using state manager
        this.gameState.restartGame();
        
        // Reset all systems
        this.energySystem.reset();
        this.scannerSystem.reset();
        this.shootingSystem.clearAllBullets();
        this.spawningSystem.clearAll();
        this.collisionSystem.reset();
        this.scoreSystem.reset();
        this.locationSystem.reset();
        
        // Reset player
        this.initPlayer();
        
        // Hide game over screen using HUD
        this.hud.hideGameOver();
        
        // Update HUD
        this.updateHUD();
    }
    
    async startGame() {
        console.log('🎮 Starting SpyShoot game...');
        
        try {
            // Ensure audio system is initialized on first user interaction
            if (!this.audioSystem.isInitialized) {
                console.log('🎵 Initializing audio system on game start...');
                await this.audioSystem.initialize();
                if (this.audioSystem.isInitialized) {
                    // Preload essential sound effects
                    await this.audioSystem.preloadAssets();
                    
                    // Test audio immediately
                    console.log('🔊 Testing audio with laser sound...');
                    this.audioSystem.playSyntheticSound('laser_shot', { volume: 0.5 });
                    
                    // Initialize dynamic music system
                    this.dynamicMusicManager.handleGameEvent('game_start');
                    
                    // Play game start sound
                    setTimeout(() => {
                        this.enhancedSoundEffects.playGameStart();
                    }, 500);
                    
                    console.log('✅ Audio system initialized and ready!');
                } else {
                    console.warn('⚠️ Audio system failed to initialize - continuing without sound');
                }
            } else {
                // Audio already initialized, just trigger game start events
                this.dynamicMusicManager.handleGameEvent('game_start');
                
                // Test audio
                console.log('🔊 Testing audio with laser sound...');
                this.audioSystem.playSyntheticSound('laser_shot', { volume: 0.5 });
                
                // Play game start sound
                setTimeout(() => {
                    this.enhancedSoundEffects.playGameStart();
                }, 500);
            }
            
            // Use ECS game if enabled
            if (this.useECS && this.enhancedGame) {
                this.enhancedGame.startGame();
                console.log('✅ ECS SpyShoot game started successfully!');
                return;
            }
            
            // Original game start logic
            // Start the game using state manager
            this.gameState.startGame();
            
            // Initialize all systems
            this.energySystem.reset();
            this.scannerSystem.reset();
            this.shootingSystem.clearAllBullets();
            this.spawningSystem.clearAll();
            this.collisionSystem.reset();
            this.scoreSystem.reset();
            
            // Connect enhanced sound effects to score system
            this.scoreSystem.setEnhancedSoundEffects(this.enhancedSoundEffects);
            this.scoreSystem.setAdvancedAudioManager(this.advancedAudioManager);
            
            // Initialize player
            this.initPlayer();
            
            // Set initial environment for dynamic music
            const currentEnv = this.locationSystem.getCurrentEnvironment();
            if (currentEnv) {
                this.dynamicMusicManager.setEnvironment(this.locationSystem.environmentManager.currentEnvironment);
            }
            
            // Update HUD
            this.updateHUD();
            
            console.log('✅ SpyShoot game started successfully!');
        } catch (error) {
            console.error('❌ Error starting game:', error);
        }
    }
    
    gameLoop(currentTime = 0) {
        // Calculate delta time
        this.deltaTime = currentTime - this.lastTime;
        this.lastTime = currentTime;
        
        // Update game
        this.update(this.deltaTime);
        
        // Render game
        this.render();
        
        // Continue loop
        requestAnimationFrame((time) => this.gameLoop(time));
    }
}

// Initialize game when page loads
document.addEventListener('DOMContentLoaded', () => {
    const game = new SpyShootGame();
    
    // Make game accessible globally for debugging
    window.spyShootGame = game;
});