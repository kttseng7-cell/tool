// js/modules/grid-trading.js
export const metadata = {
    title: "網格交易策略 - 動態演示",
    description: "綠線為買單，紅線為賣單。成交後該格會自動翻轉類型，實現高拋低吸。"
};

let animationId;
let price;
let counter = 0;
let grids = [];

export function init(canvas, params) {
    const ctx = canvas.getContext('2d');
    canvas.width = canvas.parentElement.clientWidth;
    canvas.height = canvas.parentElement.clientHeight;

    // 初始化網格 (依據輸入的上下限)
    const setupGrids = () => {
        grids = [];
        const count = 6;
        const spacing = (params.gridBottom - params.gridTop) / count;
        for (let i = 0; i <= count; i++) {
            const y = params.gridTop + i * spacing;
            grids.push({
                y: y,
                // 價格下方的線為買單(buy)，上方為賣單(sell)
                type: y > canvas.height / 2 ? 'buy' : 'sell',
                lastTriggered: 0
            });
        }
        price = (params.priceMax + params.priceMin) / 2;
    };

    setupGrids();

    function draw() {
        ctx.fillStyle = '#131722';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // 價格震盪邏輯 (限制在 priceMax ~ priceMin 之間)
        counter += 0.03;
        let nextPrice = price + Math.sin(counter) * 4 + (Math.random() - 0.5) * 6;
        
        // 碰壁反彈或限制
        if (nextPrice < params.priceMax || nextPrice > params.priceMin) {
            counter += Math.PI; // 反向
        } else {
            price = nextPrice;
        }

        grids.forEach(grid => {
            // 碰撞偵測：當價格經過網格線
            if (Math.abs(price - grid.y) < 3 && grid.lastTriggered === 0) {
                // 翻轉邏輯：成交後買單變賣單，賣單變買單
                grid.type = (grid.type === 'buy') ? 'sell' : 'buy';
                grid.lastTriggered = 20; // 防止連續觸發
            }

            // 繪製格線
            ctx.beginPath();
            ctx.setLineDash(grid.lastTriggered > 0 ? [] : [5, 5]);
            ctx.strokeStyle = grid.type === 'buy' ? '#00c076' : '#ff5252';
            ctx.globalAlpha = grid.lastTriggered > 0 ? 1 : 0.4;
            ctx.lineWidth = grid.lastTriggered > 0 ? 3 : 1;
            ctx.moveTo(0, grid.y);
            ctx.lineTo(canvas.width, grid.y);
            ctx.stroke();
            ctx.globalAlpha = 1;

            if (grid.lastTriggered > 0) grid.lastTriggered--;
        });

        // 價格線
        ctx.setLineDash([]);
        ctx.strokeStyle = '#2962ff';
        ctx.lineWidth = 2;
        ctx.strokeRect(0, price, canvas.width, 1);

        animationId = requestAnimationFrame(draw);
    }
    draw();
}

export function destroy() {
    if (animationId) cancelAnimationFrame(animationId);
}
