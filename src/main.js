// QRコードジェネレーターのメインJavaScriptファイル

class QRCodeGenerator {
    constructor() {
        this.canvas = document.getElementById('qr-canvas');
        this.textInput = document.getElementById('text-input');
        this.downloadPngBtn = document.getElementById('download-png');
        this.downloadSvgBtn = document.getElementById('download-svg');
        this.copyBtn = document.getElementById('copy-qr');
        this.fullscreenBtn = document.getElementById('fullscreen-qr');
        this.charCount = document.querySelector('.char-count');
        this.inputType = document.querySelector('.input-type');
        
        // ロゴ関連の要素
        this.logoSection = document.getElementById('logo-section');
        this.logoUpload = document.getElementById('logo-upload');
        this.logoUploadArea = document.getElementById('logo-upload-area');
        this.uploadPlaceholder = document.getElementById('upload-placeholder');
        this.logoPreview = document.getElementById('logo-preview');
        this.logoImage = document.getElementById('logo-image');
        this.removeLogoBtn = document.getElementById('remove-logo');
        this.toggleLogoBtn = document.getElementById('toggle-logo');
        
        this.defaultText = 'https://example.com';
        this.currentQRCodeData = null;
        this.currentLogoData = null;
        
        this.init();
    }
    
    init() {
        // イベントリスナーの設定
        this.textInput.addEventListener('input', () => {
            this.generateQRCode();
        });
        this.downloadPngBtn.addEventListener('click', () => this.downloadPNG());
        this.downloadSvgBtn.addEventListener('click', () => this.downloadSVG());
        this.copyBtn.addEventListener('click', () => this.copyQRCode());
        this.fullscreenBtn.addEventListener('click', () => this.showFullscreen());
        
        // ロゴアップロード関連のイベントリスナー
        this.toggleLogoBtn.addEventListener('click', () => this.toggleLogoSection());
        this.logoUpload.addEventListener('change', (e) => this.handleLogoUpload(e));
        this.logoUploadArea.addEventListener('click', () => this.logoUpload.click());
        this.logoUploadArea.addEventListener('dragover', (e) => this.handleDragOver(e));
        this.logoUploadArea.addEventListener('dragleave', (e) => this.handleDragLeave(e));
        this.logoUploadArea.addEventListener('drop', (e) => this.handleDrop(e));
        this.removeLogoBtn.addEventListener('click', () => this.removeLogo());
        
        // 初期化
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
                        ecLevel: this.currentLogoData ? 'H' : 'M', // ロゴがある場合はエラー訂正レベルを高く
                        quiet: 0,
                        crisp: true,
                        minVersion: 1
                    };

                    // ロゴがある場合は追加
                    if (this.currentLogoData) {
                        options.image = {
                            src: this.currentLogoData,
                            width: 60,
                            height: 60,
                            x: 120, // 中央位置
                            y: 120
                        };
                        // ロゴがある場合はエラー訂正レベルを最高に
                        options.ecLevel = 'H';
                    }
            
            // デバッグログ
            console.log('QRコード生成オプション:', options);
            console.log('ロゴデータ:', this.currentLogoData ? 'あり' : 'なし');
            
            // QRコードを生成
            const element = kjua(options);
            
            if (element) {
                // プレースホルダーを非表示
                const placeholder = this.canvas.querySelector('.qr-placeholder');
                if (placeholder) {
                    placeholder.style.display = 'none';
                }

                this.canvas.appendChild(element);
                
                // ロゴがある場合は少し遅延して描画（QRコードが完全に描画された後）
                if (this.currentLogoData) {
                    setTimeout(() => {
                        this.addLogoToQRCode(element);
                    }, 500);
                }
                
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
                ecLevel: this.currentLogoData ? 'H' : 'M', // ロゴがある場合はエラー訂正レベルを高く
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
            
            // ロゴがある場合はSVGに埋め込み
            if (this.currentLogoData) {
                this.addLogoToSVG(svgElement);
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
    
    updateInputInfo() {
        const text = this.textInput.value;
        const length = text.length;
        const maxLength = 2953;
        
        // 文字数カウントを更新
        this.charCount.textContent = `${length} / ${maxLength} 文字`;
        
        // 文字数制限の警告
        if (length > maxLength * 0.9) {
            this.charCount.style.color = '#f59e0b';
        } else if (length > maxLength) {
            this.charCount.style.color = '#dc2626';
        } else {
            this.charCount.style.color = '#6b7280';
        }
        
        // 入力タイプを更新
        const inputType = this.getInputType(text);
        this.inputType.textContent = inputType;
        
        // 入力タイプに応じて色を変更
        switch (inputType) {
            case 'URL':
                this.inputType.style.background = '#e0e7ff';
                this.inputType.style.color = '#3730a3';
                break;
            case 'メールアドレス':
                this.inputType.style.background = '#10b981';
                this.inputType.style.color = 'white';
                break;
            case '電話番号':
                this.inputType.style.background = '#f59e0b';
                this.inputType.style.color = 'white';
                break;
            default:
                this.inputType.style.background = '#f3f4f6';
                this.inputType.style.color = '#374151';
        }
    }
    
    copyQRCode() {
        if (!this.currentQRCodeData) {
            this.showError('コピーするQRコードがありません');
            return;
        }
        
        try {
            // QRコード要素を探す（imgまたはcanvas）
            const qrImg = this.canvas.querySelector('img');
            const qrCanvas = this.canvas.querySelector('canvas');
            const qrElement = qrImg || qrCanvas;
            
            if (qrElement && navigator.clipboard && window.ClipboardItem) {
                if (qrElement.tagName === 'IMG') {
                    // img要素の場合
                    navigator.clipboard.write([
                        new ClipboardItem({
                            'image/png': fetch(qrElement.src).then(response => response.blob())
                        })
                    ]).then(() => {
                        this.showSuccess('QRコードをクリップボードにコピーしました');
                    }).catch(() => {
                        // フォールバック: テキストをコピー
                        navigator.clipboard.writeText(this.currentQRCodeData).then(() => {
                            this.showSuccess('テキストをクリップボードにコピーしました');
                        });
                    });
                } else if (qrElement.tagName === 'CANVAS') {
                    // canvas要素の場合、blobに変換してコピー
                    qrElement.toBlob((blob) => {
                        if (blob) {
                            navigator.clipboard.write([
                                new ClipboardItem({
                                    'image/png': blob
                                })
                            ]).then(() => {
                                this.showSuccess('QRコードをクリップボードにコピーしました');
                            }).catch(() => {
                                // フォールバック: テキストをコピー
                                navigator.clipboard.writeText(this.currentQRCodeData).then(() => {
                                    this.showSuccess('テキストをクリップボードにコピーしました');
                                });
                            });
                        } else {
                            // フォールバック: テキストをコピー
                            navigator.clipboard.writeText(this.currentQRCodeData).then(() => {
                                this.showSuccess('テキストをクリップボードにコピーしました');
                            });
                        }
                    }, 'image/png');
                }
            } else {
                // テキストをコピー
                navigator.clipboard.writeText(this.currentQRCodeData).then(() => {
                    this.showSuccess('テキストをクリップボードにコピーしました');
                });
            }
        } catch (error) {
            console.error('コピーエラー:', error);
            this.showError('コピーに失敗しました');
        }
    }
    
    showFullscreen() {
        if (!this.currentQRCodeData) {
            this.showError('表示するQRコードがありません');
            return;
        }
        
        // 全画面表示モーダルを作成
        const modal = document.createElement('div');
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.9);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 10000;
            cursor: pointer;
        `;
        
        // QRコード要素を探す（imgまたはcanvas）
        const qrImg = this.canvas.querySelector('img');
        const qrCanvas = this.canvas.querySelector('canvas');
        const qrElement = qrImg || qrCanvas;
        
        if (qrElement) {
            let fullscreenElement;
            
            if (qrElement.tagName === 'IMG') {
                // img要素の場合
                fullscreenElement = qrElement.cloneNode(true);
            } else if (qrElement.tagName === 'CANVAS') {
                // canvas要素の場合、新しいcanvasを作成してコピー
                fullscreenElement = document.createElement('canvas');
                const ctx = fullscreenElement.getContext('2d');
                const originalCtx = qrElement.getContext('2d');
                
                fullscreenElement.width = qrElement.width;
                fullscreenElement.height = qrElement.height;
                
                // canvasの内容をコピー
                ctx.drawImage(qrElement, 0, 0);
            }
            
            if (fullscreenElement) {
                fullscreenElement.style.cssText = `
                    max-width: 90vw;
                    max-height: 90vh;
                    border-radius: 20px;
                    box-shadow: 0 25px 50px rgba(0, 0, 0, 0.5);
                    background: white;
                `;
                modal.appendChild(fullscreenElement);
            }
        } else {
            // QRコード要素が見つからない場合のフォールバック
            const fallbackDiv = document.createElement('div');
            fallbackDiv.style.cssText = `
                background: white;
                padding: 40px;
                border-radius: 20px;
                text-align: center;
                color: #374151;
                font-size: 18px;
                font-weight: 500;
            `;
            fallbackDiv.textContent = 'QRコードが見つかりません';
            modal.appendChild(fallbackDiv);
        }
        
        // モーダルを閉じるイベント
        modal.addEventListener('click', () => {
            if (modal.parentNode) {
                document.body.removeChild(modal);
            }
        });
        
        // ESCキーで閉じる
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') {
                if (modal.parentNode) {
                    document.body.removeChild(modal);
                }
                document.removeEventListener('keydown', handleKeyDown);
            }
        };
        document.addEventListener('keydown', handleKeyDown);
        
        document.body.appendChild(modal);
    }
    
    showSuccess(message) {
        // 成功メッセージを表示
        this.hideError();
        
        const successDiv = document.createElement('div');
        successDiv.id = 'success-message';
        successDiv.className = 'success-message';
        successDiv.textContent = message;
        successDiv.style.cssText = `
            background: linear-gradient(135deg, #f0fdf4, #dcfce7);
            color: var(--success-600);
            padding: var(--space-4);
            border-radius: var(--radius-lg);
            margin: var(--space-4) 0;
            border-left: 4px solid var(--success-500);
            font-weight: 500;
            box-shadow: var(--shadow-sm);
            animation: slideIn 0.3s ease-out;
        `;
        
        this.canvas.parentNode.insertBefore(successDiv, this.canvas.nextSibling);
        
        // 3秒後に自動で成功メッセージを削除
        setTimeout(() => {
            if (successDiv.parentNode) {
                successDiv.remove();
            }
        }, 3000);
    }
    
    getInputType(text) {
        if (this.isURL(text)) {
            return 'URL';
        } else if (text.includes('@')) {
            return 'メールアドレス';
        } else if (/^\d+$/.test(text)) {
            return '電話番号';
        } else {
            return 'テキスト';
        }
    }
    
    isURL(text) {
        try {
            new URL(text);
            return true;
        } catch {
            return false;
        }
    }
    
    // ロゴアップロード関連のメソッド
    handleLogoUpload(event) {
        const file = event.target.files[0];
        if (file) {
            this.processLogoFile(file);
        }
    }
    
    handleDragOver(event) {
        event.preventDefault();
        this.logoUploadArea.classList.add('dragover');
    }
    
    handleDragLeave(event) {
        event.preventDefault();
        this.logoUploadArea.classList.remove('dragover');
    }
    
    handleDrop(event) {
        event.preventDefault();
        this.logoUploadArea.classList.remove('dragover');
        
        const files = event.dataTransfer.files;
        if (files.length > 0) {
            this.processLogoFile(files[0]);
        }
    }
    
    processLogoFile(file) {
        // ファイル形式のチェック
        if (!file.type.startsWith('image/')) {
            this.showError('画像ファイルを選択してください');
            return;
        }
        
        // ファイルサイズのチェック（2MB以下）
        if (file.size > 2 * 1024 * 1024) {
            this.showError('ファイルサイズは2MB以下にしてください');
            return;
        }
        
        const reader = new FileReader();
        reader.onload = (e) => {
            this.currentLogoData = e.target.result;
            this.showLogoPreview(e.target.result);
            this.generateQRCode(); // QRコードを再生成
            this.showSuccess('ロゴが追加されました');
        };
        reader.onerror = () => {
            this.showError('ファイルの読み込みに失敗しました');
        };
        reader.readAsDataURL(file);
    }
    
    showLogoPreview(imageData) {
        this.logoImage.src = imageData;
        this.uploadPlaceholder.style.display = 'none';
        this.logoPreview.style.display = 'block';
    }
    
    removeLogo() {
        this.currentLogoData = null;
        this.logoUpload.value = '';
        this.uploadPlaceholder.style.display = 'block';
        this.logoPreview.style.display = 'none';
        this.generateQRCode(); // QRコードを再生成
        this.showSuccess('ロゴが削除されました');
    }
    
    toggleLogoSection() {
        const isVisible = this.logoSection.style.display !== 'none';
        
        if (isVisible) {
            // 非表示にする
            this.logoSection.style.display = 'none';
            this.toggleLogoBtn.classList.remove('active');
            this.toggleLogoBtn.querySelector('.btn-text').textContent = 'ロゴ追加';
            
            // ロゴがある場合は削除
            if (this.currentLogoData) {
                this.removeLogo();
            }
        } else {
            // 表示する
            this.logoSection.style.display = 'block';
            this.toggleLogoBtn.classList.add('active');
            this.toggleLogoBtn.querySelector('.btn-text').textContent = 'ロゴ非表示';
        }
    }
    
    addLogoToQRCode(qrElement) {
        console.log('ロゴ描画開始:', qrElement);
        
        // QRコード要素がimgかcanvasかを確認
        const img = qrElement.querySelector('img') || qrElement;
        const canvas = qrElement.querySelector('canvas') || qrElement;
        
        console.log('検出された要素:', { img: img?.tagName, canvas: canvas?.tagName });
        
        if (img && img.tagName === 'IMG') {
            // img要素の場合、canvasに変換してロゴを描画
            console.log('img要素でロゴ描画');
            this.drawLogoOnImage(img);
        } else if (canvas && canvas.tagName === 'CANVAS') {
            // canvas要素の場合、直接ロゴを描画
            console.log('canvas要素でロゴ描画');
            this.drawLogoOnCanvas(canvas);
        } else {
            console.log('QRコード要素が見つかりません');
        }
    }
    
    drawLogoOnImage(img) {
        console.log('drawLogoOnImage開始:', img);
        
        // まずQRコードが正しく表示されているか確認
        if (!img.src || img.naturalWidth === 0) {
            console.log('QRコード画像が読み込まれていません');
            return;
        }
        
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        // 画像サイズを取得
        const size = 300;
        canvas.width = size;
        canvas.height = size;
        
        // QRコード画像を描画
        ctx.drawImage(img, 0, 0, size, size);
        
        // ロゴ画像を読み込んで描画
        const logoImg = new Image();
        logoImg.onload = () => {
            console.log('ロゴ画像読み込み完了');
            
            // 中央にロゴを描画（60x60px）
            const logoSize = 60;
            const x = (size - logoSize) / 2;
            const y = (size - logoSize) / 2;
            
            // 白い背景を描画
            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(x - 5, y - 5, logoSize + 10, logoSize + 10);
            
            // ロゴを描画
            ctx.drawImage(logoImg, x, y, logoSize, logoSize);
            
            // 元のimg要素をcanvasに置き換え
            img.parentNode.replaceChild(canvas, img);
            
            console.log('ロゴ描画完了');
        };
        logoImg.onerror = () => {
            console.error('ロゴ画像の読み込みに失敗');
        };
        logoImg.src = this.currentLogoData;
    }
    
    drawLogoOnCanvas(targetCanvas, sourceImg = null) {
        const ctx = targetCanvas.getContext('2d');
        const size = targetCanvas.width;
        
        // QRコード画像を描画
        if (sourceImg) {
            ctx.drawImage(sourceImg, 0, 0, size, size);
        }
        
        // ロゴ画像を読み込んで描画
        const logoImg = new Image();
        logoImg.onload = () => {
            console.log('ロゴ画像読み込み完了');
            
            // 中央にロゴを描画（60x60px）
            const logoSize = 60;
            const x = (size - logoSize) / 2;
            const y = (size - logoSize) / 2;
            
            // 白い背景を描画
            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(x - 5, y - 5, logoSize + 10, logoSize + 10);
            
            // ロゴを描画
            ctx.drawImage(logoImg, x, y, logoSize, logoSize);
            
            console.log('ロゴ描画完了');
        };
        logoImg.onerror = () => {
            console.error('ロゴ画像の読み込みに失敗');
        };
        logoImg.src = this.currentLogoData;
    }
    
    addLogoToSVG(svgElement) {
        console.log('SVGにロゴを追加:', svgElement);
        
        // SVGのサイズを取得
        const size = 300;
        const logoSize = 60;
        const x = (size - logoSize) / 2;
        const y = (size - logoSize) / 2;
        
        // 白い背景の矩形を作成
        const backgroundRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        backgroundRect.setAttribute('x', x - 5);
        backgroundRect.setAttribute('y', y - 5);
        backgroundRect.setAttribute('width', logoSize + 10);
        backgroundRect.setAttribute('height', logoSize + 10);
        backgroundRect.setAttribute('fill', '#FFFFFF');
        
        // ロゴ画像を作成
        const logoImage = document.createElementNS('http://www.w3.org/2000/svg', 'image');
        logoImage.setAttribute('x', x);
        logoImage.setAttribute('y', y);
        logoImage.setAttribute('width', logoSize);
        logoImage.setAttribute('height', logoSize);
        logoImage.setAttribute('href', this.currentLogoData);
        
        // SVGに要素を追加
        svgElement.appendChild(backgroundRect);
        svgElement.appendChild(logoImage);
        
        console.log('SVGロゴ追加完了');
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
