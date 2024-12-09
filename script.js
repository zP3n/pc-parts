// データの型定義
class PriceItem {
    constructor(id, name, currentPrice, previousPrice, category) {
        this.id = id;
        this.name = name;
        this.currentPrice = currentPrice;
        this.previousPrice = previousPrice;
        this.category = category;
        this.changePercentage = this.calculateChange();
    }

    calculateChange() {
        return ((this.currentPrice - this.previousPrice) / this.previousPrice * 100).toFixed(2);
    }
}

// 仮のデータ
const mockData = [
    new PriceItem(1, 'Intel Core i7-13700K', 45000, 48000, 'CPU'),
    new PriceItem(2, 'AMD Ryzen 7 7800X3D', 52000, 50000, 'CPU'),
    new PriceItem(3, 'NVIDIA RTX 4070', 85000, 89000, 'GPU'),
    new PriceItem(4, 'NVIDIA RTX 4060 Ti', 65000, 68000, 'GPU'),
    new PriceItem(5, 'Crucial 32GB DDR5', 25000, 25000, 'Memory'),
    new PriceItem(6, 'Corsair 64GB DDR5', 45000, 48000, 'Memory'),
    new PriceItem(7, 'Samsung 2TB NVMe', 28000, 30000, 'Storage'),
    new PriceItem(8, 'WD Black 1TB SSD', 15000, 16000, 'Storage'),
];

// 価格アイテムのHTML生成
function createPriceItemHTML(item) {
    // 価格の差分を計算
    const priceDiff = item.currentPrice - item.previousPrice;
    const diffText = priceDiff >= 0 
        ? `+¥${priceDiff.toLocaleString()}` 
        : `-¥${Math.abs(priceDiff).toLocaleString()}`;

    return `
        <div class="price-item" onclick="window.location.href='product-detail.html?id=${item.id}'">
            <h2>${item.name}</h2>
            <div class="price-info">
                <p>現在価格: ¥${item.currentPrice.toLocaleString()}</p>
                <p>先週比: 
                    <span class="price-change ${item.changePercentage > 0 ? 'price-up' : 'price-down'}">
                        ${diffText}
                        (${item.changePercentage > 0 ? '+' : ''}${item.changePercentage}%)
                    </span>
                </p>
            </div>
        </div>
    `;
}

// カテゴリーセクションのHTML生成
function createCategorySection(category, items) {
    return `
        <section class="category-section">
            <h2 class="category-title">${category}</h2>
            <div class="price-list">
                ${items.map(item => createPriceItemHTML(item)).join('')}
            </div>
        </section>
    `;
}

// ローディング表示用の関数
function showLoading(element) {
    element.innerHTML = `
        <div class="loading">
            <p>データを読み込み中...</p>
        </div>
    `;
}

function showError(element, message) {
    element.innerHTML = `
        <div class="error">
            <p>エラー: ${message}</p>
        </div>
    `;
}

// スプレッドシートからデータを取得する関数
async function fetchAllProducts() {
    try {
        const response = await fetch(
            `https://sheets.googleapis.com/v4/spreadsheets/${CONFIG.SPREADSHEET_ID}/values/${CONFIG.SHEET_NAME}?key=${CONFIG.API_KEY}`
        );
        
        if (!response.ok) {
            throw new Error('データの取得に失敗しました');
        }

        const data = await response.json();
        if (!data.values || data.values.length < 2) {
            throw new Error('データが見つかりません');
        }

        const rows = data.values.slice(1);

        return rows.map(row => {
            try {
                const priceHistory = JSON.parse(row[3]);
                const dates = Object.keys(priceHistory).sort();
                const currentPrice = priceHistory[dates[dates.length - 1]];
                const previousPrice = dates.length > 1 ? priceHistory[dates[dates.length - 2]] : currentPrice;

                return {
                    id: row[0],
                    name: row[1],
                    category: row[2],
                    priceHistory: priceHistory,
                    currentPrice: currentPrice,
                    previousPrice: previousPrice,
                    changePercentage: ((currentPrice - previousPrice) / previousPrice * 100).toFixed(2)
                };
            } catch (error) {
                console.error(`データ処理エラー:`, error);
                return null;
            }
        }).filter(item => item !== null);

    } catch (error) {
        console.error('データ取得エラー:', error);
        return [];
    }
}

// ページ読み込み時の処理を更新
document.addEventListener('DOMContentLoaded', async () => {
    const priceList = document.getElementById('price-list');
    showLoading(priceList);

    try {
        // テックデータからスプレッドシートデータに切り替え
        // const products = mockData;  // ← この行をコメントアウト
        const products = await fetchAllProducts(); // この行を有効化

        if (products.length === 0) {
            throw new Error('データを取得できませんでした');
        }

        const currentPage = window.location.pathname.split('/').pop();

        if (currentPage === 'index.html' || currentPage === '') {
            const categories = ['CPU', 'GPU', 'Memory', 'Storage'];
            const categorySections = categories.map(category => {
                const categoryItems = products.filter(item => item.category === category);
                return createCategorySection(category, categoryItems);
            }).join('');
            
            priceList.innerHTML = categorySections;
        } else {
            const category = currentPage.split('.')[0].toUpperCase();
            const filteredData = products.filter(item => item.category === category);
            const priceItemsHTML = filteredData
                .map(item => createPriceItemHTML(item))
                .join('');
            
            priceList.innerHTML = priceItemsHTML;
        }
    } catch (error) {
        showError(priceList, error.message);
    }
}); 
