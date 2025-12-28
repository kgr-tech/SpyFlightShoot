// EnvironmentManager - Manages different space environments and their properties
// Handles environment definitions, transitions, and gameplay modifiers

export class EnvironmentManager {
    constructor() {
        // Current environment state
        this.currentEnvironment = 'deep_space';
        this.environmentStartTime = Date.now();
        this.environmentDuration = 30000; // 30 seconds per environment
        
        // Environment definitions
        this.environments = this.initializeEnvironments();
        
        // Environment progression
        this.environmentSequence = ['deep_space', 'asteroid_field', 'nebula', 'deep_space'];
        this.currentSequenceIndex = 0;
        this.randomizeSequence = true;
        
        console.log('🌌 EnvironmentManager initialized');
    }
    
    /**
     * Initialize all environment definitions
     */
    initializeEnvironments() {
        return {
            deep_space: {
                name: 'Deep Space',
                description: 'The vast emptiness of space with distant stars',
                
                // Gameplay modifiers
                spawnModifiers: {
                    rocks: 0.3,
                    enemies: 1.0,
                    spies: 1.0
                },
                
                // Visual properties
                backgroundColor: '#000011',
                starDensity: 200,
                starBrightness: 0.9,
                
                // Visual effects
                effects: {
                    nebula: false,
                    asteroidDust: false,
                    energyStorms: false,
                    distantGalaxies: true,
                    floatingDebris: false,
                    colorfulGas: false,
                    cosmicRays: false
                },
                
                // Enhanced visual properties
                particleDensity: {
                    stars: 200,
                    dust: 0,
                    debris: 0,
                    energy: 0,
                    gas: 0
                },
                
                // Lighting and atmosphere
                ambientLight: 0.1,
                contrast: 1.0,
                saturation: 1.0,
                
                // Audio properties
                ambientSound: 'deep_space_hum',
                musicTrack: 'ambient_space',
                reverbSettings: {
                    roomSize: 0.9,
                    decay: 3.0,
                    wetness: 0.2
                }
            },
            
            asteroid_field: {
                name: 'Asteroid Field',
                description: 'A dangerous field of floating rocks and debris',
                
                // Gameplay modifiers
                spawnModifiers: {
                    rocks: 2.5,
                    enemies: 0.8,
                    spies: 0.7
                },
                
                // Visual properties
                backgroundColor: '#1a0f00',
                starDensity: 120,
                starBrightness: 0.6,
                
                // Visual effects
                effects: {
                    nebula: false,
                    asteroidDust: true,
                    energyStorms: false,
                    distantGalaxies: false,
                    floatingDebris: true,
                    colorfulGas: false,
                    cosmicRays: false
                },
                
                // Enhanced visual properties
                particleDensity: {
                    stars: 120,
                    dust: 80,
                    debris: 40,
                    energy: 0,
                    gas: 0
                },
                
                // Lighting and atmosphere
                ambientLight: 0.15,
                contrast: 1.2,
                saturation: 0.9,
                
                // Audio properties
                ambientSound: 'asteroid_collisions',
                musicTrack: 'tension_music',
                reverbSettings: {
                    roomSize: 0.6,
                    decay: 1.8,
                    wetness: 0.4
                }
            },
            
            nebula: {
                name: 'Nebula',
                description: 'A colorful cloud of cosmic gas and energy',
                
                // Gameplay modifiers
                spawnModifiers: {
                    rocks: 0.5,
                    enemies: 1.2,
                    spies: 1.5
                },
                
                // Visual properties
                backgroundColor: '#2a1a3a',
                starDensity: 250,
                starBrightness: 1.3,
                
                // Visual effects
                effects: {
                    nebula: true,
                    asteroidDust: false,
                    energyStorms: true,
                    distantGalaxies: false,
                    floatingDebris: false,
                    colorfulGas: true,
                    cosmicRays: false
                },
                
                // Enhanced visual properties
                particleDensity: {
                    stars: 250,
                    dust: 0,
                    debris: 0,
                    energy: 25,
                    gas: 15
                },
                
                // Special properties
                visibilityReduction: 0.7,
                scannerEfficiency: 0.8,
                
                // Lighting and atmosphere
                ambientLight: 0.25,
                contrast: 0.8,
                saturation: 1.4,
                
                // Audio properties
                ambientSound: 'nebula_winds',
                musicTrack: 'ethereal_music',
                reverbSettings: {
                    roomSize: 0.8,
                    decay: 4.0,
                    wetness: 0.6
                }
            },
            
            deep_space_2: {
                name: 'Deep Space Variant',
                description: 'A different region of deep space with unique properties',
                
                // Gameplay modifiers
                spawnModifiers: {
                    rocks: 0.4,
                    enemies: 1.1,
                    spies: 0.9
                },
                
                // Visual properties
                backgroundColor: '#001122',
                starDensity: 180,
                starBrightness: 0.9,
                
                // Visual effects
                effects: {
                    nebula: false,
                    asteroidDust: false,
                    energyStorms: false,
                    distantGalaxies: true,
                    floatingDebris: false,
                    colorfulGas: false,
                    cosmicRays: true
                },
                
                // Enhanced visual properties
                particleDensity: {
                    stars: 180,
                    dust: 0,
                    debris: 0,
                    energy: 0,
                    gas: 0
                },
                
                // Lighting and atmosphere
                ambientLight: 0.12,
                contrast: 1.1,
                saturation: 1.1,
                
                // Audio properties
                ambientSound: 'deep_space_hum',
                musicTrack: 'ambient_space',
                reverbSettings: {
                    roomSize: 0.95,
                    decay: 3.5,
                    wetness: 0.15
                }
            }
        };
    }
    
    /**
     * Get current environment configuration
     */
    getCurrentEnvironment() {
        return this.environments[this.currentEnvironment];
    }
    
    /**
     * Get environment by ID
     */
    getEnvironment(environmentId) {
        return this.environments[environmentId];
    }
    
    /**
     * Set current environment
     */
    setEnvironment(environmentId) {
        if (this.environments[environmentId]) {
            this.currentEnvironment = environmentId;
            this.environmentStartTime = Date.now();
            console.log(`🌌 Environment changed to: ${this.environments[environmentId].name}`);
            return true;
        }
        
        console.warn(`⚠️ Unknown environment: ${environmentId}`);
        return false;
    }
    
    /**
     * Update environment progression
     */
    update(deltaTime, gameTime) {
        const currentTime = Date.now();
        const timeInEnvironment = currentTime - this.environmentStartTime;
        
        // Check if it's time to change environment
        if (timeInEnvironment >= this.environmentDuration) {
            this.progressToNextEnvironment();
        }
    }
    
    /**
     * Progress to the next environment in sequence
     */
    progressToNextEnvironment() {
        if (this.randomizeSequence) {
            // Random environment selection (avoiding immediate repetition)
            const availableEnvironments = Object.keys(this.environments)
                .filter(env => env !== this.currentEnvironment);
            
            const nextEnvironment = availableEnvironments[
                Math.floor(Math.random() * availableEnvironments.length)
            ];
            
            this.setEnvironment(nextEnvironment);
        } else {
            // Sequential progression
            this.currentSequenceIndex = (this.currentSequenceIndex + 1) % this.environmentSequence.length;
            const nextEnvironment = this.environmentSequence[this.currentSequenceIndex];
            this.setEnvironment(nextEnvironment);
        }
    }
    
    /**
     * Get spawn rate modifiers for current environment
     */
    getSpawnModifiers() {
        const env = this.getCurrentEnvironment();
        return env ? env.spawnModifiers : { rocks: 1.0, enemies: 1.0, spies: 1.0 };
    }
    
    /**
     * Get visual properties for current environment
     */
    getVisualProperties() {
        const env = this.getCurrentEnvironment();
        if (!env) return null;
        
        return {
            backgroundColor: env.backgroundColor,
            starDensity: env.starDensity,
            starBrightness: env.starBrightness,
            effects: env.effects,
            ambientLight: env.ambientLight,
            contrast: env.contrast,
            saturation: env.saturation,
            visibilityReduction: env.visibilityReduction || 1.0,
            scannerEfficiency: env.scannerEfficiency || 1.0
        };
    }
    
    /**
     * Get audio properties for current environment
     */
    getAudioProperties() {
        const env = this.getCurrentEnvironment();
        if (!env) return null;
        
        return {
            ambientSound: env.ambientSound,
            musicTrack: env.musicTrack,
            reverbSettings: env.reverbSettings
        };
    }
    
    /**
     * Get environment progress (0.0 to 1.0)
     */
    getEnvironmentProgress() {
        const currentTime = Date.now();
        const timeInEnvironment = currentTime - this.environmentStartTime;
        return Math.min(1.0, timeInEnvironment / this.environmentDuration);
    }
    
    /**
     * Get time remaining in current environment
     */
    getTimeRemaining() {
        const currentTime = Date.now();
        const timeInEnvironment = currentTime - this.environmentStartTime;
        return Math.max(0, this.environmentDuration - timeInEnvironment);
    }
    
    /**
     * Force environment change (for testing or special events)
     */
    forceEnvironmentChange(environmentId) {
        if (environmentId) {
            return this.setEnvironment(environmentId);
        } else {
            this.progressToNextEnvironment();
            return true;
        }
    }
    
    /**
     * Set environment duration
     */
    setEnvironmentDuration(duration) {
        this.environmentDuration = Math.max(5000, duration); // Minimum 5 seconds
    }
    
    /**
     * Enable or disable random environment progression
     */
    setRandomProgression(enabled) {
        this.randomizeSequence = enabled;
    }
    
    /**
     * Get all available environments
     */
    getAllEnvironments() {
        return Object.keys(this.environments).map(id => ({
            id,
            name: this.environments[id].name,
            description: this.environments[id].description
        }));
    }
    
    /**
     * Get environment statistics
     */
    getStats() {
        return {
            currentEnvironment: this.currentEnvironment,
            environmentName: this.getCurrentEnvironment()?.name,
            progress: this.getEnvironmentProgress(),
            timeRemaining: this.getTimeRemaining(),
            totalEnvironments: Object.keys(this.environments).length,
            randomProgression: this.randomizeSequence
        };
    }
    
    /**
     * Reset environment system
     */
    reset() {
        this.currentEnvironment = 'deep_space';
        this.environmentStartTime = Date.now();
        this.currentSequenceIndex = 0;
        console.log('🌌 EnvironmentManager reset');
    }
    
    /**
     * Clean up resources
     */
    dispose() {
        console.log('🧹 EnvironmentManager disposed');
    }
}