export const metadata = {
    title: "網格交易策略 - 動態演示",
    description: "綠線買入，紅線賣出。支援自定義顯示視窗、波動度與精確的週期間隔。"
};

let animationId;
let price;
let counter = 0;
let grids = [];

export function init(canvas, params) {
    const ctx = canvas.getContext('2d');
    canvas.width = canvas.parentElement.clientWidth;
    canvas.height = canvas.parentElement.clientHeight;

    // 座標轉換函式：將「價格數值」轉為「畫布 Y 座標」
    const mapY = (val) => {
        const range = params.viewTop - params.viewBottom;
        const offset = val - params.viewBottom;
        const ratio = offset / range;
        return canvas.height * (1 - ratio); // Canvas 頂端是 0
    };

    // 初始化狀態
    price = (params.gridTop + params.gridBottom) / 2;
    counter = 0;
    grids = [];

    const count = 6;
    const step = (params.gridTop - params.gridBottom) / count;
    for (let i = 0; i <= count; i++) {
        const priceVal = params.gridBottom + i * step;
        grids.push({
            priceVal: priceVal,
            type: priceVal > price ? 'sell' : 'buy',
            active: 0
        });
    }

    function draw() {
        ctx.fillStyle = '#131722';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // 1. 計算趨勢移動 (基於設定的秒數週期)
        // 假設 60fps, 週期秒數轉化為每幀增加的弧度
        const speedFactor = (2 * Math.PI) / (params.moveSpeed * 60);
        counter += speedFactor;

        // 主趨勢震盪範圍
        const trendRange = (params.priceMax - params.priceMin) / 2;
        const trendMid = (params.priceMax + params.priceMin) / 2;
        
        // 2. 加入波動度 (隨機噪音)
        const noise = (Math.random() - 0.5) * params.volatility;
        price = trendMid + Math.sin(counter) * trendRange + noise;

        // 3. 繪製網格
        grids.forEach(grid => {
            const y = mapY(grid.priceVal);
            
            // 成交偵測
            if (Math.abs(price - grid.priceVal) < (params.volatility + 2) && grid.active === 0) {
                grid.type = (grid.type === 'buy') ? 'sell' : 'buy';
                grid.active = 20;
            }

            // 只繪製在視窗內的網格
            if (y >= 0 && y <= canvas.height) {
                ctx.beginPath();
                ctx.setLineDash(grid.active > 0 ? [] : [4, 4]);
                ctx.strokeStyle = grid.type === 'buy' ? '#00c076' : '#ff5252';
                ctx.lineWidth = grid.active > 0 ? 3 : 1;
                ctx.globalAlpha = grid.active > 0 ? 1 : 0.3;
                ctx.moveTo(0, y); ctx.lineTo(canvas.width, y);
                ctx.stroke();
            }
            if (grid.active > 0) grid.active--;
        });

        // 4. 繪製價格線
        const currentY = mapY(price);
        ctx.globalAlpha = 1;
        ctx.setLineDash([]);
        ctx.strokeStyle = '#2962ff';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(0, currentY); ctx.lineTo(canvas.width, currentY);
        ctx.stroke();

        // 價格標籤
        ctx.fillStyle = '#2962ff';
        ctx.fillRect(canvas.width - 90, currentY - 12, 90, 24);
        ctx.fillStyle = 'white';
        ctx.font = 'bold 12px Arial';
        ctx.fillText(`${price.toFixed(1)}`, canvas.width - 80, currentY + 5);

        animationId = requestAnimationFrame(draw);
    }
    draw();
}

export function destroy() {
    if (animationId) cancelAnimationFrame(animationId);
}
