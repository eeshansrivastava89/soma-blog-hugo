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
        
        # Build the event object with all fields
        event_data = {
            "experiment_id": data.get("experiment_id"),
            "user_id": data.get("user_id"),
            "variant": data.get("variant"),
            "converted": data.get("converted"),
            "timestamp": datetime.utcnow().isoformat(),
            "action_type": data.get("action_type"),
            "completion_time": data.get("completion_time"),
            "success": data.get("success"),
            "correct_words_count": data.get("correct_words_count"),
            "total_guesses_count": data.get("total_guesses_count"),
            "metadata": data.get("metadata")
        }
        
        # Remove None values
        event_data = {k: v for k, v in event_data.items() if v is not None}
        
        response = supabase.table("events").insert(event_data).execute()
        
        return {"status": "success", "data": response.data}
    
    except Exception as e:
        import traceback
        print(traceback.format_exc())
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
        
        if not events or len(events) == 0:
            return {"status": "error", "message": "No events found"}
        
        df = pd.DataFrame(events)
        # Convert to native Python bool
        df['converted'] = df['converted'].astype(bool).apply(bool)
        
        variant_a = df[df['variant'] == 'A']
        variant_b = df[df['variant'] == 'B']
        
        a_conversions = int(variant_a['converted'].sum())
        b_conversions = int(variant_b['converted'].sum())
        a_total = len(variant_a)
        b_total = len(variant_b)
        
        if a_total == 0 or b_total == 0:
            return {"status": "error", "message": "Need data from both variants"}
        
        a_rate = float(a_conversions) / float(a_total)
        b_rate = float(b_conversions) / float(b_total)
        
        p_value = None
        significant = False
        
        if a_total >= 5 and b_total >= 5:
            contingency = [[int(a_conversions), int(a_total - a_conversions)],
                           [int(b_conversions), int(b_total - b_conversions)]]
            chi2, p_value, dof, expected = scipy_stats.chi2_contingency(contingency)
            significant = bool(p_value < 0.05)
        
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
        prob_b_better = float((b_samples > a_samples).mean())
        
        # Calculate average completion times
        a_completed = variant_a[variant_a['action_type'] == 'completed']
        b_completed = variant_b[variant_b['action_type'] == 'completed']
        
        a_avg_time = None
        b_avg_time = None
        
        if len(a_completed) > 0 and 'completion_time' in a_completed.columns:
            a_times = a_completed['completion_time'].dropna()
            if len(a_times) > 0:
                a_avg_time = float(a_times.mean())
        
        if len(b_completed) > 0 and 'completion_time' in b_completed.columns:
            b_times = b_completed['completion_time'].dropna()
            if len(b_times) > 0:
                b_avg_time = float(b_times.mean())
        
        return {
            "status": "success",
            "variant_a": {
                "n_users": int(a_total),
                "conversions": int(a_conversions),
                "conversion_rate": round(a_rate, 4),
                "credible_interval": [round(float(x), 4) for x in a_ci],
                "avg_completion_time": round(a_avg_time, 2) if a_avg_time else None
            },
            "variant_b": {
                "n_users": int(b_total),
                "conversions": int(b_conversions),
                "conversion_rate": round(b_rate, 4),
                "credible_interval": [round(float(x), 4) for x in b_ci],
                "avg_completion_time": round(b_avg_time, 2) if b_avg_time else None
            },
            "frequentist": {
                "p_value": round(float(p_value), 4) if p_value else None,
                "significant": significant
            },
            "bayesian": {
                "prob_b_better": round(prob_b_better, 4)
            }
        }
    
    except Exception as e:
        import traceback
        print(traceback.format_exc())
        return {"status": "error", "message": str(e)}