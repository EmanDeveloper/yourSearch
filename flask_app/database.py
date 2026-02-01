"""
MongoDB Database Module for Product Caching

This module handles:
- MongoDB connection management
- Product CRUD operations
- Cache management with TTL (Time To Live)
- Search history tracking
"""

from pymongo import MongoClient, ASCENDING, DESCENDING
from pymongo.errors import ConnectionFailure, ServerSelectionTimeoutError
from datetime import datetime, timedelta
from typing import List, Dict, Optional
import hashlib
import os

# Configuration
MONGO_URI = os.environ.get("MONGO_URI", "mongodb://localhost:27017/")
DB_NAME = os.environ.get("MONGO_DB_NAME", "product_search")
CACHE_TTL_HOURS = int(os.environ.get("CACHE_TTL_HOURS", 1))  # Data freshness in hours


class ProductDatabase:
    """MongoDB database handler for product caching."""
    
    _instance = None
    
    def __new__(cls):
        """Singleton pattern to reuse connection."""
        if cls._instance is None:
            cls._instance = super().__new__(cls)
            cls._instance._initialized = False
        return cls._instance
    
    def __init__(self):
        if self._initialized:
            return
        
        self.client = None
        self.db = None
        self._initialized = True
        self._connect()
    
    def _connect(self):
        """Establish MongoDB connection."""
        try:
            self.client = MongoClient(
                MONGO_URI,
                serverSelectionTimeoutMS=5000,
                connectTimeoutMS=5000
            )
            # Test connection
            self.client.admin.command('ping')
            self.db = self.client[DB_NAME]
            self._create_indexes()
            print(f"✓ Connected to MongoDB: {DB_NAME}")
        except (ConnectionFailure, ServerSelectionTimeoutError) as e:
            print(f"✗ MongoDB connection failed: {e}")
            self.client = None
            self.db = None
    
    def _create_indexes(self):
        """Create indexes for better query performance."""
        if self.db is None:
            return
        
        # Products collection indexes
        self.db.products.create_index([
            ("search_key", ASCENDING),
            ("source", ASCENDING)
        ])
        self.db.products.create_index([("cached_at", ASCENDING)])
        self.db.products.create_index([("price", ASCENDING)])
        
        # Search cache collection indexes
        self.db.search_cache.create_index([("search_key", ASCENDING)], unique=True)
        self.db.search_cache.create_index([("cached_at", ASCENDING)])
        
        # Search history collection
        self.db.search_history.create_index([("searched_at", DESCENDING)])
    
    def is_connected(self) -> bool:
        """Check if database is connected."""
        if self.client is None:
            return False
        try:
            self.client.admin.command('ping')
            return True
        except:
            return False
    
    def reconnect(self):
        """Attempt to reconnect to database."""
        self._connect()
    
    @staticmethod
    def generate_search_key(country_code: str, product_type: str, min_price: int, max_price: int) -> str:
        """Generate a unique key for search parameters."""
        raw = f"{country_code}_{product_type}_{min_price}_{max_price}".lower()
        return hashlib.md5(raw.encode()).hexdigest()
    
    def get_cached_products(
        self,
        country_code: str,
        product_type: str,
        min_price: int,
        max_price: int
    ) -> Optional[Dict]:
        """
        Get cached products if they exist and are fresh.
        
        Returns:
            Dict with products and metadata if cache is valid, None otherwise
        """
        if not self.is_connected():
            return None
        
        search_key = self.generate_search_key(country_code, product_type, min_price, max_price)
        
        # Check if we have a valid cache entry
        cache_entry = self.db.search_cache.find_one({"search_key": search_key})
        
        if cache_entry is None:
            return None
        
        # Check if cache is still fresh
        cache_age = datetime.utcnow() - cache_entry["cached_at"]
        if cache_age > timedelta(hours=CACHE_TTL_HOURS):
            return None
        
        # Get products for this search
        products = list(self.db.products.find(
            {"search_key": search_key},
            {"_id": 0}  # Exclude MongoDB _id from results
        ))
        
        if not products:
            return None
        
        # Group products by source
        grouped = {}
        for product in products:
            source = product.get("source", "Unknown")
            if source not in grouped:
                grouped[source] = []
            # Remove internal fields before returning
            product_copy = {k: v for k, v in product.items() 
                          if k not in ["search_key", "cached_at"]}
            grouped[source].append(product_copy)
        
        # Sort each group by price
        for source in grouped:
            grouped[source].sort(key=lambda x: x.get("price", 0))
        
        return {
            "count": len(products),
            "grouped": grouped,
            "cached": True,
            "cached_at": cache_entry["cached_at"].isoformat(),
            "cache_expires_in": str(timedelta(hours=CACHE_TTL_HOURS) - cache_age)
        }
    
    def save_products(
        self,
        country_code: str,
        product_type: str,
        min_price: int,
        max_price: int,
        grouped_products: Dict[str, List]
    ) -> bool:
        """
        Save scraped products to database.
        
        Args:
            country_code: Country code for the search
            product_type: Type of product searched
            min_price: Minimum price filter
            max_price: Maximum price filter
            grouped_products: Dict with source as key and list of products as value
        
        Returns:
            True if saved successfully, False otherwise
        """
        if not self.is_connected():
            return False
        
        search_key = self.generate_search_key(country_code, product_type, min_price, max_price)
        now = datetime.utcnow()
        
        try:
            # Delete old products for this search
            self.db.products.delete_many({"search_key": search_key})
            
            # Prepare products for insertion
            all_products = []
            for source, products in grouped_products.items():
                for product in products:
                    product_doc = {
                        **product,
                        "search_key": search_key,
                        "cached_at": now
                    }
                    all_products.append(product_doc)
            
            # Insert all products
            if all_products:
                self.db.products.insert_many(all_products)
            
            # Update search cache entry
            self.db.search_cache.update_one(
                {"search_key": search_key},
                {
                    "$set": {
                        "search_key": search_key,
                        "country_code": country_code,
                        "product_type": product_type,
                        "min_price": min_price,
                        "max_price": max_price,
                        "product_count": len(all_products),
                        "cached_at": now
                    }
                },
                upsert=True
            )
            
            # Log search history
            self.db.search_history.insert_one({
                "search_key": search_key,
                "country_code": country_code,
                "product_type": product_type,
                "min_price": min_price,
                "max_price": max_price,
                "results_count": len(all_products),
                "searched_at": now
            })
            
            print(f"✓ Cached {len(all_products)} products for search: {product_type}")
            return True
            
        except Exception as e:
            print(f"✗ Failed to save products: {e}")
            return False
    
    def invalidate_cache(
        self,
        country_code: str = None,
        product_type: str = None
    ) -> int:
        """
        Invalidate (delete) cached data.
        
        Args:
            country_code: Optional country code filter
            product_type: Optional product type filter
            
        Returns:
            Number of cache entries invalidated
        """
        if not self.is_connected():
            return 0
        
        query = {}
        if country_code:
            query["country_code"] = country_code
        if product_type:
            query["product_type"] = product_type
        
        if not query:
            # Delete all cache
            search_keys = [doc["search_key"] for doc in self.db.search_cache.find()]
            self.db.products.delete_many({"search_key": {"$in": search_keys}})
            result = self.db.search_cache.delete_many({})
            return result.deleted_count
        
        # Delete specific cache entries
        cache_entries = list(self.db.search_cache.find(query))
        search_keys = [entry["search_key"] for entry in cache_entries]
        
        self.db.products.delete_many({"search_key": {"$in": search_keys}})
        result = self.db.search_cache.delete_many(query)
        
        return result.deleted_count
    
    def get_stale_searches(self) -> List[Dict]:
        """Get all searches with stale (expired) cache."""
        if not self.is_connected():
            return []
        
        cutoff_time = datetime.utcnow() - timedelta(hours=CACHE_TTL_HOURS)
        
        return list(self.db.search_cache.find(
            {"cached_at": {"$lt": cutoff_time}},
            {"_id": 0}
        ))
    
    def get_popular_searches(self, limit: int = 10) -> List[Dict]:
        """Get most popular searches based on history."""
        if not self.is_connected():
            return []
        
        pipeline = [
            {
                "$group": {
                    "_id": {
                        "country_code": "$country_code",
                        "product_type": "$product_type",
                        "min_price": "$min_price",
                        "max_price": "$max_price"
                    },
                    "count": {"$sum": 1},
                    "last_searched": {"$max": "$searched_at"}
                }
            },
            {"$sort": {"count": -1}},
            {"$limit": limit}
        ]
        
        return list(self.db.search_history.aggregate(pipeline))
    
    def get_cache_stats(self) -> Dict:
        """Get cache statistics."""
        if not self.is_connected():
            return {"connected": False}
        
        total_products = self.db.products.count_documents({})
        total_searches = self.db.search_cache.count_documents({})
        stale_searches = len(self.get_stale_searches())
        
        return {
            "connected": True,
            "total_products": total_products,
            "total_searches_cached": total_searches,
            "stale_searches": stale_searches,
            "fresh_searches": total_searches - stale_searches,
            "cache_ttl_hours": CACHE_TTL_HOURS
        }


# Global database instance
db = ProductDatabase()
