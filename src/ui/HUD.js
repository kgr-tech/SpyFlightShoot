// HUD - Heads-Up Display management
// Handles the top HUD elements (score, energy, scanner status)

export class HUD {
    constructor() {
        this.elements = {
            score: document.getElementById('score'),
            energyFill: document.getElementById('energy-fill'),
            scannerStatus: document.getElementById('scanner-status'),
            audioButton: document.getElementById('audioSettingsButton')
        };
        
        // Verify all elements exist
        this.validateElements();
    }
    
    /**
     * Validate that all HUD elements exist
     */
    validateElements() {
        for (const [name, element] of Object.entries(this.elements)) {
            if (!element) {
                console.warn(`⚠️ HUD element '${name}' not found`);
            }
        }
    }
    
    /**
     * Update the score display
     */
    updateScore(score) {
        if (this.elements.score) {
            this.elements.score.textContent = this.formatScore(score);
        }
    }
    
    /**
     * Update the energy bar
     */
    updateEnergy(energyPercentage, isLow = false, isCritical = false) {
        if (!this.elements.energyFill) return;
        
        // Update width
        this.elements.energyFill.style.width = `${Math.max(0, Math.min(100, energyPercentage))}%`;
        
        // Update color based on energy level
        let gradient;
        if (isCritical) {
            gradient = 'linear-gradient(90deg, #ff0000 0%, #ff4444 100%)';
        } else if (isLow) {
            gradient = 'linear-gradient(90deg, #ffaa00 0%, #ffdd44 100%)';
        } else {
            gradient = 'linear-gradient(90deg, #00ff00 0%, #44ff44 100%)';
        }
        
        this.elements.energyFill.style.background = gradient;
        
        // Add pulsing animation for low energy
        if (isLow) {
            this.elements.energyFill.classList.add('low');
        } else {
            this.elements.energyFill.classList.remove('low');
        }
    }
    
    /**
     * Update scanner status
     */
    updateScanner(status, isActive = false) {
        if (!this.elements.scannerStatus) return;
        
        this.elements.scannerStatus.textContent = status;
        
        // Update styling based on active state
        if (isActive) {
            this.elements.scannerStatus.className = 'scanner-value active';
        } else {
            this.elements.scannerStatus.className = 'scanner-value';
        }
    }
    
    /**
     * Show/hide HUD elements
     */
    setVisibility(visible) {
        const hudElement = document.querySelector('.hud');
        if (hudElement) {
            hudElement.style.display = visible ? 'flex' : 'none';
        }
    }
    
    /**
     * Format score with leading zeros
     */
    formatScore(score) {
        return score.toString().padStart(6, '0');
    }
    
    /**
     * Update all HUD elements at once
     */
    updateAll(gameData) {
        this.updateScore(gameData.score || 0);
        this.updateEnergy(
            gameData.energyPercentage || 0,
            gameData.energyLow || false,
            gameData.energyCritical || false
        );
        this.updateScanner(
            gameData.scannerStatus || 'READY',
            gameData.scannerActive || false
        );
    }
    
    /**
     * Add event listeners for HUD interactions
     */
    setupEventListeners(callbacks = {}) {
        // Audio settings button
        if (this.elements.audioButton && callbacks.onAudioSettings) {
            this.elements.audioButton.addEventListener('click', (e) => {
                callbacks.onAudioSettings();
                e.stopPropagation();
            });
        }
    }
    
    /**
     * Show game over state
     */
    showGameOver(finalScore) {
        const gameOverScreen = document.getElementById('gameOverScreen');
        const finalScoreElement = document.getElementById('finalScore');
        
        if (finalScoreElement) {
            finalScoreElement.textContent = this.formatScore(finalScore);
        }
        
        if (gameOverScreen) {
            gameOverScreen.classList.remove('hidden');
        }
    }
    
    /**
     * Hide game over screen
     */
    hideGameOver() {
        const gameOverScreen = document.getElementById('gameOverScreen');
        if (gameOverScreen) {
            gameOverScreen.classList.add('hidden');
        }
    }
}