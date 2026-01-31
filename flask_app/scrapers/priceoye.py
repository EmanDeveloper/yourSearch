from playwright.async_api import Page


async def scrape_priceoye(page: Page, product_type: str, min_price: int, max_price: int):
    """
    Scrape products from PriceOye.pk
    
    Args:
        page: Playwright page instance
        product_type: Type of product to search (phone, laptop)
        min_price: Minimum price filter
        max_price: Maximum price filter
    
    Returns:
        List of products matching the criteria
    """
    # Use category URLs for better results
    if product_type == "phone":
        url = "https://priceoye.pk/mobiles"
    elif product_type == "laptop":
        url = "https://priceoye.pk/laptops"
    else:
        url = f"https://priceoye.pk/search?q={product_type}"
    
    print(f"PriceOye: Loading {url}")
    
    try:
        await page.goto(url, wait_until="domcontentloaded", timeout=30000)
    except Exception as e:
        print(f"PriceOye: Failed to load page - {e}")
        return []

    # Wait for page to load
    await page.wait_for_timeout(3000)
    
    # Debug: Print page title
    title = await page.title()
    print(f"PriceOye: Page title - {title}")

    # Get all product links and data
    products = await page.evaluate("""
        () => {
            const results = [];
            
            // Find all links that look like product links
            const allLinks = document.querySelectorAll('a[href*="/mobiles/"], a[href*="/laptops/"], a[href*="/product/"]');
            console.log("Found links:", allLinks.length);
            
            // Also try to find product containers
            const containers = document.querySelectorAll('[class*="product"], [class*="Product"], .card, .item');
            console.log("Found containers:", containers.length);
            
            // Process product containers
            containers.forEach(el => {
                const linkEl = el.querySelector('a[href*="/mobiles/"], a[href*="/laptops/"], a[href]');
                const imgEl = el.querySelector('img');
                
                // Find price - look for Rs or numbers
                const allText = el.innerText || '';
                const priceMatch = allText.match(/Rs\\.?\\s*([\\d,]+)/i) || allText.match(/([\\d,]{4,})/);
                let price = 0;
                if (priceMatch) {
                    price = parseInt(priceMatch[1].replace(/,/g, '')) || 0;
                }
                
                // Get title from various sources
                let title = '';
                const titleEl = el.querySelector('h1, h2, h3, h4, h5, h6, [class*="title"], [class*="name"], p');
                if (titleEl) {
                    title = titleEl.textContent.trim();
                } else if (imgEl && imgEl.alt) {
                    title = imgEl.alt;
                }
                
                // Get link
                let link = linkEl ? linkEl.href : null;
                
                // Get image
                let image = imgEl ? (imgEl.src || imgEl.getAttribute('data-src')) : null;
                
                if (title && link && price > 0) {
                    results.push({
                        title: title.substring(0, 100),
                        price: price,
                        image: image,
                        link: link,
                        source: "PriceOye",
                        currency: "PKR"
                    });
                }
            });
            
            // Deduplicate by link
            const seen = new Set();
            return results.filter(p => {
                if (seen.has(p.link)) return false;
                seen.add(p.link);
                return true;
            }).slice(0, 40);
        }
    """)
    
    print(f"PriceOye: Raw products found: {len(products)}")
    
    # Debug: Print first product if any
    if products and len(products) > 0:
        print(f"PriceOye: Sample product - {products[0]}")

    # Filter products by price range
    filtered = [
        p for p in products
        if p["price"] and min_price <= p["price"] <= max_price
    ]
    
    print(f"PriceOye: Filtered products (price {min_price}-{max_price}): {len(filtered)}")
    return filtered
