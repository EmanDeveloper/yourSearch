// State
let selectedCountry = null;
let selectedProductType = null;

// DOM Elements
const countrySelectWrapper = document.getElementById('countrySelectWrapper');
const countryTrigger = document.getElementById('countryTrigger');
const countryDropdown = document.getElementById('countryDropdown');
const countryValue = document.getElementById('countryValue');
const countrySearch = document.getElementById('countrySearch');
const countryOptions = document.getElementById('countryOptions');
const countryInput = document.getElementById('countryInput');
const countryCodeInput = document.getElementById('countryCodeInput');

const productSelectWrapper = document.getElementById('productSelectWrapper');
const productTrigger = document.getElementById('productTrigger');
const productDropdown = document.getElementById('productDropdown');
const productValue = document.getElementById('productValue');
const productTypeInput = document.getElementById('productTypeInput');

const currencySymbol = document.getElementById('currencySymbol');
const currencySymbol2 = document.getElementById('currencySymbol2');
const minPriceInput = document.getElementById('minPrice');
const maxPriceInput = document.getElementById('maxPrice');

const searchForm = document.getElementById('searchForm');
const submitBtn = document.getElementById('submitBtn');
const loading = document.getElementById('loading');
const resultsSection = document.getElementById('resultsSection');
const resultsCount = document.getElementById('resultsCount');
const cacheStatus = document.getElementById('cacheStatus');
const refreshBtn = document.getElementById('refreshBtn');
const productsGrid = document.getElementById('productsGrid');
const toastContainer = document.getElementById('toastContainer');

// Store last search params for refresh
let lastSearchParams = null;

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    renderCountryOptions(COUNTRIES);
    setupEventListeners();
});

// Render country options
function renderCountryOptions(countries) {
    countryOptions.innerHTML = countries.map(country => `
        <button type="button" class="option" data-code="${country.code}" data-name="${country.name}">
            <img src="https://flagcdn.com/w40/${country.code.toLowerCase()}.png" 
                 alt="${country.name}"
                 onerror="this.style.display='none'">
            <span>${country.name}</span>
        </button>
    `).join('');

    // Add click handlers
    countryOptions.querySelectorAll('.option').forEach(option => {
        option.addEventListener('click', () => {
            const code = option.dataset.code;
            const name = option.dataset.name;
            selectCountry(code, name);
        });
    });
}

// Select country
function selectCountry(code, name) {
    selectedCountry = { code, name };
    countryInput.value = name;
    countryCodeInput.value = code;
    
    // Update display
    countryValue.innerHTML = `
        <img src="https://flagcdn.com/w40/${code.toLowerCase()}.png" alt="${name}">
        <span>${name}</span>
    `;
    
    // Update currency symbol
    const currency = getCurrencySymbol(code);
    currencySymbol.textContent = currency;
    currencySymbol2.textContent = currency;
    
    // Update selected state
    countryOptions.querySelectorAll('.option').forEach(opt => {
        opt.classList.toggle('selected', opt.dataset.code === code);
    });
    
    // Close dropdown
    closeDropdown(countrySelectWrapper);
}

// Select product type
function selectProductType(type, label) {
    selectedProductType = type;
    productTypeInput.value = type;
    
    const icon = type === 'phone' 
        ? `<svg class="option-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
             <rect x="5" y="2" width="14" height="20" rx="2" ry="2"></rect>
             <line x1="12" y1="18" x2="12.01" y2="18"></line>
           </svg>`
        : `<svg class="option-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
             <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
             <line x1="2" y1="20" x2="22" y2="20"></line>
           </svg>`;
    
    productValue.innerHTML = `${icon}<span>${label}</span>`;
    
    // Update selected state
    productDropdown.querySelectorAll('.option').forEach(opt => {
        opt.classList.toggle('selected', opt.dataset.value === type);
    });
    
    // Close dropdown
    closeDropdown(productSelectWrapper);
}

// Setup event listeners
function setupEventListeners() {
    // Country dropdown toggle
    countryTrigger.addEventListener('click', () => {
        toggleDropdown(countrySelectWrapper);
        closeDropdown(productSelectWrapper);
    });
    
    // Product dropdown toggle
    productTrigger.addEventListener('click', () => {
        toggleDropdown(productSelectWrapper);
        closeDropdown(countrySelectWrapper);
    });
    
    // Country search
    countrySearch.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase();
        const filtered = COUNTRIES.filter(c => 
            c.name.toLowerCase().includes(query)
        );
        renderCountryOptions(filtered);
    });
    
    // Product type options
    productDropdown.querySelectorAll('.option').forEach(option => {
        option.addEventListener('click', () => {
            selectProductType(option.dataset.value, option.querySelector('span').textContent);
        });
    });
    
    // Close dropdowns on outside click
    document.addEventListener('click', (e) => {
        if (!countrySelectWrapper.contains(e.target)) {
            closeDropdown(countrySelectWrapper);
        }
        if (!productSelectWrapper.contains(e.target)) {
            closeDropdown(productSelectWrapper);
        }
    });
    
    // Form submission
    searchForm.addEventListener('submit', handleSubmit);
    
    // Refresh button
    refreshBtn.addEventListener('click', handleRefresh);
}

// Toggle dropdown
function toggleDropdown(wrapper) {
    wrapper.classList.toggle('open');
    if (wrapper.classList.contains('open') && wrapper === countrySelectWrapper) {
        countrySearch.focus();
    }
}

// Close dropdown
function closeDropdown(wrapper) {
    wrapper.classList.remove('open');
}

// Handle form submission
async function handleSubmit(e) {
    e.preventDefault();
    
    // Validate
    if (!selectedCountry) {
        showToast('Please select a country', 'error');
        return;
    }
    
    if (!selectedProductType) {
        showToast('Please select a product type', 'error');
        return;
    }
    
    const minPrice = minPriceInput.value;
    const maxPrice = maxPriceInput.value;
    
    if (!minPrice || !maxPrice) {
        showToast('Please enter price range', 'error');
        return;
    }
    
    if (parseInt(minPrice) > parseInt(maxPrice)) {
        showToast('Min price cannot be greater than max price', 'error');
        return;
    }
    
    // Store search params for refresh
    lastSearchParams = {
        country: selectedCountry.name,
        countryCode: selectedCountry.code,
        productType: selectedProductType,
        minPrice,
        maxPrice
    };
    
    // Show loading
    submitBtn.disabled = true;
    loading.classList.add('active');
    resultsSection.classList.remove('active');
    
    try {
        const response = await fetch('/api/scrape', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(lastSearchParams)
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.error || 'Something went wrong');
        }
        
        const cacheMsg = data.cached ? '⚡ From cache' : '🔄 Fresh data';
        showToast(`Found ${data.count} products! ${cacheMsg}`, 'success');
        displayResults(data);
        
    } catch (error) {
        showToast(error.message, 'error');
    } finally {
        submitBtn.disabled = false;
        loading.classList.remove('active');
    }
}

// Handle refresh button click
async function handleRefresh() {
    if (!lastSearchParams) {
        showToast('Please search for products first', 'error');
        return;
    }
    
    // Show loading state
    refreshBtn.disabled = true;
    refreshBtn.classList.add('loading');
    
    try {
        const response = await fetch('/api/refresh', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(lastSearchParams)
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.error || 'Failed to refresh');
        }
        
        showToast(`Refreshed! Found ${data.count} products`, 'success');
        displayResults(data);
        
    } catch (error) {
        showToast(error.message, 'error');
    } finally {
        refreshBtn.disabled = false;
        refreshBtn.classList.remove('loading');
    }
}

// Display results grouped by source
function displayResults(data) {
    const grouped = data.grouped || {};
    const totalCount = data.count || 0;
    const isCached = data.cached === true;
    
    resultsCount.textContent = `${totalCount} products found`;
    
    // Update cache status
    cacheStatus.className = 'cache-status';
    if (isCached) {
        cacheStatus.classList.add('cached');
        cacheStatus.textContent = `Cached • Expires in ${data.cache_expires_in || 'soon'}`;
    } else {
        cacheStatus.classList.add('fresh');
        cacheStatus.textContent = 'Fresh data';
    }
    
    if (totalCount === 0) {
        productsGrid.innerHTML = `
            <div class="no-results" style="grid-column: 1 / -1;">
                <svg class="no-results-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                    <circle cx="11" cy="11" r="8"></circle>
                    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
                <p>No products found matching your criteria.</p>
                <p>Try adjusting your price range or search terms.</p>
            </div>
        `;
    } else {
        let html = '';
        
        // Define source colors and icons
        const sourceStyles = {
            'Daraz': { color: '#f85606', icon: '🛒' },
            'PriceOye': { color: '#00a651', icon: '💰' },
            'OLX': { color: '#002f34', icon: '🏷️' }
        };
        
        // Loop through each source
        for (const [source, products] of Object.entries(grouped)) {
            if (products && products.length > 0) {
                const style = sourceStyles[source] || { color: '#3b82f6', icon: '🛍️' };
                
                html += `
                    <div class="source-section" style="grid-column: 1 / -1;">
                        <div class="source-header" style="border-left-color: ${style.color};">
                            <span class="source-icon">${style.icon}</span>
                            <h3 class="source-title">${source}</h3>
                            <span class="source-count">${products.length} products</span>
                        </div>
                    </div>
                `;
                
                html += products.map(product => `
                    <div class="product-card">
                        <img class="product-image" 
                             src="${product.image || '/static/images/placeholder.png'}" 
                             alt="${product.title}"
                             onerror="this.src='https://via.placeholder.com/280x200?text=No+Image'">
                        <div class="product-info">
                            <h3 class="product-title">${product.title || 'Untitled Product'}</h3>
                            <div class="product-price">${product.currency} ${formatPrice(product.price)}</div>
                            <a href="${product.link}" target="_blank" rel="noopener noreferrer" class="product-link">
                                View Details
                            </a>
                        </div>
                    </div>
                `).join('');
            }
        }
        
        productsGrid.innerHTML = html;
    }
    
    resultsSection.classList.add('active');
}

// Format price with commas
function formatPrice(price) {
    return new Intl.NumberFormat().format(price);
}

// Show toast notification
function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    const icon = type === 'success'
        ? `<svg class="toast-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
             <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
             <polyline points="22 4 12 14.01 9 11.01"></polyline>
           </svg>`
        : `<svg class="toast-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
             <circle cx="12" cy="12" r="10"></circle>
             <line x1="15" y1="9" x2="9" y2="15"></line>
             <line x1="9" y1="9" x2="15" y2="15"></line>
           </svg>`;
    
    toast.innerHTML = `
        ${icon}
        <span class="toast-message">${message}</span>
    `;
    
    toastContainer.appendChild(toast);
    
    // Auto remove after 4 seconds
    setTimeout(() => {
        toast.style.animation = 'slideIn 0.3s ease reverse';
        setTimeout(() => toast.remove(), 300);
    }, 4000);
}
