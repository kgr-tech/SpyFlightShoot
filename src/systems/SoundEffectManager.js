// SoundEffectManager - Specialized sound effect playback with advanced features
// Handles concurrent limiting, priority system, and sound effect pooling

export class SoundEffectManager {
    constructor(audioSystem) {
        this.audioSystem = audioSystem;
        
        // Sound effect tracking
        this.activeSounds = new Map(); // soundId -> Set of active sources
        this.soundPriorities = new Map(); // soundId -> priority level
        this.soundCooldowns = new Map(); // soundId -> last play time
        
        // Performance settings
        this.maxGlobalConcurrent = 8;
        this.defaultCooldown = 50; // ms between same sound plays
        
        console.log('🔊 SoundEffectManager initialized');
    }
    
    /**
     * Register a sound effect with specific settings
     */
    registerSoundEffect(soundId, config) {
        // Register with audio system
        this.audioSystem.registerAsset(soundId, {
            ...config,
            type: 'sfx'
        });
        
        // Set up sound effect specific tracking
        this.activeSounds.set(soundId, new Set());
        this.soundPriorities.set(soundId, config.priority || 1);
        
        console.log(`📝 Registered sound effect: ${soundId} (priority: ${config.priority || 1})`);
    }
    
    /**
     * Play a sound effect with advanced options
     */
    playSound(soundId, options = {}) {
        if (!this.audioSystem.isInitialized || !this.audioSystem.isEnabled) {
            return null;
        }
        
        // Check cooldown
        if (this.isOnCooldown(soundId)) {
            return null;
        }
        
        // Check concurrent limits
        if (!this.canPlaySound(soundId)) {
            return null;
        }
        
        // Get asset config
        const assetConfig = this.audioSystem.assetManifest.get(soundId);
        if (!assetConfig) {
            console.warn(`⚠️ Sound effect ${soundId} not registered`);
            return null;
        }
        
        // Play the sound
        const source = this.audioSystem.playSound(soundId, options);
        if (!source) {
            return null;
        }
        
        // Track the active sound
        this.activeSounds.get(soundId).add(source);
        this.soundCooldowns.set(soundId, Date.now());
        
        // Set up cleanup when sound ends
        const originalOnEnded = source.onended;
        source.onended = () => {
            this.activeSounds.get(soundId)?.delete(source);
            if (originalOnEnded) {
                originalOnEnded();
            }
        };
        
        return source;
    }
    
    /**
     * Play sound with random pitch variation
     */
    playSoundVaried(soundId, options = {}) {
        const pitchVariation = options.pitchVariation || 0.1;
        const basePitch = options.pitch || 1.0;
        
        // Add random pitch variation
        const randomPitch = basePitch + (Math.random() - 0.5) * pitchVariation * 2;
        
        return this.playSound(soundId, {
            ...options,
            pitch: Math.max(0.5, Math.min(2.0, randomPitch))
        });
    }
    
    /**
     * Play sound with 3D positioning (if supported)
     */
    playSoundPositioned(soundId, x, y, options = {}) {
        // For 2D games, we can simulate positioning with volume and panning
        const canvasWidth = options.canvasWidth || 800;
        const canvasHeight = options.canvasHeight || 600;
        
        // Calculate distance from center for volume
        const centerX = canvasWidth / 2;
        const centerY = canvasHeight / 2;
        const distance = Math.sqrt((x - centerX) ** 2 + (y - centerY) ** 2);
        const maxDistance = Math.sqrt(centerX ** 2 + centerY ** 2);
        
        // Volume falloff based on distance
        const distanceVolume = Math.max(0.1, 1.0 - (distance / maxDistance) * 0.7);
        
        return this.playSound(soundId, {
            ...options,
            volume: (options.volume || 1.0) * distanceVolume
        });
    }
    
    /**
     * Stop all instances of a specific sound
     */
    stopSound(soundId) {
        const activeSources = this.activeSounds.get(soundId);
        if (activeSources) {
            activeSources.forEach(source => {
                try {
                    source.stop();
                } catch (error) {
                    // Source might already be stopped
                }
            });
            activeSources.clear();
        }
    }
    
    /**
     * Stop all active sound effects
     */
    stopAllSounds() {
        this.activeSounds.forEach((sources, soundId) => {
            this.stopSound(soundId);
        });
    }
    
    /**
     * Check if a sound is on cooldown
     */
    isOnCooldown(soundId) {
        const lastPlayTime = this.soundCooldowns.get(soundId);
        if (!lastPlayTime) return false;
        
        const assetConfig = this.audioSystem.assetManifest.get(soundId);
        const cooldown = assetConfig?.cooldown || this.defaultCooldown;
        
        return (Date.now() - lastPlayTime) < cooldown;
    }
    
    /**
     * Check if a sound can be played based on concurrent limits
     */
    canPlaySound(soundId) {
        // Check global concurrent limit
        const totalActiveSounds = Array.from(this.activeSounds.values())
            .reduce((total, sources) => total + sources.size, 0);
        
        if (totalActiveSounds >= this.maxGlobalConcurrent) {
            // Try to stop lowest priority sounds to make room
            if (!this.makeRoomForSound(soundId)) {
                return false;
            }
        }
        
        // Check per-sound concurrent limit
        const assetConfig = this.audioSystem.assetManifest.get(soundId);
        const maxConcurrent = assetConfig?.maxConcurrent || 3;
        const currentCount = this.activeSounds.get(soundId)?.size || 0;
        
        return currentCount < maxConcurrent;
    }
    
    /**
     * Make room for a higher priority sound by stopping lower priority ones
     */
    makeRoomForSound(soundId) {
        const targetPriority = this.soundPriorities.get(soundId) || 1;
        
        // Find lower priority sounds to stop
        const soundsToStop = [];
        
        this.activeSounds.forEach((sources, activeSoundId) => {
            const priority = this.soundPriorities.get(activeSoundId) || 1;
            if (priority < targetPriority && sources.size > 0) {
                soundsToStop.push(activeSoundId);
            }
        });
        
        // Stop the lowest priority sounds first
        soundsToStop.sort((a, b) => {
            return (this.soundPriorities.get(a) || 1) - (this.soundPriorities.get(b) || 1);
        });
        
        for (const soundToStop of soundsToStop) {
            const sources = this.activeSounds.get(soundToStop);
            if (sources && sources.size > 0) {
                // Stop one instance of the lower priority sound
                const sourceToStop = sources.values().next().value;
                try {
                    sourceToStop.stop();
                } catch (error) {
                    // Source might already be stopped
                }
                sources.delete(sourceToStop);
                
                // Check if we've made enough room
                const totalActiveSounds = Array.from(this.activeSounds.values())
                    .reduce((total, sources) => total + sources.size, 0);
                
                if (totalActiveSounds < this.maxGlobalConcurrent) {
                    return true;
                }
            }
        }
        
        return false;
    }
    
    /**
     * Get statistics about active sounds
     */
    getStats() {
        const stats = {
            totalActiveSounds: 0,
            soundBreakdown: {}
        };
        
        this.activeSounds.forEach((sources, soundId) => {
            const count = sources.size;
            stats.totalActiveSounds += count;
            stats.soundBreakdown[soundId] = count;
        });
        
        return stats;
    }
    
    /**
     * Set maximum concurrent sounds globally
     */
    setMaxConcurrentSounds(max) {
        this.maxGlobalConcurrent = Math.max(1, max);
    }
    
    /**
     * Clean up resources
     */
    dispose() {
        this.stopAllSounds();
        this.activeSounds.clear();
        this.soundPriorities.clear();
        this.soundCooldowns.clear();
        
        console.log('🧹 SoundEffectManager disposed');
    }
}