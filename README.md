# Live Audio Visualizer 🎵⚡

A high-performance, real-time web audio visualizer built with vanilla JavaScript, HTML5 Canvas, and the Web Audio API.

Experience audio visualization with multiple reactive modes, customizable audio processing settings, and vibrant color themes.

---

## ✨ Features

- **Dual Audio Sources**:
  - **Live Microphone**: Capture and visualize live microphone input in real time.
  - **Audio File Upload**: Upload local audio files (MP3, WAV, OGG, etc.) with simultaneous speaker playback and frequency analysis.
- **5 Visualization Modes**:
  - 📊 **Frequency Bars**: Dynamic spectrum bars with gradient color scaling.
  - ⭕ **Circular Spectrum**: Radial frequency visualization around an illuminated baseline ring.
  - 〰️ **Waveform**: High-contrast oscilloscopic time-domain wave visualization.
  - 🌊 **Spectrogram**: Continuous high-speed waterfall spectrogram running at a locked 60 FPS.
  - ✨ **Particles**: Bass-reactive floating particle field with dynamic physics impulses.
- **Customizable Controls**:
  - **Color Schemes**: Rainbow, Ocean, Fire, and Purple palettes.
  - **Sensitivity**: Real-time gain control multiplier (0.1x – 3.0x).
  - **FFT Size**: Configurable frequency resolution (128, 256, 512, 1024, 2048 bins).
  - **Smoothing**: Adjustable smoothing time constant (0.0 – 0.9).
- **Modern UI**:
  - Semi-transparent, blur-backed floating controls overlay.
  - Collapsible control drawer ("Hide Controls" / "Show Controls").
  - Fullscreen toggle and real-time FPS counter.
  - Fully responsive on desktop and mobile viewports.

---

## 🚀 Getting Started

No build step or dependencies required!

### Option 1: Direct in Browser
Simply clone or download this repository and open `index.html` in your browser:
```bash
git clone https://github.com/Tanishq-Haldiya/Live-Audio-Visualizer.git
cd Live-Audio-Visualizer
```
Double-click `index.html` to open it in Chrome, Edge, Firefox, or Safari.

### Option 2: Local HTTP Server (Recommended)
Using Python:
```bash
python -m http.server 8000
```
Then navigate to `http://localhost:8000` in your web browser.

---

## 🎧 How to Use

1. Click **"Start Visualizer"** on the welcome screen.
2. Grant microphone access when prompted by the browser, or click **"Upload Audio File"** to load any audio track (a sample `test_tone.wav` is included).
3. Use the floating control panel on the right to:
   - Switch between the 5 visualization modes.
   - Adjust sensitivity, smoothing, and FFT size.
   - Switch color palettes.
   - Toggle fullscreen for an immersive display.

---

## 🛠️ Built With

- **HTML5 Canvas** (2D Context with optimized GPU blits)
- **Web Audio API** (`AudioContext`, `AnalyserNode`, `GainNode`, `MediaStreamAudioSourceNode`)
- **Vanilla JavaScript** (ES6+)
- **CSS3** (Custom properties & modern responsive design)

---

## 📄 License

This project is open-source and available under the [MIT License](LICENSE).
