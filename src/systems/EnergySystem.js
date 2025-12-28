// Energy management system for SpyShoot
import { GAME_CONFIG } from '../utils/GameConstants.js';

export class EnergySystem {
    constructor(maxEnergy = GAME_CONFIG.PLAYER_MAX_ENERGY) {
        this.maxEnergy = maxEnergy;
        this.currentEnergy = maxEnergy;
        this.energyDrainRate = GAME_CONFIG.SCANNER_ENERGY_DRAIN_RATE;
        
        // Energy regeneration (optional feature)
        this.naturalRegenRate = 0.5; // Energy per second natural regen
        this.lastRegenTime = 0;
        this.regenCooldown = 3000; // 3 seconds without energy consumption before regen starts
        
        // Energy consumption tracking
        this.lastEnergyUse = 0;
        
        // Warning sound tracking
        this.wasCritical = false;
        this.lastWarningSound = 0;
        this.warningSoundCooldown = 2000; // 2 seconds between warning sounds
    }
    
    update(deltaTime, scannerActive, soundEffectManager = null, enhancedSoundEffects = null, advancedAudioManager = null) {
        const currentTime = Date.now();
        
        // Handle scanner energy drain
        if (scannerActive && this.currentEnergy > 0) {
            const drainAmount = (this.energyDrainRate * deltaTime) / 1000;
            this.consumeEnergy(drainAmount);
        }
        
        // Handle natural energy regeneration (when not using energy)
        if (currentTime - this.lastEnergyUse > this.regenCooldown && this.currentEnergy < this.maxEnergy) {
            const regenAmount = (this.naturalRegenRate * deltaTime) / 1000;
            this.restoreEnergy(regenAmount);
        }
        
        // Handle energy warning sounds (legacy support)
        this.handleWarningSound(soundEffectManager, enhancedSoundEffects);
        
        // Advanced audio manager handles escalating warnings automatically
        // No additional integration needed here as it reads energy percentage directly
        
        // Ensure energy stays within bounds
        this.currentEnergy = Math.max(0, Math.min(this.maxEnergy, this.currentEnergy));
    }
    
    // Handle energy warning sound effects
    handleWarningSound(soundEffectManager, enhancedSoundEffects) {
        const currentTime = Date.now();
        const isCriticalNow = this.isCritical();
        const energyPercentage = this.getEnergyPercentage();
        
        // Play warning sound when energy becomes critical or periodically while critical
        if (isCriticalNow && (!this.wasCritical || currentTime - this.lastWarningSound > this.warningSoundCooldown)) {
            
            if (enhancedSoundEffects) {
                enhancedSoundEffects.playWarningSound(energyPercentage);
            } else if (soundEffectManager) {
                soundEffectManager.playSound('warning_alarm');
            }
            
            this.lastWarningSound = currentTime;
        }
        
        this.wasCritical = isCriticalNow;
    }
    
    // Consume energy for actions (shooting, scanning)
    consumeEnergy(amount) {
        if (this.currentEnergy >= amount) {
            this.currentEnergy -= amount;
            this.lastEnergyUse = Date.now();
            return true;
        }
        return false;
    }
    
    // Restore energy (from destroying enemies)
    restoreEnergy(amount) {
        this.currentEnergy = Math.min(this.maxEnergy, this.currentEnergy + amount);
    }
    
    // Get current energy level
    getCurrentEnergy() {
        return this.currentEnergy;
    }
    
    // Get energy as percentage
    getEnergyPercentage() {
        return (this.currentEnergy / this.maxEnergy) * 100;
    }
    
    // Check if energy is empty
    isEmpty() {
        return this.currentEnergy <= 0;
    }
    
    // Check if energy is low (below 25%)
    isLow() {
        return this.getEnergyPercentage() < 25;
    }
    
    // Check if energy is critical (below 10%)
    isCritical() {
        return this.getEnergyPercentage() < 10;
    }
    
    // Reset energy to full (for game restart)
    reset() {
        this.currentEnergy = this.maxEnergy;
        this.lastEnergyUse = 0;
        this.lastRegenTime = 0;
        this.wasCritical = false;
        this.lastWarningSound = 0;
    }
    
    // Set energy to specific value (for testing or special events)
    setEnergy(amount) {
        this.currentEnergy = Math.max(0, Math.min(this.maxEnergy, amount));
    }
    
    // Get energy status for UI display
    getEnergyStatus() {
        const percentage = this.getEnergyPercentage();
        
        if (percentage <= 0) return 'empty';
        if (percentage < 10) return 'critical';
        if (percentage < 25) return 'low';
        if (percentage < 50) return 'medium';
        return 'high';
    }
    
    // Calculate energy color for UI
    getEnergyColor() {
        const status = this.getEnergyStatus();
        
        switch (status) {
            case 'empty':
            case 'critical':
                return '#ff0000';
            case 'low':
                return '#ff6600';
            case 'medium':
                return '#ffff00';
            case 'high':
            default:
                return '#00ff00';
        }
    }
    
    // Get energy bar gradient for UI
    getEnergyGradient() {
        const status = this.getEnergyStatus();
        
        switch (status) {
            case 'empty':
            case 'critical':
                return 'linear-gradient(90deg, #ff0000, #ff3300)';
            case 'low':
                return 'linear-gradient(90deg, #ff6600, #ff9900)';
            case 'medium':
                return 'linear-gradient(90deg, #ff9900, #ffff00)';
            case 'high':
            default:
                return 'linear-gradient(90deg, #00ff00, #66ff00)';
        }
    }
}