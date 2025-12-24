export const metadata = {
    title: "網格交易策略 - 動態演示",
    description: "綠線為買單，成交後會變成紅線掛在上方賣出；紅線為賣單，成交後會變成綠線在下方買入。"
};

let animationId;
let price;
let counter = 0;
let grids = [];

export function init(canvas, params) {
    const ctx = canvas.getContext('2d');
    canvas.width = canvas.parentElement.clientWidth;
    canvas.height = canvas.parentElement.clientHeight;

    // 初始化：價格設在正中間
    price = (params.gridTop + params.gridBottom) / 2;
    
    // 初始化網格線
    grids = [];
    const count = 5;
    const step = (params.gridBottom - params.gridTop) / count;
    for (let i = 0; i <= count; i++) {
        const y = params.gridTop + i * step;
        grids.push({
            y: y,
            type: y > price ? 'buy' : 'sell', // 價格下方的設為買，上方為賣
            triggerTimer: 0
        });
    }

    function draw() {
        ctx.fillStyle = '#131722';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // 1. 價格隨機震盪
        counter += 0.04;
        let noise = (Math.random() - 0.5) * 6;
        let nextPrice = price + Math.sin(counter) * 4 + noise;

        // 2. 邊界檢查 (priceMax/Min)
        if (nextPrice < params.priceMax || nextPrice > params.priceMin) {
            counter += Math.PI; // 碰壁反向
        } else {
            price = nextPrice;
        }

        // 3. 繪製與碰撞偵測
        grids.forEach(grid => {
            // 成交偵測：價格穿過線條
            if (Math.abs(price - grid.y) < 3 && grid.triggerTimer === 0) {
                // 核心邏輯：翻轉類型
                grid.type = (grid.type === 'buy') ? 'sell' : 'buy';
                grid.triggerTimer = 20; // 成交動畫持續 20 幀
            }

            ctx.beginPath();
            ctx.setLineDash(grid.triggerTimer > 0 ? [] : [4, 4]);
            ctx.strokeStyle = grid.type === 'buy' ? '#00c076' : '#ff5252';
            ctx.lineWidth = grid.triggerTimer > 0 ? 3 : 1;
            ctx.globalAlpha = grid.triggerTimer > 0 ? 1 : 0.4;
            
            ctx.moveTo(0, grid.y);
            ctx.lineTo(canvas.width, grid.y);
            ctx.stroke();
            ctx.globalAlpha = 1;

            if (grid.triggerTimer > 0) grid.triggerTimer--;
        });

        // 4. 繪製價格線與標籤
        ctx.setLineDash([]);
        ctx.strokeStyle = '#2962ff';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(0, price);
        ctx.lineTo(canvas.width, price);
        ctx.stroke();

        ctx.fillStyle = '#2962ff';
        ctx.fillRect(canvas.width - 90, price - 12, 90, 24);
        ctx.fillStyle = 'white';
        ctx.font = 'bold 12px Arial';
        ctx.fillText(`BTC ${price.toFixed(1)}`, canvas.width - 85, price + 5);

        animationId = requestAnimationFrame(draw);
    }
    draw();
}

export function destroy() {
    if (animationId) cancelAnimationFrame(animationId);
}
