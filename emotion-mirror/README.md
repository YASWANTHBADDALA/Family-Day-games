# Emotion Mirror - Real-Time Facial Emotion Detection

A web-based application that uses MediaPipe Face Landmarker to detect and display emotions in real-time from your webcam feed. The application runs entirely offline with no data storage or transmission.

## 🎯 Features

- **Real-Time Emotion Detection**: Detects 4 emotions (Neutral, Happy, Angry, Surprised)
- **100% Offline**: All processing happens locally in your browser
- **Privacy-Focused**: No data is stored, transmitted, or collected
- **Visual Feedback**: Emotion symbols highlight when detected
- **Modern UI**: Clean, responsive interface with live webcam feed

## 📋 Requirements

- **Python 3.6+** (for downloading assets)
- **Modern Web Browser** (Chrome, Edge, Firefox, Safari)
- **Webcam** (for real-time emotion detection)
- **Internet Connection** (only for initial asset download)

## 🚀 Setup Instructions

### Step 1: Download Required Assets

The application requires MediaPipe assets to function. Run the download script:

```bash
cd emotion-mirror
python download_assets.py
```

This will download:

- `vision_bundle.js` - MediaPipe vision library
- `face_landmarker.task` - Face detection model
- `vision_wasm_internal.js` - WASM loader
- `vision_wasm_internal.wasm` - WebAssembly runtime

**Note**: The download script must be run from the `emotion-mirror` directory.

### Step 2: Start Local Web Server

Since the application uses ES modules, it must be served over HTTP (not `file://`). Use Python's built-in server:

```bash
cd emotion-mirror
python -m http.server 8000
```

Or use any other local web server:

- **Node.js**: `npx http-server -p 8000`
- **PHP**: `php -S localhost:8000`
- **VS Code**: Use Live Server extension

### Step 3: Open in Browser

Navigate to:

```
http://localhost:8000
```

## 📁 Project Structure

```
emotion-mirror/
│
├── index.html              # Main HTML file
├── script.js               # Application logic
├── download_assets.py      # Asset download script
├── README.md               # This file
├── PRIVACY_CONFIRMATION.md # Privacy documentation
│
└── assets/
    ├── vision_bundle.js    # MediaPipe vision bundle
    │
    └── mediapipe/          # MediaPipe internal files
        ├── face_landmarker.task
        ├── vision_wasm_internal.js
        └── vision_wasm_internal.wasm
```

## 🎮 Usage

1. **Allow Camera Access**: When prompted, click "Allow" to grant camera permissions
2. **Wait for AI to Load**: The app will load the face detection model (takes a few seconds)
3. **Make Facial Expressions**:
   - **Neutral** 😐: Relax your face
   - **Happy** 😄: Smile widely
   - **Angry** 😠: Frown deeply (bring eyebrows down)
   - **Surprised** 😲: Open eyes wide and raise eyebrows
4. **Watch the Results**: The corresponding emotion symbol will highlight, and the detected emotion will display below

## 🔧 Troubleshooting

### Issue: "vision_bundle.js not found"

**Solution**: Run `python download_assets.py` to download required files

### Issue: "Camera access denied"

**Solution**:

- Check browser permissions for camera access
- Ensure no other application is using the webcam
- Try refreshing the page and allowing access again

### Issue: Emojis showing as garbled characters

**Solution**:

- Ensure the HTML file is saved with UTF-8 encoding
- The file should already have proper encoding set in the `<meta charset="UTF-8">` tag

### Issue: "Error: Check assets/mediapipe folder!"

**Solution**:

- Verify all files were downloaded successfully
- Check that `assets/mediapipe/` folder contains:
  - `face_landmarker.task`
  - `vision_wasm_internal.js`
  - `vision_wasm_internal.wasm`

### Issue: App not loading

**Solution**:

- Ensure you're accessing via `http://localhost:8000` (not `file://`)
- Check browser console (F12) for errors
- Verify Python server is running

### Issue: Detection not working

**Solution**:

- Ensure good lighting
- Face the camera directly
- Make clear, distinct expressions
- Check that your face is fully visible in the frame

## 🔒 Privacy & Security

- **No Data Storage**: Nothing is saved to your device
- **No Network Transmission**: All processing is local
- **No Tracking**: No analytics or tracking code
- **100% Offline**: Works without internet after initial setup

See `PRIVACY_CONFIRMATION.md` for detailed privacy information.

## 🛠️ Technical Details

- **Framework**: Vanilla JavaScript (ES6 Modules)
- **AI Library**: MediaPipe Face Landmarker
- **Processing**: Client-side only (browser-based)
- **Model**: Face Landmarker with blendshape detection

## 📝 Emotion Detection Logic

The app uses facial blendshapes (52 facial muscle scores) to detect emotions:

- **Happy**: `mouthSmileLeft + mouthSmileRight > 0.6`
- **Angry**: `browInnerDown + browDownLeft + browDownRight > 0.5`
- **Surprised**: `eyeWide + browUp > 0.8`
- **Neutral**: Default when no other emotions detected

## 🎨 Customization

You can adjust emotion detection sensitivity by modifying thresholds in `script.js`:

```javascript
if (smile > 0.6) {
  // Adjust threshold (0.0 - 2.0)
  emotion = "HAPPY! 😄";
}
```

Lower values = more sensitive, Higher values = less sensitive

## 📄 License

This project is provided as-is for educational purposes.

## 🤝 Support

If you encounter issues:

1. Check the Troubleshooting section above
2. Verify all files are downloaded correctly
3. Check browser console (F12) for error messages
4. Ensure you're using a modern browser with WebAssembly support

---

**Enjoy detecting emotions in real-time!** 🎭
