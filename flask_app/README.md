# Product Search - Flask Application

A unified Flask web application for searching products across e-commerce platforms with MongoDB caching for fast responses.

## Features

- Search products from Daraz Pakistan and PriceOye
- Filter by product type (Phone, Laptop)
- Set price range
- Modern, responsive UI
- Real-time scraping with Playwright
- **MongoDB Caching** - Fast responses from cached data
- **Auto-refresh** - Background scheduler keeps data fresh
- **Manual refresh** - Force refresh button to get latest data

## Project Structure

```
flask_app/
├── app.py                 # Main Flask application
├── database.py            # MongoDB database module
├── browser_pool.py        # Browser pool for scraping
├── requirements.txt       # Python dependencies
├── scrapers/
│   ├── __init__.py
│   ├── daraz.py          # Daraz scraper
│   └── priceoye.py       # PriceOye scraper
├── static/
│   ├── css/
│   │   └── style.css     # Styles
│   └── js/
│       ├── countries.js  # Country data
│       └── main.js       # Frontend JavaScript
└── templates/
    └── index.html        # Main HTML template
```

## Installation

### 1. Install MongoDB

**Windows:**
- Download MongoDB Community Server from https://www.mongodb.com/try/download/community
- Run the installer and follow the wizard
- MongoDB will run as a Windows service automatically

**macOS (using Homebrew):**
```bash
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community
```

**Linux (Ubuntu):**
```bash
sudo apt-get install -y mongodb
sudo systemctl start mongodb
sudo systemctl enable mongodb
```

**Docker (Alternative):**
```bash
docker run -d --name mongodb -p 27017:27017 mongo:latest
```

### 2. Create Python Virtual Environment

```bash
python -m venv venv
```

### 3. Activate the virtual environment

**Windows:**
```bash
venv\Scripts\activate
```

**macOS/Linux:**
```bash
source venv/bin/activate
```

### 4. Install dependencies

```bash
pip install -r requirements.txt
```

### 5. Install Playwright browsers

```bash
playwright install chromium
```

## Configuration (Optional)

You can configure the application using environment variables:

```bash
# MongoDB connection URI (default: mongodb://localhost:27017/)
set MONGO_URI=mongodb://localhost:27017/

# Database name (default: product_search)
set MONGO_DB_NAME=product_search

# Cache TTL in hours (default: 1)
set CACHE_TTL_HOURS=1
```

## Running the Application

```bash
python app.py
```

The application will start at `http://localhost:5000`

## API Endpoints

### POST /api/scrape

Search for products. Returns cached data if available, otherwise scrapes fresh data.

**Request Body:**
```json
{
    "countryCode": "PK",
    "productType": "phone",
    "minPrice": "10000",
    "maxPrice": "50000",
    "forceRefresh": false
}
```

**Response:**
```json
{
    "count": 40,
    "grouped": {
        "Daraz": [...],
        "PriceOye": [...]
    },
    "cached": true,
    "cached_at": "2024-01-15T10:30:00",
    "cache_expires_in": "0:45:00"
}
```

### POST /api/refresh

Force refresh products (invalidates cache and scrapes fresh data).

**Request Body:**
```json
{
    "countryCode": "PK",
    "productType": "phone",
    "minPrice": "10000",
    "maxPrice": "50000"
}
```

### GET /api/cache/stats

Get cache statistics.

**Response:**
```json
{
    "connected": true,
    "total_products": 150,
    "total_searches_cached": 5,
    "stale_searches": 1,
    "fresh_searches": 4,
    "cache_ttl_hours": 1
}
```

### POST /api/cache/invalidate

Invalidate cache entries. Can filter by country and product type.

**Request Body:**
```json
{
    "countryCode": "PK",
    "productType": "phone"
}
```

### GET /api/popular-searches

Get most popular searches.

**Query Parameters:**
- `limit` (optional): Number of results (default: 10)

## How Caching Works

1. **First Search**: When you search for a product, the app scrapes data from websites and stores it in MongoDB.

2. **Cached Response**: Subsequent searches with the same parameters return cached data instantly (if cache is fresh).

3. **Cache Expiry**: Cache expires after 1 hour (configurable via `CACHE_TTL_HOURS`).

4. **Background Refresh**: A scheduler runs every 30 minutes to refresh stale cache entries for popular searches.

5. **Manual Refresh**: Click the "Refresh" button to force-fetch latest data anytime.

## Adding New Scrapers

To add support for more e-commerce sites:

1. Create a new scraper file in `scrapers/` folder
2. Implement the scraper function following the pattern in `daraz.py`
3. Add the scraper logic to `app.py` based on country code

## Technologies Used

- **Backend:** Flask, Playwright (async), APScheduler
- **Database:** MongoDB (pymongo)
- **Frontend:** HTML5, CSS3, Vanilla JavaScript
- **Scraping:** Playwright with Chromium
