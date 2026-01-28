# app/scrapers/daraz.py
from playwright.async_api import Page
from app.utils import clean_price


async def scrape_daraz(page: Page, product_type: str, min_price: int, max_price: int):
    url = f"https://www.daraz.pk/catalog/?q={product_type}"
    await page.goto(url, wait_until="domcontentloaded")

    await page.wait_for_selector(".Bm3ON")

    products = await page.evaluate("""
        () => Array.from(document.querySelectorAll(".Bm3ON"))
          .slice(0, 10)
          .map(el => ({
              title: el.querySelector("img")?.getAttribute("alt"),
              price: Number(
                  el.querySelector(".ooOxS")?.textContent?.replace(/[^\\d]/g, "")
              ),
              source: "Daraz",
              currency: "PKR"
          }))
    """)

    return [
        p for p in products
        if p["price"] and min_price <= p["price"] <= max_price
    ]
