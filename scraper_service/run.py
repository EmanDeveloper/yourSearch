import sys
import os

# CRITICAL: Set Windows event loop policy BEFORE importing anything async-related
if sys.platform == 'win32':
    import asyncio
    asyncio.set_event_loop_policy(asyncio.WindowsProactorEventLoopPolicy())

if __name__ == "__main__":
    import uvicorn
    
    # NOTE: --reload is disabled on Windows due to Playwright subprocess compatibility
    # To update code, manually restart this process
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=4000
    )
