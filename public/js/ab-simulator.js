const EXPERIMENT_ID = '83cac599-f4bb-4d68-8b12-04458801a22b';

const API_BASE_URL = window.location.hostname === 'localhost' 
  ? 'http://localhost:8000'
  : 'https://api-spring-night-5744.fly.dev';

const POLLING_INTERVAL_MS = 10000; // 10 seconds - change this to adjust refresh rate

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
  initializeVariant();
  displayVariant();
  setupPuzzle();
  loadPlotlyCharts();
  updateLeaderboard();
  startAutoRefresh(); // Start auto-refresh immediately
});

function initializeVariant() {
  if (!localStorage.getItem('simulator_variant')) {
    const variant = Math.random() < 0.5 ? 'A' : 'B';
    localStorage.setItem('simulator_variant', variant);
    
    const userId = 'user_' + Math.random().toString(36).substr(2, 9);
    localStorage.setItem('simulator_user_id', userId);
  }
  
  // Always ensure username exists
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

  // Show personal best indicator if applicable
  if (puzzleState.isPersonalBest) {
    document.getElementById('comparison-text').innerHTML = 
      '🏆 <strong style="color: #f39c12;">Personal Best!</strong> | ' + 
      document.getElementById('comparison-text').innerHTML;
  }
  
  // Show completion message with animation
  const completionMsg = document.getElementById('completion-message');
  completionMsg.style.display = 'block';
  completionMsg.classList.add('celebration-animate');
  
  // Remove animation class after it completes so it can replay next time
  setTimeout(() => {
    completionMsg.classList.remove('celebration-animate');
  }, 1000);
  
  // Update leaderboard
  updateLeaderboard(puzzleState.completionTime, puzzleState.variant);
  
  // Track completion first
  await trackCompletion();
  
  // Then fetch variant comparison and percentile
  await fetchVariantComparison();
  await fetchUserPercentile();
}

async function failChallenge() {
  console.log('failChallenge called'); // DEBUG
  
  puzzleState.isRunning = false;
  clearInterval(puzzleState.timerInterval);
  
  puzzleState.completionTime = 60000; // 60 seconds
  
  document.getElementById('word-input').style.display = 'none';
  document.getElementById('reset-button').style.display = 'none';
  
  const config = PUZZLE_CONFIG[puzzleState.variant];
  
  // Update failure message
  document.getElementById('failure-words-found').textContent = puzzleState.foundWords.length;
  document.getElementById('failure-words-total').textContent = config.targetCount;
  
  console.log('Showing failure message'); // DEBUG
  
  // Show failure message
  const failureMsg = document.getElementById('failure-message');
  if (failureMsg) {
    failureMsg.style.display = 'block';
    console.log('Failure message shown'); // DEBUG
  } else {
    console.error('failure-message element not found!'); // DEBUG
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
    
    const response = await fetch(`${API_BASE_URL}/api/track`, {
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

async function trackFailure() {
  try {
    const variant = puzzleState.variant;
    const userId = localStorage.getItem('simulator_user_id');
    
    const response = await fetch(`${API_BASE_URL}/api/track`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        experiment_id: EXPERIMENT_ID,
        user_id: userId,
        variant: variant,
        converted: false,  // This is the key difference
        action_type: 'completed',
        completion_time: 60.0,
        success: false,
        correct_words_count: puzzleState.foundWords.length,
        total_guesses_count: puzzleState.guessedWords.length,
        metadata: {
          found_words: puzzleState.foundWords,
          puzzle_type: 'word_search',
          failure_reason: 'timeout'
        }
      })
    });
    
    if (!response.ok) {
      console.error('Error tracking failure:', response.status);
    }
  } catch (error) {
    console.error('Error tracking failure:', error);
  }
}

async function trackStarted() {
  try {
    const variant = puzzleState.variant;
    const userId = localStorage.getItem('simulator_user_id');
    
    const response = await fetch(`${API_BASE_URL}/api/track`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        experiment_id: EXPERIMENT_ID,
        user_id: userId,
        variant: variant,
        converted: false,  // Started but not completed yet
        action_type: 'started',
        metadata: {
          puzzle_type: 'word_search'
        }
      })
    });
    
    if (!response.ok) {
      console.error('Error tracking started:', response.status);
    }
  } catch (error) {
    console.error('Error tracking started:', error);
  }
}

async function trackRepeated() {
  try {
    const variant = puzzleState.variant;
    const userId = localStorage.getItem('simulator_user_id');
    
    const response = await fetch(`${API_BASE_URL}/api/track`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        experiment_id: EXPERIMENT_ID,
        user_id: userId,
        variant: variant,
        converted: false,  // Repeated attempt
        action_type: 'repeated',
        metadata: {
          puzzle_type: 'word_search'
        }
      })
    });
    
    if (!response.ok) {
      console.error('Error tracking repeated:', response.status);
    }
  } catch (error) {
    console.error('Error tracking repeated:', error);
  }
}

async function fetchVariantComparison() {
  try {

    const response = await fetch(`${API_BASE_URL}/api/stats?experiment_id=${EXPERIMENT_ID}`);
    
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
        comparisonHTML += `⚡ ${diffAbs.toFixed(2)}s faster than ${variantName}`;
      } else if (diff > 0) {
        comparisonHTML += `${diffAbs.toFixed(2)}s slower than ${variantName}`;
      } else {
        comparisonHTML += `Matched ${variantName} average!`;
      }
      
      if (otherVariantAvg) {
        comparisonHTML += ` <span style="margin: 0 0.5rem; color: #999;">|</span> ${otherName} avg: ${otherVariantAvg.toFixed(2)}s`;
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

function updateLeaderboard(currentTime = null, currentVariant = null) {
  const leaderboard = JSON.parse(localStorage.getItem('leaderboard') || '[]');
  const leaderboardList = document.getElementById('leaderboard-list');
  
  // Save new completion if provided
  if (currentTime && currentVariant) {
    const username = localStorage.getItem('simulator_username');
    const timeInSeconds = currentTime / 1000;
    
    const existingIndex = leaderboard.findIndex(e => e.username === username);
    
    if (existingIndex >= 0) {
      if (timeInSeconds < leaderboard[existingIndex].time) {
        leaderboard[existingIndex] = { username, time: timeInSeconds, variant: currentVariant };
      }
    } else {
      leaderboard.push({ username, time: timeInSeconds, variant: currentVariant });
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
}


async function fetchUserPercentile() {
  try {
    const userTime = puzzleState.completionTime / 1000; // convert to seconds
    const variant = puzzleState.variant;

    const response = await fetch(`${API_BASE_URL}/api/user_percentile?experiment_id=${EXPERIMENT_ID}&user_time=${userTime}&variant=${variant}`);
    
    if (!response.ok) {
      return; // Silently fail if not enough data
    }
    
    const data = await response.json();
    
    if (data.status !== 'success') {
      return;
    }
    
    // Add percentile info to comparison text
    const comparisonElem = document.getElementById('comparison-text');
    const currentText = comparisonElem.innerHTML;
    
    comparisonElem.innerHTML = currentText + 
      ` <span style="margin: 0 0.5rem; color: #999;">|</span> ` +
      `Faster than ${data.variant_percentile}% of ${variant} players`;
    
  } catch (error) {
    console.error('Error fetching percentile:', error);
  }
}

function startAutoRefresh() {
  updateDashboard(); // Initial update
  pollingInterval = setInterval(updateDashboard, POLLING_INTERVAL_MS);
}

async function updateDashboard() {
  try {
    
    const response = await fetch(`${API_BASE_URL}/api/stats?experiment_id=${EXPERIMENT_ID}`);
    
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
      
      // Update difficulty analysis
      if (data.difficulty_analysis) {
        const diff = data.difficulty_analysis;
        let diffText = `<strong>${diff.difficulty_label}</strong>`;
        
        if (diff.variant_a_avg_time && diff.variant_b_avg_time) {
          diffText += ` (A: ${diff.variant_a_avg_time}s avg, B: ${diff.variant_b_avg_time}s avg)`;
        }
        
        if (diff.success_rate_difference !== undefined) {
          diffText += ` | Success rates: A ${diff.variant_a_success_rate}%, B ${diff.variant_b_success_rate}%`;
        }
        
        document.getElementById('difficulty-comparison').innerHTML = diffText;
      }
      
      const now = new Date();
      document.getElementById('last-updated').textContent = now.toLocaleTimeString();

      // Reload Plotly charts
      loadPlotlyCharts();
    }
  } catch (error) {
    console.error('Error updating dashboard:', error);
  }
}


// Plotly Chart Rendering Functions
async function loadPlotlyCharts() {

  try {
    // Load funnel chart
    const funnelResponse = await fetch(`${API_BASE_URL}/api/funnel_chart?experiment_id=${EXPERIMENT_ID}`);
    if (funnelResponse.ok) {
      const funnelData = await funnelResponse.json();
      if (funnelData.status === 'success') {
        const funnelJson = JSON.parse(funnelData.chart);
        Plotly.newPlot('funnel-chart', funnelJson.data, funnelJson.layout, {responsive: true});
      }
    }
    
    // Load time distribution
    const timeResponse = await fetch(`${API_BASE_URL}/api/time_distribution?experiment_id=${EXPERIMENT_ID}`);
    if (timeResponse.ok) {
      const timeData = await timeResponse.json();
      if (timeData.status === 'success') {
        const timeJson = JSON.parse(timeData.chart);
        Plotly.newPlot('time-distribution-chart', timeJson.data, timeJson.layout, {responsive: true});
      }
    }
    
    // Load comparison charts
    const compResponse = await fetch(`${API_BASE_URL}/api/comparison_charts?experiment_id=${EXPERIMENT_ID}`);
    if (compResponse.ok) {
      const compData = await compResponse.json();
      if (compData.status === 'success') {
        const successJson = JSON.parse(compData.success_rate_chart);
        Plotly.newPlot('success-rate-chart', successJson.data, successJson.layout, {responsive: true});
        
        const timeJson = JSON.parse(compData.avg_time_chart);
        Plotly.newPlot('avg-time-chart', timeJson.data, timeJson.layout, {responsive: true});
      }
    }
  } catch (error) {
    console.error('Error loading Plotly charts:', error);
  }
}