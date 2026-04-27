# PricePluse AI - Smart Grocery Price Comparison

A full-stack AI-powered price comparison web application for groceries with a modern premium UI featuring glassmorphism, smooth animations, voice input, physics-based gravity mode, and an intelligent shopping assistant chatbot.

![PricePluse AI](https://img.shields.io/badge/Version-1.0.0-green)
![License](https://img.shields.io/badge/License-MIT-blue)

## ✨ Features

### 🎨 Frontend
- **Modern Premium UI** - Apple-level design with glassmorphism effects
- **Real-time Search** - Smart search with suggestions
- **Voice Input** - Web Speech API for hands-free search
- **Product Cards** - Beautiful cards with name, price, and buy links
- **Smooth Animations** - Fade-in effects and transitions

### 🌑 Gravity Mode
- **Matter.js Physics** - Realistic physics engine
- **Falling Products** - Products fall from top and bounce
- **Price-based Physics** - Cheaper products fall faster
- **Interactive** - Click and drag products

### 🤖 AI Features
- **Smart Search Understanding**:
  - "cheapest product"
  - "under ₹100"
  - "best quality"
- **Intelligent Recommendations** - Best product suggestions
- **Dynamic AI Suggestions** - Real-time AI responses

### 💬 Chatbot
- **Shopping Assistant** - AI-powered chatbot
- **Natural Language** - Understands queries
- **Quick Responses** - Instant answers
- **Example Questions**:
  - "Which is best?"
  - "What should I buy?"

## 🚀 Quick Start

### Prerequisites
- Python 3.8+
- Node.js (optional, for development)
- Web browser with microphone access (for voice)

### Backend Setup (Flask)

1. **Navigate to project folder**
```bash
cd "c:\Users\SS\Desktop\PRICEPLUSE AI"
```

2. **Create virtual environment** (optional but recommended)
```bash
python -m venv venv
venv\Scripts\activate
```

3. **Install dependencies**
```bash
pip install -r requirements.txt
```

4. **Start the server**
```bash
python app.py
```

The backend will run at `http://localhost:5000`

### Frontend Setup

1. **Open the application**
   - Simply open `index.html` in your browser
   - Or use a local server: `python -m http.server 8000`

2. **Access the app**
   - Open `http://localhost:8000` in your browser

## 📁 Project Structure

```
PRICEPLUSE AI/
├── index.html          # Main HTML file
├── style.css           # Styles (green & white theme)
├── script.js           # Frontend JavaScript
├── app.py              # Flask backend
├── server.js           # Node.js server (alternative)
├── dataset.json        # Product database
├── requirements.txt   # Python dependencies
└── README.md          # This file
```

## 🔧 Configuration

### API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/` | GET | API health check |
| `/api/products` | GET | Get all products |
| `/api/search?q=` | GET | Search products |
| `/api/filter` | GET | Filter products |
| `/api/chat` | POST | Chat with AI |
| `/api/recommend` | GET | Get AI recommendation |

### Environment Variables

```env
# Flask
FLASK_ENV=development
FLASK_DEBUG=1
PORT=5000

# Optional: OpenAI API (for advanced chatbot)
# OPENAI_API_KEY=your_api_key_here
```

## 🎯 Usage Examples

### Search Queries
- `cheapest` - Shows cheapest products first
- `under ₹100` - Filters products under 100 rupees
- `best quality` - Shows premium quality products
- `rice` - Searches for rice products

### Chatbot Questions
- "Which is the cheapest rice?"
- "What should I buy for cooking?"
- "Best products under ₹500?"
- "Show me pulses"

## 🛠️ Deployment

### Backend (Render)

1. Push code to GitHub
2. Create new Web Service on Render
3. Set:
   - Build Command: `pip install -r requirements.txt`
   - Start Command: `python app.py`
4. Deploy!

### Frontend (Netlify)

1. Create `netlify.toml`:
```toml
[build]
  command = ""
  publish = ""

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

2. Drag and drop folder to Netlify
3. Done! 🎉

## 📊 Sample Data Format

```json
{
  "id": 1001,
  "name": "Rice",
  "category": "Staples",
  "brand": "Daawat",
  "quantity": 5,
  "unit": "kg",
  "prices": {
    "amazon": 399,
    "flipkart": 486,
    "blinkit": 344
  },
  "best_price": 344,
  "links": {
    "amazon": "https://...",
    "flipkart": "https://...",
    "blinkit": "https://..."
  },
  "quality": "Premium"
}
```

## 🔐 Security Notes

- Add API key validation for production
- Implement rate limiting
- Use HTTPS in production
- Sanitize user inputs

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📄 License

MIT License - feel free to use this project!

## 🙏 Acknowledgments

- [Matter.js](https://brm.io/matter-js/) - Physics engine
- [Font Awesome](https://fontawesome.com) - Icons
- [Google Fonts](https://fonts.google.com) - Inter font

---
**
Made with ❤️ for groceries shopping by team members :
Team leader   : Vasamsetti Jahnavi devi
Team member 1 : Srungaram Venkata Sesha Sri Hasini
Team member 2 : Sadu Hemanjali
Team member 1 : Kandregula Shanmukha Priya
