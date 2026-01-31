from playwright.async_api import Page


async def scrape_daraz(page: Page, product_type: str, min_price: int, max_price: int):
    """
    Scrape products from Daraz Pakistan.
    
    Args:
        page: Playwright page instance
        product_type: Type of product to search (phone, laptop)
        min_price: Minimum price filter
        max_price: Maximum price filter
    
    Returns:
        List of products matching the criteria
    """
    url = f"https://www.daraz.pk/catalog/?q={product_type}"
    
    try:
        await page.goto(url, wait_until="networkidle", timeout=30000)
    except Exception as e:
        print(f"Daraz: Failed to load page - {e}")
        return []

    await page.wait_for_timeout(2000)

    try:
        await page.wait_for_selector(".Bm3ON, [data-qa-locator='product-item']", timeout=10000)
    except:
        print("Daraz: No products found")
        return []

    products = await page.evaluate("""
        () => {
            const items = document.querySelectorAll(".Bm3ON, [data-qa-locator='product-item']");
            console.log("Daraz found items:", items.length);
            
            return Array.from(items).slice(0, 40).map(el => {
                const linkEl = el.querySelector("a");
                const imgEl = el.querySelector("img");
                const priceEl = el.querySelector(".ooOxS, [class*='price'], span[class*='Price']");
                
                let priceText = priceEl ? priceEl.textContent : "";
                let price = parseInt(priceText.replace(/[^0-9]/g, "")) || 0;
                
                return {
                    title: imgEl ? imgEl.getAttribute("alt") : "",
                    price: price,
                    image: imgEl ? imgEl.getAttribute("src") : null,
                    link: linkEl ? linkEl.href : null,
                    source: "Daraz",
                    currency: "PKR"
                }
            });
        }
    """)
    
    print(f"Daraz: Raw products found: {len(products)}")

    # Filter products by price range
    filtered = [
        p for p in products
        if p["price"] and min_price <= p["price"] <= max_price and p["link"]
    ]
    
    print(f"Daraz: Filtered products: {len(filtered)}")
    return filtered
