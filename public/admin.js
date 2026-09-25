const API = 'http://127.0.0.1:8000/api';
const token = localStorage.getItem('pos_token');
const userName = localStorage.getItem('pos_user');
const userRole = localStorage.getItem('pos_role');

// ─── AUTH CHECK ───
if (!token || userRole !== 'admin') {
    window.location.href = 'login.html';
}

function logout() {
    fetch(`${API}/logout`, {
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

let allProducts = [];
let allUsers = [];

// ─── PAGE NAVIGATION ───
function showPage(page) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));

    document.getElementById(`page-${page}`).classList.add('active');
    event.target.classList.add('active');

    const titles = {
        dashboard: 'Dashboard',
        products:  'Products Management',
        sales:     'Sales History',
        grn:       'GRN / Stock In',
        alerts:    '⚠️ Stock Alerts',
        reports:   '📈 Reports & Charts',
        users:     '👥 User Management',
    };
    document.getElementById('pageTitle').textContent = titles[page];

    if (page === 'dashboard') loadDashboard();
    if (page === 'products')  loadProducts();
    if (page === 'sales')     loadSales();
    if (page === 'grn')       loadGrn();
    if (page === 'reports')   loadReports();
    if (page === 'users')     loadUsers();
}

// ─── DASHBOARD ───
async function loadDashboard() {
    document.getElementById('userGreeting').textContent = `👋 ${userName}`;

    const [productsRes, reportRes, alertsRes] = await Promise.all([
        fetch(`${API}/products`),
        fetch(`${API}/sales/report`),
        fetch(`${API}/products/low-stock`)
    ]);

    const products = await productsRes.json();
    const report   = await reportRes.json();
    const alerts   = await alertsRes.json();

    document.getElementById('statProducts').textContent  = products.length;
    document.getElementById('statSales').textContent     = report.total_sales;
    document.getElementById('statRevenue').textContent   = `Rs. ${parseFloat(report.total_revenue).toFixed(2)}`;
    document.getElementById('statLowStock').textContent  = alerts.low_stock_count;

    const tbody = document.getElementById('dashboardSales');
    tbody.innerHTML = '';
    if (report.sales.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;color:#888">No sales today</td></tr>';
        return;
    }
    report.sales.forEach(sale => {
        tbody.innerHTML += `
            <tr>
                <td>#${sale.id}</td>
                <td>${sale.items.length} items</td>
                <td>Rs. ${parseFloat(sale.total_amount).toFixed(2)}</td>
                <td>${sale.payment_method}</td>
                <td>${new Date(sale.created_at).toLocaleTimeString()}</td>
            </tr>
        `;
    });
}

// ─── PRODUCTS ───
async function loadProducts() {
    const res = await fetch(`${API}/products`);
    allProducts = await res.json();

    const tbody = document.getElementById('productsTable');
    tbody.innerHTML = '';
    allProducts.forEach(p => {
        tbody.innerHTML += `
            <tr>
                <td>${p.id}</td>
                <td>${p.name}</td>
                <td>${p.barcode}</td>
                <td>${p.category}</td>
                <td>Rs. ${parseFloat(p.price).toFixed(2)}</td>
                <td>${p.stock}</td>
                <td>
                    <button class="btn-edit" onclick="editProduct(${p.id})">✏️ Edit</button>
                    <button class="btn-delete" onclick="deleteProduct(${p.id}, '${p.name}')">🗑️ Delete</button>
                </td>
            </tr>
        `;
    });
}

function showAddProduct() {
    document.getElementById('formTitle').textContent   = 'Add New Product';
    document.getElementById('editProductId').value     = '';
    document.getElementById('fieldName').value         = '';
    document.getElementById('fieldBarcode').value      = '';
    document.getElementById('fieldPrice').value        = '';
    document.getElementById('fieldStock').value        = '';
    document.getElementById('fieldCategory').value     = 'Beverages';
    document.getElementById('productForm').style.display = 'block';
}

function hideProductForm() {
    document.getElementById('productForm').style.display = 'none';
}

function editProduct(id) {
    const p = allProducts.find(p => p.id === id);
    document.getElementById('formTitle').textContent   = 'Edit Product';
    document.getElementById('editProductId').value     = p.id;
    document.getElementById('fieldName').value         = p.name;
    document.getElementById('fieldBarcode').value      = p.barcode;
    document.getElementById('fieldPrice').value        = p.price;
    document.getElementById('fieldStock').value        = p.stock;
    document.getElementById('fieldCategory').value     = p.category;
    document.getElementById('productForm').style.display = 'block';
    window.scrollTo(0, 0);
}

async function saveProduct() {
    const id   = document.getElementById('editProductId').value;
    const data = {
        name:     document.getElementById('fieldName').value,
        barcode:  document.getElementById('fieldBarcode').value,
        price:    document.getElementById('fieldPrice').value,
        stock:    document.getElementById('fieldStock').value,
        category: document.getElementById('fieldCategory').value,
    };

    const url    = id ? `${API}/products/${id}` : `${API}/products`;
    const method = id ? 'PUT' : 'POST';

    const res = await fetch(url, {
        method,
        headers: {
            'Content-Type': 'application/json',
            'Accept':       'application/json'
        },
        body: JSON.stringify(data)
    });

    if (res.ok) {
        alert(id ? '✅ Product updated!' : '✅ Product added!');
        hideProductForm();
        loadProducts();
    } else {
        const err = await res.json();
        alert('❌ Error: ' + JSON.stringify(err.errors));
    }
}

async function deleteProduct(id, name) {
    if (!confirm(`🗑️ Delete "${name}"? This cannot be undone!`)) return;
    const res = await fetch(`${API}/products/${id}`, {
        method:  'DELETE',
        headers: { 'Accept': 'application/json' }
    });
    if (res.ok) {
        alert('✅ Product deleted!');
        loadProducts();
    }
}

// ─── SALES ───
async function loadSales() {
    const dateFilter = document.getElementById('salesDateFilter').value;
    const res        = await fetch(`${API}/sales`);
    let sales        = await res.json();

    // Filter by date if selected
    if (dateFilter) {
        sales = sales.filter(sale => {
            const saleDate = new Date(sale.created_at).toISOString().split('T')[0];
            return saleDate === dateFilter;
        });
        document.getElementById('salesFilterInfo').textContent =
            `Showing ${sales.length} sale(s) for ${dateFilter}`;
        document.getElementById('salesSummary').style.display = 'block';
    } else {
        document.getElementById('salesFilterInfo').textContent =
            `Showing all ${sales.length} sales`;
        document.getElementById('salesSummary').style.display = 'block';
    }

    // Calculate summary
    const totalRevenue = sales.reduce((sum, s) => sum + parseFloat(s.total_amount), 0);
    const totalItems   = sales.reduce((sum, s) => sum + s.items.length, 0);

    document.getElementById('summaryCount').textContent   = sales.length;
    document.getElementById('summaryRevenue').textContent = `Rs. ${totalRevenue.toFixed(2)}`;
    document.getElementById('summaryItems').textContent   = totalItems;

    // Render table
    const tbody = document.getElementById('salesTable');
    tbody.innerHTML = '';

    if (sales.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="7" style="text-align:center;color:#888;padding:24px">
                    No sales found ${dateFilter ? `for ${dateFilter}` : ''}
                </td>
            </tr>`;
        return;
    }

    sales.forEach(sale => {
        tbody.innerHTML += `
            <tr>
                <td>#${sale.id}</td>
                <td>${sale.items.length} items</td>
                <td>Rs. ${parseFloat(sale.total_amount).toFixed(2)}</td>
                <td>Rs. ${parseFloat(sale.amount_paid).toFixed(2)}</td>
                <td>Rs. ${parseFloat(sale.change_amount).toFixed(2)}</td>
                <td>${sale.payment_method}</td>
                <td>${new Date(sale.created_at).toLocaleString()}</td>
            </tr>
        `;
    });
}

function clearDateFilter() {
    document.getElementById('salesDateFilter').value = '';
    loadSales();
}

// ─── GRN ───
async function loadGrn() {
    const res  = await fetch(`${API}/grns`);
    const grns = await res.json();

    const tbody = document.getElementById('grnTable');
    tbody.innerHTML = '';
    if (grns.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;color:#888">No GRN records yet</td></tr>';
        return;
    }
    grns.forEach(grn => {
        tbody.innerHTML += `
            <tr>
                <td>${grn.grn_number}</td>
                <td>${grn.supplier_name}</td>
                <td>${grn.received_date}</td>
                <td>Rs. ${parseFloat(grn.total_cost).toFixed(2)}</td>
                <td>${grn.items.length} products</td>
            </tr>
        `;
    });
}

function showGrnForm() {
    document.getElementById('grnDate').value = new Date().toISOString().split('T')[0];
    loadProductDropdowns();
    document.getElementById('grnForm').style.display = 'block';
}

function hideGrnForm() {
    document.getElementById('grnForm').style.display = 'none';
}

function loadProductDropdowns() {
    const selects = document.querySelectorAll('.grn-product');
    selects.forEach(select => {
        select.innerHTML = allProducts.map(p =>
            `<option value="${p.id}">${p.name}</option>`
        ).join('');
    });
}

function addGrnRow() {
    const row = document.createElement('div');
    row.className = 'grn-item-row';
    row.innerHTML = `
        <select class="grn-product">
            ${allProducts.map(p => `<option value="${p.id}">${p.name}</option>`).join('')}
        </select>
        <input type="number" class="grn-qty" placeholder="Qty" min="1" />
        <input type="number" class="grn-cost" placeholder="Cost/unit" min="0" />
        <button onclick="removeGrnRow(this)">✖</button>
    `;
    document.getElementById('grnItems').appendChild(row);
}

function removeGrnRow(btn) {
    const rows = document.querySelectorAll('.grn-item-row');
    if (rows.length > 1) btn.parentElement.remove();
    else alert('⚠️ At least one item is required!');
}

async function saveGrn() {
    const supplier = document.getElementById('grnSupplier').value;
    const date     = document.getElementById('grnDate').value;
    const notes    = document.getElementById('grnNotes').value;

    if (!supplier || !date) {
        alert('⚠️ Please fill supplier name and date!');
        return;
    }

    const rows  = document.querySelectorAll('.grn-item-row');
    const items = [];
    rows.forEach(row => {
        items.push({
            product_id:    row.querySelector('.grn-product').value,
            quantity:      row.querySelector('.grn-qty').value,
            cost_per_unit: row.querySelector('.grn-cost').value,
        });
    });

    const res = await fetch(`${API}/grns`, {
        method:  'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept':       'application/json'
        },
        body: JSON.stringify({ supplier_name: supplier, received_date: date, notes, items })
    });

    if (res.ok) {
        alert('✅ GRN saved! Stock updated successfully.');
        hideGrnForm();
        loadGrn();
    } else {
        const err = await res.json();
        alert('❌ Error: ' + JSON.stringify(err.errors));
    }
}

// ─── STOCK ALERTS ───
async function loadAlerts() {
    const res  = await fetch(`${API}/products/low-stock`);
    const data = await res.json();
    const div  = document.getElementById('alertsContent');

    if (data.low_stock_count === 0) {
        div.innerHTML = `
            <div style="text-align:center;padding:40px;color:#34a853;font-size:18px">
                ✅ All products have sufficient stock!
            </div>`;
        return;
    }

    div.innerHTML = `<h3 style="margin-bottom:16px;color:#ea4335">
        ⚠️ ${data.low_stock_count} product(s) running low!</h3>`;

    data.products.forEach(p => {
        div.innerHTML += `
            <div class="alert-card">
                <div>
                    <h4>${p.name}</h4>
                    <p>Category: ${p.category} | Barcode: ${p.barcode}</p>
                </div>
                <div class="stock-badge">Stock: ${p.stock}</div>
            </div>
        `;
    });
}

// ─── USER MANAGEMENT ───
async function loadUsers() {
    const res = await fetch(`${API}/users`, {
        headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json'
        }
    });
    allUsers = await res.json();

    const tbody = document.getElementById('usersTable');
    tbody.innerHTML = '';
    allUsers.forEach(u => {
        tbody.innerHTML += `
            <tr>
                <td>${u.id}</td>
                <td>${u.name}</td>
                <td>${u.email}</td>
                <td>
                    <span style="background:${u.role === 'admin' ? '#1a73e8' : '#34a853'};
                        color:white;padding:4px 10px;border-radius:12px;font-size:12px">
                        ${u.role}
                    </span>
                </td>
                <td>${new Date(u.created_at).toLocaleDateString()}</td>
                <td>
                    <button class="btn-edit" onclick="editUser(${u.id})">✏️ Edit</button>
                    <button class="btn-delete" onclick="deleteUser(${u.id}, '${u.name}')">🗑️ Delete</button>
                </td>
            </tr>
        `;
    });
}

function showAddUser() {
    document.getElementById('userFormTitle').textContent  = 'Add New User';
    document.getElementById('editUserId').value           = '';
    document.getElementById('userFieldName').value        = '';
    document.getElementById('userFieldEmail').value       = '';
    document.getElementById('userFieldPassword').value    = '';
    document.getElementById('userFieldRole').value        = 'cashier';
    document.getElementById('userForm').style.display     = 'block';
}

function hideUserForm() {
    document.getElementById('userForm').style.display = 'none';
}

function editUser(id) {
    const u = allUsers.find(u => u.id === id);
    document.getElementById('userFormTitle').textContent  = 'Edit User';
    document.getElementById('editUserId').value           = u.id;
    document.getElementById('userFieldName').value        = u.name;
    document.getElementById('userFieldEmail').value       = u.email;
    document.getElementById('userFieldPassword').value    = '';
    document.getElementById('userFieldRole').value        = u.role;
    document.getElementById('userForm').style.display     = 'block';
    window.scrollTo(0, 0);
}

async function saveUser() {
    const id   = document.getElementById('editUserId').value;
    const data = {
        name:     document.getElementById('userFieldName').value,
        email:    document.getElementById('userFieldEmail').value,
        password: document.getElementById('userFieldPassword').value,
        role:     document.getElementById('userFieldRole').value,
    };

    const url    = id ? `${API}/users/${id}` : `${API}/users`;
    const method = id ? 'PUT' : 'POST';

    const res = await fetch(url, {
        method,
        headers: {
            'Content-Type':  'application/json',
            'Accept':        'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data)
    });

    if (res.ok) {
        alert(id ? '✅ User updated!' : '✅ User added!');
        hideUserForm();
        loadUsers();
    } else {
        const err = await res.json();
        alert('❌ Error: ' + JSON.stringify(err.errors));
    }
}

async function deleteUser(id, name) {
    if (!confirm(`🗑️ Delete user "${name}"? They will lose access immediately!`)) return;

    const res = await fetch(`${API}/users/${id}`, {
        method:  'DELETE',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Accept':        'application/json'
        }
    });

    if (res.ok) {
        alert('✅ User deleted!');
        loadUsers();
    }
}
// ─── REPORTS & CHARTS ───
let revenueChartInstance = null;
let salesChartInstance   = null;

async function loadReports() {
    const res  = await fetch(`${API}/sales/weekly`);
    const data = await res.json();

    const labels  = data.map(d => d.label);
    const revenue = data.map(d => parseFloat(d.revenue));
    const sales   = data.map(d => d.sales);

    // ── Stats ──
    const totalRevenue = revenue.reduce((a, b) => a + b, 0);
    const totalSales   = sales.reduce((a, b) => a + b, 0);
    const bestRevenue  = Math.max(...revenue);
    const avgSales     = (totalSales / 7).toFixed(1);

    document.getElementById('weekRevenue').textContent = `Rs. ${totalRevenue.toFixed(2)}`;
    document.getElementById('weekSales').textContent   = totalSales;
    document.getElementById('bestDay').textContent     = `Rs. ${bestRevenue.toFixed(2)}`;
    document.getElementById('avgSales').textContent    = avgSales;

    // ── Revenue Bar Chart ──
    if (revenueChartInstance) revenueChartInstance.destroy();
    revenueChartInstance = new Chart(
        document.getElementById('revenueChart'),
        {
            type: 'bar',
            data: {
                labels,
                datasets: [{
                    label: 'Revenue (Rs.)',
                    data: revenue,
                    backgroundColor: 'rgba(26, 115, 232, 0.7)',
                    borderColor: '#1a73e8',
                    borderWidth: 2,
                    borderRadius: 6,
                }]
            },
            options: {
                responsive: true,
                plugins: { legend: { display: false } },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: value => `Rs. ${value}`
                        }
                    }
                }
            }
        }
    );

    // ── Sales Count Line Chart ──
    if (salesChartInstance) salesChartInstance.destroy();
    salesChartInstance = new Chart(
        document.getElementById('salesChart'),
        {
            type: 'line',
            data: {
                labels,
                datasets: [{
                    label: 'Sales Count',
                    data: sales,
                    backgroundColor: 'rgba(52, 168, 83, 0.1)',
                    borderColor: '#34a853',
                    borderWidth: 3,
                    pointBackgroundColor: '#34a853',
                    pointRadius: 6,
                    fill: true,
                    tension: 0.4,
                }]
            },
            options: {
                responsive: true,
                plugins: { legend: { display: false } },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: { stepSize: 1 }
                    }
                }
            }
        }
    );
}

// ─── LIVE CLOCK ───
function updateClock() {
    document.getElementById('datetime').textContent = new Date().toLocaleString();
}

// ─── START ───
loadDashboard();
updateClock();
setInterval(updateClock, 1000);
