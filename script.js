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
                const priceHistory = JSON.parse(row[4]);
                const dates = Object.keys(priceHistory).sort();
                const currentPrice = priceHistory[dates[dates.length - 1]];
                const previousPrice = dates.length > 1 ? priceHistory[dates[dates.length - 2]] : currentPrice;

                return {
                    id: row[0],
                    name: row[1],
                    category: row[2],
                    subcategory: row[3],
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
            const categories = ['AMD CPU 最新世代', 'AMD CPU X3Dモデル', 'Intel CPU Ultraシリーズ', 'NVIDIA GPU 最新世代', 'AMD GPU 最新世代', 'Intel GPU 最新世代', 'DDR5 メモリー 8GB×2', 'DDR5 メモリー 16GB×2'];
            const categorySections = categories.map(subcategory => {
                const categoryItems = products.filter(item => item.subcategory === subcategory);
                return createCategorySection(subcategory, categoryItems);
            }).join('');
            
            priceList.innerHTML = categorySections;
        } else {
            // const category = currentPage.split('.')[0].toUpperCase();
            // const filteredData = products.filter(item => item.category === category);
            // const priceItemsHTML = filteredData
            //     .map(item => createPriceItemHTML(item))
            //     .join('');
            
            // priceList.innerHTML = priceItemsHTML;
            if(currentPage === "cpu.html"){
                let categories2 = ['AMD CPU 最新世代', 'AMD CPU X3Dモデル', 'Intel CPU Ultraシリーズ', 'AMD CPU Ryzen 7000シリーズ', 'Intel CPU 第14世代', 'AMD CPU Ryzen 5000シリーズ', 'Intel CPU 第13世代', 'AMD CPU 特殊モデル'];
                const categorySections = categories2.map(subcategory => {
                    const categoryItems = products.filter(item => item.subcategory === subcategory);
                    return createCategorySection(subcategory, categoryItems);
                }).join('');
                priceList.innerHTML = categorySections;
            }else if(currentPage === "gpu.html"){
                let categories2 = ['NVIDIA GPU 最新世代', 'AMD GPU 最新世代', 'Intel GPU 最新世代','NVIDIA GPU 3000シリーズ', 'AMD GPU 6000シリーズ', 'Intel GPU Aシリーズ','NVIDIA GPU 1000シリーズ'];
                const categorySections = categories2.map(subcategory => {
                    const categoryItems = products.filter(item => item.subcategory === subcategory);
                    return createCategorySection(subcategory, categoryItems);
                }).join('');
                priceList.innerHTML = categorySections;
            }else if(currentPage === "memory.html"){
                let categories2 = ['DDR5 メモリー 8GB×2', 'DDR5 メモリー 16GB×2'];
                const categorySections = categories2.map(subcategory => {
                    const categoryItems = products.filter(item => item.subcategory === subcategory);
                    return createCategorySection(subcategory, categoryItems);
                }).join('');
                priceList.innerHTML = categorySections;
            }else{
                let categories2 = ['Storage'];
                const categorySections = categories2.map(subcategory => {
                    const categoryItems = products.filter(item => item.subcategory === subcategory);
                    return createCategorySection(subcategory, categoryItems);
                }).join('');
                priceList.innerHTML = categorySections;
            }
        }
    } catch (error) {
        showError(priceList, error.message);
    }
}); 
