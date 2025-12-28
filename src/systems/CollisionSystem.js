// Collision detection system for SpyShoot
import { GAME_CONFIG } from '../utils/GameConstants.js';

export class CollisionSystem {
    constructor() {
        // Collision detection settings
        this.bulletEnemyCollisions = [];
        this.playerEnemyCollisions = [];
        this.playerRockCollisions = [];
    }
    
    update(shootingSystem, spawningSystem, player, energySystem, scoreSystem, soundEffectManager = null, enhancedSoundEffects = null) {
        // Store sound effect managers for use in collision handlers
        this.soundEffectManager = soundEffectManager;
        this.enhancedSoundEffects = enhancedSoundEffects;
        
        // Clear previous frame collisions
        this.bulletEnemyCollisions = [];
        this.playerEnemyCollisions = [];
        this.playerRockCollisions = [];
        
        // Check bullet vs enemy collisions
        this.checkBulletEnemyCollisions(shootingSystem, spawningSystem, energySystem, scoreSystem);
        
        // Check bullet vs rock collisions
        this.checkBulletRockCollisions(shootingSystem, spawningSystem, scoreSystem);
        
        // Check player vs rock collisions
        this.checkPlayerRockCollisions(player, spawningSystem, energySystem);
        
        // Check player vs enemy collisions (future implementation)
        // this.checkPlayerEnemyCollisions(player, spawningSystem);
    }
    
    checkBulletEnemyCollisions(shootingSystem, spawningSystem, energySystem, scoreSystem) {
        const bullets = shootingSystem.getActiveBullets();
        const enemies = spawningSystem.getActiveEnemies();
        
        for (const bullet of bullets) {
            for (const enemy of enemies) {
                if (this.isColliding(bullet.getBounds(), enemy.getBounds())) {
                    // Handle collision
                    this.handleBulletEnemyCollision(bullet, enemy, shootingSystem, spawningSystem, energySystem, scoreSystem);
                    break; // Bullet can only hit one enemy
                }
            }
        }
    }
    
    handleBulletEnemyCollision(bullet, enemy, shootingSystem, spawningSystem, energySystem, scoreSystem) {
        // Remove bullet and enemy
        shootingSystem.removeBullet(bullet);
        spawningSystem.removeEnemy(enemy);
        
        // Play enhanced explosion sound effect
        if (this.enhancedSoundEffects) {
            this.enhancedSoundEffects.playEnemyExplosion(
                enemy.getCenterPosition().x, 
                enemy.getCenterPosition().y
            );
        } else if (this.soundEffectManager) {
            this.soundEffectManager.playSoundPositioned('explosion_enemy', 
                enemy.getCenterPosition().x, 
                enemy.getCenterPosition().y, 
                { pitchVariation: 0.15 }
            );
        }
        
        // Handle scoring and energy based on enemy type
        if (enemy.isEnemy()) {
            // Destroyed an enemy - award points and restore energy
            scoreSystem.addEnemyKill(GAME_CONFIG.ENEMY_KILL_POINTS);
            energySystem.restoreEnergy(GAME_CONFIG.ENERGY_RESTORE_AMOUNT);
            
            // Play power-up sound for energy restoration
            if (this.enhancedSoundEffects) {
                setTimeout(() => {
                    this.enhancedSoundEffects.playPowerUp();
                }, 200);
            }
            
            console.log(`Enemy destroyed! +${GAME_CONFIG.ENEMY_KILL_POINTS} points, +${GAME_CONFIG.ENERGY_RESTORE_AMOUNT} energy`);
        } else if (enemy.isSpy()) {
            // Shot a spy alien - penalty
            scoreSystem.addSpyPenalty(GAME_CONFIG.SPY_ALIEN_PENALTY); // This is negative
            energySystem.consumeEnergy(Math.abs(GAME_CONFIG.SPY_ALIEN_PENALTY / 10)); // Energy penalty
            
            // Play spy detection sound (negative feedback)
            if (this.enhancedSoundEffects) {
                setTimeout(() => {
                    this.enhancedSoundEffects.playUIError();
                }, 300);
            }
            
            console.log(`Spy alien shot! ${GAME_CONFIG.SPY_ALIEN_PENALTY} points, energy penalty`);
        }
        
        // Store collision for visual effects
        this.bulletEnemyCollisions.push({
            x: enemy.getCenterPosition().x,
            y: enemy.getCenterPosition().y,
            type: enemy.type,
            timestamp: Date.now()
        });
    }
    
    checkBulletRockCollisions(shootingSystem, spawningSystem, scoreSystem) {
        const bullets = shootingSystem.getActiveBullets();
        const rocks = spawningSystem.getActiveRocks();
        
        for (const bullet of bullets) {
            for (const rock of rocks) {
                if (this.isColliding(bullet.getBounds(), rock.getBounds())) {
                    // Handle collision
                    this.handleBulletRockCollision(bullet, rock, shootingSystem, spawningSystem, scoreSystem);
                    break; // Bullet can only hit one rock
                }
            }
        }
    }
    
    handleBulletRockCollision(bullet, rock, shootingSystem, spawningSystem, scoreSystem) {
        // Remove bullet
        shootingSystem.removeBullet(bullet);
        
        // Damage rock (rocks take multiple hits)
        const rockDestroyed = rock.takeDamage();
        
        // Play enhanced rock impact/explosion sound effect
        if (this.enhancedSoundEffects) {
            this.enhancedSoundEffects.playRockExplosion(
                rock.getCenterPosition().x, 
                rock.getCenterPosition().y,
                rockDestroyed
            );
        } else if (this.soundEffectManager) {
            this.soundEffectManager.playSoundPositioned('explosion_rock', 
                rock.getCenterPosition().x, 
                rock.getCenterPosition().y, 
                { pitchVariation: 0.2 }
            );
        }
        
        if (rockDestroyed) {
            // Rock destroyed - small point reward
            scoreSystem.addEnemyKill(rock.getPointValue());
            console.log(`Rock destroyed! +${rock.getPointValue()} points`);
            
            // Store collision for visual effects
            this.bulletEnemyCollisions.push({
                x: rock.getCenterPosition().x,
                y: rock.getCenterPosition().y,
                type: 'rock',
                timestamp: Date.now()
            });
        } else {
            console.log('Rock damaged but not destroyed');
        }
    }
    
    checkPlayerEnemyCollisions(player, spawningSystem) {
        // Placeholder for player-enemy collision detection
        const enemies = spawningSystem.getActiveEnemies();
        const playerBounds = player.getBounds();
        
        for (const enemy of enemies) {
            if (this.isColliding(playerBounds, enemy.getBounds())) {
                // Handle player-enemy collision
                this.handlePlayerEnemyCollision(player, enemy, spawningSystem);
                break;
            }
        }
    }
    
    handlePlayerEnemyCollision(player, enemy, spawningSystem) {
        // Remove enemy and damage player
        spawningSystem.removeEnemy(enemy);
        
        // Damage player (reduce energy)
        player.consumeEnergy(20); // Collision damage
        
        console.log('Player hit by enemy! -20 energy');
        
        // Store collision for visual effects
        this.playerEnemyCollisions.push({
            x: enemy.getCenterPosition().x,
            y: enemy.getCenterPosition().y,
            timestamp: Date.now()
        });
    }
    
    checkPlayerRockCollisions(player, spawningSystem, energySystem) {
        const rocks = spawningSystem.getActiveRocks();
        const playerBounds = player.getBounds();
        
        for (const rock of rocks) {
            if (this.isColliding(playerBounds, rock.getBounds())) {
                // Handle player-rock collision
                this.handlePlayerRockCollision(player, rock, spawningSystem, energySystem);
                break;
            }
        }
    }
    
    handlePlayerRockCollision(player, rock, spawningSystem, energySystem) {
        // Remove rock and damage player significantly
        spawningSystem.removeRock(rock);
        
        // Heavy damage from rock collision
        energySystem.consumeEnergy(30);
        
        console.log('Player hit by rock! -30 energy');
        
        // Store collision for visual effects
        this.playerRockCollisions.push({
            x: rock.getCenterPosition().x,
            y: rock.getCenterPosition().y,
            timestamp: Date.now()
        });
    }
    
    // Basic AABB (Axis-Aligned Bounding Box) collision detection
    isColliding(bounds1, bounds2) {
        return bounds1.x < bounds2.x + bounds2.width &&
               bounds1.x + bounds1.width > bounds2.x &&
               bounds1.y < bounds2.y + bounds2.height &&
               bounds1.y + bounds1.height > bounds2.y;
    }
    
    // Get recent collisions for visual effects
    getRecentBulletEnemyCollisions(maxAge = 500) {
        const currentTime = Date.now();
        return this.bulletEnemyCollisions.filter(collision => 
            currentTime - collision.timestamp < maxAge
        );
    }
    
    getRecentPlayerCollisions(maxAge = 500) {
        const currentTime = Date.now();
        return [
            ...this.playerEnemyCollisions,
            ...this.playerRockCollisions
        ].filter(collision => currentTime - collision.timestamp < maxAge);
    }
    
    // Render collision effects
    renderCollisionEffects(ctx) {
        // Draw explosion effects for bullet-enemy collisions
        const bulletCollisions = this.getRecentBulletEnemyCollisions();
        for (const collision of bulletCollisions) {
            this.drawExplosion(ctx, collision.x, collision.y, collision.type);
        }
        
        // Draw impact effects for player collisions
        const playerCollisions = this.getRecentPlayerCollisions();
        for (const collision of playerCollisions) {
            this.drawImpact(ctx, collision.x, collision.y);
        }
    }
    
    drawExplosion(ctx, x, y, enemyType) {
        ctx.save();
        
        // Different colors for different enemy types
        const color = enemyType === 'enemy' ? '#ff6600' : '#ffff00';
        
        // Draw explosion burst
        ctx.fillStyle = color;
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        
        // Draw explosion particles
        for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI * 2;
            const distance = 15;
            const particleX = x + Math.cos(angle) * distance;
            const particleY = y + Math.sin(angle) * distance;
            
            ctx.beginPath();
            ctx.arc(particleX, particleY, 3, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
        }
        
        // Draw central flash
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(x, y, 8, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.restore();
    }
    
    drawImpact(ctx, x, y) {
        ctx.save();
        
        // Draw impact effect
        ctx.strokeStyle = '#ff0000';
        ctx.lineWidth = 3;
        
        // Draw impact lines
        ctx.beginPath();
        ctx.moveTo(x - 10, y - 10);
        ctx.lineTo(x + 10, y + 10);
        ctx.moveTo(x + 10, y - 10);
        ctx.lineTo(x - 10, y + 10);
        ctx.stroke();
        
        ctx.restore();
    }
    
    // Reset collision system (for game restart)
    reset() {
        this.bulletEnemyCollisions = [];
        this.playerEnemyCollisions = [];
        this.playerRockCollisions = [];
    }
}