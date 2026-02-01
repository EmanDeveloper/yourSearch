from flask import Flask, render_template, request, jsonify
import asyncio
from playwright.async_api import async_playwright
from scrapers.daraz import scrape_daraz
from scrapers.priceoye import scrape_priceoye
from database import db, ProductDatabase
from apscheduler.schedulers.background import BackgroundScheduler
import atexit


app = Flask(__name__)

# Background scheduler for automatic data refresh
scheduler = BackgroundScheduler()


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
    """
    API endpoint to get products.
    First checks MongoDB cache, falls back to scraping if needed.
    """
    try:
        data = request.get_json()
        
        # Validate input
        country_code = data.get('countryCode')
        product_type = data.get('productType')
        min_price = data.get('minPrice')
        max_price = data.get('maxPrice')
        force_refresh = data.get('forceRefresh', False)
        
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
        
        # Try to get from cache first (unless force refresh requested)
        if not force_refresh:
            cached_result = db.get_cached_products(
                country_code, product_type, min_price, max_price
            )
            if cached_result and cached_result.get('count', 0) > 0:
                print(f"✓ Returning cached data: {cached_result['count']} products")
                return jsonify(cached_result)
        
        # Cache miss or force refresh - scrape fresh data
        print(f"→ Scraping fresh data for: {product_type}")
        result = run_async(
            run_scraper(country_code, product_type, min_price, max_price)
        )
        
        # Save to database if we got results
        if result.get('grouped') and len(result['grouped']) > 0:
            db.save_products(
                country_code, product_type, min_price, max_price,
                result['grouped']
            )
            result['cached'] = False
            result['message'] = 'Fresh data scraped and cached'
        
        return jsonify(result)
    
    except Exception as e:
        print(f"✗ Error: {e}")
        return jsonify({'error': str(e)}), 500


@app.route('/api/refresh', methods=['POST'])
def force_refresh():
    """
    Force refresh products - invalidate cache and scrape fresh.
    """
    try:
        data = request.get_json()
        
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
        
        # Invalidate existing cache for this search
        search_key = ProductDatabase.generate_search_key(
            country_code, product_type, min_price, max_price
        )
        db.db.products.delete_many({"search_key": search_key})
        db.db.search_cache.delete_one({"search_key": search_key})
        
        # Scrape fresh data
        result = run_async(
            run_scraper(country_code, product_type, min_price, max_price)
        )
        
        # Save to database
        if result.get('grouped'):
            db.save_products(
                country_code, product_type, min_price, max_price,
                result['grouped']
            )
        
        result['cached'] = False
        result['message'] = 'Data refreshed successfully'
        
        return jsonify(result)
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/cache/stats', methods=['GET'])
def cache_stats():
    """Get cache statistics."""
    return jsonify(db.get_cache_stats())


@app.route('/api/cache/invalidate', methods=['POST'])
def invalidate_cache():
    """
    Invalidate cache entries.
    Optionally filter by country_code and product_type.
    """
    try:
        data = request.get_json() or {}
        
        country_code = data.get('countryCode')
        product_type = data.get('productType')
        
        deleted_count = db.invalidate_cache(country_code, product_type)
        
        return jsonify({
            'success': True,
            'invalidated_entries': deleted_count,
            'message': f'Invalidated {deleted_count} cache entries'
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/popular-searches', methods=['GET'])
def popular_searches():
    """Get popular searches."""
    limit = request.args.get('limit', 10, type=int)
    searches = db.get_popular_searches(limit)
    
    # Format the response
    formatted = []
    for s in searches:
        formatted.append({
            'country_code': s['_id']['country_code'],
            'product_type': s['_id']['product_type'],
            'min_price': s['_id']['min_price'],
            'max_price': s['_id']['max_price'],
            'search_count': s['count'],
            'last_searched': s['last_searched'].isoformat() if s.get('last_searched') else None
        })
    
    return jsonify(formatted)


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


def refresh_stale_cache():
    """
    Background job to refresh stale cache entries.
    Runs periodically to keep data fresh.
    """
    if not db.is_connected():
        print("⚠ Database not connected, skipping cache refresh")
        return
    
    stale_searches = db.get_stale_searches()
    
    if not stale_searches:
        print("✓ No stale cache entries to refresh")
        return
    
    print(f"→ Refreshing {len(stale_searches)} stale cache entries...")
    
    for search in stale_searches[:5]:  # Limit to 5 at a time to avoid overload
        try:
            country_code = search['country_code']
            product_type = search['product_type']
            min_price = search['min_price']
            max_price = search['max_price']
            
            print(f"  Refreshing: {product_type} ({min_price}-{max_price})")
            
            result = run_async(
                run_scraper(country_code, product_type, min_price, max_price)
            )
            
            if result.get('grouped'):
                db.save_products(
                    country_code, product_type, min_price, max_price,
                    result['grouped']
                )
                print(f"  ✓ Refreshed: {result['count']} products")
            
        except Exception as e:
            print(f"  ✗ Failed to refresh: {e}")


def start_scheduler():
    """Start the background scheduler for cache refresh."""
    if not scheduler.running:
        # Refresh stale cache every 30 minutes
        scheduler.add_job(
            func=refresh_stale_cache,
            trigger='interval',
            minutes=30,
            id='refresh_stale_cache',
            replace_existing=True
        )
        scheduler.start()
        print("✓ Background scheduler started")
        
        # Shut down scheduler when app exits
        atexit.register(lambda: scheduler.shutdown())


# Start scheduler when app loads
start_scheduler()


if __name__ == '__main__':
    app.run(debug=True, use_reloader=False, port=5000)
