// ========================================
// PricePluse AI - JavaScript
// Smart Grocery Price Comparison
// ========================================

// ========================================
// Configuration
// ========================================
const CONFIG = {
    API_BASE: 'http://localhost:5000',
    DEBOUNCE_DELAY: 300,
    VOICE_LANGUAGE: 'en-IN',
    ANIMATION_DELAY: 100
};

// ========================================
// State Management
// ========================================
let state = {
    products: [],
    filteredProducts: [],
    searchQuery: '',
    isGravityMode: false,
    isListening: false,
    isChatOpen: false,
    recognition: null,
    engine: null,
    currentPlatform: 'all'
};

// ========================================
// DOM Elements
// ========================================
const elements = {
    searchInput: document.getElementById('searchInput'),
    suggestions: document.getElementById('suggestions'),
    voiceBtn: document.getElementById('voiceBtn'),
    clearBtn: document.getElementById('clearBtn'),
    gravityToggle: document.getElementById('gravityToggle'),
    gravityCanvas: document.getElementById('gravityCanvas'),
    closeGravity: document.getElementById('closeGravity'),
    physicsContainer: document.getElementById('physics-container'),
    productsGrid: document.getElementById('productsGrid'),
    loading: document.getElementById('loading'),
    aiSuggestion: document.getElementById('aiSuggestion'),
    aiText: document.getElementById('aiText'),
    filterTags: document.getElementById('filterTags'),
    chatbotToggle: document.getElementById('chatbotToggle'),
    chatbotContainer: document.getElementById('chatbotContainer'),
    chatbotClose: document.getElementById('chatbotClose'),
    chatbotMessages: document.getElementById('chatbotMessages'),
    platformTabs: document.querySelectorAll('.platform-tab'),
    chatInput: document.getElementById('chatInput'),
    sendChat: document.getElementById('sendChat')
};

// ========================================
// Initialize Application
// ========================================
document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
});

async function initializeApp() {
    showLoading(true);
    await loadProducts();
    setupEventListeners();
    initializeSpeechRecognition();
    renderFilterTags();
    showLoading(false);
}

// ========================================
// API Functions
// ========================================
async function loadProducts() {
    try {
        // Try to load from local dataset.json file
        const response = await fetch('dataset.json');
        if (!response.ok) throw new Error('Failed to fetch products');
        
        const text = await response.text();
        let data = JSON.parse(text);
        
        // Handle case where JSON has two separate arrays (malformed)
        if (Array.isArray(data)) {
            state.products = data;
        } else if (Array.isArray(data.products)) {
            state.products = data.products;
        } else {
            // Try to find arrays in the text and combine them
            const allProducts = [];
            
            // Find all JSON array patterns in the text
            const arrayMatches = text.match(/\[[\s\S]*?\]/g);
            if (arrayMatches) {
                arrayMatches.forEach(arrStr => {
                    try {
                        const arr = JSON.parse(arrStr);
                        if (Array.isArray(arr) && arr.length > 0 && arr[0].id) {
                            allProducts.push(...arr);
                        }
                    } catch (e) {}
                });
            }
            
            if (allProducts.length > 0) {
                state.products = allProducts;
            } else {
                throw new Error('No valid products found');
            }
        }
        
        // Filter out products with 0 or null best_price
        state.products = state.products.filter(p => p.best_price > 0);
        
        state.filteredProducts = state.products;
        renderProducts(state.products);
    } catch (error) {
        console.error('Error loading products:', error);
        // Fallback to local data
        loadLocalProducts();
    }
}

function loadLocalProducts() {
    // Sample grocery data
    state.products = [
        {
            id: 1,
            name: "Basmati Rice",
            brand: "India Gate",
            category: "Staples",
            quantity: 5,
            unit: "kg",
            best_price: 399,
            prices: { amazon: 450, flipkart: 420, blinkit: 399 },
            links: { amazon: "#", flipkart: "#", blinkit: "#" },
            quality: "Premium"
        },
        {
            id: 2,
            name: "Toor Dal",
            brand: "Tata",
            category: "Pulses",
            quantity: 1,
            unit: "kg",
            best_price: 120,
            prices: { amazon: 140, flipkart: 135, blinkit: 120 },
            links: { amazon: "#", flipkart: "#", blinkit: "#" },
            quality: "Standard"
        },
        {
            id: 3,
            name: "Sugar",
            brand: "Crown",
            category: "Staples",
            quantity: 1,
            unit: "kg",
            best_price: 45,
            prices: { amazon: 50, flipkart: 48, blinkit: 45 },
            links: { amazon: "#", flipkart: "#", blinkit: "#" },
            quality: "Standard"
        },
        {
            id: 4,
            name: "Refined Oil",
            brand: "Fortune",
            category: "Oils",
            quantity: 1,
            unit: "L",
            best_price: 160,
            prices: { amazon: 180, flipkart: 175, blinkit: 160 },
            links: { amazon: "#", flipkart: "#", blinkit: "#" },
            quality: "Standard"
        },
        {
            id: 5,
            name: "Wheat Atta",
            brand: "Aashirvaad",
            category: "Staples",
            quantity: 5,
            unit: "kg",
            best_price: 280,
            prices: { amazon: 320, flipkart: 300, blinkit: 280 },
            links: { amazon: "#", flipkart: "#", blinkit: "#" },
            quality: "Premium"
        },
        {
            id: 6,
            name: "Moong Dal",
            brand: "Laxmi",
            category: "Pulses",
            quantity: 1,
            unit: "kg",
            best_price: 110,
            prices: { amazon: 130, flipkart: 125, blinkit: 110 },
            links: { amazon: "#", flipkart: "#", blinkit: "#" },
            quality: "Standard"
        },
        {
            id: 7,
            name: "Salt",
            brand: "Tata",
            category: "Spices",
            quantity: 1,
            unit: "kg",
            best_price: 20,
            prices: { amazon: 25, flipkart: 22, blinkit: 20 },
            links: { amazon: "#", flipkart: "#", blinkit: "#" },
            quality: "Standard"
        },
        {
            id: 8,
            name: "Turmeric Powder",
            brand: "MDH",
            category: "Spices",
            quantity: 100,
            unit: "g",
            best_price: 45,
            prices: { amazon: 55, flipkart: 50, blinkit: 45 },
            links: { amazon: "#", flipkart: "#", blinkit: "#" },
            quality: "Premium"
        },
        {
            id: 9,
            name: "Green Tea",
            brand: "Tata",
            category: "Beverages",
            quantity: 25,
            unit: "bags",
            best_price: 80,
            prices: { amazon: 100, flipkart: 95, blinkit: 80 },
            links: { amazon: "#", flipkart: "#", blinkit: "#" },
            quality: "Standard"
        },
        {
            id: 10,
            name: "Coffee Powder",
            brand: "Nescafe",
            category: "Beverages",
            quantity: 50,
            unit: "g",
            best_price: 120,
            prices: { amazon: 150, flipkart: 140, blinkit: 120 },
            links: { amazon: "#", flipkart: "#", blinkit: "#" },
            quality: "Premium"
        },
        {
            id: 11,
            name: "Olive Oil",
            brand: "Figaro",
            category: "Oils",
            quantity: 500,
            unit: "ml",
            best_price: 350,
            prices: { amazon: 420, flipkart: 400, blinkit: 350 },
            links: { amazon: "#", flipkart: "#", blinkit: "#" },
            quality: "Premium"
        },
        {
            id: 12,
            name: "Chana Dal",
            brand: "Laxmi",
            category: "Pulses",
            quantity: 1,
            unit: "kg",
            best_price: 85,
            prices: { amazon: 100, flipkart: 95, blinkit: 85 },
            links: { amazon: "#", flipkart: "#", blinkit: "#" },
            quality: "Standard"
        }
    ];
    state.filteredProducts = state.products;
    renderProducts(state.products);
}

async function searchProducts(query) {
    try {
        const response = await fetch(`${CONFIG.API_BASE}/api/search?q=${encodeURIComponent(query)}`);
        if (!response.ok) throw new Error('Search failed');
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Search error:', error);
        return localSearch(query);
    }
}

function localSearch(query) {
    const lowerQuery = query.toLowerCase();
    let results = [...state.products];

    // Smart search understanding
    if (lowerQuery.includes('cheapest') || lowerQuery.includes('lowest price') || lowerQuery.includes('cheap')) {
        results.sort((a, b) => a.best_price - b.best_price);
    } else if (lowerQuery.includes('best quality') || lowerQuery.includes('premium')) {
        results = results.filter(p => p.quality === 'Premium');
    } else if (lowerQuery.includes('under ₹') || lowerQuery.includes('under Rs') || lowerQuery.includes('below')) {
        const priceMatch = lowerQuery.match(/under\s*₹?(\d+)/i) || lowerQuery.match(/below\s*₹?(\d+)/i);
        if (priceMatch) {
            const maxPrice = parseInt(priceMatch[1]);
            results = results.filter(p => p.best_price <= maxPrice);
        }
    } else if (lowerQuery.includes('best') || lowerQuery.includes('top')) {
        // Return top recommended products
        results = results.slice(0, 5);
    } else {
        // Regular text search
        results = results.filter(p => 
            p.name.toLowerCase().includes(lowerQuery) ||
            p.category.toLowerCase().includes(lowerQuery) ||
            p.brand.toLowerCase().includes(lowerQuery)
        );
    }

    return results;
}

async function getAIRecommendation(products, query) {
    if (!products || products.length === 0) {
        return "No products found matching your criteria.";
    }

    const lowerQuery = query.toLowerCase();
    let recommendation = "";

    if (lowerQuery.includes('cheapest') || lowerQuery.includes('lowest price')) {
        const cheapest = products.reduce((min, p) => p.best_price < min.best_price ? p : min, products[0]);
        recommendation = `💚 The cheapest option is ${cheapest.name} (${cheapest.brand}) at just ₹${cheapest.best_price}! Great value for money.`;
    } else if (lowerQuery.includes('best quality') || lowerQuery.includes('premium')) {
        const premium = products.find(p => p.quality === 'Premium');
        if (premium) {
            recommendation = `🌟 For best quality, I recommend ${premium.name} by ${premium.brand}. It's priced at ₹${premium.best_price} and offers superior quality.`;
        }
    } else if (lowerQuery.includes('under ₹') || lowerQuery.includes('below')) {
        recommendation = `✅ Found ${products.length} products within your budget! The most affordable is ${products[0].name} at just ₹${products[0].best_price}.`;
    } else if (lowerQuery.includes('best') || lowerQuery.includes('recommend')) {
        const best = products[0];
        recommendation = `🎯 My top pick: ${best.name} by ${best.brand} at ₹${best.best_price}. Great balance of price and quality!`;
    } else {
        recommendation = `✨ Found ${products.length} products for "${query}". Showing you the best deals first!`;
    }

    return recommendation;
}

async function sendChatMessage(message) {
    try {
        const response = await fetch(`${CONFIG.API_BASE}/api/chat`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message })
        });
        if (!response.ok) throw new Error('Chat failed');
        const data = await response.json();
        return data.response;
    } catch (error) {
        console.error('Chat error:', error);
        return getLocalChatResponse(message);
    }
}

function getLocalChatResponse(message) {
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('cheapest') || lowerMessage.includes('lowest price')) {
        const cheapest = [...state.products].sort((a, b) => a.best_price - b.best_price)[0];
        return `The cheapest product is ${cheapest.name} by ${cheapest.brand} at just ₹${cheapest.best_price}!`;
    }
    
    if (lowerMessage.includes('best') || lowerMessage.includes('recommend')) {
        const best = state.products[0];
        return `I recommend ${best.name} by ${best.brand} at ₹${best.best_price}. It offers great value!`;
    }
    
    if (lowerMessage.includes('under') || lowerMessage.includes('budget')) {
        const affordable = state.products.filter(p => p.best_price < 100);
        if (affordable.length > 0) {
            return `Here are some affordable options: ${affordable.map(p => p.name).join(', ')} - all under ₹100!`;
        }
    }
    
    if (lowerMessage.includes('rice')) {
        const rice = state.products.filter(p => p.name.toLowerCase().includes('rice'));
        return `We have ${rice.length} rice options! The best price is ₹${rice[0]?.best_price} for ${rice[0]?.brand}.`;
    }
    
    if (lowerMessage.includes('oil')) {
        const oils = state.products.filter(p => p.category === 'Oils');
        return `Our oil selection: ${oils.map(p => `${p.name} (${p.brand}) - ₹${p.best_price}`).join(', ')}`;
    }
    
    return `I'd be happy to help! You can ask me things like "Which is cheapest?", "Best quality products", or "Products under ₹100".`;
}

// ========================================
// Rendering Functions
// ========================================
function renderProducts(products) {
    elements.productsGrid.innerHTML = '';
    
    if (products.length === 0) {
        elements.productsGrid.innerHTML = `
            <div class="no-products">
                <i class="fas fa-search"></i>
                <p>No products found. Try a different search.</p>
            </div>
        `;
        return;
    }

    products.forEach((product, index) => {
        const card = createProductCard(product, index);
        elements.productsGrid.appendChild(card);
    });
}

function createProductCard(product, index) {
    const card = document.createElement('div');
    card.className = 'product-card';
    card.style.animationDelay = `${index * 0.05}s`;

    // Get prices for each platform
    const prices = product.prices || {};
    const amazonPrice = prices.amazon;
    const flipkartPrice = prices.flipkart;
    const blinkitPrice = prices.blinkit;

    // Find best price and platform
    const platformPrices = [
        { platform: 'amazon', price: amazonPrice, link: product.links?.amazon },
        { platform: 'flipkart', price: flipkartPrice, link: product.links?.flipkart },
        { platform: 'blinkit', price: blinkitPrice, link: product.links?.blinkit }
    ].filter(p => p.price !== null && p.price !== undefined && p.price > 0);

    const bestPlatform = platformPrices.length > 0 
        ? platformPrices.reduce((min, p) => p.price < min.price ? p : min, platformPrices[0])
        : null;

    // Get product image - convert Google Drive URL to direct image URL
    let imageUrl = product.image || '';
    if (imageUrl.includes('drive.google.com')) {
        // Extract file ID from various Google Drive URL formats
        let fileId = '';
        
        if (imageUrl.includes('id=')) {
            // Format: uc?export=view&id=FILE_ID
            const fileIdMatch = imageUrl.match(/id=([^&]+)/);
            if (fileIdMatch && fileIdMatch[1]) {
                fileId = fileIdMatch[1];
            }
        } else if (imageUrl.includes('/d/')) {
            // Format: /d/FILE_ID/...
            const fileIdMatch = imageUrl.match(/\/d\/([^\/]+)/);
            if (fileIdMatch && fileIdMatch[1]) {
                fileId = fileIdMatch[1];
            }
        }
        
        // Use Google Drive thumbnail format (more reliable)
        if (fileId) {
            imageUrl = `https://lh3.googleusercontent.com/d/${fileId}=w320-h240`;
        }
    }

    // Platform-specific cards
    const platformCards = `
        <div class="platform-prices">
            <div class="platform-price-card amazon ${state.currentPlatform === 'all' || state.currentPlatform === 'amazon' ? 'active' : ''}">
                <div class="platform-header">
                    <i class="fab fa-amazon"></i>
                    <span>Amazon</span>
                </div>
                <div class="platform-price">₹${amazonPrice || 'N/A'}</div>
                <a href="${product.links?.amazon || '#'}" target="_blank" class="platform-buy-btn">
                    Buy Now <i class="fas fa-external-link-alt"></i>
                </a>
            </div>
            <div class="platform-price-card flipkart ${state.currentPlatform === 'all' || state.currentPlatform === 'flipkart' ? 'active' : ''}">
                <div class="platform-header">
                    <i class="fas fa-shopping-bag"></i>
                    <span>Flipkart</span>
                </div>
                <div class="platform-price">₹${flipkartPrice || 'N/A'}</div>
                <a href="${product.links?.flipkart || '#'}" target="_blank" class="platform-buy-btn">
                    Buy Now <i class="fas fa-external-link-alt"></i>
                </a>
            </div>
            <div class="platform-price-card blinkit ${state.currentPlatform === 'all' || state.currentPlatform === 'blinkit' ? 'active' : ''}">
                <div class="platform-header">
                    <i class="fas fa-bolt"></i>
                    <span>Blinkit</span>
                </div>
                <div class="platform-price">₹${blinkitPrice || 'N/A'}</div>
                <a href="${product.links?.blinkit || '#'}" target="_blank" class="platform-buy-btn">
                    Buy Now <i class="fas fa-external-link-alt"></i>
                </a>
            </div>
        </div>
    `;

    // Default product icon if no image
    const productIcon = getProductIcon(product.name);

    card.innerHTML = `
        <div class="product-image-container">
            ${imageUrl ? 
                `<img src="${imageUrl}" alt="${product.name}" class="product-image" onerror="this.style.display='none';this.nextElementSibling.style.display='flex';">` : 
                ''}
            <div class="product-image-placeholder" style="display: ${imageUrl ? 'none' : 'flex'}">
                <i class="fas ${productIcon}"></i>
            </div>
        </div>
        
        <div class="product-header">
            <div>
                <h3 class="product-name">${product.name}</h3>
                <p class="product-brand">${product.brand}</p>
            </div>
            <span class="product-category">${product.category}</span>
        </div>
        
        <div class="product-price-section">
            <p class="price-label">Best Price</p>
            <p class="best-price">₹${product.best_price}<span>/${product.unit}</span></p>
        </div>
        
        <p class="product-quantity">📦 ${product.quantity} ${product.unit}</p>
        
        ${platformCards}
        
        ${bestPlatform ? `
            <div class="best-deal-badge">
                <i class="fas fa-trophy"></i>
                Best Deal on ${bestPlatform.platform.charAt(0).toUpperCase() + bestPlatform.platform.slice(1)}: ₹${bestPlatform.price}
            </div>
        ` : ''}
    `;

    return card;
}

function renderFilterTags() {
    const categories = [...new Set(state.products.map(p => p.category))];
    const tags = ['All', ...categories];
    
    elements.filterTags.innerHTML = tags.map((tag, index) => `
        <span class="filter-tag ${index === 0 ? 'active' : ''}" data-category="${tag}">
            ${tag}
        </span>
    `).join('');

    // Add click handlers
    document.querySelectorAll('.filter-tag').forEach(tag => {
        tag.addEventListener('click', () => {
            document.querySelectorAll('.filter-tag').forEach(t => t.classList.remove('active'));
            tag.classList.add('active');
            
            const category = tag.dataset.category;
            if (category === 'All') {
                state.filteredProducts = state.products;
            } else {
                state.filteredProducts = state.products.filter(p => p.category === category);
            }
            renderProducts(state.filteredProducts);
        });
    });
}

function showSuggestions(query) {
    if (!query || query.length < 2) {
        elements.suggestions.classList.remove('active');
        return;
    }

    const suggestions = [
        { text: 'cheapest product', icon: 'fa-tags' },
        { text: 'under ₹100', icon: 'fa-rupee-sign' },
        { text: 'best quality', icon: 'fa-star' },
        { text: 'rice', icon: 'fa-box' },
        { text: 'dal', icon: 'fa-seedling' },
        { text: 'oil', icon: 'fa-tint' },
        { text: 'atta', icon: 'fa-bread-slice' },
        { text: 'sugar', icon: 'fa-cubes' }
    ];

    const filtered = suggestions.filter(s => 
        s.text.toLowerCase().includes(query.toLowerCase())
    );

    if (filtered.length === 0) {
        elements.suggestions.classList.remove('active');
        return;
    }

    elements.suggestions.innerHTML = filtered.map(s => `
        <div class="suggestion-item" data-text="${s.text}">
            <i class="fas ${s.icon}"></i>
            <span>${s.text}</span>
        </div>
    `).join('');

    elements.suggestions.classList.add('active');

    // Add click handlers
    document.querySelectorAll('.suggestion-item').forEach(item => {
        item.addEventListener('click', () => {
            elements.searchInput.value = item.dataset.text;
            elements.suggestions.classList.remove('active');
            handleSearch(item.dataset.text);
        });
    });
}

async function showAISuggestion(query) {
    if (!query) {
        elements.aiSuggestion.classList.remove('visible');
        return;
    }

    const products = await searchProducts(query);
    const recommendation = await getAIRecommendation(products, query);
    
    elements.aiText.textContent = '';
    elements.aiSuggestion.classList.add('visible');
    
    // Typing effect
    let index = 0;
    const typingInterval = setInterval(() => {
        if (index < recommendation.length) {
            elements.aiText.textContent += recommendation[index];
            index++;
        } else {
            clearInterval(typingInterval);
        }
    }, 30);
}

function showLoading(show) {
    if (show) {
        elements.loading.classList.add('active');
        elements.productsGrid.style.display = 'none';
    } else {
        elements.loading.classList.remove('active');
        elements.productsGrid.style.display = 'grid';
    }
}

// ========================================
// Product Icon Helper
// ========================================
function getProductIcon(productName) {
    const name = productName.toLowerCase();
    
    const iconMap = {
        'rice': 'fa-bowl-rice',
        'atta': 'fa-bread-slice',
        'wheat': 'fa-grain',
        'dal': 'fa-seedling',
        'toor': 'fa-seedling',
        'moong': 'fa-seedling',
        'chana': 'fa-seedling',
        'oil': 'fa-droplet',
        'sugar': 'fa-cubes',
        'salt': 'fa-shaker',
        'maida': 'fa-bread-slice',
        'sooji': 'fa-bowl-food',
        'besan': 'fa-bowl-rice',
        'tea': 'fa-mug-hot',
        'coffee': 'fa-mug-saucer',
        'spices': 'fa-pepper-hot',
        'turmeric': 'fa-pepper-hot',
        'chilli': 'fa-pepper-hot',
        'coriander': 'fa-leaf',
        'cumin': 'fa-seedling',
        'garlic': 'fa-clove',
        'ginger': 'fa-root',
        'pulse': 'fa-seedling',
        'gram': 'fa-seedling',
        'urad': 'fa-seedling',
        'masoor': 'fa-seedling'
    };
    
    for (const [key, icon] of Object.entries(iconMap)) {
        if (name.includes(key)) {
            return icon;
        }
    }
    
    return 'fa-box-open';
}

// ========================================
// Platform Filter Functions
// ========================================
function filterByPlatform(platform) {
    // Update state
    state.currentPlatform = platform;
    
    // Update tab UI
    elements.platformTabs.forEach(tab => {
        tab.classList.toggle('active', tab.dataset.platform === platform);
    });
    
    // Filter products based on platform
    let filtered = [...state.products];
    
    if (platform !== 'all') {
        // Show products that have prices from the selected platform
        filtered = filtered.filter(p => {
            const price = p.prices?.[platform];
            return price !== null && price !== undefined && price > 0;
        });
        
        // Sort by price for the selected platform
        filtered.sort((a, b) => {
            const priceA = a.prices?.[platform] || Infinity;
            const priceB = b.prices?.[platform] || Infinity;
            return priceA - priceB;
        });
    }
    
    state.filteredProducts = filtered;
    renderProducts(filtered);
    
    // Update AI suggestion
    if (state.searchQuery) {
        showAISuggestion(state.searchQuery);
    }
}

// ========================================
// Event Listeners
// ========================================
function setupEventListeners() {
    // Search input
    let debounceTimer;
    elements.searchInput.addEventListener('input', (e) => {
        const value = e.target.value;
        state.searchQuery = value;
        
        // Show/hide clear button
        elements.clearBtn.classList.toggle('visible', value.length > 0);
        
        // Show suggestions
        showSuggestions(value);
        
        // Debounced search
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
            handleSearch(value);
        }, CONFIG.DEBOUNCE_DELAY);
    });

    // Search form submit
    elements.searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            handleSearch(e.target.value);
            elements.suggestions.classList.remove('active');
        }
    });

    // Clear button
    elements.clearBtn.addEventListener('click', () => {
        elements.searchInput.value = '';
        state.searchQuery = '';
        elements.clearBtn.classList.remove('visible');
        elements.suggestions.classList.remove('active');
        state.filteredProducts = state.products;
        renderProducts(state.products);
        elements.aiSuggestion.classList.remove('visible');
    });

    // Voice button
    elements.voiceBtn.addEventListener('click', toggleVoiceInput);

    // Gravity mode toggle
    elements.gravityToggle.addEventListener('click', toggleGravityMode);
    elements.closeGravity.addEventListener('click', toggleGravityMode);

    // Chatbot
    elements.chatbotToggle.addEventListener('click', toggleChatbot);
    elements.chatbotClose.addEventListener('click', toggleChatbot);
    elements.sendChat.addEventListener('click', handleChatSubmit);
    elements.chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleChatSubmit();
    });

    // Close suggestions when clicking outside
    document.addEventListener('click', (e) => {
        if (!elements.suggestions.contains(e.target) && e.target !== elements.searchInput) {
            elements.suggestions.classList.remove('active');
        }
    });

    // Platform tabs
    elements.platformTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const platform = tab.dataset.platform;
            filterByPlatform(platform);
        });
    });
}

async function handleSearch(query) {
    if (!query || query.trim() === '') {
        state.filteredProducts = state.products;
        renderProducts(state.products);
        elements.aiSuggestion.classList.remove('visible');
        return;
    }

    showLoading(true);
    const results = await searchProducts(query);
    state.filteredProducts = results;
    renderProducts(results);
    await showAISuggestion(query);
    showLoading(false);
}

// ========================================
// Voice Input
// ========================================
function initializeSpeechRecognition() {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        state.recognition = new SpeechRecognition();
        state.recognition.continuous = false;
        state.recognition.interimResults = false;
        state.recognition.lang = CONFIG.VOICE_LANGUAGE;

        state.recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            elements.searchInput.value = transcript;
            handleSearch(transcript);
            stopListening();
        };

        state.recognition.onerror = (event) => {
            console.error('Speech recognition error:', event.error);
            stopListening();
        };

        state.recognition.onend = () => {
            stopListening();
        };
    } else {
        elements.voiceBtn.style.display = 'none';
    }
}

function toggleVoiceInput() {
    if (!state.recognition) {
        alert('Voice input is not supported in your browser.');
        return;
    }

    if (state.isListening) {
        state.recognition.stop();
    } else {
        state.recognition.start();
    }
}

function startListening() {
    state.isListening = true;
    elements.voiceBtn.classList.add('listening');
    elements.voiceBtn.innerHTML = '<i class="fas fa-microphone"></i>';
}

function stopListening() {
    state.isListening = false;
    elements.voiceBtn.classList.remove('listening');
}

// ========================================
// Gravity Mode (Matter.js)
// ========================================
function toggleGravityMode() {
    state.isGravityMode = !state.isGravityMode;
    elements.gravityToggle.classList.toggle('active', state.isGravityMode);
    elements.gravityCanvas.classList.toggle('active', state.isGravityMode);

    if (state.isGravityMode) {
        initializePhysics();
    } else {
        destroyPhysics();
    }
}

function initializePhysics() {
    const { Engine, Render, Runner, World, Bodies, Body, Events } = Matter;
    
    // Create engine
    state.engine = Engine.create();
    state.engine.world.gravity.y = 0.5;

    // Create renderer
    const render = Render.create({
        element: elements.physicsContainer,
        engine: state.engine,
        options: {
            width: window.innerWidth,
            height: window.innerHeight,
            wireframes: false,
            background: 'transparent'
        }
    });

    // Create ground
    const ground = Bodies.rectangle(
        window.innerWidth / 2,
        window.innerHeight - 30,
        window.innerWidth,
        60,
        { 
            isStatic: true,
            render: { fillStyle: '#2E7D32' }
        }
    );

    // Create walls
    const leftWall = Bodies.rectangle(
        -30,
        window.innerHeight / 2,
        60,
        window.innerHeight,
        { isStatic: true }
    );

    const rightWall = Bodies.rectangle(
        window.innerWidth + 30,
        window.innerHeight / 2,
        60,
        window.innerHeight,
        { isStatic: true }
    );

    World.add(state.engine.world, [ground, leftWall, rightWall]);

    // Create product bodies
    const products = [...state.filteredProducts].slice(0, 12);
    products.forEach((product, index) => {
        setTimeout(() => {
            createPhysicsProduct(product, index);
        }, index * 200);
    });

    // Run the engine
    const runner = Runner.create();
    Runner.run(runner, state.engine);
    Render.run(render);

    // Update positions for DOM elements
    Events.on(render, 'afterRender', () => {
        updatePhysicsProducts();
    });
}

function createPhysicsProduct(product, index) {
    const { Bodies, World } = Matter;
    
    const x = Math.random() * (window.innerWidth - 200) + 100;
    const y = -50 - (index * 80);
    
    // Cheaper products fall faster (higher density)
    const maxPrice = Math.max(...state.filteredProducts.map(p => p.best_price));
    const density = 0.001 + (1 - product.best_price / maxPrice) * 0.002;
    
    const body = Bodies.rectangle(x, y, 160, 80, {
        restitution: 0.6,
        friction: 0.5,
        density: density,
        render: {
            fillStyle: product.best_price < 100 ? '#C8E6C9' : '#FFFFFF'
        },
        label: JSON.stringify(product)
    });

    World.add(state.engine.world, body);
    
    // Create DOM element
    const element = document.createElement('div');
    element.className = `physics-product ${product.best_price < 100 ? 'physics-product-cheaper' : ''}`;
    element.innerHTML = `
        <div class="physics-product-name">${product.name}</div>
        <div class="physics-product-price">₹${product.best_price}</div>
    `;
    element.dataset.bodyId = body.id;
    elements.physicsContainer.appendChild(element);
}

function updatePhysicsProducts() {
    if (!state.engine) return;
    
    const bodies = Matter.Composite.allBodies(state.engine.world);
    
    bodies.forEach(body => {
        if (body.label && body.label !== 'Rectangle Body' && body.label !== 'Wall') {
            const element = elements.physicsContainer.querySelector(`[data-body-id="${body.id}"]`);
            if (element) {
                element.style.left = `${body.position.x - 80}px`;
                element.style.top = `${body.position.y - 40}px`;
                element.style.transform = `rotate(${body.angle}rad)`;
            }
        }
    });
}

function destroyPhysics() {
    if (state.engine) {
        Matter.Engine.clear(state.engine);
        Matter.Render.stop(state.engine);
        state.engine = null;
    }
    elements.physicsContainer.innerHTML = '';
}

// ========================================
// Chatbot Functions
// ========================================
function toggleChatbot() {
    state.isChatOpen = !state.isChatOpen;
    elements.chatbotContainer.classList.toggle('active', state.isChatOpen);
    elements.chatbotToggle.classList.toggle('hidden', state.isChatOpen);
}

async function handleChatSubmit() {
    const message = elements.chatInput.value.trim();
    if (!message) return;

    // Add user message
    addMessage(message, 'user');
    elements.chatInput.value = '';

    // Show typing indicator
    showTypingIndicator();

    // Get response
    const response = await sendChatMessage(message);
    
    // Remove typing indicator
    removeTypingIndicator();
    
    // Add bot message
    addMessage(response, 'bot');
}

function addMessage(content, sender) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${sender}-message`;
    
    const iconClass = sender === 'user' ? 'fa-user' : 'fa-robot';
    const iconBg = sender === 'user' ? 'var(--primary-green)' : 'var(--mint-green)';
    const iconColor = sender === 'user' ? 'white' : 'var(--primary-green)';
    
    messageDiv.innerHTML = `
        <div class="message-icon" style="background: ${iconBg}; color: ${iconColor};">
            <i class="fas ${iconClass}"></i>
        </div>
        <div class="message-content">
            <p>${content}</p>
        </div>
    `;
    
    elements.chatbotMessages.appendChild(messageDiv);
    elements.chatbotMessages.scrollTop = elements.chatbotMessages.scrollHeight;
}

function showTypingIndicator() {
    const typingDiv = document.createElement('div');
    typingDiv.className = 'message bot-message typing-indicator';
    typingDiv.id = 'typingIndicator';
    typingDiv.innerHTML = `
        <div class="message-icon" style="background: var(--mint-green); color: var(--primary-green);">
            <i class="fas fa-robot"></i>
        </div>
        <div class="typing-indicator">
            <span></span>
            <span></span>
            <span></span>
        </div>
    `;
    elements.chatbotMessages.appendChild(typingDiv);
    elements.chatbotMessages.scrollTop = elements.chatbotMessages.scrollHeight;
}

function removeTypingIndicator() {
    const typing = document.getElementById('typingIndicator');
    if (typing) typing.remove();
}

// ========================================
// Utility Functions
// ========================================
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Make functions globally available
window.toggleGravityMode = toggleGravityMode;
window.toggleChatbot = toggleChatbot;