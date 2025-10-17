from fastapi import FastAPI, Request
from supabase import create_client, Client
import os
from datetime import datetime

app = FastAPI()

@app.post("/api/track")
async def track_event(request: Request):
    """
    Receive user event and store in database
    Expected body: {
        "experiment_id": "homepage-cta",
        "user_id": "abc123",
        "variant": "A",
        "converted": true
    }
    """
    try:
        # Initialize Supabase (moved inside function)
        SUPABASE_URL = os.environ.get("SUPABASE_URL")
        SUPABASE_KEY = os.environ.get("SUPABASE_KEY")
        supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
        
        data = await request.json()
        
        # Insert into events table
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