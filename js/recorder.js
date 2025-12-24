export function recordCanvas(canvas, durationSeconds = 3) {
    return new Promise((resolve) => {
        const gif = new GIF({
            workers: 2,
            quality: 10,
            width: canvas.width,
            height: canvas.height,
            workerScript: './assets/gif.worker.js'
        });

        const fps = 20;
        const frameDelay = 1000 / fps;
        const totalFrames = durationSeconds * fps;
        let capturedFrames = 0;

        const recordInterval = setInterval(() => {
            gif.addFrame(canvas, { copy: true, delay: frameDelay });
            capturedFrames++;

            if (capturedFrames >= totalFrames) {
                clearInterval(recordInterval);
                gif.render();
            }
        }, frameDelay);

        gif.on('finished', (blob) => {
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `strategy-${Date.now()}.gif`;
            link.click();
            resolve(url);
        });
    });
}
