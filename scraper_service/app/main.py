from fastapi import FastAPI, HTTPException
import asyncio
from app.browser_pool import BrowserPool
from app.scrapers.daraz import scrape_daraz



app = FastAPI()
browser_pool = BrowserPool(size=2)

@app.on_event("startup")
async def startup():
    await browser_pool.start()

@app.on_event("shutdown")
async def shutdown():
    await browser_pool.shutdown()

@app.post("/scrape")
async def scrape_products(payload: dict):
    print(payload)
    country = payload["countryCode"]
    product = payload["productType"]
    min_price = int(payload["minPrice"])
    max_price = int(payload["maxPrice"])

    browser = await browser_pool.acquire()
    try:
        pages = await asyncio.gather(
            browser.new_page(),
            browser.new_page()
        )

        tasks = []

        if country == "PK":
            tasks.append(scrape_daraz(pages[0], product, min_price, max_price))

        results = await asyncio.gather(*tasks)
        products = [item for sublist in results for item in sublist]

        return {
            "count": len(products),
            "products": products
        }

    finally:
        await browser_pool.release(browser)
