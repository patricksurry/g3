from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from random import gauss
from datetime import datetime, timezone

heading = 0

app = FastAPI()

# Serve panel.html from the panels folder, preventing CORS issues
app.mount("/panels", StaticFiles(directory="panels"), name="panels")

# Provide the metrics endpoint
@app.get("/metrics")
async def metrics(latest: int = 0, units: bool = False):
    global heading
    # randomly vary the heading
    heading += gauss(0, 2)

    # calculate time since midnight for the clock
    now = datetime.now(timezone.utc)
    seconds = (now - now.replace(hour=0, minute=0, second=0, microsecond=0)).total_seconds()

    return {
        "latest": 0,
        "units": {},
        "metrics": {
            "heading": heading,
            "time": seconds
        }
    }
