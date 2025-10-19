---
title: "A/B Testing Simulator"
description: "Interactive A/B test with real-time Bayesian and Frequentist statistics"
date: 2025-10-17
draft: false
---

# A/B Testing Simulator

Welcome! This is an interactive simulator where you can see A/B testing and statistical analysis in action.

## Section 1: Word Search Challenge

<div id="puzzle-section" class="simulator-section">
  <h3>Your Challenge</h3>
  <p>You are in: <strong id="user-variant">Loading...</strong></p>
  <p id="difficulty-display"></p>
  
  <div id="puzzle-container" style="display: none;">
    <div id="letter-grid" class="letter-grid"></div>
    <div style="margin: 1.5rem 0;">
      <p><strong>Words to find: <span id="target-word-count">0</span></strong></p>
      <p id="timer" style="font-size: 2rem; font-weight: bold; color: #0066cc; font-family: monospace;">00:00:00</p>
      <button id="start-button" class="puzzle-button">▶ Start Challenge</button>
      <button id="reset-button" class="puzzle-button" style="display: none;">↻ Reset</button>
    </div>
    <div style="margin: 1rem 0;">
      <input type="text" id="word-input" placeholder="Type a 4-letter word and press Enter" style="display: none; padding: 8px; width: 100%; font-size: 1rem; border: 1px solid #ddd; border-radius: 4px;">
      <div id="guessed-words" style="margin-top: 1rem; min-height: 2rem;">
        <p style="font-size: 0.9rem; color: #666;">Found words: <span id="found-words-list" style="font-weight: bold;"></span></p>
      </div>
    </div>
    <div id="completion-message" style="display: none; text-align: center; padding: 1.5rem; background-color: #e8f5e9; border-radius: 4px; margin: 1rem 0;">
      <h4 style="color: #27ae60;">✓ Challenge Complete!</h4>
      <p id="completion-text"></p>
      <button id="try-again-button" class="puzzle-button">Try Again</button>
    </div>
  </div>
</div>

## Section 2: Live Dashboard

<div id="dashboard-section" class="simulator-section">
  <h3>Results (Live)</h3>
  
  <div style="margin-bottom: 1rem;">
    <button id="polling-toggle" style="padding: 8px 16px; background-color: #666; color: white; border: none; border-radius: 4px; cursor: pointer; font-weight: bold;">
      ▶ Enable Live Refresh
    </button>
  </div>
  
  <div class="dashboard">
    <div class="variant-stats">
      <h4>Variant A</h4>
      <p>Users: <strong id="variant-a-users">0</strong></p>
      <p>Completions: <strong id="variant-a-completions">0</strong></p>
      <p>Avg Time: <strong id="variant-a-avg-time">-</strong></p>
      <p>Success Rate: <strong id="variant-a-success-rate">-</strong></p>
    </div>
    <div class="variant-stats">
      <h4>Variant B</h4>
      <p>Users: <strong id="variant-b-users">0</strong></p>
      <p>Completions: <strong id="variant-b-completions">0</strong></p>
      <p>Avg Time: <strong id="variant-b-avg-time">-</strong></p>
      <p>Success Rate: <strong id="variant-b-success-rate">-</strong></p>
    </div>
  </div>
  
  <p class="last-updated">Last updated: <span id="last-updated">never</span></p>
</div>

## Section 3: Python Code

<div id="code-section" class="simulator-section">
  <h3>How We Calculate It</h3>
  <p>This is the actual Python code powering the analysis:</p>
  
  <pre><code class="language-python">import pandas as pd
    from scipy import stats as scipy_stats
    import numpy as np

    # Load experiment data
    df = pd.read_csv('events.csv')

    # Split by variant
    a = df[df['variant'] == 'A']['converted']
    b = df[df['variant'] == 'B']['converted']

    # Frequentist: Chi-square test
    contingency = [[a.sum(), len(a)-a.sum()],
                [b.sum(), len(b)-b.sum()]]
    chi2, p_value, dof, expected = scipy_stats.chi2_contingency(contingency)

    # Bayesian: Beta-Binomial credible intervals
    alpha, beta = 1, 1  # Uniform priors
    a_alpha = alpha + a.sum()
    a_beta = beta + (len(a) - a.sum())
    a_ci = scipy_stats.beta.ppf([0.025, 0.975], a_alpha, a_beta)
  </code></pre>
</div>

## Section 4: Education

<div id="education-section" class="simulator-section">
  <h3>Understanding the Results</h3>
  
  <h4>Why Bayesian and Frequentist?</h4>
  <p>This simulator shows both approaches because they answer different questions:</p>
  <ul>
    <li><strong>Frequentist:</strong> "If we repeated this experiment many times, how often would we see this difference by chance?"</li>
    <li><strong>Bayesian:</strong> "Given what we've observed, what's the probability that B is actually better than A?"</li>
  </ul>
  
  <h4>What Are Credible Intervals?</h4>
  <p>The 95% credible interval means: "We're 95% confident the true value is in this range."</p>
</div>

<script>
const EXPERIMENT_ID = '83cac599-f4bb-4d68-8b12-04458801a22b';
let pollingInterval = null;
let isPolling = false;

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
  initializeVariant();
  displayVariant();
  setupPuzzle();
  setupPollingToggle();
});

function initializeVariant() {
  if (!localStorage.getItem('simulator_variant')) {
    const variant = Math.random() < 0.5 ? 'A' : 'B';
    localStorage.setItem('simulator_variant', variant);
    
    const userId = 'user_' + Math.random().toString(36).substr(2, 9);
    localStorage.setItem('simulator_user_id', userId);
  }
}

function displayVariant() {
  const variant = localStorage.getItem('simulator_variant');
  puzzleState.variant = variant;
  
  document.getElementById('user-variant').textContent = 'Variant ' + variant;
  
  const difficulty = PUZZLE_CONFIG[variant].difficulty;
  document.getElementById('difficulty-display').textContent = `Difficulty: ${difficulty}/10`;
  document.getElementById('target-word-count').textContent = PUZZLE_CONFIG[variant].targetCount;
}

function setupPuzzle() {
  const variant = puzzleState.variant;
  const config = PUZZLE_CONFIG[variant];
  
  // Display letter grid
  const grid = document.getElementById('letter-grid');
  grid.innerHTML = '';
  
  // Create 3-row grid
  const gridHTML = config.letters.map((letter, idx) => {
    return `<div class="letter">${letter}</div>`;
  }).join('');
  
  grid.innerHTML = gridHTML;
  
  // Setup event listeners
  document.getElementById('start-button').addEventListener('click', startChallenge);
  document.getElementById('reset-button').addEventListener('click', resetPuzzle);
  document.getElementById('try-again-button').addEventListener('click', resetPuzzle);
  document.getElementById('word-input').addEventListener('keypress', handleWordInput);
  
  document.getElementById('puzzle-container').style.display = 'block';
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
}

function updateTimer() {
  const elapsed = Date.now() - puzzleState.startTime;
  const seconds = Math.floor(elapsed / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  
  const display = 
    String(hours).padStart(2, '0') + ':' +
    String(minutes % 60).padStart(2, '0') + ':' +
    String(seconds % 60).padStart(2, '0');
  
  document.getElementById('timer').textContent = display;
}

function handleWordInput(event) {
  if (event.key !== 'Enter') return;
  
  const word = event.target.value.toUpperCase().trim();
  event.target.value = '';
  
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
  }
}

function updateFoundWordsList() {
  const list = puzzleState.foundWords.join(', ');
  document.getElementById('found-words-list').textContent = list || '(none yet)';
}

function completeChallenge() {
  puzzleState.isRunning = false;
  clearInterval(puzzleState.timerInterval);
  
  puzzleState.completionTime = Math.floor((Date.now() - puzzleState.startTime) / 1000);
  
  document.getElementById('word-input').style.display = 'none';
  document.getElementById('reset-button').style.display = 'none';
  
  const timeDisplay = 
    String(Math.floor(puzzleState.completionTime / 60)).padStart(2, '0') + ':' +
    String(puzzleState.completionTime % 60).padStart(2, '0');
  
  document.getElementById('completion-text').innerHTML = 
    `You found all ${puzzleState.foundWords.length} words in ${timeDisplay}!<br>` +
    `Total guesses: ${puzzleState.guessedWords.length}`;
  
  document.getElementById('completion-message').style.display = 'block';
  
  // Track completion event
  trackCompletion();
}

function resetPuzzle() {
  puzzleState.isRunning = false;
  clearInterval(puzzleState.timerInterval);
  puzzleState.startTime = null;
  puzzleState.guessedWords = [];
  puzzleState.foundWords = [];
  puzzleState.completionTime = null;
  
  document.getElementById('timer').textContent = '00:00:00';
  document.getElementById('start-button').style.display = 'inline-block';
  document.getElementById('reset-button').style.display = 'none';
  document.getElementById('word-input').style.display = 'none';
  document.getElementById('word-input').value = '';
  document.getElementById('completion-message').style.display = 'none';
  document.getElementById('found-words-list').textContent = '(none yet)';
}

async function trackCompletion() {
  try {
    const variant = puzzleState.variant;
    const userId = localStorage.getItem('simulator_user_id');
    
    const apiUrl = window.location.hostname === 'localhost' 
      ? 'http://localhost:8000/api/track'
      : 'https://soma-blog-hugo.vercel.app/api/track';
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        experiment_id: EXPERIMENT_ID,
        user_id: userId,
        variant: variant,
        converted: true,
        action_type: 'completed',
        completion_time: puzzleState.completionTime,
        success: true,
        attempts_count: puzzleState.guessedWords.length,
        metadata: {
          found_words: puzzleState.foundWords,
          total_guesses: puzzleState.guessedWords.length
        }
      })
    });
    
    if (!response.ok) {
      console.error('Error tracking completion:', response.status);
    }
  } catch (error) {
    console.error('Error tracking completion:', error);
  }
}

function setupPollingToggle() {
  const toggleBtn = document.getElementById('polling-toggle');
  if (toggleBtn) {
    toggleBtn.addEventListener('click', togglePolling);
  }
}

function togglePolling() {
  const toggleBtn = document.getElementById('polling-toggle');
  
  if (isPolling) {
    clearInterval(pollingInterval);
    isPolling = false;
    toggleBtn.textContent = '▶ Enable Live Refresh';
    toggleBtn.style.backgroundColor = '#666';
  } else {
    isPolling = true;
    toggleBtn.textContent = '⏸ Disable Live Refresh';
    toggleBtn.style.backgroundColor = '#27ae60';
    
    updateDashboard();
    pollingInterval = setInterval(updateDashboard, 10000);
  }
}

async function updateDashboard() {
  try {
    const apiUrl = window.location.hostname === 'localhost' 
      ? 'http://localhost:8000/api/stats?experiment_id=' + EXPERIMENT_ID
      : 'https://soma-blog-hugo.vercel.app/api/stats?experiment_id=' + EXPERIMENT_ID;
    
    const response = await fetch(apiUrl);
    
    if (!response.ok) {
      console.error('Error fetching stats:', response.status);
      return;
    }
    
    const data = await response.json();
    
    if (data.status === 'success') {
      // Update variant A
      document.getElementById('variant-a-users').textContent = data.variant_a.n_users;
      document.getElementById('variant-a-completions').textContent = data.variant_a.conversions;
      document.getElementById('variant-a-success-rate').textContent = 
        (data.variant_a.conversion_rate * 100).toFixed(1) + '%';
      
      // Update variant B
      document.getElementById('variant-b-users').textContent = data.variant_b.n_users;
      document.getElementById('variant-b-completions').textContent = data.variant_b.conversions;
      document.getElementById('variant-b-success-rate').textContent = 
        (data.variant_b.conversion_rate * 100).toFixed(1) + '%';
      
      const now = new Date();
      document.getElementById('last-updated').textContent = now.toLocaleTimeString();
    }
  } catch (error) {
    console.error('Error updating dashboard:', error);
  }
}
</script>

<style>
.simulator-section {
  border: 1px solid #e0e0e0;
  padding: 2rem;
  margin: 2rem 0;
  border-radius: 8px;
  background-color: #f9f9f9;
  color: #333;
}

.simulator-section h3,
.simulator-section h4 {
  color: #333;
}

.simulator-section p,
.simulator-section ul,
.simulator-section li {
  color: #333;
}

.letter-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 1rem;
  margin: 1.5rem 0;
}

.letter {
  background-color: #0066cc;
  color: white;
  padding: 1rem;
  border-radius: 8px;
  text-align: center;
  font-size: 1.5rem;
  font-weight: bold;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.puzzle-button {
  padding: 10px 20px;
  margin-right: 0.5rem;
  font-size: 1rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: bold;
  background-color: #0066cc;
  color: white;
}

.puzzle-button:hover {
  opacity: 0.9;
}

.dashboard {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  margin: 1rem 0;
}

.variant-stats {
  border: 1px solid #ddd;
  padding: 1rem;
  border-radius: 4px;
  background-color: #fff;
  color: #333;
}

.variant-stats h4 {
  margin-top: 0;
  color: #333;
}

.last-updated {
  font-size: 0.9rem;
  color: #999;
  text-align: right;
}

@media (max-width: 768px) {
  .letter-grid {
    grid-template-columns: repeat(4, 1fr);
  }
  
  .dashboard {
    grid-template-columns: 1fr;
  }
}
</style>