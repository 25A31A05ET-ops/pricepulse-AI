# ========================================
# PricePluse AI - Flask Backend
# Smart Grocery Price Comparison API
# ========================================

from flask import Flask, request, jsonify
from flask_cors import CORS
import json
import os
from datetime import datetime

app = Flask(__name__)
CORS(app)

# Load products from JSON file
def load_products():
    try:
        with open('dataset.json', 'r', encoding='utf-8') as f:
            data = json.load(f)
            return data if isinstance(data, list) else data.get('products', [])
    except FileNotFoundError:
        return get_default_products()
    except json.JSONDecodeError:
        return get_default_products()

def get_default_products():
    """Fallback default products if JSON file is not found"""
    return [
        {
            "id": 1,
            "name": "Basmati Rice",
            "brand": "India Gate",
            "category": "Staples",
            "quantity": 5,
            "unit": "kg",
            "best_price": 399,
            "prices": {"amazon": 450, "flipkart": 420, "blinkit": 399},
            "links": {"amazon": "#", "flipkart": "#", "blinkit": "#"},
            "quality": "Premium"
        },
        {
            "id": 2,
            "name": "Toor Dal",
            "brand": "Tata",
            "category": "Pulses",
            "quantity": 1,
            "unit": "kg",
            "best_price": 120,
            "prices": {"amazon": 140, "flipkart": 135, "blinkit": 120},
            "links": {"amazon": "#", "flipkart": "#", "blinkit": "#"},
            "quality": "Standard"
        }
    ]

# ========================================
# API Routes
# ========================================

@app.route('/')
def home():
    return jsonify({
        "name": "PricePluse AI API",
        "version": "1.0.0",
        "status": "running",
        "timestamp": datetime.now().isoformat()
    })

@app.route('/api/products', methods=['GET'])
def get_products():
    """Get all products"""
    products = load_products()
    return jsonify(products)

@app.route('/api/search', methods=['GET'])
def search_products():
    """Search and filter products"""
    query = request.args.get('q', '').lower().strip()
    products = load_products()
    
    if not query:
        return jsonify(products)
    
    results = products.copy()
    
    # Smart search understanding
    if 'cheapest' in query or 'lowest price' in query or 'cheap' in query:
        # Sort by price ascending
        results.sort(key=lambda x: x.get('best_price', float('inf')))
        
    elif 'best quality' in query or 'premium' in query:
        # Filter premium quality
        results = [p for p in results if p.get('quality') == 'Premium']
        
    elif any(keyword in query for keyword in ['under', 'below', 'less than']):
        # Extract price and filter
        import re
        price_match = re.search(r'(\d+)', query)
        if price_match:
            max_price = int(price_match.group(1))
            results = [p for p in results if p.get('best_price', float('inf')) <= max_price]
            results.sort(key=lambda x: x.get('best_price', float('inf')))
            
    elif 'best' in query or 'top' in query or 'recommend' in query:
        # Return top recommendations
        results.sort(key=lambda x: x.get('best_price', float('inf')))
        results = results[:5]
        
    else:
        # Regular text search
        results = [
            p for p in results
            if query in p.get('name', '').lower()
            or query in p.get('brand', '').lower()
            or query in p.get('category', '').lower()
        ]
    
    return jsonify(results)

@app.route('/api/filter', methods=['GET'])
def filter_products():
    """Filter products by category or price range"""
    category = request.args.get('category', '').lower()
    min_price = request.args.get('min_price', type=int)
    max_price = request.args.get('max_price', type=int)
    quality = request.args.get('quality', '').lower()
    
    products = load_products()
    results = products
    
    # Apply filters
    if category:
        results = [p for p in results if category in p.get('category', '').lower()]
    
    if min_price is not None:
        results = [p for p in results if p.get('best_price', 0) >= min_price]
    
    if max_price is not None:
        results = [p for p in results if p.get('best_price', float('inf')) <= max_price]
    
    if quality:
        results = [p for p in results if quality in p.get('quality', '').lower()]
    
    return jsonify(results)

@app.route('/api/chat', methods=['POST'])
def chat():
    """AI Chatbot endpoint"""
    data = request.get_json()
    user_message = data.get('message', '').lower().strip()
    
    products = load_products()
    response = generate_chat_response(user_message, products)
    
    return jsonify({
        "response": response,
        "timestamp": datetime.now().isoformat()
    })

def generate_chat_response(message, products):
    """Generate intelligent chat response"""
    
    # Cheapest product query
    if any(keyword in message for keyword in ['cheapest', 'lowest price', 'lowest', 'cheap']):
        if products:
            cheapest = min(products, key=lambda x: x.get('best_price', float('inf')))
            return f"💚 The cheapest product is **{cheapest['name']}** by {cheapest['brand']} at just **₹{cheapest['best_price']}** for {cheapest['quantity']} {cheapest['unit']}! It's a great value deal."
    
    # Best quality query
    if any(keyword in message for keyword in ['best quality', 'premium', 'top quality']):
        premium_products = [p for p in products if p.get('quality') == 'Premium']
        if premium_products:
            p = premium_products[0]
            return f"🌟 For premium quality, I recommend **{p['name']}** by {p['brand']}. It's priced at **₹{p['best_price']}** and comes with our quality guarantee!"
    
    # Under budget query
    if any(keyword in message for keyword in ['under', 'budget', 'affordable', 'cheap']):
        import re
        price_match = re.search(r'(\d+)', message)
        if price_match:
            max_price = int(price_match.group(1))
            affordable = [p for p in products if p.get('best_price', float('inf')) <= max_price]
            if affordable:
                names = ', '.join([p['name'] for p in affordable[:5]])
                return f"✅ Found {len(affordable)} products under ₹{max_price}: {names}. The most affordable is **{affordable[0]['name']}** at just **₹{affordable[0]['best_price']}**!"
    
    # Best recommendation
    if any(keyword in message for keyword in ['best', 'recommend', 'suggest', 'what should i buy']):
        if products:
            best = min(products, key=lambda x: x.get('best_price', float('inf')))
            return f"🎯 My top pick for you: **{best['name']}** by {best['brand']} at **₹{best['best_price']}**. It offers great value with excellent quality!"
    
    # Category-specific queries
    category_queries = {
        'rice': 'rice',
        'dal': 'dal',
        'oil': 'oil',
        'atta': 'atta',
        'sugar': 'sugar',
        'salt': 'salt',
        'tea': 'tea',
        'coffee': 'coffee',
        'spices': 'spices'
    }
    
    for category, keyword in category_queries.items():
        if keyword in message:
            matching = [p for p in products if keyword in p.get('name', '').lower()]
            if matching:
                best_match = min(matching, key=lambda x: x.get('best_price', float('inf')))
                return f"🛒 We have {len(matching)} {category} options! The best deal is **{best_match['name']}** by {best_match['brand']} at **₹{best_match['best_price']}**."
    
    # Help message
    return """🤖 I'd be happy to help you find the best groceries! You can ask me things like:

• "Which is the cheapest rice?"
• "Best quality products under ₹500?"
• "What should I buy for cooking?"
• "Show me pulses under ₹150"

Just type your question and I'll recommend the best options!"""

@app.route('/api/recommend', methods=['GET'])
def recommend_product():
    """Get AI-recommended product"""
    products = load_products()
    
    if not products:
        return jsonify({"error": "No products available"})
    
    # Recommend based on best price-quality ratio
    recommended = min(products, key=lambda x: x.get('best_price', float('inf')))
    
    return jsonify({
        "recommended": recommended,
        "reason": "Best value for money"
    })

# ========================================
# Error Handlers
# ========================================

@app.errorhandler(404)
def not_found(error):
    return jsonify({"error": "Endpoint not found"}), 404

@app.errorhandler(500)
def internal_error(error):
    return jsonify({"error": "Internal server error"}), 500

# ========================================
# Main Entry Point
# ========================================

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=True)