// Audio Visualizer Application
class AudioVisualizer {
    constructor() {
        // Audio properties
        this.audioContext = null;
        this.analyser = null;
        this.dataArray = null;
        this.bufferLength = null;
        this.source = null;
        this.gainNode = null;
        this.mediaStream = null;
        this.timeDataArray = null;
        this.isPlaying = false;
        
        // Canvas properties
        this.canvas = null;
        this.ctx = null;
        this.animationId = null;
        
        // Settings
        this.settings = {
            fftSize: 1024,
            smoothingTimeConstant: 0.8,
            gain: 1.0,
            visualizationType: 'bars',
            colorScheme: 'rainbow'
        };
        
        // Color schemes
        this.colorSchemes = {
            rainbow: ['#ff0000', '#ff8000', '#ffff00', '#80ff00', '#00ff00', '#00ff80', '#00ffff', '#0080ff', '#0000ff', '#8000ff', '#ff00ff', '#ff0080'],
            gradient: ['#ff0044', '#ff5500', '#ffaa00', '#ffee00', '#44ff00', '#00ffaa', '#00d4ff', '#0055ff', '#8800ff', '#ff00cc'],
            sunset: ['#ff3366', '#ff6633', '#ff9933', '#ffcc00', '#cc3399', '#660099'],
            neon: ['#00ffff', '#00aaff', '#7f00ff', '#ff00ff', '#ff007f'],
            ocean: ['#003366', '#0066cc', '#0099ff', '#33ccff', '#66ffff'],
            fire: ['#660000', '#cc0000', '#ff3300', '#ff6600', '#ffcc00', '#ffff00'],
            purple: ['#330066', '#6600cc', '#9933ff', '#cc66ff', '#ff99ff']
        };
        
        // Spectrogram data for waterfall effect
        this.spectrogramData = [];
        
        // Particle system
        this.particles = [];
        
        // FPS tracking
        this.fps = 0;
        this.lastTime = 0;
        this.frameCount = 0;
        
        this.initializeElements();
        this.setupEventListeners();
    }
    
    initializeElements() {
        // Get DOM elements
        this.canvas = document.getElementById('visualizerCanvas');
        this.ctx = this.canvas.getContext('2d');
        
        // Set canvas size
        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());
    }
    
    resizeCanvas() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }
    
    setupEventListeners() {
        // Welcome screen
        document.getElementById('startButton').addEventListener('click', () => {
            this.showVisualizer();
        });
        
        // Audio controls
        document.getElementById('startMic').addEventListener('click', () => {
            this.startMicrophone();
        });
        
        document.getElementById('stopAudio').addEventListener('click', () => {
            this.stopAudio();
        });
        
        document.getElementById('audioFile').addEventListener('change', (e) => {
            this.handleFileUpload(e.target.files[0]);
        });
        
        // Settings controls
        document.getElementById('vizType').addEventListener('change', (e) => {
            this.settings.visualizationType = e.target.value;
            if (this.ctx) {
                this.ctx.fillStyle = '#000000';
                this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            }
            if (e.target.value === 'particles') {
                this.initializeParticles();
            }
        });
        
        document.getElementById('gainSlider').addEventListener('input', (e) => {
            this.settings.gain = parseFloat(e.target.value);
            document.getElementById('gainValue').textContent = parseFloat(e.target.value).toFixed(1);
            if (this.gainNode) {
                this.gainNode.gain.value = this.settings.gain;
            }
        });
        
        document.getElementById('fftSize').addEventListener('change', (e) => {
            this.settings.fftSize = parseInt(e.target.value);
            if (this.analyser) {
                this.analyser.fftSize = this.settings.fftSize;
                this.bufferLength = this.analyser.frequencyBinCount;
                this.dataArray = new Uint8Array(this.bufferLength);
            }
        });
        
        document.getElementById('smoothing').addEventListener('input', (e) => {
            this.settings.smoothingTimeConstant = parseFloat(e.target.value);
            document.getElementById('smoothingValue').textContent = e.target.value;
            if (this.analyser) {
                this.analyser.smoothingTimeConstant = this.settings.smoothingTimeConstant;
            }
        });
        
        document.getElementById('colorScheme').addEventListener('change', (e) => {
            this.settings.colorScheme = e.target.value;
        });
        
        // UI controls
        document.getElementById('toggleControls').addEventListener('click', () => {
            this.toggleControls();
        });
        
        document.getElementById('fullscreen').addEventListener('click', () => {
            this.toggleFullscreen();
        });
        
        document.getElementById('dismissError').addEventListener('click', () => {
            document.getElementById('errorDisplay').classList.add('hidden');
        });
    }
    
    showVisualizer() {
        document.getElementById('welcomeScreen').classList.add('hidden');
        document.getElementById('visualizerContainer').classList.remove('hidden');
        this.startAnimation();
        this.startMicrophone();
    }
    
    async startMicrophone() {
        if (this.isPlaying) {
            this.stopAudio();
        }
        
        try {
            if (!this.audioContext) {
                this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            }
            
            if (this.audioContext.state === 'suspended') {
                await this.audioContext.resume();
            }
            
            let stream;
            try {
                // Request studio-quality raw audio bypassing telephony voice filters (noise cancellation/echo suppression)
                stream = await navigator.mediaDevices.getUserMedia({
                    audio: {
                        echoCancellation: false,
                        noiseSuppression: false,
                        autoGainControl: false
                    }
                });
            } catch (err) {
                // Fallback to basic audio constraint if strict constraints fail
                stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            }
            this.mediaStream = stream;
            
            this.setupAudioProcessing(stream);
            this.updateStatus('Recording', 'success');
            
            document.getElementById('startMic').disabled = true;
            document.getElementById('stopAudio').disabled = false;
            
        } catch (error) {
            console.error('Error accessing microphone:', error);
            this.showError('Could not access microphone. Please check permissions or upload an audio file.');
        }
    }
    
    async handleFileUpload(file) {
        if (!file) return;
        
        if (this.isPlaying) {
            this.stopAudio();
        }
        
        try {
            if (!this.audioContext) {
                this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            }
            
            if (this.audioContext.state === 'suspended') {
                await this.audioContext.resume();
            }
            
            const arrayBuffer = await file.arrayBuffer();
            const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
            
            this.playAudioBuffer(audioBuffer);
            this.updateStatus('Playing File', 'success');
            
            document.getElementById('startMic').disabled = false;
            document.getElementById('stopAudio').disabled = false;
            
        } catch (error) {
            console.error('Error loading audio file:', error);
            this.showError('Could not load audio file. Please try a different file.');
        }
    }
    
    setupAudioProcessing(stream) {
        this.source = this.audioContext.createMediaStreamSource(stream);
        this.setupAnalyser();
        this.source.connect(this.gainNode);
        this.gainNode.connect(this.analyser);
        // Note: Microphone is intentionally NOT connected to destination to avoid acoustic feedback screech
        this.isPlaying = true;
    }
    
    playAudioBuffer(audioBuffer) {
        if (this.source) {
            try { this.source.stop(); } catch (e) {}
            this.source.disconnect();
        }
        
        this.source = this.audioContext.createBufferSource();
        this.source.buffer = audioBuffer;
        this.source.loop = true;
        
        this.setupAnalyser();
        // Route to visualizer analyzer via gainNode
        this.source.connect(this.gainNode);
        this.gainNode.connect(this.analyser);
        // Route to speakers so the user can hear the audio file
        this.source.connect(this.audioContext.destination);
        
        this.source.start(0);
        this.isPlaying = true;
    }
    
    setupAnalyser() {
        this.analyser = this.audioContext.createAnalyser();
        this.gainNode = this.audioContext.createGain();
        
        this.analyser.fftSize = this.settings.fftSize;
        this.analyser.smoothingTimeConstant = this.settings.smoothingTimeConstant;
        this.gainNode.gain.value = this.settings.gain;
        
        this.bufferLength = this.analyser.frequencyBinCount;
        this.dataArray = new Uint8Array(this.bufferLength);
        this.timeDataArray = new Uint8Array(this.bufferLength);
        
        if (this.settings.visualizationType === 'particles') {
            this.initializeParticles();
        }
    }
    
    stopAudio() {
        if (this.source) {
            if (this.source.stop) {
                try {
                    this.source.stop();
                } catch (e) {
                    // Ignore if already stopped
                }
            }
            this.source.disconnect();
            this.source = null;
        }
        
        if (this.mediaStream) {
            this.mediaStream.getTracks().forEach(track => track.stop());
            this.mediaStream = null;
        }
        
        const audioFileInput = document.getElementById('audioFile');
        if (audioFileInput) {
            audioFileInput.value = '';
        }
        
        this.isPlaying = false;
        this.updateStatus('Stopped', 'info');
        
        document.getElementById('startMic').disabled = false;
        document.getElementById('stopAudio').disabled = true;
    }
    
    startAnimation() {
        const animate = (currentTime) => {
            // Calculate FPS
            if (currentTime - this.lastTime >= 1000) {
                this.fps = Math.round((this.frameCount * 1000) / (currentTime - this.lastTime));
                document.getElementById('fpsCounter').textContent = `FPS: ${this.fps}`;
                this.frameCount = 0;
                this.lastTime = currentTime;
            }
            this.frameCount++;
            
            // Clear canvas with trail effect for non-spectrogram modes
            if (this.settings.visualizationType !== 'spectrogram') {
                this.ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
                this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            }
            
            if (this.isPlaying && this.analyser && this.dataArray) {
                this.analyser.getByteFrequencyData(this.dataArray);
                
                switch (this.settings.visualizationType) {
                    case 'bars':
                        this.drawFrequencyBars();
                        break;
                    case 'circular':
                        this.drawCircularSpectrum();
                        break;
                    case 'waveform':
                        this.drawWaveform();
                        break;
                    case 'spectrogram':
                        this.drawSpectrogram();
                        break;
                    case 'particles':
                        this.updateParticles();
                        this.drawParticles();
                        break;
                }
            }
            
            this.animationId = requestAnimationFrame(animate);
        };
        
        animate(0);
    }
    
    drawFrequencyBars() {
        const centerY = this.canvas.height / 2;
        const barWidth = this.canvas.width / this.bufferLength;
        const gap = barWidth > 3 ? 1 : (barWidth > 1.5 ? 0.5 : 0);
        const renderWidth = Math.max(1, barWidth - gap);
        const maxHalfHeight = (this.canvas.height / 2) - 15;
        const scheme = this.settings.colorScheme;
        const colors = this.colorSchemes[scheme] || this.colorSchemes.rainbow;
        const isGradientMode = scheme === 'gradient' || scheme === 'sunset' || scheme === 'neon';
        
        // Subtle central horizon reference line
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
        this.ctx.fillRect(0, centerY - 0.5, this.canvas.width, 1);
        
        if (isGradientMode) {
            // Continuous natural color transition across all bars
            const gradient = this.ctx.createLinearGradient(0, 0, this.canvas.width, 0);
            for (let c = 0; c < colors.length; c++) {
                gradient.addColorStop(c / (colors.length - 1), colors[c]);
            }
            this.ctx.fillStyle = gradient;
        }
        
        for (let i = 0; i < this.bufferLength; i++) {
            // DC offset suppression on bin 0 (0 Hz electrical bias) so it doesn't spike artificially
            const rawVal = (i === 0) ? this.dataArray[1] * 0.5 : this.dataArray[i];
            const intensity = rawVal / 255;
            
            // Symmetrical half-height above and below the horizontal center line
            const halfHeight = Math.max(1.5, Math.min(maxHalfHeight, intensity * (this.canvas.height * 0.44) * this.settings.gain));
            
            const x = i * barWidth;
            const y = centerY - halfHeight;
            const height = halfHeight * 2;
            
            if (!isGradientMode) {
                const colorIndex = Math.floor((i / this.bufferLength) * colors.length);
                this.ctx.fillStyle = colors[colorIndex % colors.length];
            }
            
            if (this.ctx.roundRect && renderWidth >= 3) {
                this.ctx.beginPath();
                this.ctx.roundRect(x, y, renderWidth, height, Math.min(renderWidth / 2, 3));
                this.ctx.fill();
            } else {
                this.ctx.fillRect(x, y, renderWidth, height);
            }
        }
    }
    
    drawCircularSpectrum() {
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        const radius = Math.min(centerX, centerY) * 0.45;
        const scheme = this.settings.colorScheme;
        const colors = this.colorSchemes[scheme] || this.colorSchemes.rainbow;
        const isGradientMode = scheme === 'gradient' || scheme === 'sunset' || scheme === 'neon';
        
        // Inner subtle baseline circle
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
        this.ctx.lineWidth = 1.5;
        this.ctx.beginPath();
        this.ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        this.ctx.stroke();
        
        for (let i = 0; i < this.bufferLength; i++) {
            const rawVal = (i === 0) ? this.dataArray[1] * 0.5 : this.dataArray[i];
            const intensity = rawVal / 255;
            const angle = (i / this.bufferLength) * Math.PI * 2;
            const barHeight = intensity * radius * 0.9 * this.settings.gain;
            
            const x1 = centerX + Math.cos(angle) * radius;
            const y1 = centerY + Math.sin(angle) * radius;
            const x2 = centerX + Math.cos(angle) * (radius + barHeight);
            const y2 = centerY + Math.sin(angle) * (radius + barHeight);
            
            if (isGradientMode) {
                if (scheme === 'gradient') {
                    const hue = (i / this.bufferLength) * 360;
                    this.ctx.strokeStyle = `hsl(${Math.round(hue)}, 100%, 55%)`;
                } else {
                    const t = (i / this.bufferLength) * (colors.length - 1);
                    const idx = Math.floor(t);
                    const frac = t - idx;
                    const nextIdx = Math.min(idx + 1, colors.length - 1);
                    this.ctx.strokeStyle = this.interpolateHex(colors[idx], colors[nextIdx], frac);
                }
            } else {
                const colorIndex = Math.floor((i / this.bufferLength) * colors.length);
                this.ctx.strokeStyle = colors[colorIndex % colors.length];
            }
            
            this.ctx.lineWidth = 2;
            this.ctx.beginPath();
            this.ctx.moveTo(x1, y1);
            this.ctx.lineTo(x2, y2);
            this.ctx.stroke();
        }
    }
    
    drawWaveform() {
        // Use full fftSize resolution for complete wave cycles
        const sampleCount = this.analyser.fftSize;
        if (!this.timeDataArray || this.timeDataArray.length !== sampleCount) {
            this.timeDataArray = new Uint8Array(sampleCount);
        }
        this.analyser.getByteTimeDomainData(this.timeDataArray);
        
        // Scan for peak amplitude to calculate adaptive scaling
        let maxDev = 0;
        for (let i = 0; i < sampleCount; i++) {
            const dev = Math.abs(this.timeDataArray[i] - 128);
            if (dev > maxDev) {
                maxDev = dev;
            }
        }
        
        const normMax = maxDev / 128.0;
        // Adaptive boost ensures the wave is never flat during active audio, scaling up to 4.5x for soft inputs
        const autoBoost = normMax > 0.002 ? Math.max(1.4, Math.min(4.5, 0.38 / normMax)) : 1.0;
        // Total dynamic scale amplified by sensitivity slider
        const scale = (this.canvas.height * 0.40) * autoBoost * this.settings.gain;
        const centerY = this.canvas.height / 2;
        const maxOffset = (this.canvas.height / 2) - 25;
        
        const colors = this.colorSchemes[this.settings.colorScheme];
        
        // Create full spectrum linear gradient across the canvas
        const gradient = this.ctx.createLinearGradient(0, 0, this.canvas.width, 0);
        for (let c = 0; c < colors.length; c++) {
            gradient.addColorStop(c / (colors.length - 1), colors[c]);
        }
        
        this.ctx.save();
        
        // Ambient neon phosphor glow
        this.ctx.shadowBlur = 14;
        this.ctx.shadowColor = colors[Math.min(1, colors.length - 1)];
        this.ctx.strokeStyle = gradient;
        this.ctx.lineWidth = 3.5;
        this.ctx.lineCap = 'round';
        this.ctx.lineJoin = 'round';
        
        const sliceWidth = this.canvas.width / (sampleCount - 1);
        this.ctx.beginPath();
        
        for (let i = 0; i < sampleCount; i++) {
            const deviation = (this.timeDataArray[i] - 128) / 128.0;
            // Smooth hyperbolic tangent compression prevents harsh square-wave clipping
            const rawOffset = deviation * scale;
            const compressedOffset = maxOffset * Math.tanh(rawOffset / maxOffset);
            const y = centerY + compressedOffset;
            const x = i * sliceWidth;
            
            if (i === 0) {
                this.ctx.moveTo(x, y);
            } else {
                this.ctx.lineTo(x, y);
            }
        }
        
        this.ctx.stroke();
        
        // Secondary translucent harmonic echo for depth
        if (normMax > 0.005) {
            this.ctx.shadowBlur = 0;
            this.ctx.lineWidth = 1.5;
            this.ctx.strokeStyle = this.hexToRgba(colors[0], 0.35);
            this.ctx.beginPath();
            
            for (let i = 0; i < sampleCount; i++) {
                const deviation = (this.timeDataArray[i] - 128) / 128.0;
                const rawOffset = -deviation * scale * 0.55;
                const compressedOffset = maxOffset * Math.tanh(rawOffset / maxOffset);
                const y = centerY + compressedOffset;
                const x = i * sliceWidth;
                
                if (i === 0) {
                    this.ctx.moveTo(x, y);
                } else {
                    this.ctx.lineTo(x, y);
                }
            }
            
            this.ctx.stroke();
        }
        
        this.ctx.restore();
    }
    
    drawSpectrogram() {
        // High-performance canvas waterfall: shift previous frame down and draw top scanline
        const speed = 2;
        const w = this.canvas.width;
        const h = this.canvas.height;
        
        // Shift existing canvas down by `speed` pixels
        this.ctx.drawImage(this.canvas, 0, 0, w, h - speed, 0, speed, w, h - speed);
        
        const colors = this.colorSchemes[this.settings.colorScheme];
        const barWidth = w / this.bufferLength;
        
        // Render current audio frequency row at y = 0
        for (let x = 0; x < this.bufferLength; x++) {
            const intensity = this.dataArray[x] / 255;
            const colorIndex = Math.min(Math.floor(intensity * colors.length), colors.length - 1);
            this.ctx.fillStyle = colors[colorIndex];
            this.ctx.fillRect(x * barWidth, 0, Math.ceil(barWidth), speed);
        }
    }
    
    initializeParticles() {
        this.particles = [];
        const numParticles = 120;
        const colors = this.colorSchemes[this.settings.colorScheme];
        
        for (let i = 0; i < numParticles; i++) {
            this.particles.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                vx: (Math.random() - 0.5) * 2,
                vy: (Math.random() - 0.5) * 2,
                size: Math.random() * 3 + 1,
                life: Math.random() * 0.8 + 0.2,
                decay: Math.random() * 0.01 + 0.005,
                colorIndex: Math.floor(Math.random() * colors.length)
            });
        }
    }
    
    updateParticles() {
        // Get bass frequencies (lower part of spectrum)
        const bassRange = Math.max(1, Math.floor(this.bufferLength * 0.1));
        let bassAverage = 0;
        
        for (let i = 0; i < bassRange; i++) {
            bassAverage += this.dataArray[i];
        }
        bassAverage /= bassRange;
        
        const bassIntensity = bassAverage / 255;
        const colors = this.colorSchemes[this.settings.colorScheme];
        
        this.particles.forEach(particle => {
            // Update position
            particle.x += particle.vx * (1 + bassIntensity * 2.5);
            particle.y += particle.vy * (1 + bassIntensity * 2.5);
            
            // Wrap around screen
            if (particle.x < 0) particle.x = this.canvas.width;
            if (particle.x > this.canvas.width) particle.x = 0;
            if (particle.y < 0) particle.y = this.canvas.height;
            if (particle.y > this.canvas.height) particle.y = 0;
            
            // Update life
            particle.life -= particle.decay;
            if (particle.life <= 0) {
                particle.x = Math.random() * this.canvas.width;
                particle.y = Math.random() * this.canvas.height;
                particle.life = 1.0;
                particle.colorIndex = Math.floor(Math.random() * colors.length);
            }
        });
    }
    
    drawParticles() {
        const colors = this.colorSchemes[this.settings.colorScheme];
        
        this.particles.forEach(particle => {
            const color = colors[particle.colorIndex % colors.length];
            const alpha = Math.max(0, Math.min(1, particle.life));
            
            this.ctx.fillStyle = this.hexToRgba(color, alpha);
            this.ctx.beginPath();
            this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            this.ctx.fill();
        });
    }
    
    hexToRgba(hex, alpha) {
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    }
    
    interpolateHex(hex1, hex2, factor) {
        const r1 = parseInt(hex1.slice(1, 3), 16);
        const g1 = parseInt(hex1.slice(3, 5), 16);
        const b1 = parseInt(hex1.slice(5, 7), 16);
        const r2 = parseInt(hex2.slice(1, 3), 16);
        const g2 = parseInt(hex2.slice(3, 5), 16);
        const b2 = parseInt(hex2.slice(5, 7), 16);
        const r = Math.round(r1 + (r2 - r1) * factor);
        const g = Math.round(g1 + (g2 - g1) * factor);
        const b = Math.round(b1 + (b2 - b1) * factor);
        return `rgb(${r}, ${g}, ${b})`;
    }
    
    updateStatus(message, type) {
        const statusEl = document.getElementById('audioStatus');
        statusEl.textContent = message;
        statusEl.className = `status status--${type}`;
    }
    
    showError(message) {
        document.getElementById('errorMessage').textContent = message;
        document.getElementById('errorDisplay').classList.remove('hidden');
    }
    
    toggleControls() {
        const overlay = document.getElementById('controlsOverlay');
        const button = document.getElementById('toggleControls');
        
        overlay.classList.toggle('collapsed');
        button.textContent = overlay.classList.contains('collapsed') ? 'Show Controls' : 'Hide Controls';
    }
    
    toggleFullscreen() {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(err => {
                console.error('Error attempting to enable fullscreen:', err);
            });
        } else {
            document.exitFullscreen();
        }
    }
}

// Initialize the visualizer when the page loads
window.addEventListener('DOMContentLoaded', () => {
    new AudioVisualizer();
});