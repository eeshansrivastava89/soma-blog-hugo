---
title: "A/B Testing Simulator"
description: "Interactive A/B test with real-time Bayesian and Frequentist statistics"
date: 2025-10-17
draft: false
---

Welcome! This is an interactive simulator where you can see A/B testing and statistical analysis in action.

## Section 1: Word Search Challenge

<div id="puzzle-section" class="simulator-section">
  
  <div class="puzzle-layout">
    <!-- Left Column: Header + Letter Grid -->
    <div class="puzzle-left">
      <div style="text-align: center; margin-bottom: 0.75rem; width: 100%;">
        <div style="display: inline-flex; align-items: center; gap: 0.4rem; margin-bottom: 0.5rem;">
          <span style="font-size: 1.25rem;">🎯</span>
          <h3 style="margin: 0; color: #1f2937; font-size: 1rem;">Your Challenge</h3>
        </div>
        <div style="display: flex; flex-direction: column; gap: 0.25rem; align-items: center;">
          <p style="margin: 0; font-size: 0.85rem; color: #6b7280;">
            Variant: <strong id="user-variant" style="color: #10b981;">Loading...</strong>
          </p>
          <p style="margin: 0; font-size: 1.1rem; font-weight: 700; color: #1f2937;">
            <span id="user-username">Loading...</span>
          </p>
          <p id="difficulty-display" style="margin: 0; font-size: 0.8rem; color: #9ca3af; font-style: italic;"></p>
        </div>
      </div>
      <div id="letter-grid" class="letter-grid"></div>
    </div>
    <!-- Right Column: Controls -->
    <div class="puzzle-right">
      <div style="text-align: center;">
        <p style="margin: 0 0 0.5rem 0; font-size: 0.9rem; font-weight: 600; color: #4b5563;">
          📋 Find <span id="target-word-count" style="color: #10b981;">0</span> words
        </p>
        <p id="timer" style="font-size: 2.25rem; font-weight: 800; color: #3b82f6; font-family: 'SF Mono', 'Monaco', 'Courier New', monospace; margin: 0; letter-spacing: -0.05em; line-height: 1;">00:60:00</p>
      </div>
      <div style="display: flex; gap: 0.5rem;">
        <button id="start-button" class="puzzle-button" style="flex: 1; padding: 0.6rem; font-size: 0.95rem; font-weight: 600; background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); color: white; border: none; border-radius: 6px; cursor: pointer; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">▶ Start</button>
        <button id="reset-button" class="puzzle-button" style="flex: 1; padding: 0.6rem; font-size: 0.95rem; font-weight: 600; background: linear-gradient(135deg, #6b7280 0%, #4b5563 100%); color: white; border: none; border-radius: 6px; cursor: pointer; box-shadow: 0 2px 4px rgba(0,0,0,0.1); display: none;">↻ Reset</button>
      </div>
      <div style="border-top: 1px solid #e5e7eb; margin: 0.25rem 0;"></div>
      <div>
        <input type="text" id="word-input" placeholder="Type word..." style="display: none; padding: 0.65rem; width: 100%; font-size: 0.95rem; border: 2px solid #e5e7eb; border-radius: 6px; box-sizing: border-box; font-family: inherit;" onfocus="this.style.borderColor='#3b82f6'" onblur="this.style.borderColor='#e5e7eb'">
        <div id="guessed-words" style="margin-top: 0.5rem; min-height: 1.5rem;">
          <p style="font-size: 0.85rem; color: #6b7280; margin: 0;">
            <strong style="color: #1f2937;">Found:</strong> <span id="found-words-list" style="font-weight: 600; color: #10b981;">none yet</span>
          </p>
        </div>
      </div>
      <!-- Success message - ultra compact -->
      <div id="completion-message" style="display: none; margin-top: 0.5rem; padding: 0.85rem; background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%); border-radius: 8px; border-left: 4px solid #10b981;">
        <div style="text-align: center; line-height: 1.3;">
          <h4 style="color: #065f46; margin: 0 0 0.35rem 0; font-size: 1rem; font-weight: 700;">🎉 Complete!</h4>
          <p style="margin: 0.25rem 0; font-size: 0.9rem; color: #1f2937;">
            <strong style="color: #3b82f6; font-family: 'SF Mono', monospace; font-size: 1.05rem;" id="completion-time-display">--:--</strong>
            <span style="margin: 0 0.4rem; color: #9ca3af;">·</span>
            <span style="color: #6b7280; font-size: 0.85rem;"><strong id="completion-guesses">0</strong> guesses</span>
          </p>
          <p id="comparison-text" style="margin: 0.35rem 0 0 0; font-size: 0.8rem; color: #059669; font-weight: 600; line-height: 1.3;">Loading...</p>
          <div style="margin-top: 0.65rem; display: flex; gap: 0.4rem; justify-content: center;">
            <button id="try-again-button" style="padding: 0.5rem 1rem; font-size: 0.85rem; background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: 600;">🔄 Again</button>
            <a href="#dashboard-section" style="padding: 0.5rem 1rem; font-size: 0.85rem; background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); color: white; text-decoration: none; border-radius: 6px; font-weight: 600; display: inline-block;">📊 Stats</a>
          </div>
        </div>
      </div>
      <!-- Failure message - ultra compact -->
      <div id="failure-message" style="display: none; margin-top: 0.5rem; padding: 0.85rem; background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%); border-radius: 8px; border-left: 4px solid #ef4444;">
        <div style="text-align: center; line-height: 1.3;">
          <h4 style="color: #991b1b; margin: 0 0 0.35rem 0; font-size: 1rem; font-weight: 700;">⏱️ Time's Up!</h4>
          <p style="margin: 0.25rem 0; font-size: 0.85rem; color: #1f2937;">
            Found <strong style="color: #10b981;" id="failure-words-found">0</strong>/<strong id="failure-words-total">0</strong>
          </p>
          <div style="margin-top: 0.65rem;">
            <button id="try-again-failure-button" style="padding: 0.5rem 1rem; font-size: 0.85rem; background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: 600;">🔄 Try Again</button>
          </div>
        </div>
      </div>
    </div>
  </div>
  
  <!-- Leaderboard - compact, show top 5 by default -->
  <div id="leaderboard-display" class="leaderboard-card">
    <h3>🏆 Top Players</h3>
    <div id="leaderboard-list">
      <p style="text-align: center; color: #9ca3af; font-style: italic; font-size: 0.85rem; margin: 0;">Complete a challenge to appear here</p>
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
  
  <h4 style="margin-top: 2rem;">Difficulty Analysis</h4>
  <div style="padding: 1rem; background-color: #fff; border: 1px solid #e0e0e0; border-radius: 4px; margin-bottom: 1rem;">
    <p id="difficulty-comparison" style="margin: 0; color: #333; font-size: 0.95rem;">Loading difficulty analysis...</p>
  </div>
  
  <h4 style="margin-top: 2rem;">Interactive Visualizations</h4>
  
  <!-- Funnel Chart -->
  <div id="funnel-chart" style="width: 100%; height: 450px; background-color: #fff; border: 1px solid #e0e0e0; border-radius: 4px; margin-bottom: 1rem;"></div>
  
  <!-- Time Distribution -->
  <div id="time-distribution-chart" style="width: 100%; height: 450px; background-color: #fff; border: 1px solid #e0e0e0; border-radius: 4px; margin-bottom: 1rem;"></div>
  
  <!-- Comparison Charts -->
  <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1rem;">
    <div id="success-rate-chart" style="width: 100%; height: 400px; background-color: #fff; border: 1px solid #e0e0e0; border-radius: 4px;"></div>
    <div id="avg-time-chart" style="width: 100%; height: 400px; background-color: #fff; border: 1px solid #e0e0e0; border-radius: 4px;"></div>
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

<link rel="stylesheet" href="/css/ab-simulator.css?v=1.3">
<script src="https://cdn.plot.ly/plotly-2.27.0.min.js"></script>
<script src="/js/ab-simulator.js?v=1.3"></script>