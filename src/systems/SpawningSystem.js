// Spawning system for enemies and rocks with environment integration
import { EnemyShip } from '../entities/EnemyShip.js';
import { Rock } from '../entities/Rock.js';
import { GAME_CONFIG } from '../utils/GameConstants.js';

export class SpawningSystem {
    constructor(canvasWidth, canvasHeight) {
        this.canvasWidth = canvasWidth;
        this.canvasHeight = canvasHeight;
        
        // Spawn timing
        this.lastSpawnTime = 0;
        this.baseSpawnInterval = 2000; // 2 seconds between spawns initially
        this.currentSpawnInterval = this.baseSpawnInterval;
        
        // Spawn ratios and difficulty
        this.spyAlienRatio = 0.3; // 30% chance of spy alien initially
        this.difficultyLevel = 1;
        
        // Environment modifiers
        this.environmentModifiers = {
            rocks: 1.0,
            enemies: 1.0,
            spies: 1.0
        };
        
        // Base spawn probabilities
        this.baseSpawnProbabilities = {
            alien: 0.7,  // 70% chance of alien
            rock: 0.3    // 30% chance of rock
        };
        
        // Entity arrays
        this.enemies = [];
        this.rocks = [];
        
        console.log('🚀 SpawningSystem initialized with environment integration');
    }
    
    update(deltaTime, gameState) {
        const currentTime = Date.now();
        
        // Update difficulty based on time played
        this.updateDifficulty(gameState.timePlayed);
        
        // Check if it's time to spawn
        if (currentTime - this.lastSpawnTime >= this.currentSpawnInterval) {
            this.spawnObject();
            this.lastSpawnTime = currentTime;
        }
        
        // Update all enemies
        this.updateEnemies(deltaTime);
        
        // Update all rocks (when implemented)
        this.updateRocks(deltaTime);
        
        // Clean up inactive objects
        this.cleanup();
    }
    
    updateDifficulty(timePlayed) {
        // Increase difficulty every 30 seconds
        const newDifficultyLevel = Math.floor(timePlayed / 30000) + 1;
        
        if (newDifficultyLevel !== this.difficultyLevel) {
            this.difficultyLevel = newDifficultyLevel;
            
            // Decrease spawn interval (spawn more frequently)
            this.currentSpawnInterval = Math.max(800, this.baseSpawnInterval - (this.difficultyLevel - 1) * 200);
            
            // Increase spy alien ratio (more decision complexity)
            this.spyAlienRatio = Math.min(0.6, 0.3 + (this.difficultyLevel - 1) * 0.05);
            
            console.log(`Difficulty increased to level ${this.difficultyLevel}`);
            console.log(`Spawn interval: ${this.currentSpawnInterval}ms, Spy ratio: ${this.spyAlienRatio}`);
        }
    }
    
    spawnObject() {
        // Get current spawn probabilities with environment modifiers
        const probabilities = this.getCurrentSpawnProbabilities();
        
        // Random choice: Alien or Rock with environment-modified probabilities
        const spawnType = Math.random();
        
        if (spawnType < probabilities.alien) {
            this.spawnAlien();
        } else {
            this.spawnRock();
        }
    }
    
    /**
     * Set environment modifiers from LocationSystem
     */
    setEnvironmentModifiers(modifiers) {
        this.environmentModifiers = { ...modifiers };
        console.log('🌌 SpawningSystem environment modifiers updated:', this.environmentModifiers);
    }
    
    /**
     * Get current spawn probabilities with environment modifiers applied
     */
    getCurrentSpawnProbabilities() {
        // Apply environment modifiers to base probabilities
        const modifiedRockChance = this.baseSpawnProbabilities.rock * this.environmentModifiers.rocks;
        const modifiedAlienChance = this.baseSpawnProbabilities.alien * this.environmentModifiers.enemies;
        
        // Normalize probabilities to ensure they sum to 1.0
        const total = modifiedRockChance + modifiedAlienChance;
        
        if (total <= 0) {
            // Fallback to base probabilities if modifiers result in zero spawning
            return this.baseSpawnProbabilities;
        }
        
        return {
            rock: modifiedRockChance / total,
            alien: modifiedAlienChance / total
        };
    }
    
    /**
     * Get modified spy ratio based on environment
     */
    getModifiedSpyRatio() {
        return Math.min(0.8, this.spyAlienRatio * this.environmentModifiers.spies);
    }
    
    spawnAlien() {
        // Random X position across canvas width
        const x = Math.random() * (this.canvasWidth - 25); // 25 is ship width
        const y = -30; // Start above screen
        
        // Determine if this should be a spy alien using environment-modified ratio
        const modifiedSpyRatio = this.getModifiedSpyRatio();
        const isSpy = Math.random() < modifiedSpyRatio;
        const type = isSpy ? 'spy' : 'enemy';
        
        // Create enemy ship
        const enemy = new EnemyShip(x, y, type);
        
        // Adjust speed based on difficulty and environment
        const baseSpeed = 2 + (this.difficultyLevel - 1) * 0.3;
        const environmentSpeedModifier = this.environmentModifiers.enemies || 1.0;
        enemy.speed = baseSpeed * environmentSpeedModifier;
        
        // Add to enemies array
        this.enemies.push(enemy);
        
        console.log(`👽 Spawned ${type} at (${Math.round(x)}, ${y}) with speed ${enemy.speed.toFixed(1)}`);
    }
    
    spawnRock() {
        // Random X position across canvas width
        const x = Math.random() * (this.canvasWidth - 35); // 35 is max rock size
        const y = -40; // Start above screen
        
        // Create rock
        const rock = new Rock(x, y);
        
        // Adjust speed based on difficulty and environment (rocks get faster but stay slower than enemies)
        const baseSpeed = 1.5 + (this.difficultyLevel - 1) * 0.2;
        const environmentSpeedModifier = this.environmentModifiers.rocks || 1.0;
        rock.speed = baseSpeed * environmentSpeedModifier;
        
        // Add to rocks array
        this.rocks.push(rock);
        
        console.log(`🪨 Spawned rock at (${Math.round(x)}, ${y}) with speed ${rock.speed.toFixed(1)}`);
    }
    
    updateEnemies(deltaTime) {
        for (const enemy of this.enemies) {
            if (enemy.isActive()) {
                enemy.update(deltaTime, this.canvasWidth, this.canvasHeight);
            }
        }
    }
    
    updateRocks(deltaTime) {
        for (const rock of this.rocks) {
            if (rock.isActive()) {
                rock.update(deltaTime, this.canvasWidth, this.canvasHeight);
            }
        }
    }
    
    cleanup() {
        // Remove inactive enemies
        this.enemies = this.enemies.filter(enemy => enemy.isActive());
        
        // Remove inactive rocks
        this.rocks = this.rocks.filter(rock => rock.isActive());
    }
    
    render(ctx, scannerActive = false, scannerSystem = null) {
        // Render all enemies
        for (const enemy of this.enemies) {
            if (enemy.isActive()) {
                enemy.render(ctx, scannerActive, scannerSystem);
            }
        }
        
        // Render all rocks
        for (const rock of this.rocks) {
            if (rock.isActive()) {
                rock.render(ctx);
            }
        }
    }
    
    // Get all active enemies (for collision detection)
    getActiveEnemies() {
        return this.enemies.filter(enemy => enemy.isActive());
    }
    
    // Get all active rocks (for collision detection)
    getActiveRocks() {
        return this.rocks.filter(rock => rock.isActive());
    }
    
    // Remove a specific enemy (for collision handling)
    removeEnemy(enemyToRemove) {
        const index = this.enemies.indexOf(enemyToRemove);
        if (index > -1) {
            enemyToRemove.destroy();
        }
    }
    
    // Remove a specific rock (for collision handling)
    removeRock(rockToRemove) {
        const index = this.rocks.indexOf(rockToRemove);
        if (index > -1) {
            rockToRemove.destroy();
        }
    }
    
    // Clear all objects (for game restart)
    clearAll() {
        this.enemies = [];
        this.rocks = [];
        this.lastSpawnTime = 0;
        this.difficultyLevel = 1;
        this.currentSpawnInterval = this.baseSpawnInterval;
        this.spyAlienRatio = 0.3;
    }
    
    // Get counts for debugging
    getEnemyCount() {
        return this.enemies.length;
    }
    
    getRockCount() {
        return this.rocks.length;
    }
    
    // Get current difficulty info
    getDifficultyInfo() {
        return {
            level: this.difficultyLevel,
            spawnInterval: this.currentSpawnInterval,
            spyRatio: this.spyAlienRatio,
            modifiedSpyRatio: this.getModifiedSpyRatio(),
            environmentModifiers: this.environmentModifiers,
            currentProbabilities: this.getCurrentSpawnProbabilities()
        };
    }
}