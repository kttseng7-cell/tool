export function recordCanvas(canvas, durationSeconds = 5) {
    return new Promise((resolve) => {
        const gif = new GIF({
            workers: 2,
            quality: 10,
            width: canvas.width,
            height: canvas.height,
            workerScript: './assets/gif.worker.js'
        });

        const fps = 20;
        const totalFrames = durationSeconds * fps;
        let captured = 0;

        const interval = setInterval(() => {
            gif.addFrame(canvas, { copy: true, delay: 1000 / fps });
            captured++;
            if (captured >= totalFrames) {
                clearInterval(interval);
                gif.render();
            }
        }, 1000 / fps);

        gif.on('finished', (blob) => {
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `strategy-viz-${Date.now()}.gif`;
            link.click();
            resolve();
        });
    });
}
