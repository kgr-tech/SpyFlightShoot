// Game constants and configuration
export const GAME_CONFIG = {
    CANVAS_WIDTH: 800,
    CANVAS_HEIGHT: 600,
    
    // Player settings
    PLAYER_SPEED: 5,
    PLAYER_MAX_ENERGY: 100,
    
    // Energy costs
    ENERGY_PER_SHOT: 1,
    SCANNER_ENERGY_DRAIN_RATE: 2, // per second
    
    // Scoring
    ENEMY_KILL_POINTS: 100,
    SPY_ALIEN_PENALTY: -50,
    ENERGY_RESTORE_AMOUNT: 10,
    
    // Difficulty progression
    DIFFICULTY_INCREASE_INTERVAL: 30000, // 30 seconds in milliseconds
    
    // Colors
    COLORS: {
        PLAYER: '#00ff00',
        ENEMY: '#ff0000',
        SPY_ALIEN: '#ffff00',
        BULLET: '#ffffff',
        ROCK: '#888888',
        SCANNER_ENEMY: '#ff0000',
        SCANNER_SPY: '#00ff00'
    }
};

export const KEYS = {
    ARROW_LEFT: 'ArrowLeft',
    ARROW_RIGHT: 'ArrowRight',
    ARROW_UP: 'ArrowUp',
    ARROW_DOWN: 'ArrowDown',
    SPACE: 'Space',
    SCANNER: 'KeyQ', // Changed from KeyS to KeyQ to avoid conflict with movement
    RESTART: 'KeyR',
    // Alternative WASD controls
    W: 'KeyW',
    A: 'KeyA',
    S: 'KeyS',
    D: 'KeyD'
};