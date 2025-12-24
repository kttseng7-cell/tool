/**
 * js/recorder.js
 * 負責將 Canvas 的動畫捕捉並轉換成 GIF 檔案
 */

export function recordCanvas(canvas, durationSeconds = 3) {
    return new Promise((resolve, reject) => {
        // 1. 初始化 GIF 對象
        // 注意：workerScript 的路徑在 GitHub Pages 上必須正確
        const gif = new GIF({
            workers: 2,
            quality: 10,
            width: canvas.width,
            height: canvas.height,
            workerScript: './assets/gif.worker.js' // 請確保此檔案存在於 assets 資料夾
        });

        console.log(`開始錄製 ${durationSeconds} 秒的動畫...`);

        const fps = 20; // 每秒抓取 20 幀
        const frameDelay = 1000 / fps;
        const totalFrames = durationSeconds * fps;
        let capturedFrames = 0;

        // 2. 定時捕捉畫布幀
        const recordInterval = setInterval(() => {
            // 複製當前的畫布內容
            gif.addFrame(canvas, { copy: true, delay: frameDelay });
            capturedFrames++;

            if (capturedFrames >= totalFrames) {
                clearInterval(recordInterval);
                console.log("錄製完成，正在生成 GIF (這可能需要幾秒鐘)...");
                gif.render();
            }
        }, frameDelay);

        // 3. 渲染完成後的處理
        gif.on('finished', function(blob) {
            const url = URL.createObjectURL(blob);
            
            // 建立自動下載連結
            const link = document.createElement('a');
            link.href = url;
            link.download = `strategy-${Date.now()}.gif`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            console.log("GIF 已成功導出並下載");
            resolve(url);
        });

        gif.on('abort', () => {
            reject(new Error("GIF 錄製被中斷"));
        });
    });
}
