export const metadata = {
    title: "網格交易策略 - 動態演示",
    description: "綠線為買單，觸碰後變為紅線（賣單）；紅線為賣單，觸碰後變為綠線（買單）。"
};

let animationId;
let price;
let counter = 0;
let grids = [];

export function init(canvas, params) {
    const ctx = canvas.getContext('2d');
    canvas.width = canvas.parentElement.clientWidth;
    canvas.height = canvas.parentElement.clientHeight;

    price = (params.gridTop + params.gridBottom) / 2;
    
    // 初始化網格
    grids = [];
    const count = 5;
    const step = (params.gridBottom - params.gridTop) / count;
    for (let i = 0; i <= count; i++) {
        const y = params.gridTop + i * step;
        grids.push({
            y: y,
            type: y > price ? 'buy' : 'sell',
            triggerTimer: 0
        });
    }

    function draw() {
        ctx.fillStyle = '#131722';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // 使用設定的 moveSpeed 控制速度
        counter += params.moveSpeed; 
        let noise = (Math.random() - 0.5) * 6;
        price += Math.sin(counter) * 4 + noise;

        // 簡單邊界檢查，防止價格跑出畫布
        if (price < 20 || price > canvas.height - 20) counter += Math.PI;

        grids.forEach(grid => {
            // 碰撞偵測與買賣單翻轉
            if (Math.abs(price - grid.y) < 3 && grid.triggerTimer === 0) {
                grid.type = (grid.type === 'buy') ? 'sell' : 'buy';
                grid.triggerTimer = 20; 
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

        // 繪製價格線
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
