const API = 'http://127.0.0.1:8000/api';
let cart = [];

// ─── AUTH CHECK ───
const token = localStorage.getItem('pos_token');
const userName = localStorage.getItem('pos_user');

if (!token) {
    window.location.href = 'login.html';
}

function logout() {
    fetch('http://127.0.0.1:8000/api/logout', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json'
        }
    }).finally(() => {
        localStorage.clear();
        window.location.href = 'login.html';
    });
}

// ─── Load all products when page opens ───
async function loadProducts() {
    document.getElementById('userGreeting').textContent = `👋 ${userName}`;
    const res = await fetch(`${API}/products`);
    const products = await res.json();
    displayProducts(products);
}

// ─── Show products as cards ───
function displayProducts(products) {
    const grid = document.getElementById('productList');
    grid.innerHTML = '';

    if (products.length === 0) {
        grid.innerHTML = '<p style="color:#888">No products found.</p>';
        return;
    }

    products.forEach(product => {
        grid.innerHTML += `
            <div class="product-card" onclick="addToCart(${product.id}, '${product.name}', ${product.price}, ${product.stock})">
                <div class="emoji">${getCategoryEmoji(product.category)}</div>
                <h4>${product.name}</h4>
                <div class="price">Rs. ${parseFloat(product.price).toFixed(2)}</div>
                <div class="stock">Stock: ${product.stock}</div>
            </div>
        `;
    });
}

// ─── Emoji based on category ───
function getCategoryEmoji(category) {
    const emojis = {
        'Beverages':     '🥤',
        'Groceries':     '🌾',
        'Dairy':         '🥛',
        'Bakery':        '🍞',
        'Snacks':        '🍿',
        'Household':     '🧹',
        'Personal Care': '🧴',
    };
    return emojis[category] || '📦';
}

// ─── Search product by barcode or name ───
async function searchProduct() {
    const input = document.getElementById('barcodeInput').value.trim();
    if (!input) { loadProducts(); return; }

    const res = await fetch(`${API}/products/barcode/${input}`);
    if (res.ok) {
        const product = await res.json();
        addToCart(product.id, product.name, product.price, product.stock);
        document.getElementById('barcodeInput').value = '';
        return;
    }

    const allRes = await fetch(`${API}/products`);
    const all = await allRes.json();
    const filtered = all.filter(p =>
        p.name.toLowerCase().includes(input.toLowerCase())
    );
    displayProducts(filtered);
}

// ─── Add product to cart ───
function addToCart(id, name, price, stock) {
    const existing = cart.find(item => item.id === id);
    if (existing) {
        if (existing.quantity >= stock) {
            alert('⚠️ Not enough stock!');
            return;
        }
        existing.quantity++;
    } else {
        cart.push({ id, name, price: parseFloat(price), quantity: 1, stock });
    }
    renderCart();
}

// ─── Remove or reduce item from cart ───
function removeFromCart(id) {
    const existing = cart.find(item => item.id === id);
    if (existing.quantity > 1) {
        existing.quantity--;
    } else {
        cart = cart.filter(item => item.id !== id);
    }
    renderCart();
}

// ─── Render cart items ───
function renderCart() {
    const cartDiv = document.getElementById('cartItems');
    cartDiv.innerHTML = '';
    let total = 0;

    cart.forEach(item => {
        const subtotal = item.price * item.quantity;
        total += subtotal;
        cartDiv.innerHTML += `
            <div class="cart-item">
                <div class="item-name">${item.name}</div>
                <div class="item-qty">
                    <button onclick="removeFromCart(${item.id})">−</button>
                    <span>${item.quantity}</span>
                    <button onclick="addToCart(${item.id}, '${item.name}', ${item.price}, ${item.stock})">+</button>
                </div>
                <div class="item-price">Rs. ${subtotal.toFixed(2)}</div>
            </div>
        `;
    });

    document.getElementById('totalAmount').textContent = `Rs. ${total.toFixed(2)}`;
    calculateChange();
}

// ─── Calculate change ───
function calculateChange() {
    const total = cart.reduce((sum, i) => sum + i.price * i.quantity, 0);
    const paid  = parseFloat(document.getElementById('amountPaid').value) || 0;
    const change = paid - total;
    document.getElementById('changeAmount').textContent =
        `Rs. ${change >= 0 ? change.toFixed(2) : '0.00'}`;
}

// ─── Process the sale ───
async function processSale() {
    if (cart.length === 0) { alert('⚠️ Cart is empty!'); return; }

    const amountPaid = parseFloat(document.getElementById('amountPaid').value);
    const total = cart.reduce((sum, i) => sum + i.price * i.quantity, 0);

    if (!amountPaid || amountPaid < total) {
        alert('⚠️ Amount paid is not enough!');
        return;
    }

    const saleData = {
        items: cart.map(item => ({
            product_id: item.id,
            quantity:   item.quantity
        })),
        payment_method: 'cash',
        amount_paid:    amountPaid
    };

    const res = await fetch(`${API}/sales`, {
        method:  'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept':       'application/json'
        },
        body: JSON.stringify(saleData)
    });

    if (res.ok) {
        const sale = await res.json();
        showReceipt(sale, amountPaid);
        clearCart();
        loadProducts();
    } else {
        alert('❌ Sale failed! Please try again.');
    }
}

// ─── Show receipt modal ───
function showReceipt(sale, amountPaid) {
    const now = new Date();

    document.getElementById('receiptDate').textContent =
        now.toLocaleString();
    document.getElementById('receiptId').textContent =
        `Receipt #${sale.id}`;

    let itemsHTML = '';
    sale.items.forEach(item => {
        itemsHTML += `
            <div class="receipt-item">
                <span>${item.product.name} x${item.quantity}</span>
                <span>Rs. ${parseFloat(item.subtotal).toFixed(2)}</span>
            </div>
        `;
    });
    document.getElementById('receiptItems').innerHTML = itemsHTML;

    document.getElementById('receiptTotal').textContent =
        `Rs. ${parseFloat(sale.total_amount).toFixed(2)}`;
    document.getElementById('receiptPaid').textContent =
        `Rs. ${parseFloat(amountPaid).toFixed(2)}`;
    document.getElementById('receiptChange').textContent =
        `Rs. ${parseFloat(sale.change_amount).toFixed(2)}`;

    document.getElementById('receiptModal').style.display = 'flex';
}

// ─── Print receipt ───
function printReceipt() {
    window.print();
}

// ─── Close receipt ───
function closeReceipt() {
    document.getElementById('receiptModal').style.display = 'none';
}

// ─── Clear the cart ───
function clearCart() {
    cart = [];
    document.getElementById('amountPaid').value = '';
    renderCart();
}

// ─── Live clock ───
function updateClock() {
    const now = new Date();
    document.getElementById('datetime').textContent = now.toLocaleString();
}

// ─── Search on Enter key ───
document.getElementById('barcodeInput').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') searchProduct();
});

// ─── Start everything ───
loadProducts();
updateClock();
setInterval(updateClock, 1000);
