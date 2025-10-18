from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from supabase import create_client, Client
import os
from datetime import datetime

app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/api/track")
async def track_event(request: Request):
    """
    Receive user event and store in database
    Expected body: {
        "experiment_id": "83cac599-f4bb-4d68-8b12-04458801a22b",
        "user_id": "abc123",
        "variant": "A",
        "converted": true
    }
    """
    try:
        # Initialize Supabase
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