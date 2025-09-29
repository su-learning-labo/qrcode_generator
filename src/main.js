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
            // kjua関数が存在するかチェック
            if (typeof kjua === 'undefined') {
                this.showError('QRコードライブラリが読み込まれていません');
                return;
            }
            
            // 既存のQRコードをクリア
            this.canvas.innerHTML = '';
            
            // kjuaライブラリのオプション
            const options = {
                text: qrText,
                render: 'image',
                size: 300,
                fill: '#000000',
                back: '#FFFFFF',
                ecLevel: 'M',
                quiet: 0,
                crisp: true,
                minVersion: 1
            };
            
            // QRコードを生成
            const element = kjua(options);
            
            if (element) {
                this.canvas.appendChild(element);
                this.currentQRCodeData = qrText;
                this.hideError();
            } else {
                throw new Error('kjuaが要素を返しませんでした');
            }
            
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
            // img要素またはcanvas要素を取得
            const imgElement = this.canvas.querySelector('img');
            const canvasElement = this.canvas.querySelector('canvas');
            
            if (imgElement) {
                // img要素の場合：新しいcanvasを作成してPNGに変換
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                canvas.width = 300;
                canvas.height = 300;
                
                // 白い背景を描画
                ctx.fillStyle = '#FFFFFF';
                ctx.fillRect(0, 0, 300, 300);
                
                // img要素を描画
                ctx.drawImage(imgElement, 0, 0, 300, 300);
                
                // PNG画像をダウンロード
                const link = document.createElement('a');
                link.download = 'qrcode.png';
                link.href = canvas.toDataURL('image/png');
                link.click();
            } else if (canvasElement) {
                // canvas要素の場合：直接PNGに変換
                const link = document.createElement('a');
                link.download = 'qrcode.png';
                link.href = canvasElement.toDataURL('image/png');
                link.click();
            } else {
                this.showError('QRコードが見つかりません');
                return;
            }
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
                text: qrText,
                render: 'svg',
                size: 300,
                fill: '#000000',
                back: '#FFFFFF',
                ecLevel: 'M',
                quiet: 0,
                crisp: true,
                minVersion: 1
            };
            
            // SVG要素を生成
            const svgElement = kjua(options);
            if (!svgElement) {
                this.showError('SVG生成に失敗しました');
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

// DOMContentLoadedイベントまたは即座に初期化
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => new QRCodeGenerator());
} else {
    new QRCodeGenerator();
}

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

// 開発時のデバッグ情報
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    console.log('QRコードジェネレーターが初期化されました');
}
