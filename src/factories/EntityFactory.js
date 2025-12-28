// Entity Factory - Creates game entities with proper components
import { 
    Transform, Velocity, Acceleration, Sprite, RigidBody, Collider,
    PlayerController, EnemyAI, Projectile, Health, Energy, Score,
    Player, Enemy, Bullet, Rock
} from '../components/CoreComponents.js';
import { GAME_CONFIG } from '../utils/GameConstants.js';

export class EntityFactory {
    constructor(world) {
        this.world = world;
    }
    
    createPlayer(x, y, canvasWidth, canvasHeight) {
        const entity = this.world.createEntity();
        
        // Core components
        entity.addComponent(new Transform(x, y));
        entity.addComponent(new Velocity(0, 0));
        entity.addComponent(new Acceleration(0.8, 0.85));
        entity.addComponent(new Sprite(30, 40, '#00cc00'));
        entity.addComponent(new RigidBody(1, 0.98));
        
        // Collision
        entity.addComponent(new Collider(30, 40, 0, 0));
        
        // Player-specific components
        entity.addComponent(new PlayerController());
        entity.addComponent(new Health(1));
        entity.addComponent(new Energy(GAME_CONFIG.PLAYER_MAX_ENERGY));
        entity.addComponent(new Score(0));
        
        // Tag component
        entity.addComponent(new Player());
        
        // Set collision layers
        const collider = entity.getComponent(Collider);
        collider.collisionLayer = 1; // Player layer
        collider.collisionMask = 2 | 4; // Can collide with enemies and rocks
        
        // Set velocity limits
        const velocity = entity.getComponent(Velocity);
        velocity.maxSpeed = GAME_CONFIG.PLAYER_SPEED;
        
        // Store canvas bounds for boundary checking
        const controller = entity.getComponent(PlayerController);
        controller.canvasWidth = canvasWidth;
        controller.canvasHeight = canvasHeight;
        
        return entity;
    }
    
    createEnemy(x, y, type = 'enemy') {
        const entity = this.world.createEntity();
        
        // Core components
        entity.addComponent(new Transform(x, y));
        entity.addComponent(new Velocity(0, 2));
        entity.addComponent(new Sprite(25, 30, type === 'enemy' ? '#cc0000' : '#cccc00'));
        
        // Collision
        entity.addComponent(new Collider(25, 30, 0, 0));
        
        // Enemy-specific components
        const ai = new EnemyAI(type);
        ai.centerX = x; // Remember starting position for zigzag
        entity.addComponent(ai);
        entity.addComponent(new Health(1));
        
        // Scoring
        const scoreValue = type === 'enemy' ? GAME_CONFIG.ENEMY_KILL_POINTS : GAME_CONFIG.SPY_ALIEN_PENALTY;
        entity.addComponent(new Score(scoreValue));
        
        // Tag component
        entity.addComponent(new Enemy());
        
        // Set collision layers
        const collider = entity.getComponent(Collider);
        collider.collisionLayer = 2; // Enemy layer
        collider.collisionMask = 1 | 8; // Can collide with player and bullets
        
        return entity;
    }
    
    createBullet(x, y, direction = { x: 0, y: -1 }) {
        const entity = this.world.createEntity();
        
        // Core components
        entity.addComponent(new Transform(x, y));
        entity.addComponent(new Velocity(0, 0)); // Will be set by ProjectileSystem
        entity.addComponent(new Sprite(4, 12, '#ffff00'));
        
        // Collision
        entity.addComponent(new Collider(4, 12, 0, 0));
        
        // Projectile-specific components
        entity.addComponent(new Projectile(8, direction));
        entity.addComponent(new Health(1));
        
        // Tag component
        entity.addComponent(new Bullet());
        
        // Set collision layers
        const collider = entity.getComponent(Collider);
        collider.collisionLayer = 8; // Bullet layer
        collider.collisionMask = 2 | 4; // Can collide with enemies and rocks
        
        return entity;
    }
    
    createRock(x, y, size = 'medium') {
        const entity = this.world.createEntity();
        
        // Size variations
        const sizes = {
            small: { width: 20, height: 20, speed: 1.5 },
            medium: { width: 30, height: 30, speed: 1.2 },
            large: { width: 40, height: 40, speed: 0.8 }
        };
        
        const rockSize = sizes[size] || sizes.medium;
        
        // Core components
        entity.addComponent(new Transform(x, y));
        entity.addComponent(new Velocity(0, rockSize.speed));
        entity.addComponent(new Sprite(rockSize.width, rockSize.height, '#666666'));
        
        // Collision
        entity.addComponent(new Collider(rockSize.width, rockSize.height, 0, 0));
        
        // Rock-specific components
        entity.addComponent(new Health(size === 'large' ? 2 : 1));
        entity.addComponent(new Score(5)); // Small points for destroying rocks
        
        // Tag component
        entity.addComponent(new Rock());
        
        // Set collision layers
        const collider = entity.getComponent(Collider);
        collider.collisionLayer = 4; // Rock layer
        collider.collisionMask = 1 | 8; // Can collide with player and bullets
        
        return entity;
    }
    
    createExplosion(x, y, size = 'medium') {
        const entity = this.world.createEntity();
        
        // Core components
        entity.addComponent(new Transform(x, y));
        entity.addComponent(new Sprite(size === 'large' ? 40 : 20, size === 'large' ? 40 : 20, '#ff6600'));
        
        // Explosion-specific components - will be handled by particle system later
        // For now, just a simple visual effect
        
        return entity;
    }
}