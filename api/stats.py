from fastapi import FastAPI, Query
from supabase import create_client, Client
import os
import pandas as pd
from scipy import stats as scipy_stats
import numpy as np

app = FastAPI()

# Initialize Supabase
SUPABASE_URL = os.environ.get("SUPABASE_URL")
SUPABASE_KEY = os.environ.get("SUPABASE_KEY")
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

@app.get("/api/stats")
async def get_stats(experiment_id: str = Query(...)):
    """
    Get experiment statistics with Bayesian and Frequentist analysis
    """
    try:
        # Fetch all events for this experiment
        response = supabase.table("events").select("*").eq("experiment_id", experiment_id).execute()
        events = response.data
        
        if not events:
            return {"status": "error", "message": "No events found"}
        
        # Convert to pandas dataframe
        df = pd.DataFrame(events)
        
        # Split by variant
        variant_a = df[df['variant'] == 'A']
        variant_b = df[df['variant'] == 'B']
        
        a_conversions = variant_a['converted'].sum()
        b_conversions = variant_b['converted'].sum()
        a_total = len(variant_a)
        b_total = len(variant_b)
        
        a_rate = a_conversions / a_total if a_total > 0 else 0
        b_rate = b_conversions / b_total if b_total > 0 else 0
        
        # Frequentist: Chi-square test
        contingency = [[a_conversions, a_total - a_conversions],
                       [b_conversions, b_total - b_conversions]]
        chi2, p_value, dof, expected = scipy_stats.chi2_contingency(contingency)
        
        # Bayesian: Beta-Binomial credible intervals
        alpha, beta = 1, 1  # Uniform priors
        a_alpha = alpha + a_conversions
        a_beta = beta + (a_total - a_conversions)
        b_alpha = alpha + b_conversions
        b_beta = beta + (b_total - b_conversions)
        
        # 95% credible intervals
        a_ci = scipy_stats.beta.ppf([0.025, 0.975], a_alpha, a_beta).tolist()
        b_ci = scipy_stats.beta.ppf([0.025, 0.975], b_alpha, b_beta).tolist()
        
        # Probability that B is better than A
        # Simulate from posteriors
        np.random.seed(42)
        a_samples = np.random.beta(a_alpha, a_beta, 10000)
        b_samples = np.random.beta(b_alpha, b_beta, 10000)
        prob_b_better = (b_samples > a_samples).mean()
        
        return {
            "status": "success",
            "variant_a": {
                "n_users": int(a_total),
                "conversions": int(a_conversions),
                "conversion_rate": round(a_rate, 4),
                "credible_interval": [round(x, 4) for x in a_ci]
            },
            "variant_b": {
                "n_users": int(b_total),
                "conversions": int(b_conversions),
                "conversion_rate": round(b_rate, 4),
                "credible_interval": [round(x, 4) for x in b_ci]
            },
            "frequentist": {
                "p_value": round(p_value, 4),
                "significant": p_value < 0.05
            },
            "bayesian": {
                "prob_b_better": round(prob_b_better, 4)
            }
        }
    
    except Exception as e:
        return {"status": "error", "message": str(e)}