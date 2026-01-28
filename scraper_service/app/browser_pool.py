import asyncio
import sys
from playwright.async_api import async_playwright


class BrowserPool:
    def __init__(self, size=2):
        self.size = size
        self._queue = asyncio.Queue(maxsize=size)
        self.playwright = None

    async def start(self):
        self.playwright = await async_playwright().start()
        for _ in range(self.size):
            browser = await self.playwright.chromium.launch(headless=True)
            await self._queue.put(browser)

    async def acquire(self):
        return await self._queue.get()

    async def release(self, browser):
        await self._queue.put(browser)

    async def shutdown(self):
        while not self._queue.empty():
            browser = await self._queue.get()
            await browser.close()
        await self.playwright.stop()
