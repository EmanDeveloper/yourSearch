# Product Search - Flask Application

A unified Flask web application for searching products across e-commerce platforms.

## Features

- Search products from Daraz Pakistan
- Filter by product type (Phone, Laptop)
- Set price range
- Modern, responsive UI
- Real-time scraping with Playwright

## Project Structure

```
flask_app/
├── app.py                 # Main Flask application
├── browser_pool.py        # Browser pool for scraping
├── requirements.txt       # Python dependencies
├── scrapers/
│   ├── __init__.py
│   └── daraz.py          # Daraz scraper
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

1. Create a virtual environment:
   ```bash
   python -m venv venv
   ```

2. Activate the virtual environment:
   - Windows:
     ```bash
     venv\Scripts\activate
     ```
   - macOS/Linux:
     ```bash
     source venv/bin/activate
     ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Install Playwright browsers:
   ```bash
   playwright install chromium
   ```

## Running the Application

```bash
python app.py
```

The application will start at `http://localhost:5000`

## API Endpoints

### POST /api/scrape

Search for products.

**Request Body:**
```json
{
    "countryCode": "PK",
    "productType": "phone",
    "minPrice": "10000",
    "maxPrice": "50000"
}
```

**Response:**
```json
{
    "count": 10,
    "products": [
        {
            "title": "Product Name",
            "price": 25000,
            "image": "https://...",
            "link": "https://...",
            "source": "Daraz",
            "currency": "PKR"
        }
    ]
}
```

## Adding New Scrapers

To add support for more e-commerce sites:

1. Create a new scraper file in `scrapers/` folder
2. Implement the scraper function following the pattern in `daraz.py`
3. Add the scraper logic to `app.py` based on country code

## Technologies Used

- **Backend:** Flask, Playwright (async)
- **Frontend:** HTML5, CSS3, Vanilla JavaScript
- **Scraping:** Playwright with Chromium
