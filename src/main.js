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
            // 既存のQRコードをクリア
            this.canvas.innerHTML = '';
            
            // QRコードの生成オプション
            const options = {
                text: qrText,
                width: 300,
                height: 300,
                colorDark: '#000000',
                colorLight: '#FFFFFF',
                correctLevel: QRCode.CorrectLevel.M
            };
            
            // QRコードを生成
            const qr = new QRCode(this.canvas, options);
            
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
            // QRコードのimg要素を取得
            const qrImg = this.canvas.querySelector('img');
            if (!qrImg) {
                this.showError('QRコードが見つかりません');
                return;
            }
            
            // キャンバスを作成してPNG画像を生成
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            canvas.width = 300;
            canvas.height = 300;
            
            // 白い背景を描画
            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(0, 0, 300, 300);
            
            // QRコード画像を描画
            ctx.drawImage(qrImg, 0, 0, 300, 300);
            
            // PNG画像をダウンロード
            const link = document.createElement('a');
            link.download = 'qrcode.png';
            link.href = canvas.toDataURL('image/png');
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
            // QRコードのimg要素を取得
            const qrImg = this.canvas.querySelector('img');
            if (!qrImg) {
                this.showError('QRコードが見つかりません');
                return;
            }
            
            // キャンバスを作成してQRコードを描画
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            canvas.width = 300;
            canvas.height = 300;
            
            // 白い背景を描画
            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(0, 0, 300, 300);
            
            // QRコード画像を描画
            ctx.drawImage(qrImg, 0, 0, 300, 300);
            
            // キャンバスからBase64データを取得
            const imageDataUrl = canvas.toDataURL('image/png');
            
            // SVGを生成（Base64画像を埋め込み）
            const svgContent = `<svg width="300" height="300" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
                <rect width="300" height="300" fill="white"/>
                <image href="${imageDataUrl}" width="300" height="300"/>
            </svg>`;
            
            // SVGファイルをダウンロード
            const blob = new Blob([svgContent], { type: 'image/svg+xml;charset=utf-8' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.download = 'qrcode.svg';
            link.href = url;
            link.click();
            URL.revokeObjectURL(url);
            
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
