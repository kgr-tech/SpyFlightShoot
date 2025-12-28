// AudioSettingsManager - Manages audio settings and UI controls
// Handles volume controls, mute functionality, and settings persistence

export class AudioSettingsManager {
    constructor(audioSystem) {
        this.audioSystem = audioSystem;
        
        // Settings state
        this.settings = {
            masterVolume: 1.0,
            sfxVolume: 1.0,
            musicVolume: 1.0,
            isMuted: false
        };
        
        // UI elements (will be populated when UI is created)
        this.uiElements = {
            masterSlider: null,
            sfxSlider: null,
            musicSlider: null,
            muteButton: null,
            settingsPanel: null
        };
        
        // Settings panel state
        this.isPanelVisible = false;
        
        console.log('🎛️ AudioSettingsManager initialized');
    }
    
    /**
     * Initialize audio settings UI
     */
    initializeUI() {
        this.createSettingsPanel();
        this.createVolumeControls();
        this.createMuteControl();
        this.setupEventListeners();
        this.loadSettings();
        
        console.log('✅ Audio settings UI initialized');
    }
    
    /**
     * Create the main settings panel
     */
    createSettingsPanel() {
        // Create settings panel container
        const panel = document.createElement('div');
        panel.id = 'audioSettingsPanel';
        panel.className = 'audio-settings-panel hidden';
        panel.innerHTML = `
            <div class="settings-header">
                <h3>Audio Settings</h3>
                <button id="closeAudioSettings" class="close-button">×</button>
            </div>
            <div class="settings-content">
                <div class="volume-section">
                    <div class="volume-control">
                        <label for="masterVolumeSlider">Master Volume</label>
                        <div class="slider-container">
                            <input type="range" id="masterVolumeSlider" min="0" max="100" value="100" class="volume-slider">
                            <span id="masterVolumeValue" class="volume-value">100%</span>
                        </div>
                    </div>
                    
                    <div class="volume-control">
                        <label for="sfxVolumeSlider">Sound Effects</label>
                        <div class="slider-container">
                            <input type="range" id="sfxVolumeSlider" min="0" max="100" value="100" class="volume-slider">
                            <span id="sfxVolumeValue" class="volume-value">100%</span>
                        </div>
                    </div>
                    
                    <div class="volume-control">
                        <label for="musicVolumeSlider">Music</label>
                        <div class="slider-container">
                            <input type="range" id="musicVolumeSlider" min="0" max="100" value="100" class="volume-slider">
                            <span id="musicVolumeValue" class="volume-value">100%</span>
                        </div>
                    </div>
                </div>
                
                <div class="mute-section">
                    <button id="muteToggleButton" class="mute-button">
                        <span class="mute-icon">🔊</span>
                        <span class="mute-text">Mute All</span>
                    </button>
                </div>
                
                <div class="preset-section">
                    <label>Quick Presets:</label>
                    <div class="preset-buttons">
                        <button class="preset-button" data-preset="silent">Silent</button>
                        <button class="preset-button" data-preset="low">Low</button>
                        <button class="preset-button" data-preset="medium">Medium</button>
                        <button class="preset-button" data-preset="high">High</button>
                    </div>
                </div>
            </div>
        `;
        
        // Add to game container
        const gameContainer = document.querySelector('.game-container');
        if (gameContainer) {
            gameContainer.appendChild(panel);
        } else {
            document.body.appendChild(panel);
        }
        
        this.uiElements.settingsPanel = panel;
    }
    
    /**
     * Create volume control sliders
     */
    createVolumeControls() {
        this.uiElements.masterSlider = document.getElementById('masterVolumeSlider');
        this.uiElements.sfxSlider = document.getElementById('sfxVolumeSlider');
        this.uiElements.musicSlider = document.getElementById('musicVolumeSlider');
        
        // Set initial values
        this.updateSliderValues();
    }
    
    /**
     * Create mute control button
     */
    createMuteControl() {
        this.uiElements.muteButton = document.getElementById('muteToggleButton');
        this.updateMuteButton();
    }
    
    /**
     * Set up event listeners for all controls
     */
    setupEventListeners() {
        // Volume sliders
        if (this.uiElements.masterSlider) {
            this.uiElements.masterSlider.addEventListener('input', (e) => {
                this.setMasterVolume(e.target.value / 100);
            });
        }
        
        if (this.uiElements.sfxSlider) {
            this.uiElements.sfxSlider.addEventListener('input', (e) => {
                this.setSFXVolume(e.target.value / 100);
            });
        }
        
        if (this.uiElements.musicSlider) {
            this.uiElements.musicSlider.addEventListener('input', (e) => {
                this.setMusicVolume(e.target.value / 100);
            });
        }
        
        // Mute button
        if (this.uiElements.muteButton) {
            this.uiElements.muteButton.addEventListener('click', () => {
                this.toggleMute();
            });
        }
        
        // Close button
        const closeButton = document.getElementById('closeAudioSettings');
        if (closeButton) {
            closeButton.addEventListener('click', () => {
                this.hideSettingsPanel();
            });
        }
        
        // Preset buttons
        const presetButtons = document.querySelectorAll('.preset-button');
        presetButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                this.applyPreset(e.target.dataset.preset);
            });
        });
        
        // Keyboard shortcut to open settings (M key)
        document.addEventListener('keydown', (e) => {
            if (e.code === 'KeyM' && !e.ctrlKey && !e.altKey) {
                this.toggleSettingsPanel();
                e.preventDefault();
            }
        });
    }
    
    /**
     * Set master volume
     */
    setMasterVolume(volume) {
        this.settings.masterVolume = Math.max(0, Math.min(1, volume));
        this.audioSystem.setMasterVolume(this.settings.masterVolume);
        this.updateVolumeDisplay('master');
        this.saveSettings();
    }
    
    /**
     * Set sound effects volume
     */
    setSFXVolume(volume) {
        this.settings.sfxVolume = Math.max(0, Math.min(1, volume));
        this.audioSystem.setSFXVolume(this.settings.sfxVolume);
        this.updateVolumeDisplay('sfx');
        this.saveSettings();
        
        // Play test sound effect
        this.playTestSound();
    }
    
    /**
     * Set music volume
     */
    setMusicVolume(volume) {
        this.settings.musicVolume = Math.max(0, Math.min(1, volume));
        this.audioSystem.setMusicVolume(this.settings.musicVolume);
        this.updateVolumeDisplay('music');
        this.saveSettings();
    }
    
    /**
     * Toggle mute state
     */
    toggleMute() {
        this.settings.isMuted = !this.settings.isMuted;
        this.audioSystem.setMuted(this.settings.isMuted);
        this.updateMuteButton();
        this.saveSettings();
    }
    
    /**
     * Apply volume preset
     */
    applyPreset(presetName) {
        const presets = {
            silent: { master: 0, sfx: 0, music: 0 },
            low: { master: 0.3, sfx: 0.4, music: 0.2 },
            medium: { master: 0.7, sfx: 0.7, music: 0.6 },
            high: { master: 1.0, sfx: 1.0, music: 0.8 }
        };
        
        const preset = presets[presetName];
        if (preset) {
            this.setMasterVolume(preset.master);
            this.setSFXVolume(preset.sfx);
            this.setMusicVolume(preset.music);
            
            // Update sliders
            this.updateSliderValues();
            
            console.log(`🎛️ Applied preset: ${presetName}`);
        }
    }
    
    /**
     * Update volume display values
     */
    updateVolumeDisplay(type) {
        const valueElements = {
            master: document.getElementById('masterVolumeValue'),
            sfx: document.getElementById('sfxVolumeValue'),
            music: document.getElementById('musicVolumeValue')
        };
        
        const values = {
            master: this.settings.masterVolume,
            sfx: this.settings.sfxVolume,
            music: this.settings.musicVolume
        };
        
        if (valueElements[type]) {
            valueElements[type].textContent = Math.round(values[type] * 100) + '%';
        }
    }
    
    /**
     * Update all slider values
     */
    updateSliderValues() {
        if (this.uiElements.masterSlider) {
            this.uiElements.masterSlider.value = this.settings.masterVolume * 100;
            this.updateVolumeDisplay('master');
        }
        
        if (this.uiElements.sfxSlider) {
            this.uiElements.sfxSlider.value = this.settings.sfxVolume * 100;
            this.updateVolumeDisplay('sfx');
        }
        
        if (this.uiElements.musicSlider) {
            this.uiElements.musicSlider.value = this.settings.musicVolume * 100;
            this.updateVolumeDisplay('music');
        }
    }
    
    /**
     * Update mute button appearance
     */
    updateMuteButton() {
        if (!this.uiElements.muteButton) return;
        
        const icon = this.uiElements.muteButton.querySelector('.mute-icon');
        const text = this.uiElements.muteButton.querySelector('.mute-text');
        
        if (this.settings.isMuted) {
            icon.textContent = '🔇';
            text.textContent = 'Unmute';
            this.uiElements.muteButton.classList.add('muted');
        } else {
            icon.textContent = '🔊';
            text.textContent = 'Mute All';
            this.uiElements.muteButton.classList.remove('muted');
        }
    }
    
    /**
     * Show settings panel
     */
    showSettingsPanel() {
        if (this.uiElements.settingsPanel) {
            this.uiElements.settingsPanel.classList.remove('hidden');
            this.isPanelVisible = true;
        }
    }
    
    /**
     * Hide settings panel
     */
    hideSettingsPanel() {
        if (this.uiElements.settingsPanel) {
            this.uiElements.settingsPanel.classList.add('hidden');
            this.isPanelVisible = false;
        }
    }
    
    /**
     * Toggle settings panel visibility
     */
    toggleSettingsPanel() {
        if (this.isPanelVisible) {
            this.hideSettingsPanel();
        } else {
            this.showSettingsPanel();
        }
    }
    
    /**
     * Play test sound effect when adjusting SFX volume
     */
    playTestSound() {
        // This will be connected to the sound effect manager
        if (window.spyShootGame && window.spyShootGame.soundEffectManager) {
            window.spyShootGame.soundEffectManager.playSound('scanner_beep', { volume: 0.5 });
        }
    }
    
    /**
     * Load settings from localStorage
     */
    loadSettings() {
        try {
            const savedSettings = localStorage.getItem('spyshoot_audio_settings');
            if (savedSettings) {
                const settings = JSON.parse(savedSettings);
                
                this.settings.masterVolume = settings.masterVolume || 1.0;
                this.settings.sfxVolume = settings.sfxVolume || 1.0;
                this.settings.musicVolume = settings.musicVolume || 1.0;
                this.settings.isMuted = settings.isMuted || false;
                
                // Apply to audio system
                this.audioSystem.setMasterVolume(this.settings.masterVolume);
                this.audioSystem.setSFXVolume(this.settings.sfxVolume);
                this.audioSystem.setMusicVolume(this.settings.musicVolume);
                this.audioSystem.setMuted(this.settings.isMuted);
                
                // Update UI
                this.updateSliderValues();
                this.updateMuteButton();
                
                console.log('✅ Audio settings loaded');
            }
        } catch (error) {
            console.warn('⚠️ Failed to load audio settings:', error);
        }
    }
    
    /**
     * Save settings to localStorage
     */
    saveSettings() {
        try {
            localStorage.setItem('spyshoot_audio_settings', JSON.stringify(this.settings));
        } catch (error) {
            console.warn('⚠️ Failed to save audio settings:', error);
        }
    }
    
    /**
     * Get current settings
     */
    getSettings() {
        return { ...this.settings };
    }
    
    /**
     * Clean up resources
     */
    dispose() {
        // Remove event listeners and UI elements
        if (this.uiElements.settingsPanel) {
            this.uiElements.settingsPanel.remove();
        }
        
        console.log('🧹 AudioSettingsManager disposed');
    }
}