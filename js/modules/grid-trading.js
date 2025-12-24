/**
 * js/modules/grid-trading.js
 * 核心功能：動態演示網格交易
 */

export const metadata = {
    title: "網格交易策略 - 動態演示",
    description: "價格在區間內波動時，觸碰到綠線執行買入，觸碰到紅線執行賣出。此圖演示了『等差網格』的運作方式。"
};

let animationId;
let price = 0;
let counter = 0;
let grids = [];

export function init(canvas) {
    const ctx = canvas.getContext('2d');
    
    // 設置畫布尺寸並初始化網格
    const resize = () => {
        canvas.width = canvas.parentElement.clientWidth;
        canvas.height = canvas.parentElement.clientHeight;
        setupGrids(canvas);
    };

    function setupGrids(cvs) {
        grids = [];
        // 使用畫布高度的 20% 到 80% 作為交易區間，確保動畫在視覺中心
        const top = cvs.height * 0.2;
        const bottom = cvs.height * 0.8;
        const gridCount = 8;
        const spacing = (bottom - top) / gridCount;

        for (let i = 0; i <= gridCount; i++) {
            const y = top + i * spacing;
            grids.push({
                y: y,
                type: y < (top + bottom) / 2 ? 'sell' : 'buy', // 上半部賣，下半部買
                lastTriggered: 0
            });
        }
        price = (top + bottom) / 2; // 初始價格置中
    }

    window.addEventListener('resize', resize);
    resize();

    function draw() {
        // 1. 背景清空 (TradingView 深色底)
        ctx.fillStyle = '#131722';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // 2. 更新價格 (模擬價格波動)
        counter += 0.02;
        price += Math.sin(counter) * 2 + (Math.random() - 0.5) * 4;

        // 3. 繪製網格線
        grids.forEach(grid => {
            // 成交碰撞偵測
            if (Math.abs(price - grid.y) < 3) {
                grid.lastTriggered = 15; // 觸發時發光動畫持續 15 幀
            }

            ctx.beginPath();
            if (grid.lastTriggered > 0) {
                // 觸發時：實線且變亮
                ctx.setLineDash([]);
                ctx.strokeStyle = grid.type === 'sell' ? '#ff5252' : '#00c076';
                ctx.lineWidth = 2;
                grid.lastTriggered--;
            } else {
                // 平時：虛線且半透明
                ctx.setLineDash([5, 5]);
                ctx.strokeStyle = grid.type === 'sell' ? 'rgba(255, 82, 82, 0.3)' : 'rgba(0, 192, 118, 0.3)';
                ctx.lineWidth = 1;
            }
            
            ctx.moveTo(0, grid.y);
            ctx.lineTo(canvas.width, grid.y);
            ctx.stroke();
        });

        // 4. 繪製當前價格線
        ctx.setLineDash([]);
        ctx.beginPath();
        ctx.strokeStyle = '#2962ff';
        ctx.lineWidth = 2;
        ctx.moveTo(0, price);
        ctx.lineTo(canvas.width, price);
        ctx.stroke();

        // 5. 繪製價格標籤 (右側標記)
        ctx.fillStyle = '#2962ff';
        const labelWidth = 80;
        ctx.fillRect(canvas.width - labelWidth, price - 12, labelWidth, 24);
        ctx.fillStyle = 'white';
        ctx.font = 'bold 12px Arial';
        ctx.fillText(`BTC ${price.toFixed(2)}`, canvas.width - labelWidth + 5, price + 5);

        animationId = requestAnimationFrame(draw);
    }

    draw();
}

export function destroy() {
    if (animationId) {
        cancelAnimationFrame(animationId);
    }
}
