// Score management system for SpyShoot
export class ScoreSystem {
    constructor() {
        this.currentScore = 0;
        this.highScore = this.loadHighScore();
        this.enemiesDestroyed = 0;
        this.spyAliensPenalized = 0;
        this.comboCount = 0;
        this.lastKillTime = 0;
        this.comboTimeWindow = 3000; // 3 seconds for combo
        
        // Achievement tracking
        this.lastMilestone = 0;
        this.milestones = [100, 250, 500, 1000, 2500, 5000, 10000];
        
        // Sound effect integration
        this.enhancedSoundEffects = null;
    }
    
    // Set enhanced sound effects reference
    setEnhancedSoundEffects(enhancedSoundEffects) {
        this.enhancedSoundEffects = enhancedSoundEffects;
    }
    
    // Set advanced audio manager reference
    setAdvancedAudioManager(advancedAudioManager) {
        this.advancedAudioManager = advancedAudioManager;
    }
    
    // Add points for destroying an enemy
    addEnemyKill(points) {
        const previousScore = this.currentScore;
        this.currentScore += points;
        this.enemiesDestroyed++;
        
        // Check for combo
        const currentTime = Date.now();
        if (currentTime - this.lastKillTime < this.comboTimeWindow) {
            this.comboCount++;
            // Add combo bonus
            const comboBonus = this.comboCount * 10;
            this.currentScore += comboBonus;
            console.log(`Combo x${this.comboCount}! +${comboBonus} bonus points`);
            
            // Play achievement sound for high combos via advanced audio manager
            if (this.comboCount >= 5) {
                if (this.advancedAudioManager) {
                    this.advancedAudioManager.playAchievementSound('enemy_streak', {
                        comboCount: this.comboCount,
                        bonus: comboBonus
                    });
                } else if (this.enhancedSoundEffects) {
                    this.enhancedSoundEffects.playAchievement();
                }
            }
        } else {
            this.comboCount = 1;
        }
        
        this.lastKillTime = currentTime;
        this.updateHighScore();
        
        // Check for score milestones
        this.checkMilestones(previousScore);
    }
    
    // Check if score crossed any milestones
    checkMilestones(previousScore) {
        for (const milestone of this.milestones) {
            if (previousScore < milestone && this.currentScore >= milestone) {
                console.log(`🏆 Score milestone reached: ${milestone}!`);
                
                // Play achievement sound via advanced audio manager
                if (this.advancedAudioManager) {
                    this.advancedAudioManager.playAchievementSound('score_milestone', {
                        milestone: milestone,
                        score: this.currentScore
                    });
                } else if (this.enhancedSoundEffects) {
                    // Fallback to enhanced sound effects
                    this.enhancedSoundEffects.playAchievement();
                }
                
                this.lastMilestone = milestone;
                break; // Only trigger one milestone at a time
            }
        }
    }
    
    // Subtract points for shooting spy alien
    addSpyPenalty(penalty) {
        this.currentScore += penalty; // penalty is negative
        this.spyAliensPenalized++;
        this.comboCount = 0; // Break combo on penalty
        
        // Ensure score doesn't go negative
        this.currentScore = Math.max(0, this.currentScore);
    }
    
    // Get current score
    getCurrentScore() {
        return this.currentScore;
    }
    
    // Get high score
    getHighScore() {
        return this.highScore;
    }
    
    // Check if current score is a new high score
    isNewHighScore() {
        return this.currentScore > this.highScore;
    }
    
    // Update high score if current score is higher
    updateHighScore() {
        if (this.currentScore > this.highScore) {
            this.highScore = this.currentScore;
            this.saveHighScore();
            return true;
        }
        return false;
    }
    
    // Get combo information
    getComboInfo() {
        return {
            count: this.comboCount,
            timeRemaining: Math.max(0, this.comboTimeWindow - (Date.now() - this.lastKillTime))
        };
    }
    
    // Get game statistics
    getStats() {
        return {
            score: this.currentScore,
            highScore: this.highScore,
            enemiesDestroyed: this.enemiesDestroyed,
            spyAliensPenalized: this.spyAliensPenalized,
            comboCount: this.comboCount
        };
    }
    
    // Reset score for new game
    reset() {
        this.currentScore = 0;
        this.enemiesDestroyed = 0;
        this.spyAliensPenalized = 0;
        this.comboCount = 0;
        this.lastKillTime = 0;
    }
    
    // Load high score from localStorage
    loadHighScore() {
        try {
            const saved = localStorage.getItem('spyshoot_highscore');
            return saved ? parseInt(saved, 10) : 0;
        } catch (error) {
            console.warn('Could not load high score:', error);
            return 0;
        }
    }
    
    // Save high score to localStorage
    saveHighScore() {
        try {
            localStorage.setItem('spyshoot_highscore', this.highScore.toString());
        } catch (error) {
            console.warn('Could not save high score:', error);
        }
    }
    
    // Format score for display
    formatScore(score) {
        return score.toString().padStart(6, '0');
    }
    
    // Get score display string
    getScoreDisplay() {
        return this.formatScore(this.currentScore);
    }
    
    // Get high score display string
    getHighScoreDisplay() {
        return this.formatScore(this.highScore);
    }
}