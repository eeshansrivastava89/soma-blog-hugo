---
title: "A/B Testing Simulator"
description: "Interactive A/B test with real-time Bayesian and Frequentist statistics"
date: 2025-10-17
draft: false
categories: ["projects"]
tags: ["ab-testing","posthog","streamlit","supabase","hypothesis testing"]
build:
  render: true
  list: true

rtwt:
  sidePane: false
---

Welcome! This is an interactive simulator where you can see A/B testing and statistical analysis in action. 

Complete this puzzle in 60 seconds where you will be "randomly" assigned in either Variant A and Variant B. One variant is harder than the other. We will do hypothesis testing to test that. 
* Primary KPI: Avg. Time to Complete
* Secondary KPI: Completion Rate (completed puzzles / started puzzles)

## Section 1: Word Search Challenge

{{< ab-simulator-puzzle >}}

## Section 2: Live Dashboard

{{< ab-simulator-dashboard >}}

## Section 3: Python Code

{{< ab-simulator-code >}}

## Section 4: Education

### Understanding the Results

#### Why Bayesian and Frequentist?

This simulator shows both approaches because they answer different questions:

- **Frequentist:** "If we repeated this experiment many times, how often would we see this difference by chance?"
- **Bayesian:** "Given what we've observed, what's the probability that B is actually better than A?"

#### What Are Credible Intervals?

The 95% credible interval means: "We're 95% confident the true value is in this range."

<link rel="stylesheet" href="/css/ab-simulator.css?v=1.15">
<script src="/js/ab-simulator.js?v=1.15"></script>

