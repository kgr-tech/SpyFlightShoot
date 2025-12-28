// GameStateManager - Centralized game state management
// Handles game state transitions and data coordination

export class GameStateManager {
    constructor() {
        this.state = {
            // Game flow
            gameStatus: 'start_screen', // 'start_screen', 'playing', 'paused', 'game_over'
            timePlayed: 0,
            difficultyLevel: 1,
            
            // UI state
            showDebugPanel: true,
            showHUD: true,
            
            // Game data
            score: 0,
            energy: 100,
            maxEnergy: 100,
            
            // Counters
            bullets: 0,
            enemies: 0,
            rocks: 0,
            
            // Systems state
            scannerActive: false,
            scannerStatus: 'READY',
            
            // Environment
            currentEnvironment: null,
            environmentProgress: 0,
            
            // Performance
            fps: 60,
            deltaTime: 0
        };
        
        // State change listeners
        this.listeners = new Map();
        
        console.log('🎮 GameStateManager initialized');
    }
    
    /**
     * Get current game state
     */
    getState() {
        return { ...this.state };
    }
    
    /**
     * Get specific state value
     */
    get(key) {
        return this.state[key];
    }
    
    /**
     * Set specific state value
     */
    set(key, value) {
        const oldValue = this.state[key];
        this.state[key] = value;
        
        // Notify listeners of change
        this.notifyListeners(key, value, oldValue);
    }
    
    /**
     * Update multiple state values
     */
    update(updates) {
        const changes = {};
        
        for (const [key, value] of Object.entries(updates)) {
            const oldValue = this.state[key];
            this.state[key] = value;
            changes[key] = { newValue: value, oldValue };
        }
        
        // Notify listeners of batch changes
        this.notifyBatchListeners(changes);
    }
    
    /**
     * Add state change listener
     */
    addListener(key, callback) {
        if (!this.listeners.has(key)) {
            this.listeners.set(key, new Set());
        }
        this.listeners.get(key).add(callback);
    }
    
    /**
     * Remove state change listener
     */
    removeListener(key, callback) {
        if (this.listeners.has(key)) {
            this.listeners.get(key).delete(callback);
        }
    }
    
    /**
     * Notify listeners of state changes
     */
    notifyListeners(key, newValue, oldValue) {
        if (this.listeners.has(key)) {
            this.listeners.get(key).forEach(callback => {
                try {
                    callback(newValue, oldValue, key);
                } catch (error) {
                    console.error(`Error in state listener for '${key}':`, error);
                }
            });
        }
    }
    
    /**
     * Notify listeners of batch changes
     */
    notifyBatchListeners(changes) {
        // Notify individual listeners first
        for (const [key, { newValue, oldValue }] of Object.entries(changes)) {
            this.notifyListeners(key, newValue, oldValue);
        }
        
        // Notify batch listeners
        if (this.listeners.has('*')) {
            this.listeners.get('*').forEach(callback => {
                try {
                    callback(changes);
                } catch (error) {
                    console.error('Error in batch state listener:', error);
                }
            });
        }
    }
    
    /**
     * Game state transitions
     */
    startGame() {
        this.update({
            gameStatus: 'playing',
            timePlayed: 0,
            difficultyLevel: 1,
            score: 0,
            energy: this.state.maxEnergy,
            showHUD: true
        });
        
        console.log('🎮 Game started');
    }
    
    pauseGame() {
        if (this.state.gameStatus === 'playing') {
            this.set('gameStatus', 'paused');
            console.log('⏸️ Game paused');
        } else if (this.state.gameStatus === 'paused') {
            this.set('gameStatus', 'playing');
            console.log('▶️ Game resumed');
        }
    }
    
    endGame() {
        this.set('gameStatus', 'game_over');
        console.log('💀 Game over');
    }
    
    restartGame() {
        this.update({
            gameStatus: 'start_screen',
            timePlayed: 0,
            difficultyLevel: 1,
            score: 0,
            energy: this.state.maxEnergy,
            bullets: 0,
            enemies: 0,
            rocks: 0,
            scannerActive: false,
            scannerStatus: 'READY'
        });
        
        console.log('🔄 Game restarted');
    }
    
    /**
     * Update game statistics
     */
    updateGameStats(stats) {
        this.update({
            bullets: stats.bullets || 0,
            enemies: stats.enemies || 0,
            rocks: stats.rocks || 0,
            energy: stats.energy || this.state.energy,
            score: stats.score || this.state.score,
            scannerActive: stats.scannerActive || false,
            scannerStatus: stats.scannerStatus || 'READY'
        });
    }
    
    /**
     * Update environment information
     */
    updateEnvironment(envData) {
        this.update({
            currentEnvironment: envData.name || this.state.currentEnvironment,
            environmentProgress: envData.progress || 0
        });
    }
    
    /**
     * Update performance metrics
     */
    updatePerformance(fps, deltaTime) {
        this.update({
            fps: Math.round(fps),
            deltaTime: deltaTime
        });
    }
    
    /**
     * Toggle debug panel
     */
    toggleDebugPanel() {
        this.set('showDebugPanel', !this.state.showDebugPanel);
    }
    
    /**
     * Check if game is playing
     */
    isPlaying() {
        return this.state.gameStatus === 'playing';
    }
    
    /**
     * Check if game is paused
     */
    isPaused() {
        return this.state.gameStatus === 'paused';
    }
    
    /**
     * Check if game is over
     */
    isGameOver() {
        return this.state.gameStatus === 'game_over';
    }
    
    /**
     * Check if on start screen
     */
    isStartScreen() {
        return this.state.gameStatus === 'start_screen';
    }
    
    /**
     * Get formatted data for UI components
     */
    getUIData() {
        return {
            // HUD data
            score: this.state.score,
            energyPercentage: (this.state.energy / this.state.maxEnergy) * 100,
            energyLow: this.state.energy < 20,
            energyCritical: this.state.energy < 10,
            scannerStatus: this.state.scannerStatus,
            scannerActive: this.state.scannerActive,
            
            // Stats panel data
            bullets: this.state.bullets,
            energy: this.state.energy,
            enemies: this.state.enemies,
            rocks: this.state.rocks,
            difficulty: this.state.difficultyLevel,
            fps: this.state.fps,
            timePlayed: this.state.timePlayed,
            environment: {
                name: this.state.currentEnvironment,
                progress: this.state.environmentProgress
            }
        };
    }
}