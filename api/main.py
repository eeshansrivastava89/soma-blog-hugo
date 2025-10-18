from fastapi import FastAPI, Request, Query
from fastapi.middleware.cors import CORSMiddleware
from supabase import create_client, Client
import os
from datetime import datetime
import pandas as pd
from scipy import stats as scipy_stats
import numpy as np
from dotenv import load_dotenv

load_dotenv()

app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/api/track")
async def track_event(request: Request):
    """Track user conversion event"""
    try:
        SUPABASE_URL = os.environ.get("SUPABASE_URL")
        SUPABASE_KEY = os.environ.get("SUPABASE_KEY")
        supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
        
        data = await request.json()
        
        response = supabase.table("events").insert({
            "experiment_id": data.get("experiment_id"),
            "user_id": data.get("user_id"),
            "variant": data.get("variant"),
            "converted": data.get("converted"),
            "timestamp": datetime.utcnow().isoformat()
        }).execute()
        
        return {"status": "success", "data": response.data}
    
    except Exception as e:
        return {"status": "error", "message": str(e)}

@app.get("/api/stats")
async def get_stats(experiment_id: str = Query(...)):
    """Get experiment statistics"""
    try:
        SUPABASE_URL = os.environ.get("SUPABASE_URL")
        SUPABASE_KEY = os.environ.get("SUPABASE_KEY")
        supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
        
        response = supabase.table("events").select("*").eq("experiment_id", experiment_id).execute()
        events = response.data
        
        if not events:
            return {"status": "error", "message": "No events found"}
        
        df = pd.DataFrame(events)
        
        variant_a = df[df['variant'] == 'A']
        variant_b = df[df['variant'] == 'B']
        
        a_conversions = variant_a['converted'].sum()
        b_conversions = variant_b['converted'].sum()
        a_total = len(variant_a)
        b_total = len(variant_b)
        
        a_rate = a_conversions / a_total if a_total > 0 else 0
        b_rate = b_conversions / b_total if b_total > 0 else 0
        
        p_value = None
        significant = False
        
        if a_total >= 5 and b_total >= 5:
            try:
                contingency = [[a_conversions, a_total - a_conversions],
                               [b_conversions, b_total - b_conversions]]
                chi2, p_value, dof, expected = scipy_stats.chi2_contingency(contingency)
                significant = p_value < 0.05
            except:
                p_value = None
        
        alpha, beta = 1, 1
        a_alpha = alpha + a_conversions
        a_beta = beta + (a_total - a_conversions)
        b_alpha = alpha + b_conversions
        b_beta = beta + (b_total - b_conversions)
        
        a_ci = scipy_stats.beta.ppf([0.025, 0.975], a_alpha, a_beta).tolist()
        b_ci = scipy_stats.beta.ppf([0.025, 0.975], b_alpha, b_beta).tolist()
        
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
                "p_value": round(p_value, 4) if p_value else None,
                "significant": significant
            },
            "bayesian": {
                "prob_b_better": round(prob_b_better, 4)
            }
        }
    
    except Exception as e:
        return {"status": "error", "message": str(e)}