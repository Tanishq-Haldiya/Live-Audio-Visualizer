# Live Audio Visualizer 🎵⚡

[![Live Demo](https://img.shields.io/badge/Live%20Demo-GitHub%20Pages-brightgreen?style=for-the-badge&logo=github)](https://tanishq-haldiya.github.io/Live-Audio-Visualizer/)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg?style=for-the-badge)](LICENSE)
[![Vanilla JS](https://img.shields.io/badge/Vanilla-JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![HTML5 Canvas](https://img.shields.io/badge/HTML5-Canvas-E34F26?style=for-the-badge&logo=html5&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API)
[![Web Audio API](https://img.shields.io/badge/Web%20Audio-API-teal?style=for-the-badge)](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API)

A high-performance, real-time web audio visualizer built with vanilla JavaScript, HTML5 Canvas, and the Web Audio API.

Experience audio visualization with **internal PC audio loopback (Spotify, YouTube, games)**, live studio microphone input, 32-bit floating-point oscilloscopic waveform rendering, dynamic spectrum tracking, and an immersive auto-fading interface.

🌐 **Live Website**: [https://tanishq-haldiya.github.io/Live-Audio-Visualizer/](https://tanishq-haldiya.github.io/Live-Audio-Visualizer/)

---

## ✨ Features

### 🎧 Triple Audio Source Engine
- **Direct PC Audio Capture**: Stream internal desktop audio (Spotify, YouTube, browser media, games, media players) directly into the visualizer using Web Audio loopback. Pure digital stereo quality with zero microphone feedback or room noise.
- **Studio Microphone**: Raw, studio-quality microphone capture bypassing telephony voice compression filters, with 0 Hz electrical DC offset suppression.
- **Local File Upload**: Upload local MP3, WAV, or OGG tracks with simultaneous speaker playback and real-time audio analysis.

### 📊 5 Real-Time Visualization Modes
1. **Frequency Bars**: Symmetrical frequency bars extending evenly above and below a subtle center horizon line with continuous multi-color gradients.
2. **Circular Spectrum**: Radial frequency visualization radiating outward from a glowing 360° circular baseline.
3. **Smooth Waveform**: 32-bit floating-point time-domain oscilloscopic wave with $C^1$-continuous midpoint quadratic spline interpolation, soft-knee hyperbolic tangent (`Math.tanh`) limiting, and a dual-pass CRT laser phosphor glow.
4. **Spectrogram**: Hardware-accelerated waterfall spectrogram streaming continuous top-scanline frequency history at a locked 60 FPS.
5. **Reactive Particles**: Floating particle physics field with dynamic velocity impulses triggered by real-time bass kicks, mids, and treble hits.

### 🧠 Intelligent Audio Processing & Dynamic Scaling
- **Dynamic Audio Stream Cutoff Tracking**: Streaming platforms (YouTube, Spotify) and lossy codecs (Opus, AAC, MP3) cap audio above ~15.5 kHz – 16 kHz. In PC Audio mode, the visualizer dynamically detects the active high-frequency ceiling of the audio stream and stretches bars to 100% of the canvas width, eliminating trailing dead bars.
- **Microphone Full-Spectrum Mode**: Retains the complete uncropped $0\text{ Hz} \to 24\text{ kHz}$ acoustic spectrum when microphone input is active.
- **32-Bit Float Audio Resolution**: Eliminates 8-bit integer quantization steps and staircasing in the waveform visualization.

### 👻 Cinematic Auto-Fade UI
- **Cursor Inactivity Fade**: Sit back and enjoy the show — after 2.5 seconds of cursor inactivity, the controls panel, status badges, and mouse cursor smoothly fade away (`opacity: 0`).
- **Instant Wake-Up**: Moving the mouse, clicking, or pressing any key immediately restores the controls and cursor.
- **Interaction Guard**: The UI automatically stays visible whenever hovering over or adjusting settings in the controls drawer.

### 🎨 Customizable Settings
- **Color Palettes**: Rainbow, Rainbow Gradient, Sunset Gradient, Cyberpunk Neon, Ocean, Fire, and Purple themes.
- **Sensitivity Slider**: Dynamic gain scaling from `0.1x` to `10.0x`.
- **FFT Size**: Selectable frequency resolution (`128`, `256`, `512`, `1024`, `2048` bins).
- **Temporal Smoothing**: Adjustable smoothing time constant (`0.0` to `0.9`).

---

## 🚀 Live Demo & Local Setup

### 🌐 Try It Live
Visit the live deployment hosted directly on GitHub Pages:
👉 **[https://tanishq-haldiya.github.io/Live-Audio-Visualizer/](https://tanishq-haldiya.github.io/Live-Audio-Visualizer/)**

### 💻 Run Locally
No build tools, Node modules, or package managers required!

1. **Clone the repository**:
   ```bash
   git clone https://github.com/Tanishq-Haldiya/Live-Audio-Visualizer.git
   cd Live-Audio-Visualizer
   ```

2. **Start a local HTTP server**:
   Using Python:
   ```bash
   python -m http.server 8080
   ```
   Or using Node (`npx`):
   ```bash
   npx serve .
   ```

3. **Open in your browser**:
   Navigate to `http://localhost:8080` in Chrome, Edge, Firefox, or Safari.

---

## 🎧 How to Use

### Capturing Internal PC Audio (Spotify, YouTube, Games)
1. Click **"Capture PC Audio"** on the welcome screen or in the sidebar controls.
2. In the browser share dialog:
   - Select the **"Entire Screen"** tab.
   - Check the **"Share system audio"** box at the bottom.
   - Click **Share**.
3. Play music or videos from any desktop app — the visualizer will instantly react to your computer's internal digital audio!

### Using Your Microphone
1. Click **"Start with Microphone"**.
2. Grant microphone permissions when prompted by your browser.

### Uploading an Audio File
1. Click **"Choose File"** under *Upload Audio File* in the sidebar controls.
2. Select any local `.mp3`, `.wav`, or `.ogg` file (a sample `test_tone.wav` is included in the repository).

---

## 🛠️ Built With

- **HTML5 Canvas 2D Context**: High-performance raster operations and GPU-accelerated blits.
- **Web Audio API**: `AudioContext`, `AnalyserNode`, `GainNode`, `MediaStreamAudioSourceNode`, `getFloatTimeDomainData`, and `getByteFrequencyData`.
- **Vanilla JavaScript (ES6+)**: Zero runtime dependencies, clean class-based modular architecture.
- **Modern CSS3**: CSS custom properties, glassmorphism backdrop blur, responsive layouts, and smooth transition keyframes.

---

## 📄 License

This project is open-source and available under the [MIT License](LICENSE).
