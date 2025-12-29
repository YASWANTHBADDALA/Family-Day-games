import streamlit as st
import ollama
import pyttsx3
import threading
import time
import random

# --- Config ---
MODEL_NAME = "phi3"

# --- Page Setup ---
st.set_page_config(
    page_title="Wonderland AI",
    page_icon="🦄",
    layout="centered"
)

# --- CSS Styling ---
st.markdown("""
<style>
    .stButton>button {
        background-color: #FF4B4B;
        color: white;
        border-radius: 20px;
        font-size: 20px;
        font-weight: bold;
        border: 2px solid white;
        width: 100%;
    }
    .story-container {
        background-color: #f0f2f6;
        padding: 25px;
        border-radius: 15px;
        border-left: 5px solid #7F00FF;
        font-size: 20px;
        line-height: 1.5;
        font-family: 'Comic Sans MS', sans-serif;
        color: #31333F;
    }
    .timer-box {
        color: #FF4B4B;
        font-weight: bold;
        text-align: center;
        font-size: 16px;
        margin-top: 20px;
        padding: 10px;
        border-top: 1px solid #ddd;
        background-color: #fff0f0;
        border-radius: 10px;
    }
</style>
""", unsafe_allow_html=True)

# --- Helper Functions ---

def speak_text(text):
    """Speaks text in a separate thread."""
    def _speak():
        try:
            engine = pyttsx3.init()
            engine.setProperty('rate', 160)
            engine.setProperty('volume', 1.0)
            voices = engine.getProperty('voices')
            if len(voices) > 1: engine.setProperty('voice', voices[1].id)
            engine.say(text)
            engine.runAndWait()
        except Exception as e:
            print(f"TTS Error: {e}")
    threading.Thread(target=_speak).start()

def reset_app():
    """
    Resets the app to the home page and clears input fields.
    """
    # 1. Clear the specific input widget keys
    if "w1" in st.session_state: st.session_state.w1 = ""
    if "w2" in st.session_state: st.session_state.w2 = ""
    if "w3" in st.session_state: st.session_state.w3 = ""
    
    # 2. Reset navigation and logic states
    st.session_state.page = "home"
    st.session_state.story_text = ""
    st.session_state.should_generate = False
    
    # 3. Reload
    st.rerun()

# --- Session State Init ---
if "page" not in st.session_state: st.session_state.page = "home"
if "story_text" not in st.session_state: st.session_state.story_text = ""
if "should_generate" not in st.session_state: st.session_state.should_generate = False

# ==========================================
# PAGE 1: INPUT HOME
# ==========================================
if st.session_state.page == "home":
    st.title("🦄 The Magic Storyteller")
    st.write("### Pick your magic words!")

    # Added 'key' params to ensure we can clear them programmatically
    c1, c2, c3 = st.columns(3)
    w1 = c1.text_input("Word 1", placeholder="e.g. Robot", key="w1")
    w2 = c2.text_input("Word 2", placeholder="e.g. Pizza", key="w2")
    w3 = c3.text_input("Word 3", placeholder="e.g. Moon", key="w3")

    st.markdown("<br>", unsafe_allow_html=True)
    
    if st.button("🚀 Write My Story", type="primary"):
        if w1 and w2 and w3:
            st.session_state.should_generate = True
            st.session_state.page = "story"
            st.rerun()
        else:
            st.warning("Please type in all 3 magic words first!")

# ==========================================
# PAGE 2: STORY VIEW (30s Limit)
# ==========================================
elif st.session_state.page == "story":
    
    # 1. Back Button (Manual Exit)
    if st.button("⬅️ Start Over Now"):
        reset_app()

    st.markdown("## ✨ Your Story!")
    
    story_placeholder = st.empty()
    full_response = ""

    # 2. GENERATION LOGIC
    if st.session_state.should_generate:
        try:
            vibes = ["silly", "fast", "rhyming", "heroic"]
            random_vibe = random.choice(vibes)
            
            # Retrieve words directly from widget keys
            word1 = st.session_state.w1
            word2 = st.session_state.w2
            word3 = st.session_state.w3
            
            # UPDATED: Max 75 words (1.5x previous 50 limit)
            prompt = (
                f"Write a funny story (max 75 words) for kids using: {word1}, {word2}, {word3}. "
                f"Style: {random_vibe}. End with a punchline!"
            )

            # Stream the response
            with story_placeholder.container():
                st.markdown('<div class="story-container">Writing... ✍️</div>', unsafe_allow_html=True)
                
            response_generator = ollama.chat(
                model=MODEL_NAME, 
                messages=[{'role': 'user', 'content': prompt}],
                stream=True
            )
            
            for chunk in response_generator:
                content = chunk['message']['content']
                full_response += content
                story_placeholder.markdown(f'<div class="story-container">{full_response} ▌</div>', unsafe_allow_html=True)
            
            # Final render
            story_placeholder.markdown(f'<div class="story-container">{full_response}</div>', unsafe_allow_html=True)
            st.session_state.story_text = full_response
            st.session_state.should_generate = False

        except Exception as e:
            story_placeholder.error("😴 The AI is sleeping. Is Ollama running?")
    else:
        # Show cached story
        story_placeholder.markdown(f'<div class="story-container">{st.session_state.story_text}</div>', unsafe_allow_html=True)

    # 3. AUDIO BUTTON
    st.markdown("<br>", unsafe_allow_html=True)
    c1, c2, c3 = st.columns([0.3, 0.4, 0.3])
    with c2:
        if st.button("🔊 Read to Me"):
            speak_text(st.session_state.story_text)

    # 4. 30-SECOND TIMER & AUTO-RESET
    timer_placeholder = st.empty()
    
    # Loop for 30 seconds
    for seconds_left in range(50, 0, -1):
        timer_placeholder.markdown(
            f'<div class="timer-box">⚡ Quick! Resetting in {seconds_left}s...</div>', 
            unsafe_allow_html=True
        )
        time.sleep(1)
    
    # Time is up!
    reset_app()