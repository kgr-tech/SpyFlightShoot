// AudioSystem - Core audio management for SpyShoot
// Handles Web Audio API integration, asset loading, and playback

import { SyntheticAudio } from '../utils/SyntheticAudio.js';

export class AudioSystem {
    constructor() {
        // Audio context for Web Audio API
        this.audioContext = null;
        this.isInitialized = false;
        this.isEnabled = true;
        
        // Synthetic audio generator
        this.syntheticAudio = null;
        this.useSyntheticAudio = true; // Use synthetic audio by default
        
        // Audio asset management
        this.audioAssets = new Map(); // Loaded audio buffers
        this.loadingPromises = new Map(); // Track loading states
        this.assetManifest = new Map(); // Asset definitions
        
        // Volume controls
        this.masterVolume = 1.0;
        this.sfxVolume = 1.0;
        this.musicVolume = 1.0;
        this.isMuted = false;
        
        // Audio nodes for mixing
        this.masterGainNode = null;
        this.sfxGainNode = null;
        this.musicGainNode = null;
        
        // Performance tracking
        this.maxConcurrentSounds = 8;
        this.activeSounds = new Set();
        
        console.log('🎵 AudioSystem created - awaiting initialization');
    }
    
    /**
     * Initialize the audio system with Web Audio API
     * Must be called after user interaction for browser compatibility
     */
    async initialize() {
        if (this.isInitialized) {
            return true;
        }
        
        try {
            // Create audio context
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            if (!AudioContext) {
                throw new Error('Web Audio API not supported');
            }
            
            this.audioContext = new AudioContext();
            
            // Create master gain nodes for volume control
            this.masterGainNode = this.audioContext.createGain();
            this.sfxGainNode = this.audioContext.createGain();
            this.musicGainNode = this.audioContext.createGain();
            
            // Connect gain nodes
            this.sfxGainNode.connect(this.masterGainNode);
            this.musicGainNode.connect(this.masterGainNode);
            this.masterGainNode.connect(this.audioContext.destination);
            
            // Initialize synthetic audio generator (after gain nodes are created)
            this.syntheticAudio = new SyntheticAudio(this.audioContext, this.sfxGainNode);
            
            // Set initial volumes
            this.updateVolumeNodes();
            
            // Resume context if suspended (required for some browsers)
            if (this.audioContext.state === 'suspended') {
                await this.audioContext.resume();
            }
            
            this.isInitialized = true;
            console.log('✅ AudioSystem initialized successfully with synthetic audio support');
            
            // Load settings from localStorage
            this.loadSettings();
            
            return true;
            
        } catch (error) {
            console.error('❌ AudioSystem initialization failed:', error);
            this.isEnabled = false;
            return false;
        }
    }
    
    /**
     * Register an audio asset for loading
     */
    registerAsset(id, config) {
        this.assetManifest.set(id, {
            id,
            file: config.file,
            volume: config.volume || 1.0,
            pitch: config.pitch || 1.0,
            maxConcurrent: config.maxConcurrent || 3,
            preload: config.preload || false,
            type: config.type || 'sfx', // 'sfx' or 'music'
            formats: config.formats || [config.file] // Fallback formats
        });
        
        console.log(`📝 Registered audio asset: ${id}`);
    }
    
    /**
     * Load an audio asset
     */
    async loadAsset(id) {
        if (!this.isInitialized || !this.isEnabled) {
            console.warn(`⚠️ Cannot load asset ${id} - AudioSystem not initialized`);
            return null;
        }
        
        // Return cached asset if already loaded
        if (this.audioAssets.has(id)) {
            return this.audioAssets.get(id);
        }
        
        // Return existing loading promise if already loading
        if (this.loadingPromises.has(id)) {
            return this.loadingPromises.get(id);
        }
        
        const assetConfig = this.assetManifest.get(id);
        if (!assetConfig) {
            console.error(`❌ Asset ${id} not found in manifest`);
            return null;
        }
        
        // Create loading promise
        const loadingPromise = this.loadAudioBuffer(assetConfig);
        this.loadingPromises.set(id, loadingPromise);
        
        try {
            const audioBuffer = await loadingPromise;
            this.audioAssets.set(id, audioBuffer);
            this.loadingPromises.delete(id);
            
            console.log(`✅ Loaded audio asset: ${id}`);
            return audioBuffer;
            
        } catch (error) {
            console.error(`❌ Failed to load audio asset ${id}:`, error);
            this.loadingPromises.delete(id);
            return null;
        }
    }
    
    /**
     * Load audio buffer with format fallback
     */
    async loadAudioBuffer(assetConfig) {
        const formats = assetConfig.formats;
        let lastError = null;
        
        for (const format of formats) {
            try {
                const response = await fetch(format);
                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }
                
                const arrayBuffer = await response.arrayBuffer();
                const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
                
                return audioBuffer;
                
            } catch (error) {
                lastError = error;
                console.warn(`⚠️ Failed to load ${format}, trying next format...`);
                continue;
            }
        }
        
        throw lastError || new Error('All audio formats failed to load');
    }
    
    /**
     * Preload essential audio assets
     */
    async preloadAssets() {
        if (!this.isInitialized || !this.isEnabled) {
            return;
        }
        
        const preloadAssets = Array.from(this.assetManifest.values())
            .filter(asset => asset.preload);
        
        console.log(`🔄 Preloading ${preloadAssets.length} audio assets...`);
        
        const loadPromises = preloadAssets.map(asset => this.loadAsset(asset.id));
        
        try {
            await Promise.allSettled(loadPromises);
            console.log('✅ Audio asset preloading completed');
        } catch (error) {
            console.error('❌ Audio asset preloading failed:', error);
        }
    }
    
    /**
     * Play a sound effect
     */
    playSound(soundId, options = {}) {
        if (!this.isInitialized || !this.isEnabled || this.isMuted) {
            return null;
        }
        
        // Check concurrent sound limits
        if (this.activeSounds.size >= this.maxConcurrentSounds) {
            console.warn('⚠️ Maximum concurrent sounds reached, skipping playback');
            return null;
        }
        
        const audioBuffer = this.audioAssets.get(soundId);
        if (!audioBuffer) {
            console.warn(`⚠️ Audio asset ${soundId} not loaded, using synthetic audio`);
            // Use synthetic audio as fallback
            return this.playSyntheticSound(soundId, options);
        }
        
        try {
            // Create audio source
            const source = this.audioContext.createBufferSource();
            const gainNode = this.audioContext.createGain();
            
            source.buffer = audioBuffer;
            
            // Apply volume and pitch
            const assetConfig = this.assetManifest.get(soundId);
            const volume = (options.volume || assetConfig?.volume || 1.0);
            const pitch = (options.pitch || assetConfig?.pitch || 1.0);
            
            gainNode.gain.value = volume;
            source.playbackRate.value = pitch;
            
            // Connect to appropriate gain node
            source.connect(gainNode);
            const targetGainNode = assetConfig?.type === 'music' ? this.musicGainNode : this.sfxGainNode;
            gainNode.connect(targetGainNode);
            
            // Track active sound
            this.activeSounds.add(source);
            
            // Clean up when sound ends
            source.onended = () => {
                this.activeSounds.delete(source);
                source.disconnect();
                gainNode.disconnect();
            };
            
            // Start playback
            source.start(0);
            
            return source;
            
        } catch (error) {
            console.error(`❌ Failed to play sound ${soundId}:`, error);
            // Fallback to synthetic audio
            return this.playSyntheticSound(soundId, options);
        }
    }
    
    /**
     * Play synthetic sound as fallback
     */
    playSyntheticSound(soundId, options = {}) {
        if (!this.syntheticAudio) {
            console.warn('⚠️ Synthetic audio not available');
            return null;
        }
        
        try {
            let result = null;
            
            // Map sound IDs to synthetic audio generation
            if (soundId.includes('laser')) {
                result = this.syntheticAudio.generateLaserShot({
                    volume: options.volume || 0.5,
                    pitchVariation: options.pitchVariation || 0.1
                });
            } else if (soundId.includes('explosion')) {
                const type = soundId.includes('enemy') ? 'enemy' : 'rock';
                result = this.syntheticAudio.generateExplosion({
                    volume: options.volume || 0.6,
                    type: type
                });
            } else if (soundId.includes('scanner')) {
                result = this.syntheticAudio.generateScannerBeep({
                    volume: options.volume || 0.4
                });
            } else if (soundId.includes('warning') || soundId.includes('alarm')) {
                result = this.syntheticAudio.generateWarningAlarm({
                    volume: options.volume || 0.5,
                    urgency: options.urgency || 1
                });
            } else if (soundId.includes('ui') || soundId.includes('click') || soundId.includes('error')) {
                const type = soundId.includes('error') ? 'error' : 'click';
                result = this.syntheticAudio.generateUISound({
                    type: type,
                    volume: options.volume || 0.3
                });
            } else if (soundId.includes('ambient') || soundId.includes('space')) {
                result = this.syntheticAudio.generateAmbientSpace({
                    volume: options.volume || 0.2
                });
            } else {
                // Default to a simple click sound
                result = this.syntheticAudio.generateUISound({
                    type: 'click',
                    volume: options.volume || 0.3
                });
            }
            
            if (result) {
                console.log(`🎵 Playing synthetic sound for: ${soundId}`);
            }
            
            return result;
            
        } catch (error) {
            console.error(`❌ Failed to play synthetic sound ${soundId}:`, error);
            return null;
        }
    }
    
    /**
     * Set master volume (0.0 to 1.0)
     */
    setMasterVolume(volume) {
        this.masterVolume = Math.max(0, Math.min(1, volume));
        this.updateVolumeNodes();
        this.saveSettings();
    }
    
    /**
     * Set sound effects volume (0.0 to 1.0)
     */
    setSFXVolume(volume) {
        this.sfxVolume = Math.max(0, Math.min(1, volume));
        this.updateVolumeNodes();
        this.saveSettings();
    }
    
    /**
     * Set music volume (0.0 to 1.0)
     */
    setMusicVolume(volume) {
        this.musicVolume = Math.max(0, Math.min(1, volume));
        this.updateVolumeNodes();
        this.saveSettings();
    }
    
    /**
     * Toggle mute state
     */
    setMuted(muted) {
        this.isMuted = muted;
        this.updateVolumeNodes();
        this.saveSettings();
    }
    
    /**
     * Update volume nodes with current settings
     */
    updateVolumeNodes() {
        if (!this.isInitialized) return;
        
        const effectiveVolume = this.isMuted ? 0 : this.masterVolume;
        
        this.masterGainNode.gain.value = effectiveVolume;
        this.sfxGainNode.gain.value = this.sfxVolume;
        this.musicGainNode.gain.value = this.musicVolume;
    }
    
    /**
     * Save audio settings to localStorage
     */
    saveSettings() {
        try {
            const settings = {
                masterVolume: this.masterVolume,
                sfxVolume: this.sfxVolume,
                musicVolume: this.musicVolume,
                isMuted: this.isMuted
            };
            
            localStorage.setItem('spyshoot_audio_settings', JSON.stringify(settings));
        } catch (error) {
            console.warn('⚠️ Failed to save audio settings:', error);
        }
    }
    
    /**
     * Load audio settings from localStorage
     */
    loadSettings() {
        try {
            const settingsJson = localStorage.getItem('spyshoot_audio_settings');
            if (settingsJson) {
                const settings = JSON.parse(settingsJson);
                
                this.masterVolume = settings.masterVolume || 1.0;
                this.sfxVolume = settings.sfxVolume || 1.0;
                this.musicVolume = settings.musicVolume || 1.0;
                this.isMuted = settings.isMuted || false;
                
                this.updateVolumeNodes();
                console.log('✅ Audio settings loaded from localStorage');
            }
        } catch (error) {
            console.warn('⚠️ Failed to load audio settings:', error);
        }
    }
    
    /**
     * Get current audio settings
     */
    getSettings() {
        return {
            masterVolume: this.masterVolume,
            sfxVolume: this.sfxVolume,
            musicVolume: this.musicVolume,
            isMuted: this.isMuted,
            isInitialized: this.isInitialized,
            isEnabled: this.isEnabled
        };
    }
    
    /**
     * Clean up resources
     */
    dispose() {
        if (this.audioContext) {
            this.audioContext.close();
        }
        
        this.audioAssets.clear();
        this.loadingPromises.clear();
        this.activeSounds.clear();
        
        console.log('🧹 AudioSystem disposed');
    }
}