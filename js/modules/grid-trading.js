export const metadata = {
    title: "網格交易策略 - 動態演示",
    description: "綠線為買單，成交後變紅線掛賣；紅線為賣單，成交後變綠線掛買。實現震盪行情高拋低吸。"
};

let animationId;
let price;
let counter = 0;
let grids = [];

export function init(canvas, params) {
    const ctx = canvas.getContext('2d');
    canvas.width = canvas.parentElement.clientWidth;
    canvas.height = canvas.parentElement.clientHeight;

    // 重置價格與網格
    price = (params.gridTop + params.gridBottom) / 2;
    counter = 0;
    grids = [];

    // 初始化網格線
    const count = 5;
    const step = (params.gridBottom - params.gridTop) / count;
    for (let i = 0; i <= count; i++) {
        const y = params.gridTop + i * step;
        grids.push({
            y: y,
            type: y > price ? 'buy' : 'sell', // 下方買，上方賣
            flash: 0
        });
    }

    function draw() {
        ctx.fillStyle = '#131722';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // 價格波動邏輯：使用 moveSpeed 控制速度
        counter += params.moveSpeed; 
        price += Math.sin(counter) * 4 + (Math.random() - 0.5) * 5;

        // 簡單邊界回彈
        if (price < 20 || price > canvas.height - 20) counter += Math.PI;

        grids.forEach(grid => {
            // 成交偵測：價格穿過線條
            if (Math.abs(price - grid.y) < 3 && grid.flash === 0) {
                // 成交翻轉：買入變賣出，賣出變買入
                grid.type = (grid.type === 'buy') ? 'sell' : 'buy';
                grid.flash = 20; // 成交亮起動畫
            }

            ctx.beginPath();
            ctx.setLineDash(grid.flash > 0 ? [] : [4, 4]);
            ctx.strokeStyle = grid.type === 'buy' ? '#00c076' : '#ff5252';
            ctx.lineWidth = grid.flash > 0 ? 3 : 1;
            ctx.globalAlpha = grid.flash > 0 ? 1 : 0.4;
            
            ctx.moveTo(0, grid.y);
            ctx.lineTo(canvas.width, grid.y);
            ctx.stroke();
            ctx.globalAlpha = 1;

            if (grid.flash > 0) grid.flash--;
        });

        // 繪製目前價格線與標籤
        ctx.setLineDash([]);
        ctx.strokeStyle = '#2962ff';
        ctx.lineWidth = 2;
        ctx.strokeRect(0, price, canvas.width, 1);

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
