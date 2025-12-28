// EnhancedSoundEffects - Advanced sound effect management with variations and smart selection
// Handles sound effect variations, UI sounds, and contextual audio feedback

export class EnhancedSoundEffects {
    constructor(soundEffectManager) {
        this.soundEffectManager = soundEffectManager;
        
        // Sound variation groups
        this.soundGroups = {
            laser: ['laser_shot', 'laser_shot_2', 'laser_shot_3'],
            explosion_enemy: ['explosion_enemy', 'explosion_enemy_2'],
            explosion_rock: ['explosion_rock', 'rock_impact'],
            scanner: ['scanner_beep', 'scanner_sweep'],
            warning: ['warning_alarm', 'energy_low'],
            ui: ['ui_click', 'ui_hover', 'ui_error']
        };
        
        // Last played sound tracking for variation
        this.lastPlayedInGroup = new Map();
        
        // UI sound integration
        this.uiSoundsEnabled = true;
        
        console.log('🔊 EnhancedSoundEffects initialized');
    }
    
    /**
     * Play a laser sound with automatic variation
     */
    playLaserSound(options = {}) {
        const soundId = this.getVariedSound('laser');
        return this.soundEffectManager.playSoundVaried(soundId, {
            pitchVariation: 0.15,
            ...options
        });
    }
    
    /**
     * Play an enemy explosion with variation
     */
    playEnemyExplosion(x, y, options = {}) {
        const soundId = this.getVariedSound('explosion_enemy');
        return this.soundEffectManager.playSoundPositioned(soundId, x, y, {
            pitchVariation: 0.2,
            ...options
        });
    }
    
    /**
     * Play a rock explosion/impact with variation
     */
    playRockExplosion(x, y, isDestroyed = true, options = {}) {
        const soundId = isDestroyed ? 
            this.getVariedSound('explosion_rock') : 
            'rock_impact';
            
        return this.soundEffectManager.playSoundPositioned(soundId, x, y, {
            pitchVariation: 0.25,
            volume: isDestroyed ? 0.8 : 0.6,
            ...options
        });
    }
    
    /**
     * Play scanner sound with context
     */
    playScannerSound(isActivating = true, options = {}) {
        const soundId = isActivating ? 'scanner_beep' : 'scanner_sweep';
        return this.soundEffectManager.playSound(soundId, options);
    }
    
    /**
     * Play warning sound based on energy level
     */
    playWarningSound(energyPercentage, options = {}) {
        let soundId;
        let volume = 0.6;
        
        if (energyPercentage <= 5) {
            soundId = 'warning_alarm';
            volume = 0.8;
        } else if (energyPercentage <= 15) {
            soundId = 'energy_low';
            volume = 0.6;
        } else {
            return null; // No warning needed
        }
        
        return this.soundEffectManager.playSound(soundId, {
            volume,
            ...options
        });
    }
    
    /**
     * Play enemy approach sound
     */
    playEnemyApproach(options = {}) {
        return this.soundEffectManager.playSound('enemy_approach', {
            volume: 0.4,
            pitchVariation: 0.1,
            ...options
        });
    }
    
    /**
     * Play energy warning sound with escalation
     */
    playEnergyWarning(options = {}) {
        const soundId = options.level === 'emergency' ? 'warning_alarm' : 'energy_low';
        return this.soundEffectManager.playSound(soundId, {
            volume: 0.6,
            pitchVariation: 0.05,
            ...options
        });
    }
    
    /**
     * Play spy detection sound
     */
    playSpyDetected(options = {}) {
        return this.soundEffectManager.playSound('spy_detected', {
            volume: 0.7,
            ...options
        });
    }
    
    /**
     * Play achievement sound
     */
    playAchievement(options = {}) {
        return this.soundEffectManager.playSound('achievement', {
            volume: 0.8,
            ...options
        });
    }
    
    /**
     * Play power-up sound (for energy restoration)
     */
    playPowerUp(options = {}) {
        return this.soundEffectManager.playSound('power_up', {
            volume: 0.6,
            pitchVariation: 0.1,
            ...options
        });
    }
    
    /**
     * Play game start sound
     */
    playGameStart(options = {}) {
        return this.soundEffectManager.playSound('game_start', {
            volume: 0.7,
            ...options
        });
    }
    
    /**
     * Play UI click sound
     */
    playUIClick(options = {}) {
        if (!this.uiSoundsEnabled) return null;
        
        return this.soundEffectManager.playSound('ui_click', {
            volume: 0.4,
            pitchVariation: 0.05,
            ...options
        });
    }
    
    /**
     * Play UI hover sound
     */
    playUIHover(options = {}) {
        if (!this.uiSoundsEnabled) return null;
        
        return this.soundEffectManager.playSound('ui_hover', {
            volume: 0.3,
            ...options
        });
    }
    
    /**
     * Play UI error sound
     */
    playUIError(options = {}) {
        if (!this.uiSoundsEnabled) return null;
        
        return this.soundEffectManager.playSound('ui_error', {
            volume: 0.5,
            ...options
        });
    }
    
    /**
     * Get a varied sound from a group, avoiding repetition
     */
    getVariedSound(groupName) {
        const group = this.soundGroups[groupName];
        if (!group || group.length === 0) {
            return null;
        }
        
        if (group.length === 1) {
            return group[0];
        }
        
        // Get last played sound in this group
        const lastPlayed = this.lastPlayedInGroup.get(groupName);
        
        // Filter out the last played sound to avoid immediate repetition
        const availableSounds = lastPlayed ? 
            group.filter(sound => sound !== lastPlayed) : 
            group;
        
        // Select random sound from available options
        const selectedSound = availableSounds[Math.floor(Math.random() * availableSounds.length)];
        
        // Update last played tracking
        this.lastPlayedInGroup.set(groupName, selectedSound);
        
        return selectedSound;
    }
    
    /**
     * Play contextual feedback sound based on game events
     */
    playContextualFeedback(eventType, context = {}) {
        switch (eventType) {
            case 'enemy_killed':
                this.playEnemyExplosion(context.x, context.y);
                if (context.isCombo && context.comboCount > 3) {
                    setTimeout(() => this.playAchievement(), 200);
                }
                break;
                
            case 'spy_killed':
                this.playEnemyExplosion(context.x, context.y, { pitch: 0.8 });
                setTimeout(() => this.playUIError(), 300);
                break;
                
            case 'rock_hit':
                this.playRockExplosion(context.x, context.y, context.destroyed);
                break;
                
            case 'energy_restored':
                this.playPowerUp();
                break;
                
            case 'scanner_toggle':
                this.playScannerSound(context.isActivating);
                break;
                
            case 'game_start':
                this.playGameStart();
                break;
                
            case 'score_milestone':
                this.playAchievement();
                break;
                
            default:
                console.warn(`Unknown contextual feedback event: ${eventType}`);
        }
    }
    
    /**
     * Enable or disable UI sounds
     */
    setUISoundsEnabled(enabled) {
        this.uiSoundsEnabled = enabled;
    }
    
    /**
     * Add UI sound effects to DOM elements
     */
    addUISounds() {
        // Add click sounds to buttons
        const buttons = document.querySelectorAll('button');
        buttons.forEach(button => {
            button.addEventListener('click', () => {
                this.playUIClick();
            });
            
            button.addEventListener('mouseenter', () => {
                this.playUIHover();
            });
        });
        
        // Add sounds to sliders
        const sliders = document.querySelectorAll('input[type="range"]');
        sliders.forEach(slider => {
            slider.addEventListener('input', () => {
                // Play a subtle click for slider movement
                this.soundEffectManager.playSound('ui_click', { 
                    volume: 0.2,
                    pitch: 1.2 
                });
            });
        });
        
        // Add sounds to interactive elements
        const interactiveElements = document.querySelectorAll('.preset-button, .close-button');
        interactiveElements.forEach(element => {
            element.addEventListener('click', () => {
                this.playUIClick();
            });
        });
        
        console.log('✅ UI sounds added to DOM elements');
    }
    
    /**
     * Play layered sound effects for complex events
     */
    playLayeredEffect(effectName, context = {}) {
        switch (effectName) {
            case 'massive_explosion':
                // Play multiple explosion sounds with slight delays
                this.playEnemyExplosion(context.x, context.y, { volume: 1.0 });
                setTimeout(() => {
                    this.playEnemyExplosion(context.x + 10, context.y + 5, { 
                        volume: 0.7, 
                        pitch: 0.8 
                    });
                }, 100);
                setTimeout(() => {
                    this.playRockExplosion(context.x - 5, context.y + 10, true, { 
                        volume: 0.5 
                    });
                }, 200);
                break;
                
            case 'scanner_sweep_complete':
                this.playScannerSound(true);
                setTimeout(() => {
                    this.playScannerSound(false);
                }, 300);
                break;
                
            case 'game_over_sequence':
                this.playUIError();
                setTimeout(() => {
                    this.soundEffectManager.playSound('warning_alarm', { 
                        volume: 0.4, 
                        pitch: 0.7 
                    });
                }, 500);
                break;
        }
    }
    
    /**
     * Get statistics about sound effect usage
     */
    getStats() {
        return {
            soundGroups: Object.keys(this.soundGroups).length,
            lastPlayedTracking: this.lastPlayedInGroup.size,
            uiSoundsEnabled: this.uiSoundsEnabled,
            soundEffectManagerStats: this.soundEffectManager.getStats()
        };
    }
    
    /**
     * Clean up resources
     */
    dispose() {
        this.lastPlayedInGroup.clear();
        console.log('🧹 EnhancedSoundEffects disposed');
    }
}