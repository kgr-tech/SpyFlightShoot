// EnvironmentRenderer - Advanced rendering system for dynamic space environments
// Handles sophisticated visual effects, particle systems, and environment-specific rendering

export class EnvironmentRenderer {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        
        // Particle systems
        this.particles = {
            stars: [],
            dust: [],
            debris: [],
            energy: [],
            gas: []
        };
        
        // Animation state
        this.animationTime = 0;
        this.lastFrameTime = 0;
        
        // Performance settings
        this.particleLimit = {
            stars: 300,
            dust: 100,
            debris: 50,
            energy: 30,
            gas: 20
        };
        
        // Initialize particle systems
        this.initializeParticleSystems();
        
        console.log('🎨 EnvironmentRenderer initialized');
    }
    
    /**
     * Initialize particle systems
     */
    initializeParticleSystems() {
        // Initialize star particles
        for (let i = 0; i < this.particleLimit.stars; i++) {
            this.particles.stars.push(this.createStarParticle(i));
        }
        
        // Initialize dust particles
        for (let i = 0; i < this.particleLimit.dust; i++) {
            this.particles.dust.push(this.createDustParticle(i));
        }
        
        // Initialize debris particles
        for (let i = 0; i < this.particleLimit.debris; i++) {
            this.particles.debris.push(this.createDebrisParticle(i));
        }
        
        // Initialize energy particles
        for (let i = 0; i < this.particleLimit.energy; i++) {
            this.particles.energy.push(this.createEnergyParticle(i));
        }
        
        // Initialize gas particles
        for (let i = 0; i < this.particleLimit.gas; i++) {
            this.particles.gas.push(this.createGasParticle(i));
        }
    }
    
    /**
     * Create star particle
     */
    createStarParticle(index) {
        return {
            x: (index * 37) % this.canvas.width,
            y: (index * 73) % this.canvas.height,
            size: (index % 4) + 1,
            brightness: 0.5 + (index % 5) * 0.1,
            alpha: 0.2 + (index % 8) * 0.1,
            twinklePhase: index * 0.1,
            speed: 0.02 + (index % 3) * 0.01,
            color: index % 10 === 0 ? 'blue' : index % 15 === 0 ? 'red' : 'white'
        };
    }
    
    /**
     * Create dust particle
     */
    createDustParticle(index) {
        return {
            x: Math.random() * this.canvas.width,
            y: Math.random() * this.canvas.height,
            size: 1 + Math.random() * 2,
            speed: 0.01 + Math.random() * 0.02,
            alpha: 0.2 + Math.random() * 0.3,
            color: `rgba(139, 69, 19, ${0.2 + Math.random() * 0.3})`,
            drift: Math.random() * 0.005
        };
    }
    
    /**
     * Create debris particle
     */
    createDebrisParticle(index) {
        return {
            x: Math.random() * this.canvas.width,
            y: Math.random() * this.canvas.height,
            size: 2 + Math.random() * 4,
            speed: 0.015 + Math.random() * 0.01,
            rotation: Math.random() * Math.PI * 2,
            rotationSpeed: (Math.random() - 0.5) * 0.02,
            alpha: 0.3 + Math.random() * 0.4,
            shape: Math.floor(Math.random() * 3) // 0: square, 1: triangle, 2: circle
        };
    }
    
    /**
     * Create energy particle
     */
    createEnergyParticle(index) {
        return {
            x: Math.random() * this.canvas.width,
            y: Math.random() * this.canvas.height,
            size: 3 + Math.random() * 5,
            speed: 0.02 + Math.random() * 0.03,
            energy: Math.random(),
            phase: Math.random() * Math.PI * 2,
            frequency: 0.01 + Math.random() * 0.02,
            color: `hsl(${60 + Math.random() * 60}, 100%, 70%)`,
            trail: []
        };
    }
    
    /**
     * Create gas particle
     */
    createGasParticle(index) {
        return {
            x: Math.random() * this.canvas.width,
            y: Math.random() * this.canvas.height,
            size: 20 + Math.random() * 60,
            speed: 0.005 + Math.random() * 0.01,
            hue: Math.random() * 360,
            saturation: 50 + Math.random() * 50,
            alpha: 0.05 + Math.random() * 0.1,
            drift: (Math.random() - 0.5) * 0.002,
            pulse: Math.random() * Math.PI * 2
        };
    }
    
    /**
     * Update particle systems
     */
    update(deltaTime, envProps) {
        this.animationTime += deltaTime;
        
        // Update stars
        this.updateStarParticles(deltaTime, envProps);
        
        // Update environment-specific particles
        if (envProps.effects?.asteroidDust) {
            this.updateDustParticles(deltaTime);
        }
        
        if (envProps.effects?.floatingDebris) {
            this.updateDebrisParticles(deltaTime);
        }
        
        if (envProps.effects?.energyStorms) {
            this.updateEnergyParticles(deltaTime);
        }
        
        if (envProps.effects?.colorfulGas || envProps.effects?.nebula) {
            this.updateGasParticles(deltaTime);
        }
    }
    
    /**
     * Update star particles
     */
    updateStarParticles(deltaTime, envProps) {
        const starDensity = envProps.starDensity || 150;
        const activeStars = Math.min(starDensity, this.particleLimit.stars);
        
        for (let i = 0; i < activeStars; i++) {
            const star = this.particles.stars[i];
            
            // Update position with parallax
            star.y = (star.y + star.speed * deltaTime) % this.canvas.height;
            
            // Update twinkling
            star.twinklePhase += deltaTime * 0.001;
            star.currentAlpha = star.alpha * (0.7 + 0.3 * Math.sin(star.twinklePhase));
        }
    }
    
    /**
     * Update dust particles
     */
    updateDustParticles(deltaTime) {
        this.particles.dust.forEach(particle => {
            particle.x = (particle.x + particle.speed * deltaTime) % this.canvas.width;
            particle.y = (particle.y + particle.drift * deltaTime) % this.canvas.height;
        });
    }
    
    /**
     * Update debris particles
     */
    updateDebrisParticles(deltaTime) {
        this.particles.debris.forEach(particle => {
            particle.x = (particle.x + particle.speed * deltaTime) % this.canvas.width;
            particle.y = (particle.y + particle.speed * 0.8 * deltaTime) % this.canvas.height;
            particle.rotation += particle.rotationSpeed * deltaTime;
        });
    }
    
    /**
     * Update energy particles
     */
    updateEnergyParticles(deltaTime) {
        this.particles.energy.forEach(particle => {
            // Update position with sine wave motion
            particle.phase += particle.frequency * deltaTime;
            const waveOffset = Math.sin(particle.phase) * 20;
            
            particle.x = (particle.x + particle.speed * deltaTime + waveOffset * 0.01) % this.canvas.width;
            particle.y = (particle.y + particle.speed * 0.5 * deltaTime) % this.canvas.height;
            
            // Update trail
            particle.trail.push({ x: particle.x, y: particle.y, alpha: 1.0 });
            if (particle.trail.length > 10) {
                particle.trail.shift();
            }
            
            // Fade trail
            particle.trail.forEach((point, index) => {
                point.alpha = index / particle.trail.length;
            });
        });
    }
    
    /**
     * Update gas particles
     */
    updateGasParticles(deltaTime) {
        this.particles.gas.forEach(particle => {
            particle.x = (particle.x + particle.speed * deltaTime + particle.drift * deltaTime) % this.canvas.width;
            particle.y = (particle.y + particle.speed * 0.3 * deltaTime) % this.canvas.height;
            
            // Update pulsing
            particle.pulse += deltaTime * 0.001;
            particle.currentAlpha = particle.alpha * (0.8 + 0.2 * Math.sin(particle.pulse));
            
            // Slowly shift hue
            particle.hue = (particle.hue + deltaTime * 0.01) % 360;
        });
    }
    
    /**
     * Render enhanced starfield
     */
    renderEnhancedStarfield(ctx, envProps, transitionProps) {
        const starDensity = envProps.starDensity || 150;
        const starBrightness = envProps.starBrightness || 0.8;
        const activeStars = Math.min(starDensity, this.particleLimit.stars);
        
        for (let i = 0; i < activeStars; i++) {
            const star = this.particles.stars[i];
            
            ctx.globalAlpha = star.currentAlpha * starBrightness * (transitionProps.starfieldAlpha || 1.0);
            
            // Set star color
            switch (star.color) {
                case 'blue':
                    ctx.fillStyle = `rgba(100, 150, 255, ${star.currentAlpha})`;
                    break;
                case 'red':
                    ctx.fillStyle = `rgba(255, 150, 100, ${star.currentAlpha})`;
                    break;
                default:
                    ctx.fillStyle = `rgba(${255 * star.brightness}, ${255 * star.brightness}, 255, ${star.currentAlpha})`;
            }
            
            // Add glow for larger stars
            if (star.size > 2) {
                ctx.shadowColor = ctx.fillStyle;
                ctx.shadowBlur = star.size * 2;
            }
            
            // Render star
            if (star.size > 3) {
                // Draw cross pattern for bright stars
                this.drawStarCross(ctx, star.x, star.y, star.size);
            } else {
                ctx.fillRect(star.x, star.y, star.size, star.size);
            }
            
            ctx.shadowBlur = 0;
        }
        
        ctx.globalAlpha = 1.0;
    }
    
    /**
     * Draw star cross pattern
     */
    drawStarCross(ctx, x, y, size) {
        const halfSize = size / 2;
        
        // Horizontal line
        ctx.fillRect(x - halfSize, y, size, 1);
        // Vertical line
        ctx.fillRect(x, y - halfSize, 1, size);
        // Center point
        ctx.fillRect(x - 1, y - 1, 2, 2);
    }
    
    /**
     * Render enhanced nebula effects
     */
    renderEnhancedNebulaEffects(ctx, envProps) {
        // Render gas particles for nebula
        this.particles.gas.forEach(particle => {
            const gradient = ctx.createRadialGradient(
                particle.x, particle.y, 0,
                particle.x, particle.y, particle.size
            );
            
            const color = `hsla(${particle.hue}, ${particle.saturation}%, 60%, ${particle.currentAlpha})`;
            gradient.addColorStop(0, color);
            gradient.addColorStop(0.7, `hsla(${particle.hue}, ${particle.saturation}%, 40%, ${particle.currentAlpha * 0.5})`);
            gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
            
            ctx.fillStyle = gradient;
            ctx.fillRect(
                particle.x - particle.size,
                particle.y - particle.size,
                particle.size * 2,
                particle.size * 2
            );
        });
        
        // Add nebula wisps
        this.renderNebulaWisps(ctx);
    }
    
    /**
     * Render nebula wisps
     */
    renderNebulaWisps(ctx) {
        const time = this.animationTime * 0.0001;
        
        ctx.strokeStyle = 'rgba(255, 100, 200, 0.3)';
        ctx.lineWidth = 2;
        
        for (let i = 0; i < 5; i++) {
            ctx.beginPath();
            
            const startX = (i * 150 + Math.sin(time + i) * 100) % this.canvas.width;
            const startY = (i * 100 + Math.cos(time + i) * 50) % this.canvas.height;
            
            ctx.moveTo(startX, startY);
            
            for (let j = 1; j <= 10; j++) {
                const x = startX + j * 20 + Math.sin(time * 2 + i + j * 0.5) * 30;
                const y = startY + j * 15 + Math.cos(time * 1.5 + i + j * 0.3) * 20;
                ctx.lineTo(x, y);
            }
            
            ctx.stroke();
        }
    }
    
    /**
     * Render enhanced asteroid dust
     */
    renderEnhancedAsteroidDust(ctx, envProps) {
        // Render dust particles
        this.particles.dust.forEach(particle => {
            ctx.globalAlpha = particle.alpha;
            ctx.fillStyle = particle.color;
            ctx.fillRect(particle.x, particle.y, particle.size, particle.size);
        });
        
        // Add dust clouds
        this.renderDustClouds(ctx);
        
        ctx.globalAlpha = 1.0;
    }
    
    /**
     * Render dust clouds
     */
    renderDustClouds(ctx) {
        const time = this.animationTime * 0.00005;
        
        for (let i = 0; i < 3; i++) {
            const x = (i * 200 + Math.sin(time + i) * 50) % this.canvas.width;
            const y = (i * 150 + Math.cos(time * 0.7 + i) * 30) % this.canvas.height;
            const size = 40 + Math.sin(time * 2 + i) * 15;
            
            const gradient = ctx.createRadialGradient(x, y, 0, x, y, size);
            gradient.addColorStop(0, 'rgba(139, 69, 19, 0.2)');
            gradient.addColorStop(0.5, 'rgba(160, 82, 45, 0.1)');
            gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
            
            ctx.fillStyle = gradient;
            ctx.fillRect(x - size, y - size, size * 2, size * 2);
        }
    }
    
    /**
     * Render enhanced energy storms
     */
    renderEnhancedEnergyStorms(ctx, envProps) {
        // Render energy particles with trails
        this.particles.energy.forEach(particle => {
            // Render trail
            particle.trail.forEach((point, index) => {
                if (index > 0) {
                    ctx.globalAlpha = point.alpha * 0.5;
                    ctx.strokeStyle = particle.color;
                    ctx.lineWidth = 2;
                    ctx.beginPath();
                    ctx.moveTo(particle.trail[index - 1].x, particle.trail[index - 1].y);
                    ctx.lineTo(point.x, point.y);
                    ctx.stroke();
                }
            });
            
            // Render particle
            ctx.globalAlpha = 0.8;
            ctx.fillStyle = particle.color;
            ctx.shadowColor = particle.color;
            ctx.shadowBlur = particle.size;
            ctx.fillRect(
                particle.x - particle.size / 2,
                particle.y - particle.size / 2,
                particle.size,
                particle.size
            );
            ctx.shadowBlur = 0;
        });
        
        // Add lightning bolts
        this.renderLightningBolts(ctx);
        
        ctx.globalAlpha = 1.0;
    }
    
    /**
     * Render lightning bolts
     */
    renderLightningBolts(ctx) {
        const time = this.animationTime * 0.01;
        
        for (let i = 0; i < 3; i++) {
            if (Math.sin(time + i * 2) > 0.8) {
                const startX = Math.random() * this.canvas.width;
                const startY = Math.random() * this.canvas.height;
                
                ctx.strokeStyle = `rgba(255, 255, ${100 + Math.random() * 155}, 0.8)`;
                ctx.lineWidth = 2 + Math.random() * 3;
                ctx.shadowColor = ctx.strokeStyle;
                ctx.shadowBlur = 10;
                
                ctx.beginPath();
                ctx.moveTo(startX, startY);
                
                let currentX = startX;
                let currentY = startY;
                
                for (let j = 0; j < 8; j++) {
                    currentX += (Math.random() - 0.5) * 60;
                    currentY += (Math.random() - 0.5) * 60;
                    ctx.lineTo(currentX, currentY);
                }
                
                ctx.stroke();
                ctx.shadowBlur = 0;
            }
        }
    }
    
    /**
     * Render enhanced floating debris
     */
    renderEnhancedFloatingDebris(ctx, envProps) {
        this.particles.debris.forEach(particle => {
            ctx.save();
            ctx.translate(particle.x, particle.y);
            ctx.rotate(particle.rotation);
            ctx.globalAlpha = particle.alpha;
            
            // Set debris color based on environment
            ctx.fillStyle = 'rgba(100, 100, 100, 0.6)';
            ctx.strokeStyle = 'rgba(150, 150, 150, 0.4)';
            ctx.lineWidth = 1;
            
            // Draw different shapes
            switch (particle.shape) {
                case 0: // Square
                    ctx.fillRect(-particle.size / 2, -particle.size / 2, particle.size, particle.size);
                    ctx.strokeRect(-particle.size / 2, -particle.size / 2, particle.size, particle.size);
                    break;
                case 1: // Triangle
                    ctx.beginPath();
                    ctx.moveTo(0, -particle.size / 2);
                    ctx.lineTo(-particle.size / 2, particle.size / 2);
                    ctx.lineTo(particle.size / 2, particle.size / 2);
                    ctx.closePath();
                    ctx.fill();
                    ctx.stroke();
                    break;
                case 2: // Circle
                    ctx.beginPath();
                    ctx.arc(0, 0, particle.size / 2, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.stroke();
                    break;
            }
            
            ctx.restore();
        });
        
        ctx.globalAlpha = 1.0;
    }
    
    /**
     * Render cosmic rays
     */
    renderCosmicRays(ctx, envProps) {
        const time = this.animationTime * 0.0001;
        
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.lineWidth = 1;
        
        for (let i = 0; i < 15; i++) {
            const x = (time * 100 + i * 60) % (this.canvas.width + 100);
            const angle = 0.2 + Math.sin(time + i) * 0.1;
            
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x + Math.tan(angle) * this.canvas.height, this.canvas.height);
            ctx.stroke();
        }
    }
    
    /**
     * Get particle system statistics
     */
    getStats() {
        return {
            totalParticles: Object.values(this.particles).reduce((sum, arr) => sum + arr.length, 0),
            particleCounts: Object.fromEntries(
                Object.entries(this.particles).map(([key, arr]) => [key, arr.length])
            ),
            animationTime: this.animationTime
        };
    }
    
    /**
     * Reset particle systems
     */
    reset() {
        this.animationTime = 0;
        this.initializeParticleSystems();
        console.log('🎨 EnvironmentRenderer reset');
    }
    
    /**
     * Clean up resources
     */
    dispose() {
        // Clear all particle arrays
        Object.keys(this.particles).forEach(key => {
            this.particles[key] = [];
        });
        
        console.log('🧹 EnvironmentRenderer disposed');
    }
}