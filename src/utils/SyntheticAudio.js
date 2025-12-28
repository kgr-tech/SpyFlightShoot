// SyntheticAudio - Generate synthetic sound effects using Web Audio API
// Provides fallback audio when external files are not available

export class SyntheticAudio {
    constructor(audioContext, sfxGainNode = null) {
        this.audioContext = audioContext;
        this.sfxGainNode = sfxGainNode || audioContext.destination;
    }
    
    /**
     * Generate a laser shot sound
     */
    generateLaserShot(options = {}) {
        const {
            frequency = 800,
            duration = 0.2,
            volume = 0.5,
            pitchVariation = 0.1
        } = options;
        
        if (!this.audioContext) return null;
        
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        const filterNode = this.audioContext.createBiquadFilter();
        
        // Configure oscillator
        oscillator.type = 'sawtooth';
        oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(
            frequency * (0.5 + Math.random() * pitchVariation), 
            this.audioContext.currentTime + duration
        );
        
        // Configure filter for laser effect
        filterNode.type = 'lowpass';
        filterNode.frequency.setValueAtTime(2000, this.audioContext.currentTime);
        filterNode.frequency.exponentialRampToValueAtTime(100, this.audioContext.currentTime + duration);
        
        // Configure gain envelope
        gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
        gainNode.gain.linearRampToValueAtTime(volume, this.audioContext.currentTime + 0.01);
        gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + duration);
        
        // Connect nodes
        oscillator.connect(filterNode);
        filterNode.connect(gainNode);
        gainNode.connect(this.sfxGainNode);
        
        // Play sound
        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + duration);
        
        return { oscillator, gainNode, filterNode };
    }
    
    /**
     * Generate an explosion sound
     */
    generateExplosion(options = {}) {
        const {
            duration = 0.5,
            volume = 0.6,
            type = 'enemy' // 'enemy' or 'rock'
        } = options;
        
        if (!this.audioContext) return null;
        
        // Create noise buffer for explosion
        const bufferSize = this.audioContext.sampleRate * duration;
        const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
        const data = buffer.getChannelData(0);
        
        // Generate white noise
        for (let i = 0; i < bufferSize; i++) {
            data[i] = (Math.random() * 2 - 1) * volume;
        }
        
        const source = this.audioContext.createBufferSource();
        const gainNode = this.audioContext.createGain();
        const filterNode = this.audioContext.createBiquadFilter();
        
        source.buffer = buffer;
        
        // Configure filter based on explosion type
        filterNode.type = 'lowpass';
        if (type === 'enemy') {
            filterNode.frequency.setValueAtTime(800, this.audioContext.currentTime);
            filterNode.frequency.exponentialRampToValueAtTime(200, this.audioContext.currentTime + duration);
        } else {
            filterNode.frequency.setValueAtTime(400, this.audioContext.currentTime);
            filterNode.frequency.exponentialRampToValueAtTime(100, this.audioContext.currentTime + duration);
        }
        
        // Configure gain envelope
        gainNode.gain.setValueAtTime(volume, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + duration);
        
        // Connect nodes
        source.connect(filterNode);
        filterNode.connect(gainNode);
        gainNode.connect(this.sfxGainNode);
        
        // Play sound
        source.start(this.audioContext.currentTime);
        
        return { source, gainNode, filterNode };
    }
    
    /**
     * Generate a scanner beep sound
     */
    generateScannerBeep(options = {}) {
        const {
            frequency = 1200,
            duration = 0.1,
            volume = 0.4,
            beepCount = 3
        } = options;
        
        if (!this.audioContext) return null;
        
        const sounds = [];
        
        for (let i = 0; i < beepCount; i++) {
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            
            oscillator.type = 'sine';
            oscillator.frequency.setValueAtTime(frequency + (i * 100), this.audioContext.currentTime);
            
            const startTime = this.audioContext.currentTime + (i * 0.15);
            
            gainNode.gain.setValueAtTime(0, startTime);
            gainNode.gain.linearRampToValueAtTime(volume, startTime + 0.01);
            gainNode.gain.linearRampToValueAtTime(0, startTime + duration);
            
            oscillator.connect(gainNode);
            gainNode.connect(this.sfxGainNode);
            
            oscillator.start(startTime);
            oscillator.stop(startTime + duration);
            
            sounds.push({ oscillator, gainNode });
        }
        
        return sounds;
    }
    
    /**
     * Generate a warning alarm sound
     */
    generateWarningAlarm(options = {}) {
        const {
            frequency = 600,
            duration = 1.0,
            volume = 0.5,
            urgency = 1 // 1-3, higher = more urgent
        } = options;
        
        if (!this.audioContext) return null;
        
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.type = 'square';
        
        // Create alarm pattern based on urgency
        const beepDuration = 0.1 / urgency;
        const pauseDuration = 0.1 / urgency;
        const totalCycle = beepDuration + pauseDuration;
        const cycles = Math.floor(duration / totalCycle);
        
        oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
        
        // Create beeping pattern
        let currentTime = this.audioContext.currentTime;
        gainNode.gain.setValueAtTime(0, currentTime);
        
        for (let i = 0; i < cycles; i++) {
            const beepStart = currentTime + (i * totalCycle);
            const beepEnd = beepStart + beepDuration;
            
            gainNode.gain.setValueAtTime(0, beepStart);
            gainNode.gain.linearRampToValueAtTime(volume, beepStart + 0.01);
            gainNode.gain.linearRampToValueAtTime(volume, beepEnd - 0.01);
            gainNode.gain.linearRampToValueAtTime(0, beepEnd);
        }
        
        oscillator.connect(gainNode);
        gainNode.connect(this.sfxGainNode);
        
        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + duration);
        
        return { oscillator, gainNode };
    }
    
    /**
     * Generate a UI interaction sound
     */
    generateUISound(options = {}) {
        const {
            type = 'click', // 'click', 'hover', 'error', 'success'
            volume = 0.3
        } = options;
        
        if (!this.audioContext) return null;
        
        let frequency, duration, waveType;
        
        switch (type) {
            case 'click':
                frequency = 800;
                duration = 0.1;
                waveType = 'sine';
                break;
            case 'hover':
                frequency = 600;
                duration = 0.05;
                waveType = 'sine';
                break;
            case 'error':
                frequency = 300;
                duration = 0.3;
                waveType = 'sawtooth';
                break;
            case 'success':
                frequency = 1000;
                duration = 0.2;
                waveType = 'sine';
                break;
            default:
                frequency = 800;
                duration = 0.1;
                waveType = 'sine';
        }
        
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.type = waveType;
        oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
        
        if (type === 'success') {
            // Rising tone for success
            oscillator.frequency.exponentialRampToValueAtTime(frequency * 1.5, this.audioContext.currentTime + duration);
        } else if (type === 'error') {
            // Falling tone for error
            oscillator.frequency.exponentialRampToValueAtTime(frequency * 0.5, this.audioContext.currentTime + duration);
        }
        
        gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
        gainNode.gain.linearRampToValueAtTime(volume, this.audioContext.currentTime + 0.01);
        gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + duration);
        
        oscillator.connect(gainNode);
        gainNode.connect(this.sfxGainNode);
        
        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + duration);
        
        return { oscillator, gainNode };
    }
    
    /**
     * Generate ambient space sound
     */
    generateAmbientSpace(options = {}) {
        const {
            duration = 10.0,
            volume = 0.2
        } = options;
        
        if (!this.audioContext) return null;
        
        // Create multiple oscillators for rich ambient sound
        const oscillators = [];
        const gainNodes = [];
        
        // Low frequency hum
        const hum = this.audioContext.createOscillator();
        const humGain = this.audioContext.createGain();
        hum.type = 'sine';
        hum.frequency.setValueAtTime(60, this.audioContext.currentTime);
        humGain.gain.setValueAtTime(volume * 0.5, this.audioContext.currentTime);
        hum.connect(humGain);
        humGain.connect(this.sfxGainNode);
        
        // Mid frequency texture
        const texture = this.audioContext.createOscillator();
        const textureGain = this.audioContext.createGain();
        texture.type = 'triangle';
        texture.frequency.setValueAtTime(200, this.audioContext.currentTime);
        textureGain.gain.setValueAtTime(volume * 0.3, this.audioContext.currentTime);
        texture.connect(textureGain);
        textureGain.connect(this.sfxGainNode);
        
        // High frequency sparkle
        const sparkle = this.audioContext.createOscillator();
        const sparkleGain = this.audioContext.createGain();
        sparkle.type = 'sine';
        sparkle.frequency.setValueAtTime(1200, this.audioContext.currentTime);
        sparkleGain.gain.setValueAtTime(volume * 0.1, this.audioContext.currentTime);
        sparkle.connect(sparkleGain);
        sparkleGain.connect(this.sfxGainNode);
        
        // Start all oscillators
        const startTime = this.audioContext.currentTime;
        hum.start(startTime);
        texture.start(startTime);
        sparkle.start(startTime);
        
        // Stop after duration
        hum.stop(startTime + duration);
        texture.stop(startTime + duration);
        sparkle.stop(startTime + duration);
        
        return {
            oscillators: [hum, texture, sparkle],
            gainNodes: [humGain, textureGain, sparkleGain]
        };
    }
}