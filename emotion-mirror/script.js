// 1. Import from your LOCAL file
let FaceLandmarker, FilesetResolver, DrawingUtils;

// Initialize everything when DOM is ready
async function init() {
  const video = document.getElementById("webcam");
  const canvasElement = document.getElementById("output");
  const canvasCtx = canvasElement.getContext("2d");
  const resultText = document.getElementById("emotion-result");

  // Get emotion symbol elements
  const emotionNeutral = document.getElementById("emotion-neutral");
  const emotionHappy = document.getElementById("emotion-happy");
  const emotionAngry = document.getElementById("emotion-angry");
  const emotionSurprised = document.getElementById("emotion-surprised");

  // Initialize neutral as active by default
  if (emotionNeutral) {
    emotionNeutral.classList.add("active");
  }

  let faceLandmarker;
  let runningMode = "VIDEO";
  let lastVideoTime = -1;

  // Load the vision bundle
  try {
    const visionModule = await import("./assets/vision_bundle.js");
    FaceLandmarker = visionModule.FaceLandmarker;
    FilesetResolver = visionModule.FilesetResolver;
    DrawingUtils = visionModule.DrawingUtils;
  } catch (e) {
    console.error("Failed to load vision_bundle.js:", e);
    resultText.innerText =
      "Error: vision_bundle.js not found! Run download_assets.py first.";
    resultText.style.color = "red";
    return;
  }

  // --- SETUP: LOAD AI OFFLINE ---
  async function setupAI() {
    try {
      // Point to the folder containing the WASM files
      const filesetResolver = await FilesetResolver.forVisionTasks(
        "./assets/mediapipe"
      );

      // Load the Model
      faceLandmarker = await FaceLandmarker.createFromOptions(filesetResolver, {
        baseOptions: {
          modelAssetPath: "./assets/mediapipe/face_landmarker.task",
          delegate: "GPU",
        },
        outputFaceBlendshapes: true, // <--- CRITICAL: Enables emotion scores
        runningMode: runningMode,
        numFaces: 1,
      });

      resultText.innerText = "AI Ready! Show me a face.";
      startCamera();
    } catch (e) {
      console.error("Setup error:", e);
      resultText.innerText = "Error: Check assets/mediapipe folder!";
      resultText.style.color = "red";
    }
  }

  // --- WEBCAM SETUP ---
  async function startCamera() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      video.srcObject = stream;
      video.addEventListener("loadeddata", predictWebcam);
    } catch (e) {
      console.error("Camera access error:", e);
      resultText.innerText = "Error: Camera access denied or unavailable!";
      resultText.style.color = "red";
    }
  }

  // --- PREDICTION LOOP ---
  async function predictWebcam() {
    // Check if faceLandmarker is initialized
    if (!faceLandmarker) {
      console.error("FaceLandmarker not initialized");
      return;
    }

    let startTimeMs = performance.now();

    if (lastVideoTime !== video.currentTime) {
      lastVideoTime = video.currentTime;
      try {
        const results = faceLandmarker.detectForVideo(video, startTimeMs);

        if (results.faceBlendshapes && results.faceBlendshapes.length > 0) {
          // Get the list of 52 muscle scores (0.0 to 1.0)
          const shapes = results.faceBlendshapes[0].categories;
          detectEmotion(shapes);
        } else {
          // No face detected - show neutral
          if (
            emotionNeutral &&
            emotionHappy &&
            emotionAngry &&
            emotionSurprised
          ) {
            emotionNeutral.classList.remove("active");
            emotionHappy.classList.remove("active");
            emotionAngry.classList.remove("active");
            emotionSurprised.classList.remove("active");
            emotionNeutral.classList.add("active");
          }
        }
      } catch (e) {
        console.error("Detection error:", e);
      }
    }
    requestAnimationFrame(predictWebcam);
  }

  // --- LOGIC: CONVERT MUSCLES TO EMOTIONS ---
  function detectEmotion(blendshapes) {
    // Check if emotion elements exist
    if (
      !emotionNeutral ||
      !emotionHappy ||
      !emotionAngry ||
      !emotionSurprised
    ) {
      console.error("Emotion elements not found!");
      return;
    }

    // Helper to find score by name
    const getScore = (name) => {
      const shape = blendshapes.find((s) => s.categoryName === name);
      return shape ? shape.score : 0;
    };

    // Calculate emotion scores
    const smile = getScore("mouthSmileLeft") + getScore("mouthSmileRight");

    // For angry: check brow down (frowning) - use inner brow down which is more accurate for anger
    const browDown =
      getScore("browInnerDown") +
      getScore("browDownLeft") +
      getScore("browDownRight");

    // For surprised: check wide eyes AND raised eyebrows
    const eyeOpen = getScore("eyeWideLeft") + getScore("eyeWideRight");
    const browUp =
      getScore("browInnerUp") +
      getScore("browOuterUpLeft") +
      getScore("browOuterUpRight");
    const surprised = eyeOpen + browUp * 0.5; // Combine eye wide and brow up

    let emotion = "NEUTRAL 😐";
    let color = "white";
    let activeEmotion = "neutral";

    // Remove active class from all emotion items
    emotionNeutral.classList.remove("active");
    emotionHappy.classList.remove("active");
    emotionAngry.classList.remove("active");
    emotionSurprised.classList.remove("active");

    // Check emotions with adjusted thresholds
    // Priority: Happy > Angry > Surprised > Neutral
    if (smile > 0.6) {
      emotion = "HAPPY! 😄";
      color = "#00ff00";
      activeEmotion = "happy";
      emotionHappy.classList.add("active");
    } else if (browDown > 0.5) {
      emotion = "ANGRY 😠";
      color = "red";
      activeEmotion = "angry";
      emotionAngry.classList.add("active");
    } else if (surprised > 0.8) {
      emotion = "SURPRISED 😲";
      color = "yellow";
      activeEmotion = "surprised";
      emotionSurprised.classList.add("active");
    } else {
      activeEmotion = "neutral";
      emotionNeutral.classList.add("active");
    }

    resultText.innerText = emotion;
    resultText.style.color = color;
  }

  // Start
  setupAI();
}

// Initialize when DOM is ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
