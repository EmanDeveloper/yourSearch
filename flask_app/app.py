from flask import Flask, render_template, request, jsonify
import asyncio
from playwright.async_api import async_playwright
from scrapers.daraz import scrape_daraz
from scrapers.priceoye import scrape_priceoye


app = Flask(__name__)


def run_async(coro):
    """Run an async coroutine in a new event loop."""
    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)
    try:
        return loop.run_until_complete(coro)
    finally:
        loop.close()


@app.route('/')
def index():
    """Render the main page."""
    return render_template('index.html')


@app.route('/api/scrape', methods=['POST'])
def scrape_products():
    """API endpoint to scrape products."""
    try:
        data = request.get_json()
        
        # Validate input
        country_code = data.get('countryCode')
        product_type = data.get('productType')
        min_price = data.get('minPrice')
        max_price = data.get('maxPrice')
        
        if not all([country_code, product_type, min_price, max_price]):
            return jsonify({'error': 'All fields are required'}), 400
        
        try:
            min_price = int(min_price)
            max_price = int(max_price)
        except ValueError:
            return jsonify({'error': 'Price must be a valid number'}), 400
        
        if min_price < 0 or max_price < 0:
            return jsonify({'error': 'Price cannot be negative'}), 400
        
        if min_price > max_price:
            return jsonify({'error': 'Min price cannot be greater than max price'}), 400
        
        # Run the async scraping function
        result = run_async(
            run_scraper(country_code, product_type, min_price, max_price)
        )
        
        return jsonify(result)
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500


async def run_scraper(country_code: str, product_type: str, min_price: int, max_price: int):
    """Run the scraper asynchronously."""
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        try:
            # Results grouped by source
            grouped_results = {}
            
            # Add scrapers based on country
            if country_code == "PK":
                # Create multiple pages for parallel scraping
                page1 = await browser.new_page()
                page2 = await browser.new_page()
                page3 = await browser.new_page()
                
                # Run all Pakistani scrapers in parallel (Daraz, PriceOye, OLX)
                results = await asyncio.gather(
                    scrape_daraz(page1, product_type, min_price, max_price),
                    scrape_priceoye(page2, product_type, min_price, max_price),
                    return_exceptions=True
                )
                
                # Close pages
                await page1.close()
                await page2.close()
                await page3.close()
                
                # Map results to sources
                sources = ["Daraz", "PriceOye", "OLX"]
                for i, result in enumerate(results):
                    source = sources[i]
                    if isinstance(result, list) and len(result) > 0:
                        # Sort by price within each source
                        result.sort(key=lambda x: x.get('price', 0))
                        grouped_results[source] = result
                        print(f"{source}: {len(result)} products found")
                    elif isinstance(result, Exception):
                        print(f"{source} error: {result}")
                    else:
                        print(f"{source}: No products found")
            
            # Calculate total count
            total_count = sum(len(products) for products in grouped_results.values())
            
            return {
                "count": total_count,
                "grouped": grouped_results
            }
        finally:
            await browser.close()


if __name__ == '__main__':
    app.run(debug=True, use_reloader=False, port=5000)
