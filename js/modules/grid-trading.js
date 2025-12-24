export const metadata = {
    title: "網格交易策略 - 動態演示",
    description: "此工具演示等差網格。當價格觸碰紅線執行賣出，觸碰綠線執行買入，在震盪行情中獲取利潤。"
};

let animationId;
let currentPrice = 0;
let counter = 0;

export function init(canvas, config) {
    if (animationId) cancelAnimationFrame(animationId);
    
    const ctx = canvas.getContext('2d');
    const resize = () => {
        canvas.width = canvas.parentElement.clientWidth;
        canvas.height = canvas.parentElement.clientHeight;
    };
    resize();

    currentPrice = (config.gridTop + config.gridBottom) / 2;

    function priceToY(p) {
        const range = config.viewTop - config.viewBottom;
        const offset = p - config.viewBottom;
        return canvas.height - (offset / range) * canvas.height;
    }

    function draw() {
        ctx.fillStyle = '#131722';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // 價格波動模擬
        counter += 0.02;
        currentPrice += Math.sin(counter) * (100 * config.volatility) + (Math.random() - 0.5) * 50;

        // 1. 繪製網格線
        const gridGap = (config.gridTop - config.gridBottom) / config.gridCount;
        for (let i = 0; i <= config.gridCount; i++) {
            const priceLevel = config.gridBottom + i * gridGap;
            const y = priceToY(priceLevel);
            const isSellSide = priceLevel > (config.gridTop + config.gridBottom) / 2;

            ctx.beginPath();
            ctx.setLineDash([5, 5]);
            ctx.strokeStyle = isSellSide ? 'rgba(255, 82, 82, 0.4)' : 'rgba(0, 192, 118, 0.4)';
            
            // 觸發亮起動畫
            if (Math.abs(currentPrice - priceLevel) < (100 * config.volatility)) {
                ctx.setLineDash([]);
                ctx.lineWidth = 2;
                ctx.strokeStyle = isSellSide ? '#ff5252' : '#00c076';
            } else {
                ctx.lineWidth = 1;
            }

            ctx.moveTo(0, y);
            ctx.lineTo(canvas.width, y);
            ctx.stroke();
        }

        // 2. 繪製當前價格線
        const priceY = priceToY(currentPrice);
        ctx.setLineDash([]);
        ctx.beginPath();
        ctx.strokeStyle = '#2962ff';
        ctx.lineWidth = 2;
        ctx.moveTo(0, priceY);
        ctx.lineTo(canvas.width, priceY);
        ctx.stroke();

        // 價格標籤
        ctx.fillStyle = '#2962ff';
        ctx.fillRect(canvas.width - 90, priceY - 12, 90, 24);
        ctx.fillStyle = 'white';
        ctx.font = 'bold 12px Arial';
        ctx.fillText(`$${currentPrice.toFixed(2)}`, canvas.width - 85, priceY + 5);

        animationId = requestAnimationFrame(draw);
    }
    draw();
}

export function destroy() {
    if (animationId) cancelAnimationFrame(animationId);
}
