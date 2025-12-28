// MusicManager - Specialized music playback with cross-fade transitions
// Handles background music streaming, looping, and smooth transitions

export class MusicManager {
    constructor(audioSystem) {
        this.audioSystem = audioSystem;
        
        // Music playback state
        this.currentTrack = null;
        this.currentSource = null;
        this.currentGainNode = null;
        
        // Cross-fade management
        this.isTransitioning = false;
        this.transitionStartTime = 0;
        this.transitionDuration = 2000; // Default 2 second cross-fade
        this.fadeOutTrack = null;
        this.fadeInTrack = null;
        
        // Music queue and scheduling
        this.nextTrack = null;
        this.musicQueue = [];
        
        console.log('🎵 MusicManager initialized');
    }
    
    /**
     * Play a music track with optional fade-in
     */
    async playMusic(trackId, options = {}) {
        if (!this.audioSystem.isInitialized || !this.audioSystem.isEnabled) {
            console.warn('⚠️ Cannot play music - AudioSystem not initialized');
            return false;
        }
        
        const fadeTime = options.fadeTime || 1000;
        const loop = options.loop !== undefined ? options.loop : true;
        const volume = options.volume || 1.0;
        
        // If same track is already playing, do nothing
        if (this.currentTrack === trackId && this.currentSource && !this.isTransitioning) {
            console.log(`🎵 Track ${trackId} already playing`);
            return true;
        }
        
        // Load the audio asset
        const audioBuffer = await this.audioSystem.loadAsset(trackId);
        if (!audioBuffer) {
            console.error(`❌ Failed to load music track: ${trackId}`);
            return false;
        }
        
        // If there's currently playing music, cross-fade
        if (this.currentSource && !this.isTransitioning) {
            return this.crossFadeToTrack(trackId, audioBuffer, { fadeTime, loop, volume });
        }
        
        // Start new track
        return this.startTrack(trackId, audioBuffer, { fadeTime, loop, volume });
    }
    
    /**
     * Start playing a new track
     */
    startTrack(trackId, audioBuffer, options = {}) {
        try {
            const { fadeTime = 1000, loop = true, volume = 1.0 } = options;
            
            // Create audio source and gain node
            const source = this.audioSystem.audioContext.createBufferSource();
            const gainNode = this.audioSystem.audioContext.createGain();
            
            source.buffer = audioBuffer;
            source.loop = loop;
            
            // Connect to music gain node
            source.connect(gainNode);
            gainNode.connect(this.audioSystem.musicGainNode);
            
            // Set up fade-in
            gainNode.gain.value = 0;
            gainNode.gain.linearRampToValueAtTime(volume, 
                this.audioSystem.audioContext.currentTime + (fadeTime / 1000));
            
            // Store references
            this.currentTrack = trackId;
            this.currentSource = source;
            this.currentGainNode = gainNode;
            
            // Handle track end (for non-looping tracks)
            source.onended = () => {
                if (!loop) {
                    this.handleTrackEnd();
                }
            };
            
            // Start playback
            source.start(0);
            
            console.log(`🎵 Started music track: ${trackId} (fade-in: ${fadeTime}ms)`);
            return true;
            
        } catch (error) {
            console.error(`❌ Failed to start music track ${trackId}:`, error);
            return false;
        }
    }
    
    /**
     * Cross-fade between current track and new track
     */
    async crossFadeToTrack(trackId, audioBuffer, options = {}) {
        if (this.isTransitioning) {
            console.warn('⚠️ Already transitioning, queueing track');
            this.nextTrack = { trackId, audioBuffer, options };
            return false;
        }
        
        const { fadeTime = 2000, loop = true, volume = 1.0 } = options;
        
        try {
            // Create new source for fade-in track
            const newSource = this.audioSystem.audioContext.createBufferSource();
            const newGainNode = this.audioSystem.audioContext.createGain();
            
            newSource.buffer = audioBuffer;
            newSource.loop = loop;
            
            // Connect new source
            newSource.connect(newGainNode);
            newGainNode.connect(this.audioSystem.musicGainNode);
            
            // Start new track at zero volume
            newGainNode.gain.value = 0;
            
            // Set up cross-fade
            this.isTransitioning = true;
            this.transitionStartTime = this.audioSystem.audioContext.currentTime;
            this.transitionDuration = fadeTime;
            this.fadeOutTrack = { source: this.currentSource, gainNode: this.currentGainNode };
            this.fadeInTrack = { source: newSource, gainNode: newGainNode, trackId, volume };
            
            // Start new track
            newSource.start(0);
            
            // Schedule cross-fade
            const currentTime = this.audioSystem.audioContext.currentTime;
            const fadeEndTime = currentTime + (fadeTime / 1000);
            
            // Fade out current track
            if (this.currentGainNode) {
                this.currentGainNode.gain.linearRampToValueAtTime(0, fadeEndTime);
            }
            
            // Fade in new track
            newGainNode.gain.linearRampToValueAtTime(volume, fadeEndTime);
            
            // Schedule cleanup
            setTimeout(() => {
                this.completeCrossFade();
            }, fadeTime + 100); // Small buffer for audio scheduling
            
            console.log(`🎵 Cross-fading to track: ${trackId} (duration: ${fadeTime}ms)`);
            return true;
            
        } catch (error) {
            console.error(`❌ Failed to cross-fade to track ${trackId}:`, error);
            this.isTransitioning = false;
            return false;
        }
    }
    
    /**
     * Complete cross-fade transition
     */
    completeCrossFade() {
        if (!this.isTransitioning) return;
        
        // Stop and disconnect old track
        if (this.fadeOutTrack) {
            try {
                this.fadeOutTrack.source.stop();
                this.fadeOutTrack.source.disconnect();
                this.fadeOutTrack.gainNode.disconnect();
            } catch (error) {
                // Source might already be stopped
            }
        }
        
        // Update current track references
        if (this.fadeInTrack) {
            this.currentTrack = this.fadeInTrack.trackId;
            this.currentSource = this.fadeInTrack.source;
            this.currentGainNode = this.fadeInTrack.gainNode;
            
            // Handle track end for non-looping tracks
            this.currentSource.onended = () => {
                this.handleTrackEnd();
            };
        }
        
        // Clean up transition state
        this.isTransitioning = false;
        this.fadeOutTrack = null;
        this.fadeInTrack = null;
        
        // Process queued track if any
        if (this.nextTrack) {
            const { trackId, audioBuffer, options } = this.nextTrack;
            this.nextTrack = null;
            setTimeout(() => {
                this.crossFadeToTrack(trackId, audioBuffer, options);
            }, 100);
        }
        
        console.log(`✅ Cross-fade completed to: ${this.currentTrack}`);
    }
    
    /**
     * Stop current music with fade-out
     */
    stopMusic(fadeTime = 1000) {
        if (!this.currentSource || !this.currentGainNode) {
            return;
        }
        
        try {
            const currentTime = this.audioSystem.audioContext.currentTime;
            const fadeEndTime = currentTime + (fadeTime / 1000);
            
            // Fade out
            this.currentGainNode.gain.linearRampToValueAtTime(0, fadeEndTime);
            
            // Schedule stop
            setTimeout(() => {
                if (this.currentSource) {
                    try {
                        this.currentSource.stop();
                        this.currentSource.disconnect();
                        this.currentGainNode.disconnect();
                    } catch (error) {
                        // Source might already be stopped
                    }
                }
                
                this.currentTrack = null;
                this.currentSource = null;
                this.currentGainNode = null;
            }, fadeTime + 100);
            
            console.log(`🎵 Stopping music with fade-out: ${fadeTime}ms`);
            
        } catch (error) {
            console.error('❌ Failed to stop music:', error);
        }
    }
    
    /**
     * Pause current music
     */
    pauseMusic() {
        if (this.currentSource && this.currentGainNode) {
            // Web Audio API doesn't have pause, so we fade to very low volume
            const currentTime = this.audioSystem.audioContext.currentTime;
            this.currentGainNode.gain.linearRampToValueAtTime(0.1, currentTime + 0.1);
            console.log('⏸️ Music paused (faded to low volume)');
        }
    }
    
    /**
     * Resume current music
     */
    resumeMusic() {
        if (this.currentSource && this.currentGainNode) {
            const currentTime = this.audioSystem.audioContext.currentTime;
            const assetConfig = this.audioSystem.assetManifest.get(this.currentTrack);
            const targetVolume = assetConfig?.volume || 1.0;
            
            this.currentGainNode.gain.linearRampToValueAtTime(targetVolume, currentTime + 0.5);
            console.log('▶️ Music resumed');
        }
    }
    
    /**
     * Handle track end for non-looping tracks
     */
    handleTrackEnd() {
        console.log(`🎵 Track ended: ${this.currentTrack}`);
        
        this.currentTrack = null;
        this.currentSource = null;
        this.currentGainNode = null;
        
        // Play next track in queue if any
        if (this.musicQueue.length > 0) {
            const nextTrack = this.musicQueue.shift();
            this.playMusic(nextTrack.trackId, nextTrack.options);
        }
    }
    
    /**
     * Queue a track to play after current track ends
     */
    queueTrack(trackId, options = {}) {
        this.musicQueue.push({ trackId, options });
        console.log(`📝 Queued track: ${trackId}`);
    }
    
    /**
     * Clear music queue
     */
    clearQueue() {
        this.musicQueue = [];
        console.log('🧹 Music queue cleared');
    }
    
    /**
     * Get current music state
     */
    getCurrentState() {
        return {
            currentTrack: this.currentTrack,
            isPlaying: !!this.currentSource,
            isTransitioning: this.isTransitioning,
            queueLength: this.musicQueue.length
        };
    }
    
    /**
     * Set default cross-fade duration
     */
    setDefaultFadeTime(fadeTime) {
        this.transitionDuration = fadeTime;
    }
    
    /**
     * Clean up resources
     */
    dispose() {
        this.stopMusic(0);
        this.clearQueue();
        this.nextTrack = null;
        
        console.log('🧹 MusicManager disposed');
    }
}