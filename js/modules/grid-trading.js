/**
 * js/modules/grid-trading.js
 * 核心功能：動態演示網格交易
 */

export const metadata = {
    title: "網格交易策略 - 動態演示",
    description: "價格在區間內波動時，觸碰到綠線執行買入，觸碰到紅線執行賣出。此圖演示了『等差網格』的分布。"
};

let animationId;
let price = 0;
let counter = 0;

export function init(canvas) {
    const ctx = canvas.getContext('2d');
    
    // 設置畫布尺寸
    const resize = () => {
        canvas.width = canvas.parentElement.clientWidth;
        canvas.height = canvas.parentElement.clientHeight;
    };
    window.addEventListener('resize', resize);
    resize();

    // 網格參數
    const topPrice = 100;    // 網格上限
    const bottomPrice = 500; // 網格下限
    const gridCount = 8;     // 網格數量
    const grids = [];

    // 初始化網格線
    const spacing = (bottomPrice - topPrice) / gridCount;
    for (let i = 0; i <= gridCount; i++) {
        const y = topPrice + i * spacing;
        grids.push({
            y: y,
            type: y < (topPrice + bottomPrice) / 2 ? 'sell' : 'buy', // 上半部賣，下半部買
            lastTriggered: 0
        });
    }

    price = (topPrice + bottomPrice) / 2; // 初始價格在中間

    function draw() {
        // 1. 背景清空 (TradingView 深藍)
        ctx.fillStyle = '#131722';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // 2. 更新價格 (模擬波動)
        counter += 0.02;
        price += Math.sin(counter) * 2 + (Math.random() - 0.5) * 3;

        // 3. 繪製網格虛線
        grids.forEach(grid => {
            ctx.beginPath();
            ctx.setLineDash([5, 5]);
            ctx.strokeStyle = grid.type === 'sell' ? 'rgba(255, 82, 82, 0.4)' : 'rgba(0, 192, 118, 0.4)';
            ctx.lineWidth = 1;
            ctx.moveTo(50, grid.y);
            ctx.lineTo(canvas.width - 50, grid.y);
            ctx.stroke();

            // 成交碰撞偵測
            if (Math.abs(price - grid.y) < 2) {
                grid.lastTriggered = 20; // 亮起動畫持續 20 幀
            }

            if (grid.lastTriggered > 0) {
                ctx.save();
                ctx.setLineDash([]);
                ctx.strokeStyle = grid.type === 'sell' ? '#ff5252' : '#00c076';
                ctx.lineWidth = 2;
                ctx.stroke();
                grid.lastTriggered--;
                ctx.restore();
            }
        });

        // 4. 繪製價格線
        ctx.setLineDash([]);
        ctx.beginPath();
        ctx.strokeStyle = '#2962ff';
        ctx.lineWidth = 2;
        ctx.moveTo(0, price);
        ctx.lineTo(canvas.width, price);
        ctx.stroke();

        // 5. 繪製價格標籤
        ctx.fillStyle = '#2962ff';
        const labelWidth = 70;
        ctx.fillRect(canvas.width - labelWidth, price - 12, labelWidth, 24);
        ctx.fillStyle = 'white';
        ctx.font = 'bold 12px Arial';
        ctx.fillText(`BTC ${price.toFixed(2)}`, canvas.width - labelWidth + 5, price + 5);

        animationId = requestAnimationFrame(draw);
    }

    draw();
}

// 停止動畫，避免切換模組時記憶體洩漏
export function destroy() {
    if (animationId) {
        cancelAnimationFrame(animationId);
    }
}
