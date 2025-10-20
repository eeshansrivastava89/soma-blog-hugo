from fastapi import FastAPI, Request, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from supabase import create_client, Client
import os
from datetime import datetime
import pandas as pd
from scipy import stats as scipy_stats
import numpy as np
from dotenv import load_dotenv

# Auto-deploy check#2

load_dotenv()

app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://soma-blog-hugo-shy-bird-7985.fly.dev",
        "http://localhost:8080",
        "http://localhost:1313"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api/health")
async def health_check():
    """Health check endpoint for Render"""
    return {"status": "ok"}

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
    """Get experiment statistics using stats module"""
    try:
        SUPABASE_URL = os.environ.get("SUPABASE_URL")
        SUPABASE_KEY = os.environ.get("SUPABASE_KEY")
        supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
        
        try:
            from .stats import ExperimentStats
            from .visualizations import ExperimentVisualizations
        except ImportError:
            from stats import ExperimentStats
            from visualizations import ExperimentVisualizations
        
        # Create analyzer and get complete analysis
        analyzer = ExperimentStats(supabase, experiment_id)
        result = analyzer.get_complete_analysis()
        
        # Add backwards compatibility for old frontend code
        if result['status'] == 'success':
            # Keep the old format for funnel data
            result['variant_a']['funnel'] = {
                'started': result['variant_a']['n_started'],
                'completed': result['variant_a']['n_completed'],
                'repeated': result['variant_a']['n_repeated'],
                'completion_rate': round(result['variant_a']['completion_rate'], 1),
                'repeat_rate': round(result['variant_a']['repeat_rate'], 1)
            }
            
            result['variant_b']['funnel'] = {
                'started': result['variant_b']['n_started'],
                'completed': result['variant_b']['n_completed'],
                'repeated': result['variant_b']['n_repeated'],
                'completion_rate': round(result['variant_b']['completion_rate'], 1),
                'repeat_rate': round(result['variant_b']['repeat_rate'], 1)
            }
            
            # Add avg_completion_time for backwards compatibility
            if result['variant_a'].get('time_stats'):
                result['variant_a']['avg_completion_time'] = result['variant_a']['time_stats']['mean']
            
            if result['variant_b'].get('time_stats'):
                result['variant_b']['avg_completion_time'] = result['variant_b']['time_stats']['mean']
            
            # Keep old frequentist and bayesian format
            result['frequentist'] = {
                'p_value': result['statistical_tests'].get('success_rate', {}).get('p_value'),
                'significant': result['statistical_tests'].get('success_rate', {}).get('significant', False)
            }
            
            # Simple Bayesian placeholder (we can enhance this later)
            result['bayesian'] = {
                'prob_b_better': 0.5  # Placeholder
            }
        
        return result
    
    except Exception as e:
        import traceback
        print(traceback.format_exc())
        return {"status": "error", "message": str(e)}
    

@app.get("/api/user_percentile")
async def get_user_percentile(
    experiment_id: str = Query(...),
    user_time: float = Query(...),
    variant: str = Query(...)
):
    """Get user's percentile ranking"""
    try:
        SUPABASE_URL = os.environ.get("SUPABASE_URL")
        SUPABASE_KEY = os.environ.get("SUPABASE_KEY")
        supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
        
        # Import with compatibility
        try:
            from .stats import ExperimentStats
            from .visualizations import ExperimentVisualizations
        except ImportError:
            from stats import ExperimentStats
            from visualizations import ExperimentVisualizations
        
        analyzer = ExperimentStats(supabase, experiment_id)
        analyzer.load_data()
        
        percentile_data = analyzer.calculate_user_percentile(user_time, variant)
        
        if not percentile_data:
            return {"status": "error", "message": "Not enough data for percentile calculation"}
        
        return {
            "status": "success",
            **percentile_data
        }
    
    except Exception as e:
        import traceback
        print(traceback.format_exc())
        return {"status": "error", "message": str(e)}
    

@app.get("/api/funnel_chart")
async def get_funnel_chart(experiment_id: str = Query(...)):
    """Get Plotly funnel chart JSON"""
    try:
        SUPABASE_URL = os.environ.get("SUPABASE_URL")
        SUPABASE_KEY = os.environ.get("SUPABASE_KEY")
        supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
        
        # Import modules
        try:
            from .stats import ExperimentStats
            from .visualizations import ExperimentVisualizations
        except ImportError:
            from stats import ExperimentStats
            from visualizations import ExperimentVisualizations
        
        # Get data
        analyzer = ExperimentStats(supabase, experiment_id)
        result = analyzer.get_complete_analysis()
        
        if result['status'] != 'success':
            return {"status": "error", "message": "Not enough data"}
        
        # Create chart
        viz = ExperimentVisualizations()
        chart_json = viz.create_funnel_chart(
            result['variant_a'],
            result['variant_b']
        )
        
        return {
            "status": "success",
            "chart": chart_json
        }
    
    except Exception as e:
        import traceback
        print(traceback.format_exc())
        return {"status": "error", "message": str(e)}

@app.get("/api/time_distribution")
async def get_time_distribution(experiment_id: str = Query(...)):
    """Get Plotly time distribution histogram JSON"""
    try:
        SUPABASE_URL = os.environ.get("SUPABASE_URL")
        SUPABASE_KEY = os.environ.get("SUPABASE_KEY")
        supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
        
        # Import modules
        try:
            from .stats import ExperimentStats
            from .visualizations import ExperimentVisualizations
        except ImportError:
            from stats import ExperimentStats
            from visualizations import ExperimentVisualizations
        
        # Get data
        analyzer = ExperimentStats(supabase, experiment_id)
        analyzer.load_data()
        
        if analyzer.df is None or len(analyzer.df) == 0:
            return {"status": "error", "message": "No data available"}
        
        # Create chart
        viz = ExperimentVisualizations()
        chart_json = viz.create_time_distribution(analyzer.df)
        
        return {
            "status": "success",
            "chart": chart_json
        }
    
    except Exception as e:
        import traceback
        print(traceback.format_exc())
        return {"status": "error", "message": str(e)}

@app.get("/api/comparison_charts")
async def get_comparison_charts(experiment_id: str = Query(...)):
    """Get Plotly comparison charts (success rate and avg time) JSON"""
    try:
        SUPABASE_URL = os.environ.get("SUPABASE_URL")
        SUPABASE_KEY = os.environ.get("SUPABASE_KEY")
        supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
        
        # Import modules
        try:
            from .stats import ExperimentStats
            from .visualizations import ExperimentVisualizations
        except ImportError:
            from stats import ExperimentStats
            from visualizations import ExperimentVisualizations
        
        # Get data
        analyzer = ExperimentStats(supabase, experiment_id)
        result = analyzer.get_complete_analysis()
        
        if result['status'] != 'success':
            return {"status": "error", "message": "Not enough data"}
        
        # Create charts
        viz = ExperimentVisualizations()
        success_chart = viz.create_success_rate_comparison(
            result['variant_a'],
            result['variant_b']
        )
        time_chart = viz.create_avg_time_comparison(
            result['variant_a'],
            result['variant_b']
        )
        
        return {
            "status": "success",
            "success_rate_chart": success_chart,
            "avg_time_chart": time_chart
        }
    
    except Exception as e:
        import traceback
        print(traceback.format_exc())
        return {"status": "error", "message": str(e)}
