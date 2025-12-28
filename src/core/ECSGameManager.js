// ECS Game Manager - Integrates ECS with existing SpyShoot game
import { World } from './EntityComponentSystem.js';
import { EntityFactory } from '../factories/EntityFactory.js';

// ECS Systems
import { MovementSystem } from '../systems/ecs/MovementSystem.js';
import { PlayerInputSystem } from '../systems/ecs/PlayerInputSystem.js';
import { EnemyAISystem } from '../systems/ecs/EnemyAISystem.js';
import { ProjectileSystem } from '../systems/ecs/ProjectileSystem.js';
import { BoundarySystem } from '../systems/ecs/BoundarySystem.js';
import { CollisionSystem as ECSCollisionSystem } from '../systems/ecs/CollisionSystem.js';
import { ECSRenderingSystem } from '../systems/ecs/RenderingSystem.js';

// Components
import { Transform, Velocity, PlayerController, Energy, Health, Score, Player, Enemy, Bullet } from '../components/CoreComponents.js';

export class ECSGameManager {
    constructor(canvas, ctx, inputSystem) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.inputSystem = inputSystem;
        
        // Create ECS world
        this.world = new World();
        this.entityFactory = new EntityFactory(this.world);
        
        // Initialize systems
        this.initializeSystems();
        
        // Game entities
        this.playerEntity = null;
        this.bullets = new Set();
        this.enemies = new Set();
        this.rocks = new Set();
        
        // Performance tracking
        this.stats = {
            entities: 0,
            systems: 0,
            updateTime: 0,
            renderTime: 0
        };
        
        console.log('🎮 ECS Game Manager initialized');
    }
    
    initializeSystems() {
        // Add systems in priority order
        this.world.addSystem(new PlayerInputSystem(this.inputSystem));
        this.world.addSystem(new EnemyAISystem(this.canvas.width, this.canvas.height));
        this.world.addSystem(new ProjectileSystem(this.canvas.width, this.canvas.height));
        this.world.addSystem(new MovementSystem());
        this.world.addSystem(new BoundarySystem(this.canvas.width, this.canvas.height));
        this.world.addSystem(new ECSCollisionSystem());
        this.world.addSystem(new ECSRenderingSystem(this.ctx));
        
        console.log('✅ ECS Systems initialized');
    }
    
    createPlayer(x, y) {
        this.playerEntity = this.entityFactory.createPlayer(x, y, this.canvas.width, this.canvas.height);
        return this.playerEntity;
    }
    
    createEnemy(x, y, type = 'enemy') {
        const enemy = this.entityFactory.createEnemy(x, y, type);
        this.enemies.add(enemy);
        return enemy;
    }
    
    createBullet(x, y, direction = { x: 0, y: -1 }) {
        const bullet = this.entityFactory.createBullet(x, y, direction);
        this.bullets.add(bullet);
        return bullet;
    }
    
    createRock(x, y, size = 'medium') {
        const rock = this.entityFactory.createRock(x, y, size);
        this.rocks.add(rock);
        return rock;
    }
    
    update(deltaTime) {
        const startTime = performance.now();
        
        // Update ECS world
        this.world.update(deltaTime);
        
        // Clean up destroyed entities
        this.cleanupDestroyedEntities();
        
        // Update stats
        this.updateStats(performance.now() - startTime);
    }
    
    render() {
        // Rendering is handled by ECSRenderingSystem
        // This method exists for compatibility with existing game loop
    }
    
    cleanupDestroyedEntities() {
        // Remove destroyed bullets
        for (const bullet of this.bullets) {
            if (!bullet.active) {
                this.bullets.delete(bullet);
            }
        }
        
        // Remove destroyed enemies
        for (const enemy of this.enemies) {
            if (!enemy.active) {
                this.enemies.delete(enemy);
            }
        }
        
        // Remove destroyed rocks
        for (const rock of this.rocks) {
            if (!rock.active) {
                this.rocks.delete(rock);
            }
        }
    }
    
    updateStats(updateTime) {
        this.stats.entities = this.world.entities.size;
        this.stats.systems = this.world.systemsArray.length;
        this.stats.updateTime = updateTime;
    }
    
    // Compatibility methods for existing game systems
    getPlayer() {
        return this.playerEntity;
    }
    
    getPlayerPosition() {
        if (this.playerEntity) {
            const transform = this.playerEntity.getComponent(Transform);
            return { x: transform.x, y: transform.y };
        }
        return { x: 0, y: 0 };
    }
    
    getPlayerEnergy() {
        if (this.playerEntity) {
            const energy = this.playerEntity.getComponent(Energy);
            return energy ? energy.currentEnergy : 0;
        }
        return 0;
    }
    
    getPlayerEnergyPercentage() {
        if (this.playerEntity) {
            const energy = this.playerEntity.getComponent(Energy);
            return energy ? energy.getPercentage() : 0;
        }
        return 0;
    }
    
    consumePlayerEnergy(amount) {
        if (this.playerEntity) {
            const energy = this.playerEntity.getComponent(Energy);
            return energy ? energy.consume(amount) : false;
        }
        return false;
    }
    
    restorePlayerEnergy(amount) {
        if (this.playerEntity) {
            const energy = this.playerEntity.getComponent(Energy);
            if (energy) {
                energy.restore(amount);
            }
        }
    }
    
    isPlayerEnergyEmpty() {
        if (this.playerEntity) {
            const energy = this.playerEntity.getComponent(Energy);
            return energy ? energy.isEmpty() : true;
        }
        return true;
    }
    
    isPlayerEnergyCritical() {
        if (this.playerEntity) {
            const energy = this.playerEntity.getComponent(Energy);
            return energy ? energy.isCritical() : true;
        }
        return true;
    }
    
    triggerPlayerMuzzleFlash() {
        if (this.playerEntity) {
            const controller = this.playerEntity.getComponent(PlayerController);
            if (controller) {
                controller.showMuzzleFlash = true;
                controller.muzzleFlashTime = 100;
            }
        }
    }
    
    getPlayerScore() {
        if (this.playerEntity) {
            const score = this.playerEntity.getComponent(Score);
            return score ? score.value : 0;
        }
        return 0;
    }
    
    addPlayerScore(points) {
        if (this.playerEntity) {
            const score = this.playerEntity.getComponent(Score);
            if (score) {
                score.value += points;
            }
        }
    }
    
    getBulletCount() {
        return this.bullets.size;
    }
    
    getEnemyCount() {
        return this.enemies.size;
    }
    
    getRockCount() {
        return this.rocks.size;
    }
    
    getActiveEnemies() {
        return Array.from(this.enemies).filter(enemy => enemy.active);
    }
    
    clearAllBullets() {
        for (const bullet of this.bullets) {
            bullet.destroy();
        }
        this.bullets.clear();
    }
    
    clearAllEnemies() {
        for (const enemy of this.enemies) {
            enemy.destroy();
        }
        this.enemies.clear();
    }
    
    clearAll() {
        this.clearAllBullets();
        this.clearAllEnemies();
        
        for (const rock of this.rocks) {
            rock.destroy();
        }
        this.rocks.clear();
        
        // Reset player
        if (this.playerEntity) {
            const energy = this.playerEntity.getComponent(Energy);
            const health = this.playerEntity.getComponent(Health);
            const score = this.playerEntity.getComponent(Score);
            
            if (energy) {
                energy.currentEnergy = energy.maxEnergy;
            }
            if (health) {
                health.currentHealth = health.maxHealth;
            }
            if (score) {
                score.value = 0;
            }
        }
    }
    
    reset() {
        this.world.clear();
        this.bullets.clear();
        this.enemies.clear();
        this.rocks.clear();
        this.playerEntity = null;
        
        // Reinitialize systems
        this.initializeSystems();
    }
    
    getStats() {
        return { ...this.stats };
    }
    
    // Debug methods
    getEntityCount() {
        return this.world.entities.size;
    }
    
    getSystemCount() {
        return this.world.systemsArray.length;
    }
    
    getEntitiesWith(...componentTypes) {
        return this.world.getEntitiesWith(...componentTypes);
    }
}