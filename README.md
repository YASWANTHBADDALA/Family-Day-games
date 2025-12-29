# Pose Challenge Project

A web-based pose detection application using TensorFlow.js and MoveNet model.

## Project Structure

```
pose-challenge/
├── index.html          # Main HTML file
├── script.js           # JavaScript logic for pose detection
├── style.css           # Styling for the application
└── assets/
    ├── tf.min.js       # TensorFlow.js library
    └── movenet/        # MoveNet model files
        ├── model.json
        └── group1-shard1of1.bin
```

## Setup Instructions

### 1. Download TensorFlow.js

Download the TensorFlow.js library and place it in the `assets/` folder:

- **Option A (CDN - Recommended for development):**
  - You can use the CDN link directly in your HTML instead of downloading
  - CDN: `https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@latest/dist/tf.min.js`

- **Option B (Local file):**
  - Download from: https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@latest/dist/tf.min.js
  - Save as `assets/tf.min.js`

### 2. Download MoveNet Model

Download the MoveNet model files and place them in `assets/movenet/`:

**Using TensorFlow Hub:**
1. Visit: https://tfhub.dev/google/tfjs-model/movenet/singlepose/lightning/4
2. Download the model files:
   - `model.json`
   - `group1-shard1of1.bin` (or similar shard files)

**Using Command Line (if you have Node.js):**
```bash
# Install TensorFlow.js converter if needed
npm install -g @tensorflow/tfjs-converter

# Or download directly from TF Hub
# Visit the model page and download the files manually
```

**Alternative - Use CDN (for development):**
You can load the model directly from TensorFlow Hub in your code:
```javascript
const model = await tf.loadLayersModel('https://tfhub.dev/google/tfjs-model/movenet/singlepose/lightning/4/1');
```

### 3. Verify File Structure

Make sure all files are in place:
- ✅ `index.html` exists
- ✅ `script.js` exists
- ✅ `style.css` exists
- ✅ `assets/tf.min.js` exists (or use CDN)
- ✅ `assets/movenet/model.json` exists
- ✅ `assets/movenet/group1-shard1of1.bin` exists

## Running the Project

### Option 1: Local Server (Recommended)

Due to CORS restrictions, you'll need to run a local server:

**Using Python:**
```bash
# Python 3
python -m http.server 8000

# Python 2
python -m SimpleHTTPServer 8000
```

**Using Node.js (http-server):**
```bash
npm install -g http-server
http-server -p 8000
```

**Using VS Code:**
- Install the "Live Server" extension
- Right-click on `index.html` and select "Open with Live Server"

### Option 2: Direct File Opening

Simply open `index.html` in your web browser (may have limitations with local file access).

## Access the Application

Once the server is running, open your browser and navigate to:
```
http://localhost:8000
```

## Requirements

- Modern web browser (Chrome, Firefox, Edge, Safari)
- Webcam access (for real-time pose detection)
- Local web server (for loading model files)

## Troubleshooting

### Model files not loading
- Ensure you're running a local server (not opening file directly)
- Check browser console for CORS errors
- Verify model files are in the correct directory

### Webcam not working
- Grant camera permissions in your browser
- Check if another application is using the webcam
- Try a different browser

### TensorFlow.js errors
- Ensure `tf.min.js` is loaded correctly
- Check browser console for specific error messages
- Verify you're using a compatible browser version

## Notes

- The MoveNet model files can be large (several MB)
- For production, consider hosting model files on a CDN
- Ensure your web server supports serving binary files (.bin)

