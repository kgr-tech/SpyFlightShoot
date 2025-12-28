// Input handling system
import { KEYS } from '../utils/GameConstants.js';

export class InputSystem {
    constructor() {
        this.keys = {};
        this.previousKeys = {};
        this.mouseClicked = false;
        this.setupEventListeners();
        console.log('InputSystem initialized');
    }
    
    setupEventListeners() {
        // Keyboard events
        document.addEventListener('keydown', (e) => {
            console.log('Keydown event:', e.code, e.key);
            this.keys[e.code] = true;
            
            // Prevent default for all game keys to avoid browser interference
            if (this.isGameKey(e.code) || 
                e.code === 'Space' || 
                e.code === 'Enter' || 
                e.code === 'NumpadEnter' ||
                e.code === 'KeyP' ||
                e.code === 'KeyQ' ||
                e.code === 'KeyR' ||
                e.code === 'KeyD') {
                e.preventDefault();
            }
        });
        
        document.addEventListener('keyup', (e) => {
            this.keys[e.code] = false;
            
            // Prevent default for game keys on keyup too
            if (this.isGameKey(e.code) || 
                e.code === 'Space' || 
                e.code === 'Enter' || 
                e.code === 'NumpadEnter' ||
                e.code === 'KeyP' ||
                e.code === 'KeyQ' ||
                e.code === 'KeyR' ||
                e.code === 'KeyD') {
                e.preventDefault();
            }
        });
        
        // Mouse events
        document.addEventListener('mousedown', (e) => {
            console.log('Mouse clicked');
            this.mouseClicked = true;
            e.preventDefault();
        });
        
        document.addEventListener('mouseup', (e) => {
            this.mouseClicked = false;
        });
        
        // Canvas click specifically
        const canvas = document.getElementById('gameCanvas');
        if (canvas) {
            canvas.addEventListener('click', (e) => {
                console.log('Canvas clicked');
                this.mouseClicked = true;
                e.preventDefault();
            });
        }
        
        // Handle focus loss
        window.addEventListener('blur', () => {
            this.keys = {};
            this.mouseClicked = false;
        });
        
        console.log('Event listeners set up');
    }
    
    update() {
        // Store previous frame key states
        this.previousKeys = { ...this.keys };
    }
    
    isKeyPressed(keyCode) {
        return !!this.keys[keyCode];
    }
    
    isKeyJustPressed(keyCode) {
        return !!this.keys[keyCode] && !this.previousKeys[keyCode];
    }
    
    isMouseClicked() {
        return this.mouseClicked;
    }
    
    // Get movement vector based on current input
    getMovementVector() {
        let x = 0;
        let y = 0;
        
        const leftPressed = this.isKeyPressed(KEYS.ARROW_LEFT) || this.isKeyPressed(KEYS.A);
        const rightPressed = this.isKeyPressed(KEYS.ARROW_RIGHT) || this.isKeyPressed(KEYS.D);
        const upPressed = this.isKeyPressed(KEYS.ARROW_UP) || this.isKeyPressed(KEYS.W);
        const downPressed = this.isKeyPressed(KEYS.ARROW_DOWN) || this.isKeyPressed(KEYS.S);
        
        if (leftPressed) {
            x -= 1;
            console.log('Left movement detected');
        }
        if (rightPressed) {
            x += 1;
            console.log('Right movement detected');
        }
        if (upPressed) {
            y -= 1;
            console.log('Up movement detected');
        }
        if (downPressed) {
            y += 1;
            console.log('Down movement detected');
        }
        
        // Debug log for movement
        if (x !== 0 || y !== 0) {
            console.log('Movement vector:', { x, y }, 'Keys pressed:', Object.keys(this.keys).filter(k => this.keys[k]));
        }
        
        return { x, y };
    }
    
    isGameKey(keyCode) {
        const gameKeys = Object.values(KEYS);
        return gameKeys.includes(keyCode);
    }
}