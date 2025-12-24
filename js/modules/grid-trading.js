export const metadata = {
    title: "網格交易策略 - 動態演示",
    description: "演示等差網格。價格觸碰紅線(Sell)執行賣出，觸碰綠線(Buy)執行買入。"
};

let animationId;
let price = 0;
let counter = 0;

export function init(canvas, config) {
    if (animationId) cancelAnimationFrame(animationId);
    
    const ctx = canvas.getContext('2d');
    const resize = () => {
        canvas.width = canvas.parentElement.clientWidth;
        canvas.height = canvas.parentElement.clientHeight;
    };
    resize();

    price = (config.gridTop + config.gridBottom) / 2;

    // 將價格轉換為 Canvas 座標的關鍵函數
    const priceToY = (p) => {
        const range = config.viewTop - config.viewBottom;
        const ratio = (p - config.viewBottom) / range;
        return canvas.height * (1 - ratio);
    };

    function draw() {
        ctx.fillStyle = '#131722';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // 價格波動
        counter += 0.02;
        price += Math.sin(counter) * (100 * config.volatility) + (Math.random() - 0.5) * 50;

        // 限制價格不超出視窗太多
        price = Math.max(config.viewBottom - 1000, Math.min(config.viewTop + 1000, price));

        // 繪製網格
        const gridGap = (config.gridTop - config.gridBottom) / config.gridCount;
        for (let i = 0; i <= config.gridCount; i++) {
            const level = config.gridBottom + i * gridGap;
            const y = priceToY(level);
            const isSell = level > (config.gridTop + config.gridBottom) / 2;

            ctx.beginPath();
            ctx.setLineDash([5, 5]);
            ctx.strokeStyle = isSell ? 'rgba(255, 82, 82, 0.3)' : 'rgba(0, 192, 118, 0.3)';
            
            // 碰撞亮起效果
            if (Math.abs(price - level) < (80 * config.volatility)) {
                ctx.setLineDash([]);
                ctx.lineWidth = 2;
                ctx.strokeStyle = isSell ? '#ff5252' : '#00c076';
            } else {
                ctx.lineWidth = 1;
            }

            ctx.moveTo(0, y);
            ctx.lineTo(canvas.width, y);
            ctx.stroke();
        }

        // 繪製價格線
        const priceY = priceToY(price);
        ctx.setLineDash([]);
        ctx.strokeStyle = '#2962ff';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(0, priceY);
        ctx.lineTo(canvas.width, priceY);
        ctx.stroke();

        // 價格標籤
        ctx.fillStyle = '#2962ff';
        ctx.fillRect(canvas.width - 90, priceY - 12, 90, 24);
        ctx.fillStyle = 'white';
        ctx.font = 'bold 12px Arial';
        ctx.fillText(`$${price.toFixed(0)}`, canvas.width - 80, priceY + 5);

        animationId = requestAnimationFrame(draw);
    }
    draw();
}

export function destroy() {
    if (animationId) cancelAnimationFrame(animationId);
}
