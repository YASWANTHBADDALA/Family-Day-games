// Family Day Quiz - Voice Answer Selection Update
// Flow: Name/Age Input → Category Selection → Smart Question Fetch → Quiz → Leaderboard

let playerName = "";
let ageGroup = null; 
let questions = [];
let reserveQuestions = []; 
let currentIndex = 0;
let score = 0;
let streak = 0;
let maxStreak = 0;

// Lifeline State Tracking
let fiftyUsedThisGame = false; // Tracks if used in the entire game
let fiftyUsedThisQuestion = false; // Tracks usage for current specific question
let acceptingAnswers = true;

const QUIZ_SIZE = 10; 

const GROUP_LABELS = {
  kids: "Junior Participants",
  teens: "Young Professionals",
  seniors: "Experienced Professionals"
};

const GROUP_FILES = {
  kids: "kids.json",
  teens: "teens.json",
  seniors: "seniors.json"
};

function $(id) {
  return document.getElementById(id);
}

// Initial screen
function renderWelcome() {
  const app = $("app");
  app.innerHTML = `
    <section class="scene fade-in">
      <div class="welcome-card">
        <div class="welcome-icon">🎯</div>
        <p class="eyebrow">Welcome to</p>
        <h2 class="welcome-title">Family Day Quiz</h2>
        <p class="description">Enter your name to begin your quiz adventure!</p>
        
        <div class="input-wrapper">
          <input 
            type="text" 
            id="nameInput" 
            placeholder="Enter your name" 
            class="name-input"
            autocomplete="off"
            onkeypress="if(event.key === 'Enter') handleNameSubmit()"
          />
        </div>
        
        <button class="pill-primary welcome-btn" onclick="handleNameSubmit()">
          Continue →
        </button>
      </div>
    </section>
  `;
  setTimeout(() => {
    const input = $("nameInput");
    if (input) input.focus();
  }, 100);
}

function handleNameSubmit() {
  const nameInput = $("nameInput");
  const name = (nameInput?.value || "").trim();

  if (!name) {
    alert("Please enter your name.");
    if (nameInput) nameInput.focus();
    return;
  }

  playerName = name;
  renderCategorySelection();
}

function renderCategorySelection() {
  const app = $("app");
  app.innerHTML = `
    <section class="scene fade-in">
      <div class="question-card">
        <p class="eyebrow">Hello, ${playerName || "Player"}!</p>
        <h2>Choose Your Quiz Category</h2>
        <p class="description">Pick the circuit that best fits your vibe. Each set has 10 curated questions.</p>
        
        <div class="cta-grid" style="margin-top: 24px; gap: 16px;">
          <button class="pill-primary" onclick="selectCategory('kids')">
            <div style="font-weight: 600;">Junior Participants</div>
            <div style="font-size: 0.9rem; opacity: 0.9;">Under 15</div>
          </button>
          
          <button class="pill-primary" onclick="selectCategory('teens')">
            <div style="font-weight: 600;">Young Professionals</div>
            <div style="font-size: 0.9rem; opacity: 0.9;">15 - 39</div>
          </button>
          
          <button class="pill-primary" onclick="selectCategory('seniors')">
            <div style="font-weight: 600;">Experienced Professionals</div>
            <div style="font-size: 0.9rem; opacity: 0.9;">40+</div>
          </button>
        </div>
        
        <div style="margin-top: 20px;">
          <button class="pill-secondary" onclick="renderWelcome()" style="width: 100%;">
            ← Back to Start
          </button>
        </div>
      </div>
    </section>
  `;
}

async function selectCategory(group) {
  ageGroup = group;
  currentIndex = 0;
  score = 0;
  streak = 0;
  maxStreak = 0;
  fiftyUsedThisGame = false; // Reset lifeline for new game
  fiftyUsedThisQuestion = false;
  acceptingAnswers = true;
  
  try {
    const res = await fetch(GROUP_FILES[group]);
    if (!res.ok) throw new Error(`Failed to load ${GROUP_FILES[group]}`);
    
    let rawQuestions = await res.json();
    if (!rawQuestions || rawQuestions.length === 0) {
      alert("No questions available.");
      renderCategorySelection();
      return;
    }

    let indexedQuestions = rawQuestions.map((q, index) => ({...q, originalIndex: index}));
    const usedKey = `familyDayQuiz_used_${group}`;
    let usedIndices = JSON.parse(localStorage.getItem(usedKey) || "[]");
    let availableQuestions = indexedQuestions.filter(q => !usedIndices.includes(q.originalIndex));

    if (availableQuestions.length < QUIZ_SIZE) {
      usedIndices = []; 
      localStorage.setItem(usedKey, "[]"); 
      availableQuestions = indexedQuestions; 
    }

    shuffleArray(availableQuestions);
    questions = availableQuestions.slice(0, QUIZ_SIZE);
    reserveQuestions = availableQuestions.slice(QUIZ_SIZE);

    const newUsedIndices = questions.map(q => q.originalIndex);
    const updatedUsedIndices = [...usedIndices, ...newUsedIndices];
    localStorage.setItem(usedKey, JSON.stringify(updatedUsedIndices));
    
    renderQuestion();
  } catch (e) {
    alert(`Error loading questions. Check files.`);
    console.error(e);
    renderCategorySelection();
  }
}

function renderQuestion() {
  const app = $("app");
  const q = questions[currentIndex];
  
  if (!q) {
    showResult();
    return;
  }
  
  fiftyUsedThisQuestion = false;
  acceptingAnswers = true;
  
  const progressPercent = Math.round(((currentIndex + 1) / questions.length) * 100);
  
  // Determine button style based on usage
  const fiftyBtnClass = fiftyUsedThisGame ? "pill-secondary btn-disabled-lifeline" : "pill-secondary";

  app.innerHTML = `
    <section class="scene fade-in quiz-scene">
      <div class="quiz-header">
        <div class="group-tag">
          <span class="group-dot"></span>
          <span>${GROUP_LABELS[ageGroup]}</span>
        </div>
        <div class="quiz-stats">
          <div>Score: <strong>${score} pts</strong></div>
          <div>Best Streak: ${maxStreak}</div>
        </div>
      </div>
      
      <div class="progress-section">
        <div class="progress-bar">
          <div class="progress-fill" style="width: ${progressPercent}%"></div>
        </div>
        <div class="progress-label">
          <span>Q ${currentIndex + 1} / ${questions.length}</span>
        </div>
      </div>
      
      <div class="question-card quiz-question-card">
        <h3 class="question-text">${q.question}</h3>
        <div class="options quiz-options">
          ${q.options
            .map(
              (opt, i) =>
                `<button class="option-btn quiz-option-btn" data-index="${i}" onclick="selectOption(${i})">
                  <span style="font-weight:bold; margin-right:8px;">${i + 1}.</span> ${opt}
                </button>`
            )
            .join("")}
        </div>

        <div style="margin-top: 20px; text-align: center;">
          <button id="voiceBtn" class="voice-btn" onclick="startVoiceRecognition()">🎙️</button>
          <div id="voiceStatus" class="voice-status">Tap mic & say the answer!</div>
        </div>
      </div>
      
      <div class="footer-actions quiz-actions">
        <button id="fiftyBtn" class="${fiftyBtnClass}" onclick="handleFiftyClick()">50/50 Lifeline</button>
        <button class="pill-ghost" onclick="skipQuestion()">Skip Question</button>
      </div>

      <div id="fiftyModal" class="modal-overlay" style="display: none;">
        <div class="modal-box">
          <h3 class="modal-title">Use 50/50 Lifeline?</h3>
          <p class="modal-desc">
            ⚠️ <strong>Warning:</strong> You can only use this lifeline <u>ONCE</u> in the entire game.<br><br>
            Do you want to proceed?
          </p>
          <div class="modal-actions">
            <button class="btn-cancel" onclick="closeFiftyModal()">Cancel</button>
            <button class="btn-proceed" onclick="confirmFifty()">Proceed</button>
          </div>
        </div>
      </div>
    </section>
  `;
}

// --- 50/50 LOGIC START ---

function handleFiftyClick() {
  if (fiftyUsedThisGame) {
    alert("❌ 50/50 Lifeline has already been used!");
    return;
  }
  
  if (fiftyUsedThisQuestion) {
    return;
  }

  document.getElementById("fiftyModal").style.display = "flex";
}

function closeFiftyModal() {
  document.getElementById("fiftyModal").style.display = "none";
}

function confirmFifty() {
  const q = questions[currentIndex];
  const correct = q.answer;
  const buttons = document.querySelectorAll(".option-btn");
  
  const wrongIndexes = [];
  buttons.forEach((btn, i) => {
    if (i !== correct) wrongIndexes.push(i);
  });
  
  shuffleArray(wrongIndexes);
  const toHide = wrongIndexes.slice(0, 2);
  
  toHide.forEach((i) => {
    buttons[i].style.visibility = "hidden";
    buttons[i].style.display = "none";
  });
  
  fiftyUsedThisQuestion = true;
  fiftyUsedThisGame = true;

  const btn = document.getElementById("fiftyBtn");
  if(btn) {
    btn.classList.add("btn-disabled-lifeline");
  }

  closeFiftyModal();
}

// --- 50/50 LOGIC END ---

function startVoiceRecognition() {
  if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
    alert("Voice not supported. Use Chrome.");
    return;
  }

  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  const recognition = new SpeechRecognition();
  const btn = document.getElementById("voiceBtn");
  const status = document.getElementById("voiceStatus");

  recognition.lang = 'en-US';
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;

  recognition.start();
  btn.classList.add("listening");
  status.textContent = "Listening...";

  recognition.onresult = (event) => {
    const speechResult = event.results[0][0].transcript.toLowerCase().trim();
    status.textContent = `I heard: "${speechResult}"`;
    btn.classList.remove("listening");

    let selectedIndex = -1;

    // 1. CHECK FOR ANSWER TEXT (Direct match)
    // We check this FIRST so user can say "Mars" instead of "Option 1"
    const currentQuestion = questions[currentIndex];
    if (currentQuestion && currentQuestion.options) {
      for (let i = 0; i < currentQuestion.options.length; i++) {
        // We lowercase both so "Mars" matches "mars"
        const optText = currentQuestion.options[i].toString().toLowerCase();
        
        // If the spoken text includes the option text (e.g. "It is Mars" includes "Mars")
        if (speechResult.includes(optText)) {
          selectedIndex = i;
          break; // Found the match!
        }
      }
    }

    // 2. FALLBACK: Check for Option Number (e.g. "Option 1", "First")
    if (selectedIndex === -1) {
      if (speechResult.includes("one") || speechResult.includes("1") || speechResult.includes("first")) selectedIndex = 0;
      else if (speechResult.includes("two") || speechResult.includes("2") || speechResult.includes("second")) selectedIndex = 1;
      else if (speechResult.includes("three") || speechResult.includes("3") || speechResult.includes("third")) selectedIndex = 2;
      else if (speechResult.includes("four") || speechResult.includes("4") || speechResult.includes("fourth")) selectedIndex = 3;
    }

    // 3. EXECUTE SELECTION
    if (selectedIndex !== -1 && acceptingAnswers) {
      const buttons = document.querySelectorAll(".option-btn");
      if (buttons[selectedIndex] && !buttons[selectedIndex].disabled && buttons[selectedIndex].style.display !== 'none') {
        selectOption(selectedIndex);
      } else {
         status.textContent = "Option not available/visible.";
      }
    } else {
      status.textContent = "Didn't catch that. Try saying the answer name.";
    }
  };

  recognition.onspeechend = () => {
    recognition.stop();
    btn.classList.remove("listening");
  };

  recognition.onerror = (event) => {
    btn.classList.remove("listening");
    status.textContent = "Error: " + event.error;
  };
}

function selectOption(idx) {
  if (!acceptingAnswers) return;
  acceptingAnswers = false;
  
  const q = questions[currentIndex];
  const buttons = document.querySelectorAll(".option-btn");
  
  buttons.forEach((btn) => (btn.disabled = true));
  
  if (idx === q.answer) {
    score += 10;
    streak++;
    maxStreak = Math.max(maxStreak, streak);
    buttons[idx].classList.add("correct");
    buttons[idx].style.backgroundColor = "#22c55e";
    buttons[idx].style.color = "white";
  } else {
    streak = 0;
    buttons[idx].classList.add("wrong");
    buttons[idx].style.backgroundColor = "#ef4444";
    buttons[idx].style.color = "white";
    if (buttons[q.answer]) {
      buttons[q.answer].classList.add("correct");
      buttons[q.answer].style.backgroundColor = "#22c55e";
      buttons[q.answer].style.color = "white";
    }
  }
  
  setTimeout(() => {
    currentIndex++;
    if (currentIndex >= questions.length) {
      showResult();
    } else {
      renderQuestion();
    }
  }, 1500);
}

function skipQuestion() {
  streak = 0; 
  if (reserveQuestions.length > 0) {
    const newQuestion = reserveQuestions.pop();
    const usedKey = `familyDayQuiz_used_${ageGroup}`;
    let usedIndices = JSON.parse(localStorage.getItem(usedKey) || "[]");
    usedIndices.push(newQuestion.originalIndex);
    localStorage.setItem(usedKey, JSON.stringify(usedIndices));

    questions[currentIndex] = newQuestion;
    fiftyUsedThisQuestion = false; 
    renderQuestion();
  } else {
    alert("No replacement questions available! Moving next.");
    currentIndex++;
    if (currentIndex >= questions.length) showResult();
    else renderQuestion();
  }
}

function showResult() {
  const key = "familyDayQuizLeaderboard";
  const existing = JSON.parse(localStorage.getItem(key) || "[]");
  existing.push({
    name: playerName,
    score: score,
    group: ageGroup,
    date: new Date().toISOString()
  });
  localStorage.setItem(key, JSON.stringify(existing));
  
  const app = $("app");
  const accuracy = questions.length ? Math.round((score / (questions.length * 10)) * 100) : 0;
  
  app.innerHTML = `
    <section class="scene fade-in">
      <div class="question-card">
        <div class="result-icon">🎉</div>
        <p class="eyebrow">Quiz Complete!</p>
        <h2>Great job, ${playerName}!</h2>
        <div style="margin-top: 20px; padding: 20px; background: rgba(99, 102, 241, 0.1); border-radius: 12px; text-align: center;">
            <div style="font-size: 1.75rem; font-weight: 700; color: var(--primary-color);">${score} pts</div>
            <div style="font-size: 0.9rem;">Accuracy: ${accuracy}%</div>
        </div>
        <div style="margin-top: 20px; text-align: center;">
          <p>Redirecting to leaderboard...</p>
        </div>
      </div>
    </section>
  `;
  setTimeout(() => renderLeaderboard(true), 2000);
}

function renderLeaderboard(autoRedirect = false) {
  const key = "familyDayQuizLeaderboard";
  const data = JSON.parse(localStorage.getItem(key) || "[]");
  const kidsScores = data.filter(e => e.group === 'kids').sort((a, b) => b.score - a.score);
  const teensScores = data.filter(e => e.group === 'teens').sort((a, b) => b.score - a.score);
  const seniorsScores = data.filter(e => e.group === 'seniors').sort((a, b) => b.score - a.score);
  
  const renderGroupSection = (scores, label) => {
    if (scores.length === 0) return `<div style="padding:10px; text-align:center; opacity:0.6;">No scores for ${label}</div>`;
    return `
      <div style="margin-bottom: 24px;">
        <h3 style="color: var(--primary-color);">${label}</h3>
        <ol style="padding-left: 20px;">
          ${scores.slice(0, 10).map((e, i) => `<li><strong>${e.name}</strong> - ${e.score} pts</li>`).join("")}
        </ol>
      </div>`;
  };
  
  $("app").innerHTML = `
    <section class="scene fade-in">
      <div class="question-card">
        <h2>Leaderboard 🏆</h2>
        ${autoRedirect ? '<p style="text-align:center; font-size:0.9rem;">Resetting in 10s...</p>' : ''}
        <div style="margin-top: 24px;">
          ${renderGroupSection(kidsScores, GROUP_LABELS.kids)}
          ${renderGroupSection(teensScores, GROUP_LABELS.teens)}
          ${renderGroupSection(seniorsScores, GROUP_LABELS.seniors)}
        </div>
      </div>
      ${!autoRedirect ? `<div class="footer-actions"><button class="pill-primary" onclick="renderWelcome()">New Quiz</button></div>` : ''}
    </section>
  `;
  if (autoRedirect) setTimeout(() => renderWelcome(), 10000);
}

function shuffleArray(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
}

window.onload = () => renderWelcome();