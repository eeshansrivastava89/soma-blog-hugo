const EXPERIMENT_ID = '83cac599-f4bb-4d68-8b12-04458801a22b';
const FEATURE_FLAG_KEY = 'word_search_difficulty_v2';

// Puzzle configuration
const PUZZLE_CONFIG = {
  A: {
    letters: ['M', 'A', 'T', 'H', 'E', 'M', 'A', 'T', 'I', 'C', 'S', 'L', 'O', 'W'],
    targetWords: ['MATH', 'THEM', 'MACE'],
    difficulty: 3,
    targetCount: 3
  },
  B: {
    letters: ['C', 'O', 'M', 'P', 'U', 'T', 'E', 'R', 'S', 'C', 'I', 'E', 'N', 'C', 'E', 'D', 'A', 'T', 'A'],
    targetWords: ['COMP', 'PURE', 'ENCE', 'DATA'],
    difficulty: 5,
    targetCount: 4
  }
};

// Fun username generator
const ADJECTIVES = ['Lightning', 'Swift', 'Quick', 'Speedy', 'Rapid', 'Fast', 'Blazing', 'Turbo', 'Sonic', 'Flash'];
const ANIMALS = ['Leopard', 'Cheetah', 'Falcon', 'Hawk', 'Fox', 'Wolf', 'Tiger', 'Eagle', 'Panther', 'Gazelle'];

function generateUsername() {
  const adj = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
  const animal = ANIMALS[Math.floor(Math.random() * ANIMALS.length)];
  return `${adj} ${animal}`;
}

let puzzleState = {
  variant: null,
  startTime: null,
  isRunning: false,
  guessedWords: [],
  foundWords: [],
  timerInterval: null,
  completionTime: null
};

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
  // Wait for PostHog feature flags to load before initializing
  let hasInitialized = false;
  
  function doInit() {
    if (hasInitialized) return;
    hasInitialized = true;
    initializeVariant();
    displayVariant();
    setupPuzzle();
    updateLeaderboard();
  }
  
  // Try PostHog callback first
  if (posthog && posthog.onFeatureFlags) {
    posthog.onFeatureFlags(doInit);
  }
  
  // Timeout fallback - if PostHog doesn't fire callback in 3 seconds, initialize anyway
  setTimeout(doInit, 1000);
});

function initializeVariant() {
  // Get variant from PostHog feature flag
  const posthogVariant = posthog.getFeatureFlag(FEATURE_FLAG_KEY);

  let variant;
  if (posthogVariant === '4-words') {
    variant = 'B';  // 4 words = Variant B
  } else if (posthogVariant === 'control') {
    variant = 'A';  // control = Variant A (3 words)
  } else {
    // Fallback if feature flag didn't load
    variant = Math.random() < 0.5 ? 'A' : 'B';
    console.warn('PostHog feature flag not loaded, using random assignment. Got:', posthogVariant);
  }

  localStorage.setItem('simulator_variant', variant);

  const userId = 'user_' + Math.random().toString(36).substr(2, 9);
  localStorage.setItem('simulator_user_id', userId);

  if (!localStorage.getItem('simulator_username')) {
    const username = generateUsername();
    localStorage.setItem('simulator_username', username);
  }
}


function displayVariant() {

  const variant = localStorage.getItem('simulator_variant');
  puzzleState.variant = variant;
  
  const username = localStorage.getItem('simulator_username');
  const difficulty = PUZZLE_CONFIG[variant].difficulty;
  
  document.getElementById('user-variant').textContent = 'Variant ' + variant;
  document.getElementById('user-username').textContent = username || 'Loading...';
  document.getElementById('difficulty-display').textContent = `Difficulty: ${difficulty}/10`;
  document.getElementById('target-word-count').textContent = PUZZLE_CONFIG[variant].targetCount;

}

function setupPuzzle() {
  const variant = puzzleState.variant;
  const config = PUZZLE_CONFIG[variant];
  
  // Apply variant color theme
  const puzzleSection = document.getElementById('puzzle-section');
  if (variant === 'A') {
    puzzleSection.classList.add('variant-a-theme');
    puzzleSection.classList.remove('variant-b-theme');
  } else {
    puzzleSection.classList.add('variant-b-theme');
    puzzleSection.classList.remove('variant-a-theme');
  }

  // Display letter grid
  const grid = document.getElementById('letter-grid');
  grid.innerHTML = '';
  
  // Create grid
  const gridHTML = config.letters.map((letter, idx) => {
    return `<div class="letter">${letter}</div>`;
  }).join('');
  
  grid.innerHTML = gridHTML;
  
  // Setup event listeners
  document.getElementById('start-button').addEventListener('click', startChallenge);
  document.getElementById('reset-button').addEventListener('click', resetPuzzle);
  document.getElementById('try-again-button').addEventListener('click', () => resetPuzzle(true));
  document.getElementById('try-again-failure-button').addEventListener('click', () => resetPuzzle(true));
  document.getElementById('word-input').addEventListener('keypress', handleWordInput);

}

function startChallenge() {
  puzzleState.startTime = Date.now();
  puzzleState.isRunning = true;
  puzzleState.guessedWords = [];
  puzzleState.foundWords = [];
  
  document.getElementById('start-button').style.display = 'none';
  document.getElementById('reset-button').style.display = 'inline-block';
  document.getElementById('word-input').style.display = 'block';
  document.getElementById('word-input').focus();
  
  // Start timer
  puzzleState.timerInterval = setInterval(updateTimer, 100);

  // Track "started" event
  trackStarted();
}

function updateTimer() {
  const elapsed = Date.now() - puzzleState.startTime;
  
  // Check if 60 seconds elapsed
  if (elapsed >= 60000) {
    failChallenge();
    return;
  }
  
  // Calculate time REMAINING (countdown from 60s)
  const remaining = 60000 - elapsed;
  const seconds = Math.floor(remaining / 1000);
  const milliseconds = Math.floor((remaining % 1000) / 10);
  
  const display = 
    '00:' +
    String(seconds).padStart(2, '0') + ':' +
    String(milliseconds).padStart(2, '0');
  
  document.getElementById('timer').textContent = display;
}

function handleWordInput(event) {
  if (event.key !== 'Enter') return;
  
  const word = event.target.value.toUpperCase().trim();
  const inputField = event.target;
  inputField.value = '';
  
  if (!word) return;
  
  const variant = puzzleState.variant;
  const config = PUZZLE_CONFIG[variant];
  
  // Track guessed word
  puzzleState.guessedWords.push(word);
  
  // Check if word is in target list and not already found
  if (config.targetWords.includes(word) && !puzzleState.foundWords.includes(word)) {
    puzzleState.foundWords.push(word);
    updateFoundWordsList();
    
    // Check if all words found
    if (puzzleState.foundWords.length === config.targetCount) {
      completeChallenge();
    }
  } else {
    // Wrong answer - shake animation
    inputField.classList.add('shake-animate');
    setTimeout(() => {
      inputField.classList.remove('shake-animate');
    }, 500);
  }
}

function updateFoundWordsList() {
  const list = puzzleState.foundWords.join(', ');
  document.getElementById('found-words-list').textContent = list || '(none yet)';
}

async function completeChallenge() {
  puzzleState.isRunning = false;
  clearInterval(puzzleState.timerInterval);
  
  puzzleState.completionTime = Date.now() - puzzleState.startTime;
  
  document.getElementById('word-input').style.display = 'none';
  document.getElementById('reset-button').style.display = 'none';
  
  // Format time for display
  const minutes = Math.floor(puzzleState.completionTime / 60000);
  const seconds = Math.floor((puzzleState.completionTime % 60000) / 1000);
  const milliseconds = Math.floor((puzzleState.completionTime % 1000) / 10);
  
  const timeDisplay = 
    String(minutes).padStart(2, '0') + ':' +
    String(seconds).padStart(2, '0') + ':' +
    String(milliseconds).padStart(2, '0');
  
  // Update completion message
  document.getElementById('completion-time-display').textContent = timeDisplay;
  document.getElementById('completion-guesses').textContent = puzzleState.guessedWords.length;

  // Update leaderboard and check if personal best
  const isPersonalBest = updateLeaderboard(puzzleState.completionTime, puzzleState.variant);

  // Show simple completion text
  const comparisonElem = document.getElementById('comparison-text');
  if (isPersonalBest) {
    comparisonElem.innerHTML = '🏆 <strong style="color: #f39c12;">Personal Best!</strong>';
  } else {
    comparisonElem.textContent = 'Great job! Check the dashboard below for detailed stats.';
  }

  // Show completion message with animation
  const completionMsg = document.getElementById('completion-message');
  completionMsg.style.display = 'block';
  completionMsg.classList.add('celebration-animate');

  // Remove animation class after it completes so it can replay next time
  setTimeout(() => {
    completionMsg.classList.remove('celebration-animate');
  }, 1000);

  // Track completion
  await trackCompletion();
}

async function failChallenge() {
  puzzleState.isRunning = false;
  clearInterval(puzzleState.timerInterval);
  
  puzzleState.completionTime = 60000; // 60 seconds
  
  document.getElementById('word-input').style.display = 'none';
  document.getElementById('reset-button').style.display = 'none';
  
  const config = PUZZLE_CONFIG[puzzleState.variant];
  
  // Update failure message
  document.getElementById('failure-words-found').textContent = puzzleState.foundWords.length;
  document.getElementById('failure-words-total').textContent = config.targetCount;
  
  // Show failure message
  const failureMsg = document.getElementById('failure-message');
  if (failureMsg) {
    failureMsg.style.display = 'block';
  }
  
  // Track as failed completion
  await trackFailure();
}

function resetPuzzle(isRepeat = false) {
  puzzleState.isRunning = false;
  clearInterval(puzzleState.timerInterval);
  puzzleState.startTime = null;
  puzzleState.guessedWords = [];
  puzzleState.foundWords = [];
  puzzleState.completionTime = null;
  
  document.getElementById('timer').textContent = '00:60:00';
  document.getElementById('start-button').style.display = 'inline-block';
  document.getElementById('reset-button').style.display = 'none';
  document.getElementById('word-input').style.display = 'none';
  document.getElementById('word-input').value = '';
  document.getElementById('found-words-list').textContent = '(none yet)';
  document.getElementById('completion-message').style.display = 'none';
  document.getElementById('failure-message').style.display = 'none';
  
  // Track "repeated" event if this was triggered by Try Again button
  if (isRepeat) {
    trackRepeated();
  }
}

async function trackCompletion() {
  try {
    const variant = puzzleState.variant;
    const userId = localStorage.getItem('simulator_user_id');

    const completionTimeSeconds = (puzzleState.completionTime / 1000).toFixed(3);

    // Send to PostHog with feature flag property
    posthog.capture('puzzle_completed', {
      variant: variant,
      completion_time_seconds: parseFloat(completionTimeSeconds),
      correct_words_count: puzzleState.foundWords.length,
      total_guesses_count: puzzleState.guessedWords.length,
      user_id: userId,
      $feature_flag: FEATURE_FLAG_KEY,
      $feature_flag_response: posthog.getFeatureFlag(FEATURE_FLAG_KEY)
    });
  } catch (error) {
    console.error('Error tracking completion:', error);
  }
}

async function trackFailure() {
  try {
    const variant = puzzleState.variant;
    const userId = localStorage.getItem('simulator_user_id');

    posthog.capture('puzzle_failed', {
      variant: variant,
      correct_words_count: puzzleState.foundWords.length,
      total_guesses_count: puzzleState.guessedWords.length,
      user_id: userId,
      $feature_flag: FEATURE_FLAG_KEY,
      $feature_flag_response: posthog.getFeatureFlag(FEATURE_FLAG_KEY)
    });
  } catch (error) {
    console.error('Error tracking failure:', error);
  }
}

async function trackStarted() {
  try {
    const variant = puzzleState.variant;
    const userId = localStorage.getItem('simulator_user_id');

    // Send to PostHog with feature flag property
    posthog.capture('puzzle_started', {
      variant: variant,
      user_id: userId,
      difficulty: variant === 'A' ? 3 : 4,
      $feature_flag: FEATURE_FLAG_KEY,
      $feature_flag_response: posthog.getFeatureFlag(FEATURE_FLAG_KEY)
    });
  } catch (error) {
    console.error('Error tracking started:', error);
  }
}

async function trackRepeated() {
  try {
    const variant = puzzleState.variant;
    const userId = localStorage.getItem('simulator_user_id');

    posthog.capture('puzzle_repeated', {
      variant: variant,
      user_id: userId,
      $feature_flag: FEATURE_FLAG_KEY,
      $feature_flag_response: posthog.getFeatureFlag(FEATURE_FLAG_KEY)
    });
  } catch (error) {
    console.error('Error tracking repeated:', error);
  }
}


function updateLeaderboard(currentTime = null, currentVariant = null) {
  const leaderboard = JSON.parse(localStorage.getItem('leaderboard') || '[]');
  const leaderboardList = document.getElementById('leaderboard-list');
  let isPersonalBest = false;

  // Save new completion if provided
  if (currentTime && currentVariant) {
    const username = localStorage.getItem('simulator_username');
    const timeInSeconds = currentTime / 1000;

    const existingIndex = leaderboard.findIndex(e => e.username === username);

    if (existingIndex >= 0) {
      if (timeInSeconds < leaderboard[existingIndex].time) {
        leaderboard[existingIndex] = { username, time: timeInSeconds, variant: currentVariant };
        isPersonalBest = true;
      }
    } else {
      leaderboard.push({ username, time: timeInSeconds, variant: currentVariant });
      isPersonalBest = true; // First completion is always a personal best
    }

    localStorage.setItem('leaderboard', JSON.stringify(leaderboard));
  }
  
  // Display leaderboard
  if (leaderboard.length === 0) {
    leaderboardList.innerHTML = '<p style="text-align: center; color: #9ca3af; font-style: italic; font-size: 0.85rem; margin: 0;">Complete a challenge to appear here</p>';
    return;
  }
  
  leaderboard.sort((a, b) => a.time - b.time);
  
  const username = localStorage.getItem('simulator_username');
  const top5 = leaderboard.slice(0, 5);
  
  let html = top5.map((entry, index) => {
    const isCurrentUser = entry.username === username;
    const classes = isCurrentUser ? 'leaderboard-entry current-user' : 'leaderboard-entry';
    const badge = isCurrentUser ? ' 🌟' : '';
    
    return `
      <div class="${classes}">
        <span style="font-weight: 600; color: #1f2937;">${index + 1}. ${entry.username}${badge}</span>
        <span style="font-weight: 700; color: #3b82f6;">${entry.time.toFixed(2)}s</span>
      </div>
    `;
  }).join('');
  
  // Show current attempt if it's slower than personal best
  if (currentTime) {
    const timeInSeconds = currentTime / 1000;
    const userBest = leaderboard.find(e => e.username === username);
    
    if (userBest && timeInSeconds > userBest.time) {
      html += `
        <div style="border-top: 2px dashed #d1d5db; margin: 0.65rem 0 0.35rem 0;"></div>
        <div class="leaderboard-entry current-attempt">
          <span style="font-weight: 600; color: #1f2937;">This attempt: ${timeInSeconds.toFixed(2)}s</span>
          <span style="font-size: 0.8rem; color: #6b7280;">Your Best: ${userBest.time.toFixed(2)}s</span>
        </div>
      `;
    }
  }
  
  leaderboardList.innerHTML = html;
  document.getElementById('leaderboard-display').style.display = 'block';

  return isPersonalBest;
}
