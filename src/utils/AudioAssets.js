// Audio Asset Definitions for SpyShoot
// Defines all sound effects and music tracks with their configurations

export const AUDIO_ASSETS = {
    // Sound Effects - Laser Variations
    LASER_SHOT: {
        id: 'laser_shot',
        file: 'sounds/laser_shot.ogg',
        formats: ['sounds/laser_shot.ogg', 'sounds/laser_shot.mp3', 'sounds/laser_shot.wav'],
        volume: 0.7,
        pitch: 1.0,
        maxConcurrent: 3,
        priority: 2,
        cooldown: 50,
        preload: true,
        type: 'sfx'
    },
    
    LASER_SHOT_2: {
        id: 'laser_shot_2',
        file: 'sounds/laser_shot_2.ogg',
        formats: ['sounds/laser_shot_2.ogg', 'sounds/laser_shot_2.mp3', 'sounds/laser_shot_2.wav'],
        volume: 0.6,
        pitch: 1.2,
        maxConcurrent: 3,
        priority: 2,
        cooldown: 50,
        preload: true,
        type: 'sfx'
    },
    
    LASER_SHOT_3: {
        id: 'laser_shot_3',
        file: 'sounds/laser_shot_3.ogg',
        formats: ['sounds/laser_shot_3.ogg', 'sounds/laser_shot_3.mp3', 'sounds/laser_shot_3.wav'],
        volume: 0.8,
        pitch: 0.9,
        maxConcurrent: 3,
        priority: 2,
        cooldown: 50,
        preload: true,
        type: 'sfx'
    },
    
    // Explosion Variations
    EXPLOSION_ENEMY: {
        id: 'explosion_enemy',
        file: 'sounds/explosion_enemy.ogg',
        formats: ['sounds/explosion_enemy.ogg', 'sounds/explosion_enemy.mp3', 'sounds/explosion_enemy.wav'],
        volume: 0.8,
        pitch: 1.0,
        maxConcurrent: 4,
        priority: 3,
        cooldown: 100,
        preload: true,
        type: 'sfx'
    },
    
    EXPLOSION_ENEMY_2: {
        id: 'explosion_enemy_2',
        file: 'sounds/explosion_enemy_2.ogg',
        formats: ['sounds/explosion_enemy_2.ogg', 'sounds/explosion_enemy_2.mp3', 'sounds/explosion_enemy_2.wav'],
        volume: 0.7,
        pitch: 1.1,
        maxConcurrent: 4,
        priority: 3,
        cooldown: 100,
        preload: true,
        type: 'sfx'
    },
    
    EXPLOSION_ROCK: {
        id: 'explosion_rock',
        file: 'sounds/explosion_rock.ogg',
        formats: ['sounds/explosion_rock.ogg', 'sounds/explosion_rock.mp3', 'sounds/explosion_rock.wav'],
        volume: 0.6,
        pitch: 1.0,
        maxConcurrent: 3,
        priority: 2,
        cooldown: 100,
        preload: true,
        type: 'sfx'
    },
    
    ROCK_IMPACT: {
        id: 'rock_impact',
        file: 'sounds/rock_impact.ogg',
        formats: ['sounds/rock_impact.ogg', 'sounds/rock_impact.mp3', 'sounds/rock_impact.wav'],
        volume: 0.5,
        pitch: 1.0,
        maxConcurrent: 3,
        priority: 2,
        cooldown: 50,
        preload: true,
        type: 'sfx'
    },
    
    // Scanner and System Sounds
    SCANNER_BEEP: {
        id: 'scanner_beep',
        file: 'sounds/scanner_beep.ogg',
        formats: ['sounds/scanner_beep.ogg', 'sounds/scanner_beep.mp3', 'sounds/scanner_beep.wav'],
        volume: 0.5,
        pitch: 1.0,
        maxConcurrent: 1,
        priority: 4,
        cooldown: 200,
        preload: true,
        type: 'sfx'
    },
    
    SCANNER_SWEEP: {
        id: 'scanner_sweep',
        file: 'sounds/scanner_sweep.ogg',
        formats: ['sounds/scanner_sweep.ogg', 'sounds/scanner_sweep.mp3', 'sounds/scanner_sweep.wav'],
        volume: 0.4,
        pitch: 1.0,
        maxConcurrent: 1,
        priority: 3,
        cooldown: 500,
        preload: true,
        type: 'sfx'
    },
    
    // Warning and Alert Sounds
    WARNING_ALARM: {
        id: 'warning_alarm',
        file: 'sounds/warning_alarm.ogg',
        formats: ['sounds/warning_alarm.ogg', 'sounds/warning_alarm.mp3', 'sounds/warning_alarm.wav'],
        volume: 0.6,
        pitch: 1.0,
        maxConcurrent: 1,
        priority: 5,
        cooldown: 1000,
        preload: true,
        type: 'sfx'
    },
    
    ENERGY_LOW: {
        id: 'energy_low',
        file: 'sounds/energy_low.ogg',
        formats: ['sounds/energy_low.ogg', 'sounds/energy_low.mp3', 'sounds/energy_low.wav'],
        volume: 0.5,
        pitch: 1.0,
        maxConcurrent: 1,
        priority: 4,
        cooldown: 3000,
        preload: true,
        type: 'sfx'
    },
    
    // Gameplay Feedback Sounds
    ENEMY_APPROACH: {
        id: 'enemy_approach',
        file: 'sounds/enemy_approach.ogg',
        formats: ['sounds/enemy_approach.ogg', 'sounds/enemy_approach.mp3', 'sounds/enemy_approach.wav'],
        volume: 0.4,
        pitch: 1.0,
        maxConcurrent: 2,
        priority: 1,
        cooldown: 500,
        preload: true,
        type: 'sfx'
    },
    
    SPY_DETECTED: {
        id: 'spy_detected',
        file: 'sounds/spy_detected.ogg',
        formats: ['sounds/spy_detected.ogg', 'sounds/spy_detected.mp3', 'sounds/spy_detected.wav'],
        volume: 0.7,
        pitch: 1.0,
        maxConcurrent: 1,
        priority: 4,
        cooldown: 300,
        preload: true,
        type: 'sfx'
    },
    
    ACHIEVEMENT: {
        id: 'achievement',
        file: 'sounds/achievement.ogg',
        formats: ['sounds/achievement.ogg', 'sounds/achievement.mp3', 'sounds/achievement.wav'],
        volume: 0.8,
        pitch: 1.0,
        maxConcurrent: 1,
        priority: 3,
        cooldown: 2000,
        preload: true,
        type: 'sfx'
    },
    
    POWER_UP: {
        id: 'power_up',
        file: 'sounds/power_up.ogg',
        formats: ['sounds/power_up.ogg', 'sounds/power_up.mp3', 'sounds/power_up.wav'],
        volume: 0.6,
        pitch: 1.0,
        maxConcurrent: 1,
        priority: 3,
        cooldown: 1000,
        preload: true,
        type: 'sfx'
    },
    
    // UI Interaction Sounds
    UI_CLICK: {
        id: 'ui_click',
        file: 'sounds/ui_click.ogg',
        formats: ['sounds/ui_click.ogg', 'sounds/ui_click.mp3', 'sounds/ui_click.wav'],
        volume: 0.4,
        pitch: 1.0,
        maxConcurrent: 2,
        priority: 1,
        cooldown: 100,
        preload: true,
        type: 'sfx'
    },
    
    UI_HOVER: {
        id: 'ui_hover',
        file: 'sounds/ui_hover.ogg',
        formats: ['sounds/ui_hover.ogg', 'sounds/ui_hover.mp3', 'sounds/ui_hover.wav'],
        volume: 0.3,
        pitch: 1.0,
        maxConcurrent: 1,
        priority: 1,
        cooldown: 200,
        preload: true,
        type: 'sfx'
    },
    
    UI_ERROR: {
        id: 'ui_error',
        file: 'sounds/ui_error.ogg',
        formats: ['sounds/ui_error.ogg', 'sounds/ui_error.mp3', 'sounds/ui_error.wav'],
        volume: 0.5,
        pitch: 1.0,
        maxConcurrent: 1,
        priority: 2,
        cooldown: 500,
        preload: true,
        type: 'sfx'
    },
    
    GAME_START: {
        id: 'game_start',
        file: 'sounds/game_start.ogg',
        formats: ['sounds/game_start.ogg', 'sounds/game_start.mp3', 'sounds/game_start.wav'],
        volume: 0.7,
        pitch: 1.0,
        maxConcurrent: 1,
        priority: 4,
        cooldown: 5000,
        preload: true,
        type: 'sfx'
    },
    
    // Music Tracks
    AMBIENT_SPACE: {
        id: 'ambient_space',
        file: 'music/ambient_space.ogg',
        formats: ['music/ambient_space.ogg', 'music/ambient_space.mp3'],
        volume: 0.6,
        loop: true,
        fadeInTime: 2000,
        fadeOutTime: 1500,
        preload: false,
        type: 'music'
    },
    
    COMBAT_MUSIC: {
        id: 'combat_music',
        file: 'music/combat_music.ogg',
        formats: ['music/combat_music.ogg', 'music/combat_music.mp3'],
        volume: 0.7,
        loop: true,
        fadeInTime: 1500,
        fadeOutTime: 1000,
        preload: false,
        type: 'music'
    },
    
    TENSION_MUSIC: {
        id: 'tension_music',
        file: 'music/tension_music.ogg',
        formats: ['music/tension_music.ogg', 'music/tension_music.mp3'],
        volume: 0.6,
        loop: true,
        fadeInTime: 2000,
        fadeOutTime: 1500,
        preload: false,
        type: 'music'
    },
    
    ETHEREAL_MUSIC: {
        id: 'ethereal_music',
        file: 'music/ethereal_music.ogg',
        formats: ['music/ethereal_music.ogg', 'music/ethereal_music.mp3'],
        volume: 0.5,
        loop: true,
        fadeInTime: 3000,
        fadeOutTime: 2000,
        preload: false,
        type: 'music'
    },
    
    VICTORY_MUSIC: {
        id: 'victory_music',
        file: 'music/victory_music.ogg',
        formats: ['music/victory_music.ogg', 'music/victory_music.mp3'],
        volume: 0.8,
        loop: false,
        fadeInTime: 1000,
        fadeOutTime: 2000,
        preload: false,
        type: 'music'
    },
    
    DEFEAT_MUSIC: {
        id: 'defeat_music',
        file: 'music/defeat_music.ogg',
        formats: ['music/defeat_music.ogg', 'music/defeat_music.mp3'],
        volume: 0.7,
        loop: false,
        fadeInTime: 1000,
        fadeOutTime: 2000,
        preload: false,
        type: 'music'
    },
    
    // Environmental Audio
    DEEP_SPACE_HUM: {
        id: 'deep_space_hum',
        file: 'ambient/deep_space_hum.ogg',
        formats: ['ambient/deep_space_hum.ogg', 'ambient/deep_space_hum.mp3'],
        volume: 0.3,
        loop: true,
        maxConcurrent: 1,
        priority: 1,
        preload: false,
        type: 'ambient'
    },
    
    ASTEROID_COLLISIONS: {
        id: 'asteroid_collisions',
        file: 'ambient/asteroid_collisions.ogg',
        formats: ['ambient/asteroid_collisions.ogg', 'ambient/asteroid_collisions.mp3'],
        volume: 0.4,
        loop: true,
        maxConcurrent: 1,
        priority: 1,
        preload: false,
        type: 'ambient'
    },
    
    NEBULA_WINDS: {
        id: 'nebula_winds',
        file: 'ambient/nebula_winds.ogg',
        formats: ['ambient/nebula_winds.ogg', 'ambient/nebula_winds.mp3'],
        volume: 0.3,
        loop: true,
        maxConcurrent: 1,
        priority: 1,
        preload: false,
        type: 'ambient'
    },
    
    // Additional Environmental Layers
    DISTANT_STARS: {
        id: 'distant_stars',
        file: 'ambient/distant_stars.ogg',
        formats: ['ambient/distant_stars.ogg', 'ambient/distant_stars.mp3'],
        volume: 0.2,
        loop: true,
        maxConcurrent: 1,
        priority: 1,
        preload: false,
        type: 'ambient'
    },
    
    ASTEROID_RUMBLE: {
        id: 'asteroid_rumble',
        file: 'ambient/asteroid_rumble.ogg',
        formats: ['ambient/asteroid_rumble.ogg', 'ambient/asteroid_rumble.mp3'],
        volume: 0.4,
        loop: true,
        maxConcurrent: 1,
        priority: 1,
        preload: false,
        type: 'ambient'
    },
    
    DISTANT_IMPACTS: {
        id: 'distant_impacts',
        file: 'ambient/distant_impacts.ogg',
        formats: ['ambient/distant_impacts.ogg', 'ambient/distant_impacts.mp3'],
        volume: 0.3,
        loop: true,
        maxConcurrent: 1,
        priority: 1,
        preload: false,
        type: 'ambient'
    },
    
    COSMIC_WHISPERS: {
        id: 'cosmic_whispers',
        file: 'ambient/cosmic_whispers.ogg',
        formats: ['ambient/cosmic_whispers.ogg', 'ambient/cosmic_whispers.mp3'],
        volume: 0.4,
        loop: true,
        maxConcurrent: 1,
        priority: 1,
        preload: false,
        type: 'ambient'
    },
    
    ENERGY_FLUCTUATIONS: {
        id: 'energy_fluctuations',
        file: 'ambient/energy_fluctuations.ogg',
        formats: ['ambient/energy_fluctuations.ogg', 'ambient/energy_fluctuations.mp3'],
        volume: 0.3,
        loop: true,
        maxConcurrent: 1,
        priority: 1,
        preload: false,
        type: 'ambient'
    },
    
    VOID_RESONANCE: {
        id: 'void_resonance',
        file: 'ambient/void_resonance.ogg',
        formats: ['ambient/void_resonance.ogg', 'ambient/void_resonance.mp3'],
        volume: 0.35,
        loop: true,
        maxConcurrent: 1,
        priority: 1,
        preload: false,
        type: 'ambient'
    },
    
    COSMIC_RADIATION: {
        id: 'cosmic_radiation',
        file: 'ambient/cosmic_radiation.ogg',
        formats: ['ambient/cosmic_radiation.ogg', 'ambient/cosmic_radiation.mp3'],
        volume: 0.25,
        loop: true,
        maxConcurrent: 1,
        priority: 1,
        preload: false,
        type: 'ambient'
    }
};

// Helper function to get all sound effect assets
export function getSoundEffectAssets() {
    return Object.values(AUDIO_ASSETS).filter(asset => asset.type === 'sfx');
}

// Helper function to get all music assets
export function getMusicAssets() {
    return Object.values(AUDIO_ASSETS).filter(asset => asset.type === 'music');
}

// Helper function to get all ambient assets
export function getAmbientAssets() {
    return Object.values(AUDIO_ASSETS).filter(asset => asset.type === 'ambient');
}

// Helper function to get asset by ID
export function getAssetById(id) {
    return Object.values(AUDIO_ASSETS).find(asset => asset.id === id);
}