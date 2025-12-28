// EnvironmentalAudioManager - Manages ambient sounds and spatial audio for environments
// Handles environment-specific audio layers, reverb effects, and dynamic audio mixing

export class EnvironmentalAudioManager {
    constructor(audioSystem, musicManager) {
        this.audioSystem = audioSystem;
        this.musicManager = musicManager;
        
        // Current audio state
        this.currentEnvironment = null;
        this.currentAmbientSound = null;
        this.currentMusicTrack = null;
        
        // Audio layers for environmental sounds
        this.audioLayers = {
            ambient: null,      // Base ambient sound (hum, wind, etc.)
            atmospheric: null,  // Atmospheric effects (distant sounds)
            dynamic: null       // Dynamic effects (storms, collisions)
        };
        
        // Audio nodes for spatial effects
        this.audioNodes = {
            reverbNode: null,
            filterNode: null,
            pannerNode: null,
            gainNode: null
        };
        
        // Environment audio configurations
        this.environmentAudioConfigs = this.initializeAudioConfigs();
        
        // Audio mixing settings
        this.mixingSettings = {
            ambientVolume: 0.4,
            atmosphericVolume: 0.3,
            dynamicVolume: 0.5,
            masterEnvironmentalVolume: 0.7
        };
        
        // Transition state
        this.isTransitioning = false;
        this.transitionDuration = 3000; // 3 seconds
        this.transitionStartTime = 0;
        
        console.log('🔊 EnvironmentalAudioManager initialized');
    }
    
    /**
     * Initialize audio configurations for each environment
     */
    initializeAudioConfigs() {
        return {
            deep_space: {
                ambient: {
                    soundId: 'deep_space_hum',
                    volume: 0.3,
                    loop: true,
                    fadeTime: 2000
                },
                atmospheric: {
                    soundId: 'distant_stars',
                    volume: 0.2,
                    loop: true,
                    fadeTime: 3000
                },
                reverb: {
                    roomSize: 0.9,
                    decay: 4.0,
                    wetness: 0.3,
                    dryness: 0.7
                },
                filter: {
                    type: 'lowpass',
                    frequency: 8000,
                    Q: 1.0
                }
            },
            
            asteroid_field: {
                ambient: {
                    soundId: 'asteroid_rumble',
                    volume: 0.4,
                    loop: true,
                    fadeTime: 2000
                },
                atmospheric: {
                    soundId: 'distant_impacts',
                    volume: 0.3,
                    loop: true,
                    fadeTime: 2500
                },
                dynamic: {
                    soundId: 'asteroid_collisions',
                    volume: 0.2,
                    loop: true,
                    fadeTime: 1500
                },
                reverb: {
                    roomSize: 0.6,
                    decay: 2.5,
                    wetness: 0.4,
                    dryness: 0.6
                },
                filter: {
                    type: 'bandpass',
                    frequency: 2000,
                    Q: 2.0
                }
            },
            
            nebula: {
                ambient: {
                    soundId: 'nebula_winds',
                    volume: 0.5,
                    loop: true,
                    fadeTime: 2500
                },
                atmospheric: {
                    soundId: 'cosmic_whispers',
                    volume: 0.4,
                    loop: true,
                    fadeTime: 3000
                },
                dynamic: {
                    soundId: 'energy_fluctuations',
                    volume: 0.3,
                    loop: true,
                    fadeTime: 2000
                },
                reverb: {
                    roomSize: 0.8,
                    decay: 5.0,
                    wetness: 0.6,
                    dryness: 0.4
                },
                filter: {
                    type: 'highpass',
                    frequency: 200,
                    Q: 0.7
                }
            },
            
            deep_space_2: {
                ambient: {
                    soundId: 'void_resonance',
                    volume: 0.35,
                    loop: true,
                    fadeTime: 2200
                },
                atmospheric: {
                    soundId: 'cosmic_radiation',
                    volume: 0.25,
                    loop: true,
                    fadeTime: 2800
                },
                reverb: {
                    roomSize: 0.95,
                    decay: 4.5,
                    wetness: 0.25,
                    dryness: 0.75
                },
                filter: {
                    type: 'lowpass',
                    frequency: 6000,
                    Q: 1.2
                }
            }
        };
    }
    
    /**
     * Initialize audio nodes for spatial effects
     */
    async initializeAudioNodes() {
        if (!this.audioSystem.isInitialized || !this.audioSystem.audioContext) {
            console.warn('⚠️ Audio system not initialized, skipping audio nodes setup');
            return;
        }
        
        try {
            const ctx = this.audioSystem.audioContext;
            
            // Create reverb node (convolver)
            this.audioNodes.reverbNode = ctx.createConvolver();
            
            // Create filter node
            this.audioNodes.filterNode = ctx.createBiquadFilter();
            
            // Create panner node for spatial audio
            this.audioNodes.pannerNode = ctx.createPanner();
            this.audioNodes.pannerNode.panningModel = 'HRTF';
            this.audioNodes.pannerNode.distanceModel = 'inverse';
            
            // Create gain node for volume control
            this.audioNodes.gainNode = ctx.createGain();
            this.audioNodes.gainNode.gain.value = this.mixingSettings.masterEnvironmentalVolume;
            
            // Connect nodes: source -> filter -> reverb -> panner -> gain -> destination
            this.audioNodes.filterNode.connect(this.audioNodes.reverbNode);
            this.audioNodes.reverbNode.connect(this.audioNodes.pannerNode);
            this.audioNodes.pannerNode.connect(this.audioNodes.gainNode);
            this.audioNodes.gainNode.connect(ctx.destination);
            
            console.log('🎛️ Environmental audio nodes initialized');
        } catch (error) {
            console.error('❌ Failed to initialize audio nodes:', error);
        }
    }
    
    /**
     * Set current environment and transition audio
     */
    async setEnvironment(environmentId, immediate = false) {
        const config = this.environmentAudioConfigs[environmentId];
        if (!config) {
            console.warn(`⚠️ No audio config found for environment: ${environmentId}`);
            return;
        }
        
        console.log(`🔊 Transitioning environmental audio to: ${environmentId}`);
        
        if (immediate) {
            await this.applyEnvironmentAudio(config);
        } else {
            await this.transitionToEnvironment(config);
        }
        
        this.currentEnvironment = environmentId;
    }
    
    /**
     * Transition to new environment audio
     */
    async transitionToEnvironment(newConfig) {
        this.isTransitioning = true;
        this.transitionStartTime = Date.now();
        
        // Fade out current audio layers
        await this.fadeOutCurrentAudio();
        
        // Apply new environment audio
        await this.applyEnvironmentAudio(newConfig);
        
        // Fade in new audio layers
        await this.fadeInNewAudio(newConfig);
        
        this.isTransitioning = false;
    }
    
    /**
     * Apply environment audio configuration
     */
    async applyEnvironmentAudio(config) {
        try {
            // Initialize audio nodes if not already done
            if (!this.audioNodes.gainNode) {
                await this.initializeAudioNodes();
            }
            
            // Apply reverb settings
            if (config.reverb && this.audioNodes.reverbNode) {
                await this.applyReverbSettings(config.reverb);
            }
            
            // Apply filter settings
            if (config.filter && this.audioNodes.filterNode) {
                this.applyFilterSettings(config.filter);
            }
            
            // Start ambient layer
            if (config.ambient) {
                await this.startAudioLayer('ambient', config.ambient);
            }
            
            // Start atmospheric layer
            if (config.atmospheric) {
                await this.startAudioLayer('atmospheric', config.atmospheric);
            }
            
            // Start dynamic layer
            if (config.dynamic) {
                await this.startAudioLayer('dynamic', config.dynamic);
            }
            
        } catch (error) {
            console.error('❌ Failed to apply environment audio:', error);
        }
    }
    
    /**
     * Apply reverb settings using impulse response
     */
    async applyReverbSettings(reverbConfig) {
        if (!this.audioNodes.reverbNode || !this.audioSystem.audioContext) return;
        
        try {
            // Create impulse response for reverb
            const ctx = this.audioSystem.audioContext;
            const sampleRate = ctx.sampleRate;
            const length = sampleRate * reverbConfig.decay;
            const impulse = ctx.createBuffer(2, length, sampleRate);
            
            // Generate impulse response
            for (let channel = 0; channel < 2; channel++) {
                const channelData = impulse.getChannelData(channel);
                for (let i = 0; i < length; i++) {
                    const decay = Math.pow(1 - i / length, reverbConfig.decay);
                    channelData[i] = (Math.random() * 2 - 1) * decay;
                }
            }
            
            this.audioNodes.reverbNode.buffer = impulse;
            
            // Set wet/dry mix (this would need additional nodes in a full implementation)
            console.log(`🎛️ Applied reverb: room=${reverbConfig.roomSize}, decay=${reverbConfig.decay}`);
            
        } catch (error) {
            console.error('❌ Failed to apply reverb settings:', error);
        }
    }
    
    /**
     * Apply filter settings
     */
    applyFilterSettings(filterConfig) {
        if (!this.audioNodes.filterNode) return;
        
        try {
            this.audioNodes.filterNode.type = filterConfig.type;
            this.audioNodes.filterNode.frequency.value = filterConfig.frequency;
            this.audioNodes.filterNode.Q.value = filterConfig.Q;
            
            console.log(`🎛️ Applied filter: ${filterConfig.type} @ ${filterConfig.frequency}Hz`);
        } catch (error) {
            console.error('❌ Failed to apply filter settings:', error);
        }
    }
    
    /**
     * Start an audio layer
     */
    async startAudioLayer(layerName, layerConfig) {
        try {
            // Stop existing layer
            if (this.audioLayers[layerName]) {
                await this.stopAudioLayer(layerName);
            }
            
            // Check if sound exists in audio system
            if (!this.audioSystem.hasAsset(layerConfig.soundId)) {
                console.warn(`⚠️ Audio asset not found: ${layerConfig.soundId}`);
                return;
            }
            
            // Start new layer (placeholder - would need actual audio implementation)
            console.log(`🔊 Starting ${layerName} layer: ${layerConfig.soundId} @ ${layerConfig.volume}`);
            
            // Store layer reference
            this.audioLayers[layerName] = {
                soundId: layerConfig.soundId,
                volume: layerConfig.volume,
                isPlaying: true
            };
            
        } catch (error) {
            console.error(`❌ Failed to start ${layerName} layer:`, error);
        }
    }
    
    /**
     * Stop an audio layer
     */
    async stopAudioLayer(layerName) {
        if (!this.audioLayers[layerName]) return;
        
        try {
            console.log(`🔇 Stopping ${layerName} layer`);
            
            // Fade out and stop (placeholder implementation)
            this.audioLayers[layerName].isPlaying = false;
            this.audioLayers[layerName] = null;
            
        } catch (error) {
            console.error(`❌ Failed to stop ${layerName} layer:`, error);
        }
    }
    
    /**
     * Fade out current audio
     */
    async fadeOutCurrentAudio() {
        const fadePromises = [];
        
        Object.keys(this.audioLayers).forEach(layerName => {
            if (this.audioLayers[layerName]) {
                fadePromises.push(this.fadeOutLayer(layerName));
            }
        });
        
        await Promise.all(fadePromises);
    }
    
    /**
     * Fade in new audio
     */
    async fadeInNewAudio(config) {
        // Fade in layers with staggered timing for smooth transition
        const layers = ['ambient', 'atmospheric', 'dynamic'];
        
        for (let i = 0; i < layers.length; i++) {
            const layerName = layers[i];
            if (config[layerName]) {
                // Stagger the fade-ins
                setTimeout(() => {
                    this.fadeInLayer(layerName);
                }, i * 500);
            }
        }
    }
    
    /**
     * Fade out a specific layer
     */
    async fadeOutLayer(layerName) {
        return new Promise(resolve => {
            console.log(`🔉 Fading out ${layerName} layer`);
            // Placeholder fade implementation
            setTimeout(resolve, 1000);
        });
    }
    
    /**
     * Fade in a specific layer
     */
    async fadeInLayer(layerName) {
        return new Promise(resolve => {
            console.log(`🔊 Fading in ${layerName} layer`);
            // Placeholder fade implementation
            setTimeout(resolve, 1000);
        });
    }
    
    /**
     * Update environmental audio (called each frame)
     */
    update(deltaTime, gameState) {
        // Update dynamic audio effects based on game state
        this.updateDynamicEffects(gameState);
        
        // Update spatial audio positioning
        this.updateSpatialAudio(gameState);
        
        // Handle transition progress
        if (this.isTransitioning) {
            this.updateTransition();
        }
    }
    
    /**
     * Update dynamic audio effects
     */
    updateDynamicEffects(gameState) {
        // Adjust dynamic layer volume based on enemy density
        const enemyCount = gameState.enemyCount || 0;
        const dynamicIntensity = Math.min(1.0, enemyCount / 10); // Max intensity at 10 enemies
        
        if (this.audioLayers.dynamic && this.audioLayers.dynamic.isPlaying) {
            // Adjust volume based on intensity (placeholder)
            const targetVolume = this.mixingSettings.dynamicVolume * dynamicIntensity;
            // Would implement actual volume adjustment here
        }
    }
    
    /**
     * Update spatial audio positioning
     */
    updateSpatialAudio(gameState) {
        if (!this.audioNodes.pannerNode) return;
        
        // Position audio based on player position or game events
        // This is a placeholder - would implement actual 3D positioning
        try {
            const x = 0; // Player X position
            const y = 0; // Player Y position  
            const z = -1; // Distance from listener
            
            this.audioNodes.pannerNode.setPosition(x, y, z);
        } catch (error) {
            // Ignore positioning errors for now
        }
    }
    
    /**
     * Update transition progress
     */
    updateTransition() {
        const elapsed = Date.now() - this.transitionStartTime;
        const progress = Math.min(1.0, elapsed / this.transitionDuration);
        
        if (progress >= 1.0) {
            this.isTransitioning = false;
        }
    }
    
    /**
     * Set master environmental volume
     */
    setMasterVolume(volume) {
        this.mixingSettings.masterEnvironmentalVolume = Math.max(0, Math.min(1, volume));
        
        if (this.audioNodes.gainNode) {
            this.audioNodes.gainNode.gain.value = this.mixingSettings.masterEnvironmentalVolume;
        }
        
        console.log(`🔊 Environmental master volume set to: ${volume.toFixed(2)}`);
    }
    
    /**
     * Set layer volume
     */
    setLayerVolume(layerName, volume) {
        if (this.mixingSettings[layerName + 'Volume'] !== undefined) {
            this.mixingSettings[layerName + 'Volume'] = Math.max(0, Math.min(1, volume));
            console.log(`🔊 ${layerName} volume set to: ${volume.toFixed(2)}`);
        }
    }
    
    /**
     * Get current audio status
     */
    getStatus() {
        return {
            currentEnvironment: this.currentEnvironment,
            isTransitioning: this.isTransitioning,
            activeLayers: Object.keys(this.audioLayers).filter(key => 
                this.audioLayers[key] && this.audioLayers[key].isPlaying
            ),
            masterVolume: this.mixingSettings.masterEnvironmentalVolume,
            nodesInitialized: !!this.audioNodes.gainNode
        };
    }
    
    /**
     * Stop all environmental audio
     */
    async stopAll() {
        console.log('🔇 Stopping all environmental audio');
        
        const stopPromises = Object.keys(this.audioLayers).map(layerName => 
            this.stopAudioLayer(layerName)
        );
        
        await Promise.all(stopPromises);
        
        this.currentEnvironment = null;
        this.isTransitioning = false;
    }
    
    /**
     * Reset environmental audio system
     */
    reset() {
        this.stopAll();
        this.currentAmbientSound = null;
        this.currentMusicTrack = null;
        console.log('🔄 EnvironmentalAudioManager reset');
    }
    
    /**
     * Clean up resources
     */
    dispose() {
        this.stopAll();
        
        // Disconnect audio nodes
        Object.values(this.audioNodes).forEach(node => {
            if (node && node.disconnect) {
                try {
                    node.disconnect();
                } catch (error) {
                    // Ignore disconnect errors
                }
            }
        });
        
        console.log('🧹 EnvironmentalAudioManager disposed');
    }
}