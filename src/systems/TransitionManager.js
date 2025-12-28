// TransitionManager - Handles smooth transitions between environments
// Manages visual and audio cross-fades, timing, and transition effects

export class TransitionManager {
    constructor() {
        // Transition state
        this.isTransitioning = false;
        this.transitionStartTime = 0;
        this.transitionDuration = 3000; // 3 seconds default
        this.transitionProgress = 0;
        
        // Transition data
        this.fromEnvironment = null;
        this.toEnvironment = null;
        this.transitionType = 'fade'; // 'fade', 'wipe', 'dissolve'
        
        // Transition queue
        this.pendingTransition = null;
        
        // Visual transition properties
        this.visualTransition = {
            backgroundAlpha: 1.0,
            effectsAlpha: 1.0,
            starfieldAlpha: 1.0,
            overlayAlpha: 0.0
        };
        
        console.log('🔄 TransitionManager initialized');
    }
    
    /**
     * Start a transition between environments
     */
    startTransition(fromEnv, toEnv, duration = 3000, type = 'fade') {
        // If already transitioning, queue the new transition
        if (this.isTransitioning) {
            this.pendingTransition = { fromEnv, toEnv, duration, type };
            console.log('🔄 Transition queued');
            return false;
        }
        
        // Start new transition
        this.isTransitioning = true;
        this.transitionStartTime = Date.now();
        this.transitionDuration = duration;
        this.transitionProgress = 0;
        this.fromEnvironment = fromEnv;
        this.toEnvironment = toEnv;
        this.transitionType = type;
        
        // Reset visual transition properties
        this.visualTransition = {
            backgroundAlpha: 1.0,
            effectsAlpha: 1.0,
            starfieldAlpha: 1.0,
            overlayAlpha: 0.0
        };
        
        console.log(`🔄 Starting transition: ${fromEnv?.name} → ${toEnv?.name} (${duration}ms)`);
        return true;
    }
    
    /**
     * Update transition progress
     */
    update(deltaTime) {
        if (!this.isTransitioning) return;
        
        const currentTime = Date.now();
        const elapsed = currentTime - this.transitionStartTime;
        this.transitionProgress = Math.min(1.0, elapsed / this.transitionDuration);
        
        // Update visual transition properties based on progress
        this.updateVisualTransition();
        
        // Check if transition is complete
        if (this.transitionProgress >= 1.0) {
            this.completeTransition();
        }
    }
    
    /**
     * Update visual transition properties
     */
    updateVisualTransition() {
        const progress = this.transitionProgress;
        const easeProgress = this.easeInOutCubic(progress);
        
        switch (this.transitionType) {
            case 'fade':
                this.updateFadeTransition(easeProgress);
                break;
            case 'wipe':
                this.updateWipeTransition(easeProgress);
                break;
            case 'dissolve':
                this.updateDissolveTransition(easeProgress);
                break;
            default:
                this.updateFadeTransition(easeProgress);
        }
    }
    
    /**
     * Update fade transition
     */
    updateFadeTransition(progress) {
        if (progress < 0.5) {
            // Fade out phase
            const fadeProgress = progress * 2;
            this.visualTransition.backgroundAlpha = 1.0 - fadeProgress;
            this.visualTransition.effectsAlpha = 1.0 - fadeProgress;
            this.visualTransition.starfieldAlpha = 1.0 - (fadeProgress * 0.5);
            this.visualTransition.overlayAlpha = 0.0;
        } else {
            // Fade in phase
            const fadeProgress = (progress - 0.5) * 2;
            this.visualTransition.backgroundAlpha = fadeProgress;
            this.visualTransition.effectsAlpha = fadeProgress;
            this.visualTransition.starfieldAlpha = 0.5 + (fadeProgress * 0.5);
            this.visualTransition.overlayAlpha = 0.0;
        }
    }
    
    /**
     * Update wipe transition
     */
    updateWipeTransition(progress) {
        // Horizontal wipe effect
        this.visualTransition.backgroundAlpha = 1.0;
        this.visualTransition.effectsAlpha = 1.0;
        this.visualTransition.starfieldAlpha = 1.0;
        this.visualTransition.overlayAlpha = 0.0;
        this.visualTransition.wipeProgress = progress;
    }
    
    /**
     * Update dissolve transition
     */
    updateDissolveTransition(progress) {
        // Dissolve effect with noise
        this.visualTransition.backgroundAlpha = 1.0;
        this.visualTransition.effectsAlpha = 1.0;
        this.visualTransition.starfieldAlpha = 1.0;
        this.visualTransition.overlayAlpha = 0.0;
        this.visualTransition.dissolveProgress = progress;
        this.visualTransition.noiseOffset = Date.now() * 0.001;
    }
    
    /**
     * Complete current transition
     */
    completeTransition() {
        this.isTransitioning = false;
        this.transitionProgress = 1.0;
        
        // Reset visual properties to normal
        this.visualTransition = {
            backgroundAlpha: 1.0,
            effectsAlpha: 1.0,
            starfieldAlpha: 1.0,
            overlayAlpha: 0.0
        };
        
        console.log(`✅ Transition completed: ${this.toEnvironment?.name}`);
        
        // Process pending transition if any
        if (this.pendingTransition) {
            const pending = this.pendingTransition;
            this.pendingTransition = null;
            
            // Small delay before starting next transition
            setTimeout(() => {
                this.startTransition(
                    pending.fromEnv,
                    pending.toEnv,
                    pending.duration,
                    pending.type
                );
            }, 100);
        }
    }
    
    /**
     * Get current transition state
     */
    getTransitionState() {
        return {
            isTransitioning: this.isTransitioning,
            progress: this.transitionProgress,
            type: this.transitionType,
            fromEnvironment: this.fromEnvironment?.name,
            toEnvironment: this.toEnvironment?.name,
            visualProperties: { ...this.visualTransition }
        };
    }
    
    /**
     * Get visual transition properties for rendering
     */
    getVisualProperties() {
        return { ...this.visualTransition };
    }
    
    /**
     * Get blended environment properties during transition
     */
    getBlendedProperties(fromEnv, toEnv) {
        if (!this.isTransitioning || !fromEnv || !toEnv) {
            return toEnv || fromEnv;
        }
        
        const progress = this.transitionProgress;
        
        // Blend numerical properties
        const blended = {
            backgroundColor: this.blendColors(fromEnv.backgroundColor, toEnv.backgroundColor, progress),
            starDensity: this.lerp(fromEnv.starDensity, toEnv.starDensity, progress),
            starBrightness: this.lerp(fromEnv.starBrightness, toEnv.starBrightness, progress),
            ambientLight: this.lerp(fromEnv.ambientLight, toEnv.ambientLight, progress),
            contrast: this.lerp(fromEnv.contrast, toEnv.contrast, progress),
            saturation: this.lerp(fromEnv.saturation, toEnv.saturation, progress),
            visibilityReduction: this.lerp(
                fromEnv.visibilityReduction || 1.0,
                toEnv.visibilityReduction || 1.0,
                progress
            )
        };
        
        // Blend effects (switch at 50% progress)
        blended.effects = progress < 0.5 ? fromEnv.effects : toEnv.effects;
        
        return blended;
    }
    
    /**
     * Linear interpolation
     */
    lerp(a, b, t) {
        return a + (b - a) * t;
    }
    
    /**
     * Blend two hex colors
     */
    blendColors(color1, color2, t) {
        // Convert hex to RGB
        const rgb1 = this.hexToRgb(color1);
        const rgb2 = this.hexToRgb(color2);
        
        if (!rgb1 || !rgb2) return color2;
        
        // Blend RGB values
        const r = Math.round(this.lerp(rgb1.r, rgb2.r, t));
        const g = Math.round(this.lerp(rgb1.g, rgb2.g, t));
        const b = Math.round(this.lerp(rgb1.b, rgb2.b, t));
        
        // Convert back to hex
        return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
    }
    
    /**
     * Convert hex color to RGB
     */
    hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : null;
    }
    
    /**
     * Easing function for smooth transitions
     */
    easeInOutCubic(t) {
        return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    }
    
    /**
     * Set transition duration
     */
    setTransitionDuration(duration) {
        this.transitionDuration = Math.max(500, duration); // Minimum 0.5 seconds
    }
    
    /**
     * Cancel current transition
     */
    cancelTransition() {
        if (this.isTransitioning) {
            this.completeTransition();
            console.log('🔄 Transition cancelled');
        }
    }
    
    /**
     * Skip to end of current transition
     */
    skipTransition() {
        if (this.isTransitioning) {
            this.transitionProgress = 1.0;
            this.completeTransition();
            console.log('🔄 Transition skipped');
        }
    }
    
    /**
     * Check if transition can start
     */
    canStartTransition() {
        return !this.isTransitioning;
    }
    
    /**
     * Get transition statistics
     */
    getStats() {
        return {
            isTransitioning: this.isTransitioning,
            progress: this.transitionProgress,
            duration: this.transitionDuration,
            type: this.transitionType,
            hasPendingTransition: !!this.pendingTransition,
            timeRemaining: this.isTransitioning ? 
                this.transitionDuration - (Date.now() - this.transitionStartTime) : 0
        };
    }
    
    /**
     * Reset transition manager
     */
    reset() {
        this.isTransitioning = false;
        this.transitionProgress = 0;
        this.pendingTransition = null;
        this.fromEnvironment = null;
        this.toEnvironment = null;
        
        this.visualTransition = {
            backgroundAlpha: 1.0,
            effectsAlpha: 1.0,
            starfieldAlpha: 1.0,
            overlayAlpha: 0.0
        };
        
        console.log('🔄 TransitionManager reset');
    }
    
    /**
     * Clean up resources
     */
    dispose() {
        this.reset();
        console.log('🧹 TransitionManager disposed');
    }
}