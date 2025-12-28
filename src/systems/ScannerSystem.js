// Scanner system for identifying enemy types
import { GAME_CONFIG, KEYS } from '../utils/GameConstants.js';

export class ScannerSystem {
    constructor() {
        this.isActive = false;
        this.energyDrainRate = GAME_CONFIG.SCANNER_ENERGY_DRAIN_RATE;
        this.scannerToggleCooldown = 200; // Prevent rapid toggling
        this.lastToggleTime = 0;
    }
    
    update(deltaTime, inputSystem, energySystem, soundEffectManager = null, enhancedSoundEffects = null) {
        const currentTime = Date.now();
        
        // Handle scanner toggle input
        if (inputSystem.isKeyJustPressed(KEYS.SCANNER) && 
            currentTime - this.lastToggleTime > this.scannerToggleCooldown) {
            
            this.toggle(energySystem, soundEffectManager, enhancedSoundEffects);
            this.lastToggleTime = currentTime;
        }
        
        // Auto-deactivate scanner if energy is empty
        if (this.isActive && energySystem.isEmpty()) {
            this.deactivate();
        }
    }
    
    toggle(energySystem, soundEffectManager = null, enhancedSoundEffects = null) {
        if (this.isActive) {
            this.deactivate();
        } else {
            this.activate(energySystem, soundEffectManager, enhancedSoundEffects);
        }
    }
    
    activate(energySystem, soundEffectManager = null, enhancedSoundEffects = null) {
        // Only activate if there's energy available
        if (!energySystem.isEmpty()) {
            this.isActive = true;
            
            // Play enhanced scanner activation sound
            if (enhancedSoundEffects) {
                enhancedSoundEffects.playScannerSound(true);
            } else if (soundEffectManager) {
                soundEffectManager.playSound('scanner_beep');
            }
        }
    }
    
    deactivate() {
        this.isActive = false;
    }
    
    // Get outline color for enemy ships when scanner is active
    getShipOutlineColor(ship) {
        if (!this.isActive) return null;
        
        switch (ship.type) {
            case 'enemy':
                return GAME_CONFIG.COLORS.SCANNER_ENEMY; // Red
            case 'spy':
                return GAME_CONFIG.COLORS.SCANNER_SPY; // Green
            default:
                return null;
        }
    }
    
    // Check if scanner is currently active
    isScanning() {
        return this.isActive;
    }
    
    // Get scanner status for UI
    getStatus() {
        return this.isActive ? 'ACTIVE' : 'READY';
    }
    
    // Reset scanner (for game restart)
    reset() {
        this.isActive = false;
        this.lastToggleTime = 0;
    }
    
    // Force deactivate (for energy depletion)
    forceDeactivate() {
        this.isActive = false;
    }
}