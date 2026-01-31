import asyncio
from playwright.async_api import async_playwright


class BrowserPool:
    """A pool of browser instances for concurrent scraping."""
    
    def __init__(self, size=2):
        self.size = size
        self._queue = asyncio.Queue(maxsize=size)
        self.playwright = None

    async def start(self):
        """Start the browser pool and launch browser instances."""
        self.playwright = await async_playwright().start()
        for _ in range(self.size):
            browser = await self.playwright.chromium.launch(headless=True)
            await self._queue.put(browser)

    async def acquire(self):
        """Acquire a browser from the pool."""
        return await self._queue.get()

    async def release(self, browser):
        """Release a browser back to the pool."""
        await self._queue.put(browser)

    async def shutdown(self):
        """Shutdown all browsers and stop playwright."""
        while not self._queue.empty():
            browser = await self._queue.get()
            await browser.close()
        if self.playwright:
            await self.playwright.stop()
