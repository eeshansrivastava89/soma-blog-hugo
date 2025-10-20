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
  setupPollingToggle();
  loadPlotlyCharts(); // Load charts on page load
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
  updateLeaderboard(puzzleState.completionTime);
  
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

  // Hide leaderboard
  const leaderboardDiv = document.getElementById('leaderboard-display');
  if (leaderboardDiv) {
    leaderboardDiv.style.display = 'none';
  }
  
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
    
    const apiUrl = window.location.hostname === 'localhost' 
      ? 'http://localhost:8000/api/track'
      : '/api/track';
    
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

async function trackFailure() {
  try {
    const variant = puzzleState.variant;
    const userId = localStorage.getItem('simulator_user_id');
    
    const apiUrl = window.location.hostname === 'localhost' 
      ? 'http://localhost:8000/api/track'
      : '/api/track';
    
    const response = await fetch(apiUrl, {
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
    
    const apiUrl = window.location.hostname === 'localhost' 
      ? 'http://localhost:8000/api/track'
      : '/api/track';
    
    const response = await fetch(apiUrl, {
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
    
    const apiUrl = window.location.hostname === 'localhost' 
      ? 'http://localhost:8000/api/track'
      : '/api/track';
    
    const response = await fetch(apiUrl, {
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
    const apiUrl = window.location.hostname === 'localhost' 
      ? 'http://localhost:8000/api/stats?experiment_id=' + EXPERIMENT_ID
      : '/api/stats?experiment_id=' + EXPERIMENT_ID;
    
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

function updateLeaderboard(completionTime) {
  const username = localStorage.getItem('simulator_username');
  const variant = puzzleState.variant;
  
  // Get existing leaderboard or create new one
  let leaderboard = JSON.parse(localStorage.getItem('leaderboard') || '[]');
  
  const newTime = completionTime / 1000;
  
  // Check if user already has a best score
  const userBestIndex = leaderboard.findIndex(entry => entry.username === username);
  
  let isPersonalBest = false;
  
  if (userBestIndex !== -1) {
    // User exists - only update if new time is better (faster)
    const oldBestTime = leaderboard[userBestIndex].time;
    if (newTime < oldBestTime) {
      leaderboard[userBestIndex].time = newTime;
      leaderboard[userBestIndex].variant = variant;
      leaderboard[userBestIndex].timestamp = Date.now();
      isPersonalBest = true; // Beat previous best
    }
    // If slower, don't update and don't mark as personal best
  } else {
    // New user - add to leaderboard
    leaderboard.push({
      username: username,
      time: newTime,
      variant: variant,
      timestamp: Date.now()
    });
    isPersonalBest = true; // First time completing
  }
  
  // Store in puzzleState for display
  puzzleState.isPersonalBest = isPersonalBest;
  
  // Sort by time (fastest first)
  leaderboard.sort((a, b) => a.time - b.time);
  
  // Keep only top 50
  leaderboard = leaderboard.slice(0, 50);
  
  // Save back to localStorage
  localStorage.setItem('leaderboard', JSON.stringify(leaderboard));
  
  // Display leaderboard
  displayLeaderboard(newTime);
}

function displayLeaderboard(currentAttemptTime = null) {
  const leaderboard = JSON.parse(localStorage.getItem('leaderboard') || '[]');
  const username = localStorage.getItem('simulator_username');
  
  if (leaderboard.length === 0) {
    return; // No data yet
  }
  
  // Get top 10
  const top10 = leaderboard.slice(0, 10);
  
  let html = '<div style="margin-top: 2rem; padding: 1.5rem; background-color: #f0f0f0; border-radius: 8px;">';
  html += '<h4 style="margin: 0 0 1rem 0; color: #333;">🏆 Leaderboard (Top 10)</h4>';
  html += '<div style="font-size: 0.9rem;">';
  
  top10.forEach((entry, index) => {
    const isCurrentUser = entry.username === username;
    const bgColor = isCurrentUser ? '#fff3cd' : 'white';
    const fontWeight = isCurrentUser ? 'bold' : 'normal';
    
    html += `<div style="display: flex; justify-content: space-between; padding: 0.5rem; margin-bottom: 0.25rem; background-color: ${bgColor}; border-radius: 4px; font-weight: ${fontWeight};">`;
    html += `<span>${index + 1}. ${entry.username}</span>`;
    html += `<span>${entry.time.toFixed(2)}s (${entry.variant})</span>`;
    html += `</div>`;
  });
  
  html += '</div></div>';  

  html += '</div>';
  
  html += '</div>';
  
  // Always show current attempt info
  const userEntry = leaderboard.find(entry => entry.username === username);
  if (userEntry) {
    const userPosition = leaderboard.findIndex(entry => entry.username === username) + 1;
    //const currentAttemptTime = puzzleState.completionTime / 1000; // Current attempt
    
    // Show current attempt if it's different from best (and user is in top 10)
    if (userPosition <= 10 && currentAttemptTime !== userEntry.time) {
      html += '<div style="margin-top: 1rem; padding-top: 1rem; border-top: 2px dashed #ccc;">';
      html += '<p style="font-size: 0.85rem; color: #666; margin-bottom: 0.5rem;">This Attempt:</p>';
      html += `<div style="display: flex; justify-content: space-between; padding: 0.5rem; background-color: #f0f0f0; border-radius: 4px;">`;
      html += `<span>${username}</span>`;
      html += `<span>${currentAttemptTime.toFixed(2)}s (${puzzleState.variant})</span>`;
      html += `</div>`;
      html += '<p style="font-size: 0.8rem; color: #999; margin-top: 0.25rem;">Your best: #' + userPosition + ' - ' + userEntry.time.toFixed(2) + 's</p>';
      html += '</div>';
    }
    
    // Show position if outside top 10
    if (userPosition > 10) {
      html += '<div style="margin-top: 1rem; padding-top: 1rem; border-top: 2px dashed #ccc;">';
      html += '<p style="font-size: 0.85rem; color: #666; margin-bottom: 0.5rem;">Your Position:</p>';
      html += `<div style="display: flex; justify-content: space-between; padding: 0.5rem; background-color: #fff3cd; border-radius: 4px; font-weight: bold;">`;
      html += `<span>${userPosition}. ${userEntry.username}</span>`;
      html += `<span>${userEntry.time.toFixed(2)}s (${userEntry.variant})</span>`;
      html += `</div>`;
      html += '</div>';
    }
  }
  
  html += '</div>';

  // Insert after completion message
  const completionMsg = document.getElementById('completion-message');
  let leaderboardDiv = document.getElementById('leaderboard-display');
  
  if (!leaderboardDiv) {
    leaderboardDiv = document.createElement('div');
    leaderboardDiv.id = 'leaderboard-display';
    completionMsg.parentNode.insertBefore(leaderboardDiv, completionMsg.nextSibling);
  }
  
  leaderboardDiv.innerHTML = html;
  leaderboardDiv.style.display = 'block';
}

async function fetchUserPercentile() {
  try {
    const userTime = puzzleState.completionTime / 1000; // convert to seconds
    const variant = puzzleState.variant;
    
    const apiUrl = window.location.hostname === 'localhost' 
      ? `http://localhost:8000/api/user_percentile?experiment_id=${EXPERIMENT_ID}&user_time=${userTime}&variant=${variant}`
      : `/api/user_percentile?experiment_id=${EXPERIMENT_ID}&user_time=${userTime}&variant=${variant}`;
    
    const response = await fetch(apiUrl);
    
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
      : '/api/stats?experiment_id=' + EXPERIMENT_ID;
    
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
  const apiBase = window.location.hostname === 'localhost' 
    ? 'http://localhost:8000'
    : '';
  
  try {
    // Load funnel chart
    const funnelResponse = await fetch(`${apiBase}/api/funnel_chart?experiment_id=${EXPERIMENT_ID}`);
    if (funnelResponse.ok) {
      const funnelData = await funnelResponse.json();
      if (funnelData.status === 'success') {
        const funnelJson = JSON.parse(funnelData.chart);
        Plotly.newPlot('funnel-chart', funnelJson.data, funnelJson.layout, {responsive: true});
      }
    }
    
    // Load time distribution
    const timeResponse = await fetch(`${apiBase}/api/time_distribution?experiment_id=${EXPERIMENT_ID}`);
    if (timeResponse.ok) {
      const timeData = await timeResponse.json();
      if (timeData.status === 'success') {
        const timeJson = JSON.parse(timeData.chart);
        Plotly.newPlot('time-distribution-chart', timeJson.data, timeJson.layout, {responsive: true});
      }
    }
    
    // Load comparison charts
    const compResponse = await fetch(`${apiBase}/api/comparison_charts?experiment_id=${EXPERIMENT_ID}`);
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