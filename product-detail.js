async function fetchProductData(productId) {
    const response = await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${CONFIG.SPREADSHEET_ID}/values/${CONFIG.SHEET_NAME}?key=${CONFIG.API_KEY}`
    );
    const data = await response.json();
    const rows = data.values;
    
    // IDに一致する製品を検索
    const product = rows.find(row => row[0] === productId);
    if (!product) return null;

    return {
        id: product[0],
        name: product[1],
        category: product[2],
        priceHistory: JSON.parse(product[3]),
        referenceUrls: product[4] ? product[4].split(',') : [] // カンマ区切りで複数URLに対応
    };
}

function createPriceChart(priceHistory) {
    const ctx = document.getElementById('priceChart').getContext('2d');
    const dates = Object.keys(priceHistory);
    const prices = Object.values(priceHistory);

    new Chart(ctx, {
        type: 'line',
        data: {
            labels: dates,
            datasets: [{
                label: '価格推移',
                data: prices,
                borderColor: '#333',
                tension: 0.1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: false,
                    ticks: {
                        callback: value => `¥${value.toLocaleString()}`
                    }
                }
            }
        }
    });
}

async function initProductDetail() {
    const params = new URLSearchParams(window.location.search);
    const productId = params.get('id');
    
    if (!productId) {
        window.location.href = 'index.html';
        return;
    }

    const product = await fetchProductData(productId);
    if (!product) {
        window.location.href = 'index.html';
        return;
    }

    // 参考URLのHTML生成
    const urlsHtml = product.referenceUrls.length > 0 
        ? `
            <div class="reference-urls">
                <h3>価格参考URL</h3>
                <ul>
                    ${product.referenceUrls.map(url => `
                        <li><a href="${url}" target="_blank" rel="noopener noreferrer">${new URL(url).hostname}</a></li>
                    `).join('')}
                </ul>
            </div>
        `
        : '';

    // ヘッダー部分の表示を修正
    document.getElementById('product-info').innerHTML = `
        <div class="product-header">
            <h1 id="product-name">${product.name}</h1>
            <span class="current-price">¥${Object.values(product.priceHistory).pop().toLocaleString()}</span>
        </div>
        <div class="price-history">
            <canvas id="priceChart"></canvas>
        </div>
        ${urlsHtml}
        <div id="product-details" class="details-grid"></div>
    `;

    createPriceChart(product.priceHistory);
}

document.addEventListener('DOMContentLoaded', initProductDetail); 