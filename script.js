const video = document.getElementById("webcam");
const canvas = document.getElementById("output");
const ctx = canvas.getContext("2d");
const statusText = document.getElementById("status");
const poseButtons = document.querySelectorAll("[data-pose]");
const timerElement = document.getElementById("timer");
const poseReference = document.getElementById("pose-reference");
const poseImage = document.getElementById("pose-image");

let detector;
let targetPose;
let lastPose;
let activePoseKey = "tPose";
let timerInterval = null;
let currentTime = 15;
let warningPlayed = false;
let poseReferenceTimeout = null;
let isTimerRunning = false;
let highestScore = 0;
let finalScoreTimeout = null;
let poseSequenceIndex = 0; // Track pose order to cycle through poses sequentially

// Pose image mapping - update these paths when you add your images
const POSE_IMAGES = {
  tPose: "./assets/poses/t-pose.png",
  victory: "./assets/poses/victory-pose.png",
  archer: "./assets/poses/archer-pose.png",
  warrior: "./assets/poses/warrior-pose.png",
};

const POSE_LIBRARY = {
  tPose: {
    label: "T Pose",
    points: [
      { x: 0.5, y: 0.08, score: 1 },
      { x: 0.47, y: 0.07, score: 1 },
      { x: 0.53, y: 0.07, score: 1 },
      { x: 0.45, y: 0.09, score: 1 },
      { x: 0.55, y: 0.09, score: 1 },
      { x: 0.38, y: 0.2, score: 1 },
      { x: 0.62, y: 0.2, score: 1 },
      { x: 0.25, y: 0.35, score: 1 },
      { x: 0.75, y: 0.35, score: 1 },
      { x: 0.15, y: 0.5, score: 1 },
      { x: 0.85, y: 0.5, score: 1 },
      { x: 0.42, y: 0.45, score: 1 },
      { x: 0.58, y: 0.45, score: 1 },
      { x: 0.44, y: 0.7, score: 1 },
      { x: 0.56, y: 0.7, score: 1 },
      { x: 0.45, y: 0.95, score: 1 },
      { x: 0.55, y: 0.95, score: 1 },
    ],
  },
  victory: {
    label: "Victory Pose",
    points: [
      { x: 0.5, y: 0.05, score: 1 },
      { x: 0.46, y: 0.04, score: 1 },
      { x: 0.54, y: 0.04, score: 1 },
      { x: 0.43, y: 0.06, score: 1 },
      { x: 0.57, y: 0.06, score: 1 },
      { x: 0.4, y: 0.18, score: 1 },
      { x: 0.6, y: 0.18, score: 1 },
      { x: 0.3, y: 0.08, score: 1 },
      { x: 0.7, y: 0.08, score: 1 },
      { x: 0.2, y: 0.08, score: 1 },
      { x: 0.8, y: 0.08, score: 1 },
      { x: 0.45, y: 0.45, score: 1 },
      { x: 0.55, y: 0.45, score: 1 },
      { x: 0.43, y: 0.75, score: 1 },
      { x: 0.57, y: 0.75, score: 1 },
      { x: 0.42, y: 0.98, score: 1 },
      { x: 0.58, y: 0.98, score: 1 },
    ],
  },
  warrior: {
    label: "Warrior Pose",
    points: [
      { x: 0.45, y: 0.08, score: 1 },
      { x: 0.42, y: 0.07, score: 1 },
      { x: 0.48, y: 0.07, score: 1 },
      { x: 0.39, y: 0.09, score: 1 },
      { x: 0.51, y: 0.09, score: 1 },
      { x: 0.33, y: 0.22, score: 1 },
      { x: 0.55, y: 0.22, score: 1 },
      { x: 0.2, y: 0.35, score: 1 },
      { x: 0.7, y: 0.2, score: 1 },
      { x: 0.08, y: 0.45, score: 1 },
      { x: 0.85, y: 0.18, score: 1 },
      { x: 0.36, y: 0.48, score: 1 },
      { x: 0.6, y: 0.48, score: 1 },
      { x: 0.3, y: 0.72, score: 1 },
      { x: 0.68, y: 0.62, score: 1 },
      { x: 0.25, y: 0.98, score: 1 },
      { x: 0.8, y: 0.75, score: 1 },
    ],
  },
  archer: {
    label: "Archer Pose",
    points: [
      { x: 0.45, y: 0.08, score: 1 }, // nose
      { x: 0.43, y: 0.07, score: 1 }, // left eye
      { x: 0.47, y: 0.07, score: 1 }, // right eye
      { x: 0.4, y: 0.09, score: 1 }, // left ear
      { x: 0.5, y: 0.09, score: 1 }, // right ear
      { x: 0.36, y: 0.22, score: 1 }, // left shoulder
      { x: 0.56, y: 0.22, score: 1 }, // right shoulder
      { x: 0.25, y: 0.25, score: 1 }, // left elbow (bow arm forward)
      { x: 0.7, y: 0.18, score: 1 }, // right elbow (drawing back)
      { x: 0.18, y: 0.28, score: 1 }, // left wrist
      { x: 0.8, y: 0.16, score: 1 }, // right wrist
      { x: 0.4, y: 0.5, score: 1 }, // left hip
      { x: 0.6, y: 0.5, score: 1 }, // right hip
      { x: 0.35, y: 0.8, score: 1 }, // left knee (front bent)
      { x: 0.7, y: 0.65, score: 1 }, // right knee (back straight)
      { x: 0.32, y: 0.98, score: 1 }, // left ankle
      { x: 0.78, y: 0.85, score: 1 }, // right ankle
    ],
  },
};

function clonePose(points = []) {
  return points.map(({ x, y, score }) => ({
    x,
    y,
    score: score ?? 1,
  }));
}

function updatePoseButtonState() {
  poseButtons.forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.pose === activePoseKey);
  });
}

function setTargetPoseFromLibrary(key, startTimerOnSelect = false, showReference = false) {
  const pose = POSE_LIBRARY[key];
  if (!pose) return;
  targetPose = clonePose(pose.points);
  activePoseKey = key;
  updatePoseButtonState();
  statusText.innerText = `Replicate: ${pose.label} (matching...)`;
  statusText.style.color = "#58a6ff";
  // Only show pose reference image if explicitly requested (for random selector)
  if (showReference) {
    showPoseReference(key);
  }
  // Only start timer when explicitly requested (for random selector)
  if (startTimerOnSelect) {
    startTimer();
  }
}

function showPoseReference(poseKey) {
  if (!poseImage || !poseReference) {
    console.log("Pose reference elements not found", { poseImage, poseReference });
    return;
  }
  
  // Clear any existing timeout
  if (poseReferenceTimeout) {
    clearTimeout(poseReferenceTimeout);
    poseReferenceTimeout = null;
  }
  
  // Always show the container first
  poseReference.style.display = "flex";
  poseReference.style.visibility = "visible";
  poseReference.style.opacity = "0.7";
  poseReference.style.transform = "translateX(0)";
  poseReference.classList.add("show", "animate");
  
  const imagePath = POSE_IMAGES[poseKey];
  if (!imagePath) {
    console.log("No image path for pose:", poseKey);
    return;
  }
  
  // Reset image display
  poseImage.style.display = "block";
  
  // Remove previous error handlers to avoid multiple bindings
  poseImage.onerror = null;
  poseImage.onload = null;
  
  // Set image source
  poseImage.src = imagePath;
  poseImage.alt = `${POSE_LIBRARY[poseKey]?.label || poseKey} reference`;
  
  // Handle image load error - keep container visible
  poseImage.onerror = () => {
    console.log("Image failed to load:", imagePath);
    poseImage.style.display = "none";
    // Container stays visible with border
  };
  
  // Handle successful image load
  poseImage.onload = () => {
    console.log("Image loaded successfully:", imagePath);
    poseImage.style.display = "block";
  };
  
  // Keep visible for 5 seconds as requested
  poseReferenceTimeout = setTimeout(() => {
    hidePoseReference();
  }, 5000);
}

function hidePoseReference() {
  if (poseReference) {
    poseReference.classList.remove("show", "animate");
    poseReference.style.transform = "translateX(100%)";
    poseReference.style.opacity = "0";
    poseReference.style.visibility = "hidden";
  }
  if (poseReferenceTimeout) {
    clearTimeout(poseReferenceTimeout);
    poseReferenceTimeout = null;
  }
}

function startTimer() {
  // Reset timer
  stopTimer();
  currentTime = 15;
  warningPlayed = false;
  highestScore = 0; // Reset highest score
  isTimerRunning = true; // Mark timer as running
  
  if (timerElement) {
    timerElement.textContent = currentTime;
    timerElement.classList.remove("warning");
    // Ensure any previous final display is cleared
    timerElement.classList.remove("final");
  }
  
  timerInterval = setInterval(() => {
    currentTime--;
    
    if (timerElement) {
      timerElement.textContent = currentTime;
      
      // Warning at 10 seconds
      if (currentTime === 10 && !warningPlayed) {
        warningPlayed = true;
        timerElement.classList.add("warning");
        playWarningSound();
      }
      
      // Stop at 0
      if (currentTime <= 0) {
        stopTimer();
        if (timerElement) {
          timerElement.textContent = "0";
        }
        // Show final highest score for 5 seconds
        showFinalScore();
      }
    }
  }, 1000);
}

function stopTimer() {
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
  isTimerRunning = false;
}

function showFinalScore() {
  // Replace the timer element with the final highest score display
  if (timerElement) {
    timerElement.classList.remove("warning");
    timerElement.classList.add("final");
    timerElement.innerHTML = `\n+      <div class="final-label">Final Score</div>\n+      <div class="final-value">${highestScore}%</div>\n+    `;
  }

  // Update the status text to indicate time is up (but keep the focus on the timer area)
  if (statusText) {
    statusText.innerText = "Time's up!";
    statusText.style.color = "#f85149";
    statusText.style.fontSize = "0.95rem";
  }

  // Hide any pose reference image immediately
  hidePoseReference();

  // After 5 seconds, reset the UI text so user can start again
  finalScoreTimeout = setTimeout(() => {
    if (timerElement) {
      timerElement.classList.remove("final");
      timerElement.textContent = 15;
    }
    if (statusText) {
      statusText.innerText = "Select a new pose to try again.";
      statusText.style.color = "#f85149";
      statusText.style.fontSize = "0.9rem";
    }
  }, 5000);
}

function playWarningSound() {
  // Use Web Speech API to speak the warning
  if ('speechSynthesis' in window) {
    const utterance = new SpeechSynthesisUtterance("You only have 10 seconds");
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;
    speechSynthesis.speak(utterance);
  }
}

poseButtons.forEach((btn) => {
  const poseKey = btn.dataset.pose;

  const selectPose = () => setTargetPoseFromLibrary(poseKey);

  btn.addEventListener("pointerdown", selectPose, { passive: true });
  btn.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      selectPose();
    }
  });
});

function selectRandomPose() {
  const availablePoses = ["tPose", "victory", "archer", "warrior"];
  
  // Get the next pose in the sequence (cycling through in order)
  const nextPoseKey = availablePoses[poseSequenceIndex % availablePoses.length];
  
  // Increment the sequence index for next call
  poseSequenceIndex++;
  
  // If the next pose is the same as current, skip to the one after
  if (nextPoseKey === activePoseKey && availablePoses.length > 1) {
    const nextNextPoseKey = availablePoses[poseSequenceIndex % availablePoses.length];
    poseSequenceIndex++;
    selectPoseWithAnimation(nextNextPoseKey, availablePoses);
  } else {
    selectPoseWithAnimation(nextPoseKey, availablePoses);
  }
}

function selectPoseWithAnimation(targetPoseKey, availablePoses) {
  // Disable button during animation
  const randomSelectBtn = document.getElementById("random-select");
  if (randomSelectBtn) {
    randomSelectBtn.disabled = true;
    randomSelectBtn.style.opacity = "0.6";
    randomSelectBtn.style.cursor = "not-allowed";
  }
  
  // Animation: cycle through poses in order
  let currentCycleIndex = 0;
  let totalCycles = 12; // Number of pose changes (3 full cycles through available poses)
  let baseDelay = 80; // Starting delay in ms (fast)
  let finalDelay = 300; // Final delay in ms (slow)
  
  const animate = () => {
    if (currentCycleIndex < totalCycles) {
      // Calculate delay - start fast, slow down
      const progress = currentCycleIndex / totalCycles;
      const delay = baseDelay + (finalDelay - baseDelay) * (progress * progress); // Quadratic easing
      
      // Cycle through poses in order for animation
      const cyclePoseIndex = currentCycleIndex % availablePoses.length;
      const cyclePoseKey = availablePoses[cyclePoseIndex];
      setTargetPoseFromLibrary(cyclePoseKey, false, false); // Don't restart timer, don't show reference during animation
      
      currentCycleIndex++;
      setTimeout(animate, delay);
    } else {
      // Final selection - the target pose we cycled to
      setTargetPoseFromLibrary(targetPoseKey, true, true); // Start timer and show reference
      
      // Re-enable button
      if (randomSelectBtn) {
        randomSelectBtn.disabled = false;
        randomSelectBtn.style.opacity = "1";
        randomSelectBtn.style.cursor = "pointer";
      }
    }
  };
  
  animate();
}

const randomSelectBtn = document.getElementById("random-select");
randomSelectBtn?.addEventListener("click", selectRandomPose);

setTargetPoseFromLibrary(activePoseKey, false); // Don't start timer on initial load

async function setupApp() {
  try {
    statusText.innerText = "Loading AI...";
    // PRIVACY: Model loads from local files only (fromTFHub: false)
    // No data is sent to external servers. All processing happens in-browser.
    
    // Suppress TensorFlow.js warnings about WebGL and execution methods
    const originalWarn = console.warn;
    console.warn = function(...args) {
      // Filter out TensorFlow.js informational warnings
      const message = args.join(' ');
      if (
        message.includes('WebGL') ||
        message.includes('execute() instead') ||
        message.includes('control flow') ||
        message.includes('dynamic output shapes')
      ) {
        return; // Suppress these warnings
      }
      originalWarn.apply(console, args);
    };
    
    detector = await tf.loadGraphModel("./assets/movenet/model.json", {
      fromTFHub: false,
    });
    
    // Restore console.warn after model loads
    console.warn = originalWarn;
    
    statusText.innerText = "Model Loaded! Starting Camera...";
    startCamera();
  } catch (error) {
    console.error(error);
    statusText.innerText = "Error: Check assets/movenet/ folder!";
  }
}

let cameraStream = null;

async function startCamera() {
  try {
    cameraStream = await navigator.mediaDevices.getUserMedia({
      video: { width: 640, height: 480 },
    });
    video.srcObject = cameraStream;
    video.onloadeddata = async () => {
      await video.play();
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;
      statusText.innerText = "Strike the Pose!";
      predictPose();
    };
  } catch (error) {
    console.error("Camera access error:", error);
    statusText.innerText =
      "Camera access denied. Please allow camera access for this app.";
    statusText.style.color = "#f85149";
  }
}

function stopCamera() {
  if (cameraStream) {
    cameraStream.getTracks().forEach((track) => track.stop());
    cameraStream = null;
  }
  if (video.srcObject) {
    video.srcObject = null;
  }
}

// --- SCORING MATH: NORMALIZE VECTORS ---
function buildNormalizedPose(keypoints) {
  if (!keypoints?.length) return null;

  // Weighted centroid to ignore translation and trust high-confidence joints.
  let weightSum = 0;
  let xSum = 0;
  let ySum = 0;
  keypoints.forEach((kp) => {
    const weight = Math.max(kp.score ?? 0.5, 0.01);
    weightSum += weight;
    xSum += kp.x * weight;
    ySum += kp.y * weight;
  });

  const xCenter = xSum / weightSum;
  const yCenter = ySum / weightSum;

  // Normalize scale using weighted RMS distance from the centroid.
  let varianceAccumulator = 0;
  const centered = [];
  keypoints.forEach((kp) => {
    const weight = Math.max(kp.score ?? 0.5, 0.01);
    const cx = kp.x - xCenter;
    const cy = kp.y - yCenter;
    centered.push({ cx, cy, weight });
    varianceAccumulator += weight * (cx * cx + cy * cy);
  });

  const scale = Math.sqrt(varianceAccumulator / weightSum) || 1e-6;
  const coords = new Float32Array(keypoints.length * 2);

  centered.forEach(({ cx, cy, weight }, index) => {
    const weightFactor = Math.sqrt(weight);
    coords[index * 2] = (cx / scale) * weightFactor;
    coords[index * 2 + 1] = (cy / scale) * weightFactor;
  });

  return coords;
}

function computePoseSimilarity(userPose, targetPose) {
  const userVec = buildNormalizedPose(userPose);
  const targetVec = buildNormalizedPose(targetPose);
  if (!userVec || !targetVec || userVec.length !== targetVec.length) {
    return 0;
  }

  // Orthogonal Procrustes (2D) to make similarity insensitive to rotation.
  let sxx = 0;
  let sxy = 0;
  let syx = 0;
  let syy = 0;
  for (let i = 0; i < userVec.length; i += 2) {
    const ux = userVec[i];
    const uy = userVec[i + 1];
    const tx = targetVec[i];
    const ty = targetVec[i + 1];
    sxx += ux * tx;
    sxy += ux * ty;
    syx += uy * tx;
    syy += uy * ty;
  }

  const denom = Math.hypot(sxx + syy, sxy - syx) || 1e-6;
  const cosTheta = (sxx + syy) / denom;
  const sinTheta = (sxy - syx) / denom;

  let dot = 0;
  let userNorm = 0;
  let targetNorm = 0;

  for (let i = 0; i < userVec.length; i += 2) {
    const ux = userVec[i];
    const uy = userVec[i + 1];
    const tx = targetVec[i];
    const ty = targetVec[i + 1];

    const rx = cosTheta * ux - sinTheta * uy;
    const ry = sinTheta * ux + cosTheta * uy;

    dot += rx * tx + ry * ty;
    userNorm += rx * rx + ry * ry;
    targetNorm += tx * tx + ty * ty;
  }

  const denomNorm = Math.sqrt(userNorm * targetNorm) || 1e-6;
  return dot / denomNorm;
}

async function predictPose() {
  // PRIVACY: All processing happens locally in browser memory.
  // Video frames are never sent to external servers or stored.

  // 1. Resize image for AI (192x192)
  const inputTensor = tf.tidy(() => {
    const img = tf.browser.fromPixels(video);
    return tf.image.resizeBilinear(img, [192, 192]).cast("int32").expandDims(0);
  });

  // 2. Run AI inference locally
  const result = await detector.executeAsync(inputTensor);
  const data = result.arraySync();

  // Cleanup
  inputTensor.dispose();
  result.dispose();

  // 3. Process Keypoints
  const keypoints = data?.[0]?.[0];
  if (!keypoints) {
    statusText.innerText = "Waiting for pose...";
    requestAnimationFrame(predictPose);
    return;
  }

  const userPose = keypoints.map((k) => ({ y: k[0], x: k[1], score: k[2] }));
  lastPose = userPose;

  // Only calculate and show score if timer is running
  if (!isTimerRunning) {
    if (!targetPose) {
      statusText.innerText = "Select a pose to start.";
      statusText.style.color = "#58a6ff";
    } else {
      statusText.innerText = "Use Random Select to start the timer and scoring.";
      statusText.style.color = "#58a6ff";
    }
    drawSkeleton(userPose);
    requestAnimationFrame(predictPose);
    return;
  }

  // --- CALCULATE SCORE (only when timer is running) ---
  // Make sure we have enough confidence before scoring
  const confidentPoints = userPose.filter((k) => k.score > 0.3).length;

  if (confidentPoints > 10 && targetPose) {
    const similarity = computePoseSimilarity(userPose, targetPose);

    // Convert -1.0 to 1.0 range into 0% to 100%
    const percentage = Math.round(Math.max(0, similarity) * 100);
    
    // Subtract from 100 to get final score
    const finalScore = 100 - percentage;
    
    // Update highest score if current score is better
    if (finalScore > highestScore) {
      highestScore = finalScore;
    }

    statusText.innerText = `Score: ${finalScore}%`;
    statusText.style.fontSize = "0.9rem";

    if (finalScore < 15) {
      statusText.innerText += " - YOU WIN! 🎉";
      statusText.style.color = "#00ff00"; // Green
    } else {
      statusText.style.color = "white";
    }
  } else if (!targetPose) {
    statusText.innerText = "Select a pose to start.";
    statusText.style.color = "orange";
  } else {
    statusText.innerText = "Step back to see full body...";
    statusText.style.color = "yellow";
  }

  drawSkeleton(userPose);
  requestAnimationFrame(predictPose);
}

function drawSkeleton(points) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "#00ffcc";

  points.forEach((point) => {
    if (point.score > 0.3) {
      // Scale up (MoveNet outputs 0-1 range)
      const x = point.x * canvas.width;
      const y = point.y * canvas.height;
      ctx.beginPath();
      ctx.arc(x, y, 5, 0, 2 * Math.PI);
      ctx.fill();
    }
  });
}


// Cleanup on page unload to ensure camera is stopped
window.addEventListener("beforeunload", () => {
  stopCamera();
  if (detector) {
    detector.dispose();
  }
  // Clear any pending animation frames
  if (window.animationFrameId) {
    cancelAnimationFrame(window.animationFrameId);
  }
});

// Also cleanup when page is hidden (tab switch, minimize, etc.)
document.addEventListener("visibilitychange", () => {
  if (document.hidden) {
    // Optionally pause processing when tab is hidden
    // The camera stream remains active but processing can be paused
  }
});

// Suppress 404 errors for missing pose images (they're expected until images are added)
window.addEventListener('error', (event) => {
  if (event.target && event.target.tagName === 'IMG') {
    const src = event.target.src || '';
    if (src.includes('/assets/poses/')) {
      event.preventDefault(); // Suppress 404 errors for pose images
      return true;
    }
  }
}, true);

setupApp();
