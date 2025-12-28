// LocationSystem - Main system for managing dynamic space environments
// Coordinates environment changes, transitions, and gameplay integration

import { EnvironmentManager } from './EnvironmentManager.js';
import { TransitionManager } from './TransitionManager.js';
import { EnvironmentRenderer } from './EnvironmentRenderer.js';
import { EnvironmentalAudioManager } from './EnvironmentalAudioManager.js';

export class LocationSystem {
    constructor(canvas, audioSystem = null, spawningSystem = null, musicManager = null, dynamicMusicManager = null) {
        this.canvas = canvas;
        this.audioSystem = audioSystem;
        this.spawningSystem = spawningSystem;
        this.musicManager = musicManager;
        this.dynamicMusicManager = dynamicMusicManager;
        
        // Core managers
        this.environmentManager = new EnvironmentManager();
        this.transitionManager = new TransitionManager();
        this.environmentRenderer = new EnvironmentRenderer(canvas);
        this.environmentalAudioManager = new EnvironmentalAudioManager(audioSystem, musicManager);
        
        // System state
        this.isEnabled = true;
        this.lastEnvironmentChange = Date.now();
        
        // Audio integration
        this.currentAmbientSound = null;
        this.currentMusicTrack = null;
        
        console.log('🌌 LocationSystem initialized with enhanced renderer and environmental audio');
    }
    
    /**
     * Update the location system
     */
    update(deltaTime, gameTime) {
        if (!this.isEnabled) return;
        
        // Update environment progression
        const previousEnvironment = this.environmentManager.currentEnvironment;
        this.environmentManager.update(deltaTime, gameTime);
        
        // Check if environment changed
        if (this.environmentManager.currentEnvironment !== previousEnvironment) {
            this.handleEnvironmentChange(previousEnvironment, this.environmentManager.currentEnvironment);
        }
        
        // Update transitions
        this.transitionManager.update(deltaTime);
        
        // Update environment renderer
        const envProps = this.getCurrentEnvironmentForRendering();
        this.environmentRenderer.update(deltaTime, envProps);
        
        // Update environmental audio
        this.environmentalAudioManager.update(deltaTime, {
            enemyCount: this.spawningSystem?.getEnemyCount() || 0,
            rockCount: this.spawningSystem?.getRockCount() || 0,
            gameTime: gameTime
        });
        
        // Update spawning system modifiers
        this.updateSpawningModifiers();
        
        // Update audio if needed
        this.updateEnvironmentalAudio();
    }
    
    /**
     * Handle environment change
     */
    handleEnvironmentChange(fromEnvId, toEnvId) {
        const fromEnv = this.environmentManager.getEnvironment(fromEnvId);
        const toEnv = this.environmentManager.getEnvironment(toEnvId);
        
        console.log(`🌌 Environment changing: ${fromEnv?.name} → ${toEnv?.name}`);
        
        // Start visual transition
        this.transitionManager.startTransition(fromEnv, toEnv, 3000, 'fade');
        
        // Handle audio transition
        this.transitionEnvironmentalAudio(fromEnv, toEnv);
        
        // Transition environmental audio layers
        this.environmentalAudioManager.setEnvironment(toEnvId, false);
        
        // Update dynamic music system
        if (this.dynamicMusicManager) {
            this.dynamicMusicManager.setEnvironment(toEnvId);
        }
        
        // Update last change time
        this.lastEnvironmentChange = Date.now();
    }
    
    /**
     * Transition environmental audio
     */
    transitionEnvironmentalAudio(fromEnv, toEnv) {
        if (!this.audioSystem || !this.musicManager) return;
        
        // Transition background music
        if (fromEnv?.musicTrack !== toEnv?.musicTrack) {
            this.musicManager.playMusic(toEnv.musicTrack, {
                fadeTime: 2000,
                loop: true,
                volume: 0.6
            });
            this.currentMusicTrack = toEnv.musicTrack;
        }
        
        // Handle ambient sounds (placeholder for future implementation)
        if (fromEnv?.ambientSound !== toEnv?.ambientSound) {
            this.currentAmbientSound = toEnv.ambientSound;
            console.log(`🔊 Ambient sound changed to: ${toEnv.ambientSound}`);
        }
    }
    
    /**
     * Update spawning system with environment modifiers
     */
    updateSpawningModifiers() {
        if (!this.spawningSystem) return;
        
        const modifiers = this.environmentManager.getSpawnModifiers();
        
        // Apply modifiers to spawning system (if it supports them)
        if (typeof this.spawningSystem.setEnvironmentModifiers === 'function') {
            this.spawningSystem.setEnvironmentModifiers(modifiers);
        }
    }
    
    /**
     * Update environmental audio
     */
    updateEnvironmentalAudio() {
        // Placeholder for continuous audio updates
        // This could handle things like dynamic reverb, ambient sound mixing, etc.
    }
    
    /**
     * Get current environment for rendering
     */
    getCurrentEnvironmentForRendering() {
        if (this.transitionManager.isTransitioning) {
            const fromEnv = this.environmentManager.getEnvironment(
                this.transitionManager.fromEnvironment?.id || 
                this.environmentManager.currentEnvironment
            );
            const toEnv = this.environmentManager.getCurrentEnvironment();
            
            return this.transitionManager.getBlendedProperties(
                fromEnv?.visualProperties || fromEnv,
                toEnv?.visualProperties || toEnv
            );
        }
        
        return this.environmentManager.getVisualProperties();
    }
    
    /**
     * Get transition properties for rendering
     */
    getTransitionProperties() {
        return this.transitionManager.getVisualProperties();
    }
    
    /**
     * Render environment background
     */
    renderEnvironmentBackground(ctx) {
        const envProps = this.getCurrentEnvironmentForRendering();
        const transitionProps = this.getTransitionProperties();
        
        if (!envProps) return;
        
        // Clear with environment background color
        ctx.fillStyle = envProps.backgroundColor || '#000011';
        ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Apply transition alpha if transitioning
        if (this.transitionManager.isTransitioning) {
            ctx.globalAlpha = transitionProps.backgroundAlpha;
        }
        
        // Use enhanced renderer for starfield
        this.environmentRenderer.renderEnhancedStarfield(ctx, envProps, transitionProps);
        
        // Reset alpha
        ctx.globalAlpha = 1.0;
    }
    
    /**
     * Render environment effects
     */
    renderEnvironmentEffects(ctx) {
        const envProps = this.getCurrentEnvironmentForRendering();
        const transitionProps = this.getTransitionProperties();
        
        if (!envProps || !envProps.effects) return;
        
        // Apply transition alpha for effects
        if (this.transitionManager.isTransitioning) {
            ctx.globalAlpha = transitionProps.effectsAlpha;
        }
        
        // Use enhanced renderer for effects
        if (envProps.effects.nebula || envProps.effects.colorfulGas) {
            this.environmentRenderer.renderEnhancedNebulaEffects(ctx, envProps);
        }
        
        if (envProps.effects.asteroidDust) {
            this.environmentRenderer.renderEnhancedAsteroidDust(ctx, envProps);
        }
        
        if (envProps.effects.energyStorms) {
            this.environmentRenderer.renderEnhancedEnergyStorms(ctx, envProps);
        }
        
        if (envProps.effects.floatingDebris) {
            this.environmentRenderer.renderEnhancedFloatingDebris(ctx, envProps);
        }
        
        if (envProps.effects.cosmicRays) {
            this.environmentRenderer.renderCosmicRays(ctx, envProps);
        }
        
        // Fallback to basic effects for distant galaxies
        if (envProps.effects.distantGalaxies) {
            this.renderDistantGalaxies(ctx, envProps);
        }
        
        // Reset alpha
        ctx.globalAlpha = 1.0;
    }
    
    /**
     * Render starfield with environment properties
     */
    renderStarfield(ctx, envProps, transitionProps) {
        const starDensity = envProps.starDensity || 150;
        const starBrightness = envProps.starBrightness || 0.8;
        const gameTime = Date.now();
        
        ctx.fillStyle = '#ffffff';
        
        for (let i = 0; i < starDensity; i++) {
            const x = (i * 37) % this.canvas.width;
            const y = (i * 73 + gameTime * 0.02) % this.canvas.height;
            const size = (i % 4) + 1;
            const alpha = (0.2 + (i % 8) * 0.1) * starBrightness;
            const brightness = (0.5 + (i % 5) * 0.1) * starBrightness;
            
            ctx.globalAlpha = alpha * (transitionProps.starfieldAlpha || 1.0);
            ctx.fillStyle = `rgba(${255 * brightness}, ${255 * brightness}, 255, ${alpha})`;
            
            if (size > 2) {
                ctx.shadowColor = '#ffffff';
                ctx.shadowBlur = size * 2;
            }
            
            ctx.fillRect(x, y, size, size);
            ctx.shadowBlur = 0;
        }
    }
    
    /**
     * Render nebula effects
     */
    renderNebulaEffects(ctx, envProps) {
        const gameTime = Date.now();
        
        // Create colorful nebula clouds
        for (let i = 0; i < 8; i++) {
            const x = (i * 120 + Math.sin(gameTime * 0.0005 + i) * 50) % this.canvas.width;
            const y = (i * 80 + Math.cos(gameTime * 0.0003 + i) * 30) % this.canvas.height;
            const size = 60 + Math.sin(gameTime * 0.001 + i) * 20;
            
            const colors = ['rgba(255, 100, 200, 0.1)', 'rgba(100, 200, 255, 0.1)', 'rgba(200, 255, 100, 0.1)'];
            const color = colors[i % colors.length];
            
            const gradient = ctx.createRadialGradient(x, y, 0, x, y, size);
            gradient.addColorStop(0, color);
            gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
            
            ctx.fillStyle = gradient;
            ctx.fillRect(x - size, y - size, size * 2, size * 2);
        }
    }
    
    /**
     * Render asteroid dust effects
     */
    renderAsteroidDust(ctx, envProps) {
        const gameTime = Date.now();
        
        // Floating dust particles
        ctx.fillStyle = 'rgba(139, 69, 19, 0.3)';
        
        for (let i = 0; i < 50; i++) {
            const x = (i * 23 + gameTime * 0.01) % this.canvas.width;
            const y = (i * 41 + gameTime * 0.008) % this.canvas.height;
            const size = 1 + (i % 3);
            
            ctx.fillRect(x, y, size, size);
        }
    }
    
    /**
     * Render energy storms
     */
    renderEnergyStorms(ctx, envProps) {
        const gameTime = Date.now();
        
        // Lightning-like energy effects
        ctx.strokeStyle = 'rgba(255, 255, 0, 0.6)';
        ctx.lineWidth = 2;
        
        for (let i = 0; i < 3; i++) {
            if (Math.sin(gameTime * 0.01 + i) > 0.7) {
                const startX = Math.random() * this.canvas.width;
                const startY = Math.random() * this.canvas.height;
                
                ctx.beginPath();
                ctx.moveTo(startX, startY);
                
                for (let j = 0; j < 5; j++) {
                    const x = startX + (Math.random() - 0.5) * 100;
                    const y = startY + (Math.random() - 0.5) * 100;
                    ctx.lineTo(x, y);
                }
                
                ctx.stroke();
            }
        }
    }
    
    /**
     * Render distant galaxies
     */
    renderDistantGalaxies(ctx, envProps) {
        const gameTime = Date.now();
        
        for (let i = 0; i < 3; i++) {
            const x = (i * 200) % this.canvas.width;
            const y = (i * 150 + gameTime * 0.005) % this.canvas.height;
            const size = 30 + (i * 10);
            
            const gradient = ctx.createRadialGradient(x, y, 0, x, y, size);
            gradient.addColorStop(0, `rgba(${150 + i * 30}, ${100 + i * 20}, 200, 0.08)`);
            gradient.addColorStop(1, 'rgba(0, 0, 50, 0)');
            
            ctx.fillStyle = gradient;
            ctx.fillRect(x - size, y - size, size * 2, size * 2);
        }
    }
    
    /**
     * Render floating debris
     */
    renderFloatingDebris(ctx, envProps) {
        const gameTime = Date.now();
        
        ctx.fillStyle = 'rgba(100, 100, 100, 0.4)';
        
        for (let i = 0; i < 20; i++) {
            const x = (i * 67 + gameTime * 0.015) % this.canvas.width;
            const y = (i * 43 + gameTime * 0.012) % this.canvas.height;
            const size = 2 + (i % 4);
            const rotation = gameTime * 0.001 + i;
            
            ctx.save();
            ctx.translate(x, y);
            ctx.rotate(rotation);
            ctx.fillRect(-size/2, -size/2, size, size);
            ctx.restore();
        }
    }
    
    /**
     * Render colorful gas clouds
     */
    renderColorfulGas(ctx, envProps) {
        const gameTime = Date.now();
        
        for (let i = 0; i < 6; i++) {
            const x = (i * 100 + Math.sin(gameTime * 0.0008 + i) * 40) % this.canvas.width;
            const y = (i * 90 + Math.cos(gameTime * 0.0006 + i) * 30) % this.canvas.height;
            const size = 80 + Math.sin(gameTime * 0.0012 + i) * 30;
            
            const hue = (i * 60 + gameTime * 0.05) % 360;
            const color = `hsla(${hue}, 70%, 60%, 0.08)`;
            
            const gradient = ctx.createRadialGradient(x, y, 0, x, y, size);
            gradient.addColorStop(0, color);
            gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
            
            ctx.fillStyle = gradient;
            ctx.fillRect(x - size, y - size, size * 2, size * 2);
        }
    }
    
    /**
     * Render cosmic rays
     */
    renderCosmicRays(ctx, envProps) {
        const gameTime = Date.now();
        
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.lineWidth = 1;
        
        for (let i = 0; i < 10; i++) {
            const x = (gameTime * 0.1 + i * 80) % (this.canvas.width + 100);
            const y1 = 0;
            const y2 = this.canvas.height;
            
            ctx.beginPath();
            ctx.moveTo(x, y1);
            ctx.lineTo(x + 20, y2);
            ctx.stroke();
        }
    }
    
    /**
     * Force environment change
     */
    setEnvironment(environmentId, immediate = false) {
        if (immediate) {
            this.environmentManager.setEnvironment(environmentId);
            this.transitionManager.reset();
        } else {
            const currentEnv = this.environmentManager.getCurrentEnvironment();
            const targetEnv = this.environmentManager.getEnvironment(environmentId);
            
            if (targetEnv) {
                this.environmentManager.setEnvironment(environmentId);
                this.transitionManager.startTransition(currentEnv, targetEnv);
            }
        }
    }
    
    /**
     * Get current environment info
     */
    getCurrentEnvironment() {
        return this.environmentManager.getCurrentEnvironment();
    }
    
    /**
     * Get system statistics
     */
    getStats() {
        return {
            environment: this.environmentManager.getStats(),
            transition: this.transitionManager.getStats(),
            isEnabled: this.isEnabled,
            lastEnvironmentChange: this.lastEnvironmentChange
        };
    }
    
    /**
     * Enable or disable the location system
     */
    setEnabled(enabled) {
        this.isEnabled = enabled;
        console.log(`🌌 LocationSystem ${enabled ? 'enabled' : 'disabled'}`);
    }
    
    /**
     * Reset the location system
     */
    reset() {
        this.environmentManager.reset();
        this.transitionManager.reset();
        this.environmentRenderer.reset();
        this.environmentalAudioManager.reset();
        this.lastEnvironmentChange = Date.now();
        this.currentAmbientSound = null;
        this.currentMusicTrack = null;
        
        console.log('🌌 LocationSystem reset');
    }
    
    /**
     * Clean up resources
     */
    dispose() {
        this.environmentManager.dispose();
        this.transitionManager.dispose();
        this.environmentRenderer.dispose();
        this.environmentalAudioManager.dispose();
        
        console.log('🧹 LocationSystem disposed');
    }
}