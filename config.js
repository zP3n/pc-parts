const CONFIG = {
    API_KEY: process.env.GOOGLE_SHEETS_API_KEY,
    SPREADSHEET_ID: process.env.GOOGLE_SHEETS_ID,
    SHEET_NAME: 'Sheet1'
};

if (!CONFIG.API_KEY || !CONFIG.SPREADSHEET_ID) {
    console.error('環境変数が設定されていません');
}

export default CONFIG; 