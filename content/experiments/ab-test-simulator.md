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
      <p id="timer" style="font-size: 2rem; font-weight: bold; color: #0066cc; font-family: monospace;">00:60:00</p>
      <button id="start-button" class="puzzle-button">▶ Start Challenge</button>
      <button id="reset-button" class="puzzle-button" style="display: none;">↻ Reset</button>
    </div>
    <div style="margin: 1rem 0;">
      <input type="text" id="word-input" placeholder="Type a 4-letter word and press Enter" style="display: none; padding: 8px; width: 100%; font-size: 1rem; border: 1px solid #ddd; border-radius: 4px;">
      <div id="guessed-words" style="margin-top: 1rem; min-height: 2rem;">
        <p style="font-size: 0.9rem; color: #666;">Found words: <span id="found-words-list" style="font-weight: bold;"></span></p>
      </div>
    </div>
    <!-- Success message -->
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
    <!-- Failure message (separate from completion message) -->
    <div id="failure-message" style="display: none; margin-top: 1.5rem; padding: 1.25rem; background: linear-gradient(135deg, #ffebee 0%, #ffcdd2 100%); border-radius: 8px; border-left: 4px solid #e53935;">
      <div style="text-align: center; line-height: 1.4;">
        <h4 style="color: #c62828; margin: 0 0 0.5rem 0; font-size: 1.1rem;">⏱️ Time's Up!</h4>
        <p style="margin: 0.25rem 0; font-size: 0.95rem; color: #333;">
          You found <strong id="failure-words-found">0</strong> out of <strong id="failure-words-total">0</strong> words in 60 seconds.
        </p>
        <p style="margin: 0.5rem 0; font-size: 0.9rem; color: #666;">Don't worry! Try again and beat the clock. 💪</p>
        <div style="margin-top: 0.75rem;">
          <button id="try-again-failure-button" class="compact-button" style="padding: 6px 14px; font-size: 0.85rem; background-color: #e53935; color: white; border: none; border-radius: 4px; cursor: pointer; font-weight: 600;">🔄 Try Again</button>
        </div>
      </div>
    </div>
  </div>
</div>


## Section 2: Live Dashboard

<div id="dashboard-section" class="simulator-section">
  <h3>Results (Live)</h3>
  
  <div style="margin-bottom: 1rem;">
    <button id="polling-toggle" style="padding: 8px 16px; background-color: #666; color: white; border: none; border-radius: 4px; cursor: pointer; font-weight: bold;">▶ Enable Live Refresh</button>
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
  
  <h4 style="margin-top: 2rem;">User Funnel</h4>
  <div class="funnel-container">
    <div class="funnel-variant">
      <h5>Variant A</h5>
      <div class="funnel-bar">
        <div class="funnel-label">Started</div>
        <div class="funnel-bar-fill" id="funnel-a-started" style="width: 0%; background-color: #3498db;">
          <span class="funnel-count">0</span>
        </div>
      </div>
      <div class="funnel-bar">
        <div class="funnel-label">Completed</div>
        <div class="funnel-bar-fill" id="funnel-a-completed" style="width: 0%; background-color: #27ae60;">
          <span class="funnel-count">0</span>
        </div>
      </div>
      <div class="funnel-bar">
        <div class="funnel-label">Repeated</div>
        <div class="funnel-bar-fill" id="funnel-a-repeated" style="width: 0%; background-color: #f39c12;">
          <span class="funnel-count">0</span>
        </div>
      </div>
      <p class="funnel-rates" id="funnel-a-rates">Completion: -% | Repeat: -%</p>
    </div>
    <!-- Funnel Visualization -->
    <div class="funnel-variant">
      <h5>Variant B</h5>
      <div class="funnel-bar">
        <div class="funnel-label">Started</div>
        <div class="funnel-bar-fill" id="funnel-b-started" style="width: 0%; background-color: #3498db;">
          <span class="funnel-count">0</span>
        </div>
      </div>
      <div class="funnel-bar">
        <div class="funnel-label">Completed</div>
        <div class="funnel-bar-fill" id="funnel-b-completed" style="width: 0%; background-color: #27ae60;">
          <span class="funnel-count">0</span>
        </div>
      </div>
      <div class="funnel-bar">
        <div class="funnel-label">Repeated</div>
        <div class="funnel-bar-fill" id="funnel-b-repeated" style="width: 0%; background-color: #f39c12;">
          <span class="funnel-count">0</span>
        </div>
      </div>
      <p class="funnel-rates" id="funnel-b-rates">Completion: -% | Repeat: -%</p>
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

<link rel="stylesheet" href="/css/ab-simulator.css?v=1.1">
<script src="/js/ab-simulator.js?v=1.1"></script>
