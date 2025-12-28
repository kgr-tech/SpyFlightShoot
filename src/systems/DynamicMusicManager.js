// DynamicMusicManager - Manages intensity-based music selection and transitions
// Handles environment-specific music tracks and combat music escalation

export class DynamicMusicManager {
    constructor(musicManager, audioSystem) {
        this.musicManager = musicManager;
        this.audioSystem = audioSystem;
        
        // Current state
        this.currentTrack = null;
        this.currentEnvironment = null;
        this.currentIntensity = 0.0; // 0.0 = calm, 1.0 = maximum intensity
        
        // Music intensity thresholds
        this.intensityThresholds = {
            calm: 0.0,      // No enemies, peaceful exploration
            ambient: 0.2,   // Few enemies, normal gameplay
            tension: 0.5,   // Moderate enemy density
            combat: 0.7,    // High enemy density
            crisis: 0.9     // Critical situation, low energy + many enemies
        };
        
        // Environment-specific music configurations
        this.environmentMusicConfigs = this.initializeMusicConfigs();
        
        // Transition settings
        this.transitionDuration = 3000; // 3 seconds
        this.intensityUpdateInterval = 1000; // Check intensity every second
        this.lastIntensityUpdate = 0;
        
        // Music state tracking
        this.isTransitioning = false;
        this.queuedTrack = null;
        
        console.log('🎵 DynamicMusicManager initialized');
    }
    
    /**
     * Initialize music configurations for each environment and intensity level
     */
    initializeMusicConfigs() {
        return {
            deep_space: {
                calm: { track: 'ambient_space', volume: 0.4, fadeTime: 3000 },
                ambient: { track: 'ambient_space', volume: 0.5, fadeTime: 2500 },
                tension: { track: 'tension_music', volume: 0.6, fadeTime: 2000 },
                combat: { track: 'combat_music', volume: 0.7, fadeTime: 1500 },
                crisis: { track: 'combat_music', volume: 0.8, fadeTime: 1000 }
            },
            asteroid_field: {
                calm: { track: 'tension_music', volume: 0.4, fadeTime: 3000 },
                ambient: { track: 'tension_music', volume: 0.5, fadeTime: 2500 },
                tension: { track: 'combat_music', volume: 0.6, fadeTime: 2000 },
                combat: { track: 'combat_music', volume: 0.7, fadeTime: 1500 },
                crisis: { track: 'combat_music', volume: 0.9, fadeTime: 1000 }
            },
            nebula: {
                calm: { track: 'ethereal_music', volume: 0.4, fadeTime: 4000 },
                ambient: { track: 'ethereal_music', volume: 0.5, fadeTime: 3000 },
                tension: { track: 'ethereal_music', volume: 0.6, fadeTime: 2500 },
                combat: { track: 'combat_music', volume: 0.7, fadeTime: 2000 },
                crisis: { track: 'combat_music', volume: 0.8, fadeTime: 1500 }
            },
            deep_space_2: {
                calm: { track: 'ambient_space', volume: 0.4, fadeTime: 3000 },
                ambient: { track: 'ambient_space', volume: 0.5, fadeTime: 2500 },
                tension: { track: 'tension_music', volume: 0.6, fadeTime: 2000 },
                combat: { track: 'combat_music', volume: 0.7, fadeTime: 1500 },
                crisis: { track: 'combat_music', volume: 0.8, fadeTime: 1000 }
            }
        };
    }
    
    /**
     * Update dynamic music based on game state
     */
    update(deltaTime, gameState) {
        const currentTime = Date.now();
        
        // Update intensity periodically
        if (currentTime - this.lastIntensityUpdate >= this.intensityUpdateInterval) {
            this.updateIntensity(gameState);
            this.lastIntensityUpdate = currentTime;
        }
        
        // Check if music needs to change
        this.evaluateMusicChange();
    }
    
    /**
     * Calculate current game intensity based on various factors
     */
    updateIntensity(gameState) {
        let intensity = 0.0;
        
        // Factor 1: Enemy density (0.0 - 0.4)
        const enemyCount = gameState.enemyCount || 0;
        const enemyIntensity = Math.min(0.4, enemyCount / 15); // Max at 15 enemies
        intensity += enemyIntensity;
        
        // Factor 2: Energy level (0.0 - 0.3, inverted - low energy = high intensity)
        const energyPercentage = gameState.energyPercentage || 1.0;
        const energyIntensity = Math.max(0, 0.3 * (1.0 - energyPercentage));
        intensity += energyIntensity;
        
        // Factor 3: Recent combat activity (0.0 - 0.2)
        const recentShots = gameState.recentShots || 0;
        const combatIntensity = Math.min(0.2, recentShots / 10); // Max at 10 recent shots
        intensity += combatIntensity;
        
        // Factor 4: Scanner usage (0.0 - 0.1)
        const scannerActive = gameState.scannerActive || false;
        const scannerIntensity = scannerActive ? 0.1 : 0.0;
        intensity += scannerIntensity;
        
        // Smooth intensity changes
        const targetIntensity = Math.min(1.0, intensity);
        this.currentIntensity = this.lerp(this.currentIntensity, targetIntensity, 0.1);
        
        console.log(`🎵 Music intensity: ${this.currentIntensity.toFixed(2)} (enemies: ${enemyCount}, energy: ${(energyPercentage * 100).toFixed(0)}%)`);
    }
    
    /**
     * Determine intensity level from current intensity value
     */
    getIntensityLevel() {
        if (this.currentIntensity >= this.intensityThresholds.crisis) return 'crisis';
        if (this.currentIntensity >= this.intensityThresholds.combat) return 'combat';
        if (this.currentIntensity >= this.intensityThresholds.tension) return 'tension';
        if (this.currentIntensity >= this.intensityThresholds.ambient) return 'ambient';
        return 'calm';
    }
    
    /**
     * Set current environment
     */
    setEnvironment(environmentId) {
        if (this.currentEnvironment !== environmentId) {
            console.log(`🎵 Music environment changed to: ${environmentId}`);
            this.currentEnvironment = environmentId;
            
            // Force music re-evaluation
            this.evaluateMusicChange(true);
        }
    }
    
    /**
     * Evaluate if music should change based on current state
     */
    evaluateMusicChange(forceChange = false) {
        if (!this.currentEnvironment || this.isTransitioning) return;
        
        const intensityLevel = this.getIntensityLevel();
        const config = this.environmentMusicConfigs[this.currentEnvironment];
        
        if (!config || !config[intensityLevel]) {
            console.warn(`⚠️ No music config for ${this.currentEnvironment}/${intensityLevel}`);
            return;
        }
        
        const targetTrack = config[intensityLevel].track;
        
        // Check if we need to change tracks
        if (forceChange || this.currentTrack !== targetTrack) {
            this.transitionToTrack(targetTrack, config[intensityLevel]);
        }
    }
    
    /**
     * Transition to a new music track
     */
    async transitionToTrack(trackId, config) {
        if (this.isTransitioning) {
            // Queue the track change
            this.queuedTrack = { trackId, config };
            return;
        }
        
        console.log(`🎵 Transitioning to track: ${trackId} (${this.getIntensityLevel()})`);
        
        this.isTransitioning = true;
        
        try {
            // Use MusicManager to handle the actual transition
            await this.musicManager.playMusic(trackId, {
                fadeTime: config.fadeTime,
                loop: true,
                volume: config.volume
            });
            
            this.currentTrack = trackId;
            
        } catch (error) {
            console.error('❌ Failed to transition music:', error);
        } finally {
            this.isTransitioning = false;
            
            // Process queued track if any
            if (this.queuedTrack) {
                const queued = this.queuedTrack;
                this.queuedTrack = null;
                
                // Small delay before processing queued track
                setTimeout(() => {
                    this.transitionToTrack(queued.trackId, queued.config);
                }, 500);
            }
        }
    }
    
    /**
     * Handle special game events that affect music
     */
    handleGameEvent(eventType, eventData = {}) {
        switch (eventType) {
            case 'game_start':
                this.handleGameStart();
                break;
            case 'game_over':
                this.handleGameOver();
                break;
            case 'achievement':
                this.handleAchievement(eventData);
                break;
            case 'boss_encounter':
                this.handleBossEncounter();
                break;
            case 'energy_critical':
                this.handleEnergyCritical();
                break;
        }
    }
    
    /**
     * Handle game start event
     */
    handleGameStart() {
        console.log('🎵 Game started - initializing music');
        
        // Start with calm ambient music
        this.currentIntensity = 0.0;
        
        if (this.currentEnvironment) {
            this.evaluateMusicChange(true);
        }
    }
    
    /**
     * Handle game over event
     */
    async handleGameOver() {
        console.log('🎵 Game over - playing defeat music');
        
        try {
            await this.musicManager.playMusic('defeat_music', {
                fadeTime: 1000,
                loop: false,
                volume: 0.7
            });
            
            this.currentTrack = 'defeat_music';
        } catch (error) {
            console.error('❌ Failed to play game over music:', error);
        }
    }
    
    /**
     * Handle achievement event
     */
    handleAchievement(eventData) {
        // Temporarily boost intensity for dramatic effect
        const originalIntensity = this.currentIntensity;
        this.currentIntensity = Math.min(1.0, this.currentIntensity + 0.3);
        
        // Restore original intensity after a delay
        setTimeout(() => {
            this.currentIntensity = originalIntensity;
        }, 3000);
    }
    
    /**
     * Handle boss encounter event
     */
    handleBossEncounter() {
        // Force maximum intensity
        this.currentIntensity = 1.0;
        this.evaluateMusicChange(true);
    }
    
    /**
     * Handle energy critical event
     */
    handleEnergyCritical() {
        // Boost intensity due to critical situation
        this.currentIntensity = Math.max(this.currentIntensity, 0.8);
    }
    
    /**
     * Set music volume
     */
    setVolume(volume) {
        if (this.musicManager) {
            this.musicManager.setVolume(volume);
        }
    }
    
    /**
     * Linear interpolation helper
     */
    lerp(a, b, t) {
        return a + (b - a) * t;
    }
    
    /**
     * Get current music status
     */
    getStatus() {
        return {
            currentTrack: this.currentTrack,
            currentEnvironment: this.currentEnvironment,
            currentIntensity: this.currentIntensity,
            intensityLevel: this.getIntensityLevel(),
            isTransitioning: this.isTransitioning,
            hasQueuedTrack: !!this.queuedTrack
        };
    }
    
    /**
     * Stop all music
     */
    stop() {
        if (this.musicManager) {
            this.musicManager.stopAll();
        }
        
        this.currentTrack = null;
        this.isTransitioning = false;
        this.queuedTrack = null;
    }
    
    /**
     * Reset dynamic music system
     */
    reset() {
        this.stop();
        this.currentIntensity = 0.0;
        this.currentEnvironment = null;
        this.lastIntensityUpdate = 0;
        
        console.log('🔄 DynamicMusicManager reset');
    }
    
    /**
     * Clean up resources
     */
    dispose() {
        this.stop();
        console.log('🧹 DynamicMusicManager disposed');
    }
}