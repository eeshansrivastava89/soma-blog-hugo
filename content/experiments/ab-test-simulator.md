---
title: "A/B Testing Simulator"
description: "Interactive A/B test with real-time Bayesian and Frequentist statistics"
date: 2025-10-17
draft: false
---

# A/B Testing Simulator

Welcome! This is an interactive simulator where you can see A/B testing and statistical analysis in action.

## Section 1: Your Variant

<div id="variant-section" class="simulator-section">
  <h3>Your Assigned Variant</h3>
  <p>You are in: <strong id="user-variant">Loading...</strong></p>
  
  <button id="cta-button" class="cta-button">Loading...</button>
  
  <p id="status" class="status-message"></p>
</div>

## Section 2: Live Dashboard

<div id="dashboard-section" class="simulator-section">
  <h3>Results (Live)</h3>
  
  <div class="dashboard">
    <div class="variant-stats">
      <h4>Variant A</h4>
      <p>Users: <strong id="variant-a-users">0</strong></p>
      <p>Conversions: <strong id="variant-a-conversions">0</strong></p>
      <p>Rate: <strong id="variant-a-rate">0%</strong></p>
      <p>95% CI: <strong id="variant-a-ci">[-, -]</strong></p>
    </div>
    <div class="variant-stats">
      <h4>Variant B</h4>
      <p>Users: <strong id="variant-b-users">0</strong></p>
      <p>Conversions: <strong id="variant-b-conversions">0</strong></p>
      <p>Rate: <strong id="variant-b-rate">0%</strong></p>
      <p>95% CI: <strong id="variant-b-ci">[-, -]</strong></p>
    </div>
  </div>
  
  <div class="significance">
    <h4>Statistical Significance</h4>
    <p>p-value: <strong id="p-value">-</strong></p>
    <p>Prob(B > A): <strong id="prob-b-better">-</strong></p>
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
  <p>The 95% credible interval [10%, 14%] means: "We're 95% confident the true conversion rate is between 10% and 14%."</p>
  
  <h4>What Does p-value Mean?</h4>
  <p>A p-value of 0.047 means: "There's a 4.7% chance we'd see this difference if both variants were actually the same."</p>
  
  <h4>Common Mistakes</h4>
  <ul>
    <li>❌ Peeking at results before reaching target sample size</li>
    <li>❌ Stopping early because one variant is winning</li>
    <li>❌ Running multiple tests without correcting for them</li>
    <li>✅ Planning sample size before the test</li>
    <li>✅ Running tests for the full planned duration</li>
  </ul>
</div>

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

.cta-button {
  padding: 12px 24px;
  font-size: 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  margin: 1rem 0;
  font-weight: bold;
  background-color: #0066cc;
  color: white;
}

.cta-button:hover {
  background-color: #0052a3;
}

.status-message {
  color: #27ae60;
  font-weight: bold;
  margin-top: 0.5rem;
}

.significance {
  border-top: 1px solid #ddd;
  margin-top: 1rem;
  padding-top: 1rem;
}

.last-updated {
  font-size: 0.9rem;
  color: #999;
  text-align: right;
}

pre {
  background-color: #2b2b2b;
  color: #f8f8f2;
  padding: 1rem;
  border-radius: 4px;
  overflow-x: auto;
}

code {
  color: #f8f8f2;
}

@media (max-width: 768px) {
  .dashboard {
    grid-template-columns: 1fr;
  }
}
</style>