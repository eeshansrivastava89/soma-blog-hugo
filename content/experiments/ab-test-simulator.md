---
title: "A/B Testing Simulator"
description: "Interactive A/B test with real-time Bayesian and Frequentist statistics"
date: 2025-10-17
draft: false
---

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
      <div id="completion-message" style="display: none; margin-top: 1.5rem; padding: 1.25rem; background: linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%); border-radius: 8px; border-left: 4px solid #27ae60;">
      <div style="text-align: center; line-height: 1.4;">
        <h4 style="color: #27ae60; margin: 0 0 0.5rem 0; font-size: 1.1rem;">🎉 Challenge Complete!</h4>
        <p style="margin: 0.25rem 0; font-size: 0.95rem; color: #333;">
          <strong style="color: #0066cc; font-family: monospace; font-size: 1.1rem;" id="completion-time-display">--:--:--</strong>
          <span style="margin: 0 0.5rem; color: #999;">|</span>
          <span style="color: #666;"><strong id="completion-guesses">0</strong> guesses</span>
        </p>
        <p id="comparison-text" style="margin: 0.25rem 0; font-size: 0.9rem; color: #27ae60; font-weight: 600;">Loading comparison...</p>
        <div style="margin-top: 0.75rem; display: flex; gap: 0.5rem; justify-content: center; flex-wrap: wrap;">
          <button id="try-again-button" class="compact-button" style="padding: 6px 14px; font-size: 0.85rem; background-color: #27ae60; color: white; border: none; border-radius: 4px; cursor: pointer; font-weight: 600;">🔄 Try Again</button>
          <a href="#dashboard-section" style="padding: 6px 14px; font-size: 0.85rem; background-color: #3498db; color: white; text-decoration: none; border-radius: 4px; font-weight: 600; display: inline-block;">📊 View Stats</a>
        </div>
      </div>
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

        # Calculate average completion times
        a_completed = df[(df['variant'] == 'A') & (df['action_type'] == 'completed')]
        b_completed = df[(df['variant'] == 'B') & (df['action_type'] == 'completed')]

        a_avg_time = a_completed['completion_time'].mean()
        b_avg_time = b_completed['completion_time'].mean()
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
  
  // Create grid
  const gridHTML = config.letters.map((letter, idx) => {
    return `<div class="letter">${letter}</div>`;
  }).join('');
  
  grid.innerHTML = gridHTML;
  
  // Setup event listeners
  document.getElementById('start-button').addEventListener('click', startChallenge);
  document.getElementById('reset-button').addEventListener('click', resetPuzzle);
  document.getElementById('word-input').addEventListener('keypress', handleWordInput);
  document.getElementById('try-again-button').addEventListener('click', resetPuzzle);
  
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
  const minutes = Math.floor(elapsed / 60000);
  const seconds = Math.floor((elapsed % 60000) / 1000);
  const milliseconds = Math.floor((elapsed % 1000) / 10);
  
  const display = 
    String(minutes).padStart(2, '0') + ':' +
    String(seconds).padStart(2, '0') + ':' +
    String(milliseconds).padStart(2, '0');
  
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
  
  // Show completion message
  document.getElementById('completion-message').style.display = 'block';
  
  // Track completion first
  await trackCompletion();
  
  // Then fetch variant comparison
  await fetchVariantComparison();
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
  document.getElementById('found-words-list').textContent = '(none yet)';
  document.getElementById('completion-message').style.display = 'none';
}

async function trackCompletion() {
  try {
    const variant = puzzleState.variant;
    const userId = localStorage.getItem('simulator_user_id');
    
    const completionTimeSeconds = (puzzleState.completionTime / 1000).toFixed(3);
    
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
        completion_time: parseFloat(completionTimeSeconds),
        success: true,
        correct_words_count: puzzleState.foundWords.length,
        total_guesses_count: puzzleState.guessedWords.length,
        metadata: {
          found_words: puzzleState.foundWords,
          puzzle_type: 'word_search'
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

async function fetchVariantComparison() {
  try {
    const apiUrl = window.location.hostname === 'localhost' 
      ? 'http://localhost:8000/api/stats?experiment_id=' + EXPERIMENT_ID
      : 'https://soma-blog-hugo.vercel.app/api/stats?experiment_id=' + EXPERIMENT_ID;
    
    const response = await fetch(apiUrl);
    
    if (!response.ok) {
      document.getElementById('comparison-text').textContent = 
        'Comparison data unavailable. Try again!';
      return;
    }
    
    const data = await response.json();
    
    if (data.status !== 'success') {
      document.getElementById('comparison-text').textContent = 
        'Not enough data yet for comparison.';
      return;
    }
    
    const userVariant = puzzleState.variant;
    const userTime = puzzleState.completionTime / 1000; // convert to seconds
    
    let avgTime, otherVariantAvg, variantName;
    
    if (userVariant === 'A') {
      avgTime = data.variant_a.avg_completion_time;
      otherVariantAvg = data.variant_b.avg_completion_time;
      variantName = 'A';
    } else {
      avgTime = data.variant_b.avg_completion_time;
      otherVariantAvg = data.variant_a.avg_completion_time;
      variantName = 'B';
    }
    
    let comparisonHTML = '';
    
    if (avgTime) {
      const diff = userTime - avgTime;
      const diffAbs = Math.abs(diff);
      const otherName = userVariant === 'A' ? 'B' : 'A';
      
      if (diff < 0) {
        comparisonHTML += `⚡ ${diffAbs.toFixed(1)}s faster than variant ${variantName} average`;
      } else if (diff > 0) {
        comparisonHTML += `${diffAbs.toFixed(1)}s slower than variant ${variantName} average`;
      } else {
        comparisonHTML += `Matched variant ${variantName} average!`;
      }
      
      if (otherVariantAvg) {
        comparisonHTML += ` <span style="margin: 0 0.5rem; color: #999;">|</span> Variant ${otherName} avg: ${otherVariantAvg.toFixed(1)}s`;
      }
    }
    
    if (comparisonHTML) {
      document.getElementById('comparison-text').innerHTML = comparisonHTML;
    } else {
      document.getElementById('comparison-text').textContent = 
        'Great job completing the challenge!';
    }
    
  } catch (error) {
    console.error('Error fetching comparison:', error);
    document.getElementById('comparison-text').textContent = 
      'Comparison unavailable. Nice work!';
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
      document.getElementById('variant-a-avg-time').textContent = 
        data.variant_a.avg_completion_time ? data.variant_a.avg_completion_time.toFixed(1) + 's' : '-';
      document.getElementById('variant-a-success-rate').textContent = 
        (data.variant_a.conversion_rate * 100).toFixed(1) + '%';
      
      // Update variant B
      document.getElementById('variant-b-users').textContent = data.variant_b.n_users;
      document.getElementById('variant-b-completions').textContent = data.variant_b.conversions;
      document.getElementById('variant-b-avg-time').textContent = 
        data.variant_b.avg_completion_time ? data.variant_b.avg_completion_time.toFixed(1) + 's' : '-';
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

/* Modal styles */
.modal {
  display: none;
  position: fixed;
  z-index: 1000;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0,0,0,0.6);
  align-items: center;
  justify-content: center;
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.modal-content {
  background-color: white;
  padding: 2.5rem;
  border-radius: 12px;
  max-width: 500px;
  width: 90%;
  box-shadow: 0 10px 40px rgba(0,0,0,0.3);
  text-align: center;
  animation: slideUp 0.4s ease;
}

@keyframes slideUp {
  from {
    transform: translateY(50px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.celebration-icon {
  font-size: 4rem;
  animation: bounce 0.6s ease;
}

@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-20px); }
}

.completion-stats {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
  margin: 2rem 0;
}

.stat-item {
  padding: 1rem;
  background-color: #f0f0f0;
  border-radius: 8px;
}

.stat-label {
  font-size: 0.9rem;
  color: #666;
  margin-bottom: 0.5rem;
}

.stat-value {
  font-size: 1.8rem;
  font-weight: bold;
  color: #0066cc;
  font-family: monospace;
}

.variant-comparison {
  margin: 1.5rem 0;
  padding: 1.5rem;
  background-color: #e8f5e9;
  border-radius: 8px;
  border-left: 4px solid #27ae60;
}

.modal-buttons {
  display: flex;
  gap: 1rem;
  justify-content: center;
  margin-top: 2rem;
}

.modal-button {
  padding: 12px 24px;
  font-size: 1rem;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: bold;
  transition: transform 0.2s;
}

.modal-button:hover {
  transform: scale(1.05);
}

.modal-button.primary {
  background-color: #27ae60;
  color: white;
}

.modal-button.secondary {
  background-color: #3498db;
  color: white;
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
  
  .completion-stats {
    grid-template-columns: 1fr;
  }
  
  .modal-content {
    padding: 2rem 1.5rem;
  }
  
  .modal-buttons {
    flex-direction: column;
  }
}
</style>
