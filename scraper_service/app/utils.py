# app/utils.py

import re

def clean_price(price_text: str) -> int:
    """
    Extract integer price from text like:
    'Rs. 45,999' → 45999
    '$1,299.99' → 1299
    """
    numbers = re.findall(r"\d+", price_text.replace(",", ""))
    return int("".join(numbers)) if numbers else 0
