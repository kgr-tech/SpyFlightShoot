// Core ECS Components for SpyShoot Game
// Components are pure data containers with no logic

import { Component } from '../core/EntityComponentSystem.js';

// Position and movement components
export class Transform extends Component {
    constructor(x = 0, y = 0, rotation = 0) {
        super();
        this.x = x;
        this.y = y;
        this.rotation = rotation;
        this.prevX = x;
        this.prevY = y;
    }
}

export class Velocity extends Component {
    constructor(x = 0, y = 0) {
        super();
        this.x = x;
        this.y = y;
        this.maxSpeed = 5;
    }
}

export class Acceleration extends Component {
    constructor(rate = 0.8, deceleration = 0.85) {
        super();
        this.rate = rate;
        this.deceleration = deceleration;
    }
}

// Visual components
export class Sprite extends Component {
    constructor(width, height, color = '#ffffff') {
        super();
        this.width = width;
        this.height = height;
        this.color = color;
        this.visible = true;
    }
}

export class Animation extends Component {
    constructor() {
        super();
        this.currentFrame = 0;
        this.frameTime = 0;
        this.frameRate = 60; // FPS
        this.animations = new Map();
        this.currentAnimation = null;
    }
    
    addAnimation(name, frames, duration) {
        this.animations.set(name, { frames, duration });
    }
    
    play(name) {
        if (this.animations.has(name)) {
            this.currentAnimation = name;
            this.currentFrame = 0;
            this.frameTime = 0;
        }
    }
}

// Physics components
export class RigidBody extends Component {
    constructor(mass = 1, friction = 0.98) {
        super();
        this.mass = mass;
        this.friction = friction;
        this.forces = [];
    }
    
    addForce(x, y) {
        this.forces.push({ x, y });
    }
    
    clearForces() {
        this.forces.length = 0;
    }
}

export class Collider extends Component {
    constructor(width, height, offsetX = 0, offsetY = 0) {
        super();
        this.width = width;
        this.height = height;
        this.offsetX = offsetX;
        this.offsetY = offsetY;
        this.isTrigger = false;
        this.collisionMask = 0xFFFFFFFF; // What this can collide with
        this.collisionLayer = 1; // What layer this is on
    }
}

// Game-specific components
export class PlayerController extends Component {
    constructor() {
        super();
        this.maxSpeed = 5;
        this.thrusterIntensity = 0;
        this.muzzleFlashTime = 0;
        this.showMuzzleFlash = false;
    }
}

export class EnemyAI extends Component {
    constructor(type = 'enemy') {
        super();
        this.type = type; // 'enemy' or 'spy'
        this.speed = 2;
        this.zigzagDirection = Math.random() > 0.5 ? 1 : -1;
        this.zigzagSpeed = 1.5;
        this.zigzagAmplitude = 60;
        this.centerX = 0;
        this.zigzagTimer = 0;
        this.zigzagFrequency = 0.003;
        this.pulseTimer = Math.random() * Math.PI * 2;
    }
}

export class Projectile extends Component {
    constructor(speed = 8, direction = { x: 0, y: -1 }) {
        super();
        this.speed = speed;
        this.direction = direction;
        this.damage = 1;
        this.piercing = false;
    }
}

export class Health extends Component {
    constructor(maxHealth = 1) {
        super();
        this.maxHealth = maxHealth;
        this.currentHealth = maxHealth;
        this.invulnerable = false;
        this.invulnerabilityTime = 0;
    }
    
    takeDamage(amount) {
        if (!this.invulnerable) {
            this.currentHealth = Math.max(0, this.currentHealth - amount);
            return true;
        }
        return false;
    }
    
    heal(amount) {
        this.currentHealth = Math.min(this.maxHealth, this.currentHealth + amount);
    }
    
    isDead() {
        return this.currentHealth <= 0;
    }
}

export class Energy extends Component {
    constructor(maxEnergy = 100) {
        super();
        this.maxEnergy = maxEnergy;
        this.currentEnergy = maxEnergy;
        this.regenRate = 0.5; // Energy per second
        this.consumptionRate = 1;
    }
    
    consume(amount) {
        if (this.currentEnergy >= amount) {
            this.currentEnergy -= amount;
            return true;
        }
        return false;
    }
    
    restore(amount) {
        this.currentEnergy = Math.min(this.maxEnergy, this.currentEnergy + amount);
    }
    
    getPercentage() {
        return (this.currentEnergy / this.maxEnergy) * 100;
    }
    
    isEmpty() {
        return this.currentEnergy <= 0;
    }
    
    isCritical() {
        return this.currentEnergy < (this.maxEnergy * 0.2);
    }
}

export class Lifetime extends Component {
    constructor(duration = 5000) {
        super();
        this.duration = duration; // milliseconds
        this.elapsed = 0;
        this.destroyOnExpire = true;
    }
    
    update(deltaTime) {
        this.elapsed += deltaTime;
        return this.elapsed >= this.duration;
    }
}

export class Score extends Component {
    constructor(value = 0) {
        super();
        this.value = value;
        this.multiplier = 1;
    }
}

export class AudioSource extends Component {
    constructor() {
        super();
        this.sounds = new Map();
        this.volume = 1.0;
        this.pitch = 1.0;
        this.spatial = false;
        this.range = 100;
    }
    
    addSound(name, soundId) {
        this.sounds.set(name, soundId);
    }
}

export class ParticleEmitter extends Component {
    constructor() {
        super();
        this.particles = [];
        this.emissionRate = 10; // particles per second
        this.maxParticles = 100;
        this.emissionTimer = 0;
        this.active = true;
    }
}

// Tag components (no data, just markers)
export class Player extends Component {}
export class Enemy extends Component {}
export class Bullet extends Component {}
export class Rock extends Component {}
export class PowerUp extends Component {}
export class UI extends Component {}
export class Background extends Component {}