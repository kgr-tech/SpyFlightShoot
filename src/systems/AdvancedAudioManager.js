// AdvancedAudioManager - Handles audio priority, mixing, and advanced audio features
// Manages achievement sounds, enemy approach cues, and escalating warning systems

export class AdvancedAudioManager {
    constructor(audioSystem, soundEffectManager, enhancedSoundEffects) {
        this.audioSystem = audioSystem;
        this.soundEffectManager = soundEffectManager;
        this.enhancedSoundEffects = enhancedSoundEffects;
        
        // Audio priority system
        this.audioPriorities = {
            CRITICAL: 5,    // Game over, critical warnings
            HIGH: 4,        // Achievements, spy detection
            MEDIUM: 3,      // Enemy approach, scanner
            LOW: 2,         // Shooting, explosions
            AMBIENT: 1      // Background effects
        };
        
        // Active audio tracking
        this.activeAudio = new Map();
        this.audioQueue = [];
        this.maxConcurrentSounds = 8;
        
        // Enemy approach system
        this.enemyApproachState = {
            lastWarningTime: 0,
            warningInterval: 3000, // 3 seconds between warnings
            proximityThreshold: 150, // Distance threshold for approach warning
            trackedEnemies: new Set()
        };
        
        // Achievement system
        this.achievementState = {
            lastAchievementTime: 0,
            achievementCooldown: 2000, // 2 seconds between achievements
            queuedAchievements: []
        };
        
        // Energy warning system
        this.energyWarningState = {
            lastWarningTime: 0,
            warningLevel: 'none', // 'none', 'low', 'critical', 'emergency'
            escalationTimes: {
                low: 5000,      // 5 seconds between low warnings
                critical: 3000, // 3 seconds between critical warnings
                emergency: 1000 // 1 second between emergency warnings
            }
        };
        
        // Scanner detection system
        this.scannerDetectionState = {
            lastSpyDetectionTime: 0,
            detectionCooldown: 1000, // 1 second cooldown
            detectedSpies: new Set()
        };
        
        console.log('🔊 AdvancedAudioManager initialized');
    }
    
    /**
     * Update advanced audio features
     */
    update(deltaTime, gameState) {
        // Update enemy approach warnings
        this.updateEnemyApproachWarnings(gameState);
        
        // Update energy warnings
        this.updateEnergyWarnings(gameState);
        
        // Update scanner detection
        this.updateScannerDetection(gameState);
        
        // Process audio queue
        this.processAudioQueue();
        
        // Clean up expired audio tracking
        this.cleanupAudioTracking();
    }
    
    /**
     * Update enemy approach warning system
     */
    updateEnemyApproachWarnings(gameState) {
        const currentTime = Date.now();
        
        if (currentTime - this.enemyApproachState.lastWarningTime < this.enemyApproachState.warningInterval) {
            return;
        }
        
        // Check for approaching enemies
        const player = gameState.player;
        const enemies = gameState.enemies || [];
        
        if (!player || enemies.length === 0) return;
        
        let closestDistance = Infinity;
        let approachingEnemies = 0;
        
        enemies.forEach(enemy => {
            if (!enemy.isActive()) return;
            
            const distance = this.calculateDistance(player, enemy);
            
            if (distance < this.enemyApproachState.proximityThreshold) {
                approachingEnemies++;
                closestDistance = Math.min(closestDistance, distance);
            }
        });
        
        // Play approach warning if enemies are close
        if (approachingEnemies > 0) {
            this.playEnemyApproachWarning(approachingEnemies, closestDistance);
            this.enemyApproachState.lastWarningTime = currentTime;
        }
    }
    
    /**
     * Play enemy approach warning
     */
    playEnemyApproachWarning(enemyCount, closestDistance) {
        // Calculate warning intensity based on proximity and count
        const proximityFactor = 1.0 - (closestDistance / this.enemyApproachState.proximityThreshold);
        const countFactor = Math.min(1.0, enemyCount / 5); // Max factor at 5 enemies
        const intensity = (proximityFactor + countFactor) / 2;
        
        // Play approach sound with intensity-based pitch
        this.queueAudio({
            soundId: 'enemy_approach',
            priority: this.audioPriorities.MEDIUM,
            options: {
                volume: 0.4 + intensity * 0.3,
                pitch: 0.8 + intensity * 0.4,
                pitchVariation: 0.1
            },
            metadata: {
                type: 'enemy_approach',
                intensity: intensity,
                enemyCount: enemyCount
            }
        });
        
        console.log(`⚠️ Enemy approach warning: ${enemyCount} enemies, intensity ${intensity.toFixed(2)}`);
    }
    
    /**
     * Update energy warning system with escalation
     */
    updateEnergyWarnings(gameState) {
        const currentTime = Date.now();
        const energyPercentage = gameState.energyPercentage || 1.0;
        
        // Determine warning level
        let newWarningLevel = 'none';
        if (energyPercentage <= 0.1) {
            newWarningLevel = 'emergency'; // 10% or less
        } else if (energyPercentage <= 0.2) {
            newWarningLevel = 'critical';  // 20% or less
        } else if (energyPercentage <= 0.3) {
            newWarningLevel = 'low';       // 30% or less
        }
        
        // Check if we need to play a warning
        if (newWarningLevel !== 'none') {
            const warningInterval = this.energyWarningState.escalationTimes[newWarningLevel];
            
            if (currentTime - this.energyWarningState.lastWarningTime >= warningInterval ||
                newWarningLevel !== this.energyWarningState.warningLevel) {
                
                this.playEnergyWarning(newWarningLevel, energyPercentage);
                this.energyWarningState.lastWarningTime = currentTime;
            }
        }
        
        this.energyWarningState.warningLevel = newWarningLevel;
    }
    
    /**
     * Play energy warning with escalating intensity
     */
    playEnergyWarning(warningLevel, energyPercentage) {
        let soundId, priority, volume, pitch;
        
        switch (warningLevel) {
            case 'low':
                soundId = 'energy_low';
                priority = this.audioPriorities.MEDIUM;
                volume = 0.5;
                pitch = 1.0;
                break;
                
            case 'critical':
                soundId = 'warning_alarm';
                priority = this.audioPriorities.HIGH;
                volume = 0.6;
                pitch = 1.2;
                break;
                
            case 'emergency':
                soundId = 'warning_alarm';
                priority = this.audioPriorities.CRITICAL;
                volume = 0.8;
                pitch = 1.5;
                break;
        }
        
        this.queueAudio({
            soundId: soundId,
            priority: priority,
            options: {
                volume: volume,
                pitch: pitch,
                pitchVariation: 0.05
            },
            metadata: {
                type: 'energy_warning',
                level: warningLevel,
                energyPercentage: energyPercentage
            }
        });
        
        console.log(`⚡ Energy warning: ${warningLevel} (${(energyPercentage * 100).toFixed(0)}%)`);
    }
    
    /**
     * Handle achievement notifications
     */
    playAchievementSound(achievementType, achievementData = {}) {
        const currentTime = Date.now();
        
        // Check cooldown
        if (currentTime - this.achievementState.lastAchievementTime < this.achievementState.achievementCooldown) {
            // Queue achievement for later
            this.achievementState.queuedAchievements.push({ achievementType, achievementData, timestamp: currentTime });
            return;
        }
        
        // Determine achievement sound properties
        let soundId = 'achievement';
        let volume = 0.8;
        let pitch = 1.0;
        
        switch (achievementType) {
            case 'score_milestone':
                pitch = 1.0 + (achievementData.milestone || 0) * 0.1;
                break;
                
            case 'enemy_streak':
                volume = 0.7;
                pitch = 1.2;
                break;
                
            case 'spy_identification':
                soundId = 'power_up';
                volume = 0.6;
                pitch = 1.1;
                break;
                
            case 'survival_time':
                volume = 0.9;
                pitch = 0.9;
                break;
        }
        
        this.queueAudio({
            soundId: soundId,
            priority: this.audioPriorities.HIGH,
            options: {
                volume: volume,
                pitch: pitch,
                pitchVariation: 0.05
            },
            metadata: {
                type: 'achievement',
                achievementType: achievementType,
                data: achievementData
            }
        });
        
        this.achievementState.lastAchievementTime = currentTime;
        
        console.log(`🏆 Achievement: ${achievementType}`, achievementData);
    }
    
    /**
     * Queue audio with priority system
     */
    queueAudio(audioRequest) {
        // Add to queue
        this.audioQueue.push(audioRequest);
        
        // Sort queue by priority (highest first)
        this.audioQueue.sort((a, b) => b.priority - a.priority);
        
        // Limit queue size
        if (this.audioQueue.length > 20) {
            this.audioQueue = this.audioQueue.slice(0, 20);
        }
    }
    
    /**
     * Process audio queue with priority and concurrency limits
     */
    processAudioQueue() {
        if (this.audioQueue.length === 0) return;
        
        // Count currently playing sounds
        const activeSounds = Array.from(this.activeAudio.values())
            .filter(audio => audio.isPlaying).length;
        
        // Process queue if we have capacity
        while (this.audioQueue.length > 0 && activeSounds < this.maxConcurrentSounds) {
            const audioRequest = this.audioQueue.shift();
            this.playQueuedAudio(audioRequest);
        }
    }
    
    /**
     * Play queued audio request
     */
    playQueuedAudio(audioRequest) {
        try {
            // Use enhanced sound effects for better audio management
            switch (audioRequest.soundId) {
                case 'enemy_approach':
                    this.enhancedSoundEffects.playEnemyApproach(audioRequest.options);
                    break;
                    
                case 'spy_detected':
                    this.enhancedSoundEffects.playSpyDetected(audioRequest.options);
                    break;
                    
                case 'achievement':
                    this.enhancedSoundEffects.playAchievement(audioRequest.options);
                    break;
                    
                case 'power_up':
                    this.enhancedSoundEffects.playPowerUp(audioRequest.options);
                    break;
                    
                case 'energy_low':
                case 'warning_alarm':
                    this.enhancedSoundEffects.playEnergyWarning(audioRequest.options);
                    break;
                    
                default:
                    // Fallback to basic sound effect
                    this.soundEffectManager.playSound(audioRequest.soundId, audioRequest.options);
            }
            
            // Track active audio
            const audioId = Date.now() + Math.random();
            this.activeAudio.set(audioId, {
                soundId: audioRequest.soundId,
                priority: audioRequest.priority,
                startTime: Date.now(),
                isPlaying: true,
                metadata: audioRequest.metadata
            });
            
        } catch (error) {
            console.error('❌ Failed to play queued audio:', error);
        }
    }
    
    /**
     * Calculate distance between two game objects
     */
    calculateDistance(obj1, obj2) {
        const dx = obj1.x - obj2.x;
        const dy = obj1.y - obj2.y;
        return Math.sqrt(dx * dx + dy * dy);
    }
    
    /**
     * Clean up expired audio tracking
     */
    cleanupAudioTracking() {
        const currentTime = Date.now();
        const maxAudioDuration = 10000; // 10 seconds max tracking
        
        for (const [audioId, audioData] of this.activeAudio.entries()) {
            if (currentTime - audioData.startTime > maxAudioDuration) {
                this.activeAudio.delete(audioId);
            }
        }
        
        // Process queued achievements
        this.processQueuedAchievements();
    }
    
    /**
     * Process queued achievements
     */
    processQueuedAchievements() {
        const currentTime = Date.now();
        
        while (this.achievementState.queuedAchievements.length > 0) {
            const queued = this.achievementState.queuedAchievements[0];
            
            if (currentTime - this.achievementState.lastAchievementTime >= this.achievementState.achievementCooldown) {
                this.achievementState.queuedAchievements.shift();
                this.playAchievementSound(queued.achievementType, queued.achievementData);
                break;
            } else {
                break; // Wait for cooldown
            }
        }
    }
    
    /**
     * Update scanner detection system
     */
    updateScannerDetection(gameState) {
        if (!gameState.scannerActive) {
            this.scannerDetectionState.detectedSpies.clear();
            return;
        }
        
        const currentTime = Date.now();
        const enemies = gameState.enemies || [];
        
        enemies.forEach(enemy => {
            if (!enemy.isActive() || enemy.type !== 'spy') return;
            
            // Check if this spy was already detected recently
            if (this.scannerDetectionState.detectedSpies.has(enemy.id)) return;
            
            // Check if spy is in scanner range (simplified - assume all scanned enemies are detected)
            if (currentTime - this.scannerDetectionState.lastSpyDetectionTime >= this.scannerDetectionState.detectionCooldown) {
                this.playSpyDetectionSound(enemy);
                this.scannerDetectionState.detectedSpies.add(enemy.id);
                this.scannerDetectionState.lastSpyDetectionTime = currentTime;
            }
        });
    }
    
    /**
     * Play spy detection sound
     */
    playSpyDetectionSound(spy) {
        this.queueAudio({
            soundId: 'spy_detected',
            priority: this.audioPriorities.HIGH,
            options: {
                volume: 0.7,
                pitch: 1.0,
                pitchVariation: 0.1
            },
            metadata: {
                type: 'spy_detection',
                spyId: spy.id
            }
        });
        
        console.log('🕵️ Spy detected by scanner');
    }
    
    /**
     * Get audio system status
     */
    getStatus() {
        return {
            activeAudio: this.activeAudio.size,
            queuedAudio: this.audioQueue.length,
            maxConcurrent: this.maxConcurrentSounds,
            energyWarningLevel: this.energyWarningState.warningLevel,
            queuedAchievements: this.achievementState.queuedAchievements.length,
            detectedSpies: this.scannerDetectionState.detectedSpies.size
        };
    }
    
    /**
     * Reset advanced audio system
     */
    reset() {
        this.audioQueue = [];
        this.activeAudio.clear();
        
        // Reset state tracking
        this.enemyApproachState.trackedEnemies.clear();
        this.achievementState.queuedAchievements = [];
        this.energyWarningState.warningLevel = 'none';
        this.scannerDetectionState.detectedSpies.clear();
        
        console.log('🔄 AdvancedAudioManager reset');
    }
    
    /**
     * Clean up resources
     */
    dispose() {
        this.reset();
        console.log('🧹 AdvancedAudioManager disposed');
    }
}