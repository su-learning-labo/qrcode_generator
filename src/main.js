// QRコードジェネレーターのメインJavaScriptファイル

class QRCodeGenerator {
    constructor() {
        this.canvas = document.getElementById('qr-canvas');
        this.textInput = document.getElementById('text-input');
        this.downloadPngBtn = document.getElementById('download-png');
        this.downloadSvgBtn = document.getElementById('download-svg');
        
        this.defaultText = 'https://example.com';
        this.currentQRCodeData = null;
        
        this.init();
    }
    
    init() {
        // イベントリスナーの設定
        this.textInput.addEventListener('input', () => this.generateQRCode());
        this.downloadPngBtn.addEventListener('click', () => this.downloadPNG());
        this.downloadSvgBtn.addEventListener('click', () => this.downloadSVG());
        
        // 初期QRコードの生成
        this.generateQRCode();
    }
    
    generateQRCode() {
        const text = this.textInput.value.trim();
        const qrText = text || this.defaultText;
        
        try {
            // kjuaライブラリのオプション
            const options = {
                render: 'canvas',
                crisp: true,
                minVersion: 1,
                ecLevel: 'M',
                size: 300,
                ratio: null,
                fill: '#000000',
                back: '#FFFFFF',
                text: qrText,
                rounded: 0,
                quiet: 2,
                mode: 0,
                mSize: 0.1,
                mPosX: 0.5,
                mPosY: 0.5,
                label: '',
                fontname: 'sans',
                fontcolor: '#000000',
                image: null
            };
            
            // QRコードを生成
            kjua(this.canvas, options);
            
            // 成功時の処理
            this.currentQRCodeData = qrText;
            this.hideError();
            
        } catch (error) {
            console.error('QRコード生成エラー:', error);
            this.showError('QRコードの生成に失敗しました');
        }
    }
    
    downloadPNG() {
        if (!this.currentQRCodeData) {
            this.showError('ダウンロードするQRコードがありません');
            return;
        }
        
        try {
            // キャンバスからPNG画像を生成
            const link = document.createElement('a');
            link.download = 'qrcode.png';
            link.href = this.canvas.toDataURL('image/png');
            link.click();
        } catch (error) {
            console.error('PNGダウンロードエラー:', error);
            this.showError('PNGダウンロードに失敗しました');
        }
    }
    
    downloadSVG() {
        if (!this.currentQRCodeData) {
            this.showError('ダウンロードするQRコードがありません');
            return;
        }
        
        try {
            // kjuaでSVGを生成
            const qrText = this.textInput.value.trim() || this.defaultText;
            const options = {
                render: 'svg',
                crisp: true,
                minVersion: 1,
                ecLevel: 'M',
                size: 300,
                ratio: null,
                fill: '#000000',
                back: '#FFFFFF',
                text: qrText,
                rounded: 0,
                quiet: 2,
                mode: 0,
                mSize: 0.1,
                mPosX: 0.5,
                mPosY: 0.5,
                label: '',
                fontname: 'sans',
                fontcolor: '#000000',
                image: null
            };
            
            // 一時的なdiv要素を作成
            const tempDiv = document.createElement('div');
            tempDiv.style.position = 'absolute';
            tempDiv.style.left = '-9999px';
            tempDiv.style.top = '-9999px';
            document.body.appendChild(tempDiv);
            
            // SVGを生成
            kjua(tempDiv, options);
            
            // SVG要素を取得
            const svgElement = tempDiv.querySelector('svg');
            if (!svgElement) {
                this.showError('SVG生成に失敗しました');
                document.body.removeChild(tempDiv);
                return;
            }
            
            // SVGファイルをダウンロード
            const svgString = new XMLSerializer().serializeToString(svgElement);
            const blob = new Blob([svgString], { type: 'image/svg+xml' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.download = 'qrcode.svg';
            link.href = url;
            link.click();
            URL.revokeObjectURL(url);
            
            // 一時的な要素を削除
            document.body.removeChild(tempDiv);
            
        } catch (error) {
            console.error('SVGダウンロードエラー:', error);
            this.showError('SVGダウンロードに失敗しました');
        }
    }
    
    showError(message) {
        // エラーメッセージを表示（既存のエラーメッセージがあれば削除）
        this.hideError();
        
        const errorDiv = document.createElement('div');
        errorDiv.id = 'error-message';
        errorDiv.className = 'error-message';
        errorDiv.textContent = message;
        errorDiv.style.cssText = `
            background: #ffebee;
            color: #c62828;
            padding: 10px 15px;
            border-radius: 5px;
            margin: 10px 0;
            border-left: 4px solid #c62828;
            font-weight: 500;
        `;
        
        this.canvas.parentNode.insertBefore(errorDiv, this.canvas.nextSibling);
        
        // 3秒後に自動でエラーメッセージを削除
        setTimeout(() => this.hideError(), 3000);
    }
    
    hideError() {
        const errorMessage = document.getElementById('error-message');
        if (errorMessage) {
            errorMessage.remove();
        }
    }
}

// ページ読み込み完了後にアプリを初期化
document.addEventListener('DOMContentLoaded', () => {
    new QRCodeGenerator();
});

// ユーティリティ関数
const utils = {
    // 文字列の長さをチェック（QRコードの制限内かどうか）
    validateInputLength: (text) => {
        const maxLength = 2953; // QRコードの最大文字数（エラー訂正レベルM）
        return text.length <= maxLength;
    },
    
    // URLかどうかをチェック
    isURL: (text) => {
        try {
            new URL(text);
            return true;
        } catch {
            return false;
        }
    },
    
    // 入力テキストの種類を判定
    getInputType: (text) => {
        if (utils.isURL(text)) {
            return 'URL';
        } else if (text.includes('@')) {
            return 'メールアドレス';
        } else if (/^\d+$/.test(text)) {
            return '電話番号';
        } else {
            return 'テキスト';
        }
    }
};

// デバッグ用（開発時のみ）
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    console.log('QRコードジェネレーターが初期化されました');
    console.log('利用可能なユーティリティ関数:', Object.keys(utils));
}
