export const metadata = {
    title: "網格交易策略 - 動態演示",
    description: "演示等差網格。紅線為買單，綠線為賣單。當價格刷到線條時會變色閃爍，價格線也會隨漲跌變換顏色。"
};

let animationId;
let price = 0;
let lastPrice = 0;
let counter = 0;
let grids = [];

const COLOR_BUY = '#ff5252';   // 買單紅色
const COLOR_SELL = '#00c076';  // 賣單綠色

export function init(canvas, config) {
    if (animationId) cancelAnimationFrame(animationId);
    
    const ctx = canvas.getContext('2d');
    const resize = () => {
        canvas.width = canvas.parentElement.clientWidth;
        canvas.height = canvas.parentElement.clientHeight;
    };
    resize();

    price = (config.gridTop + config.gridBottom) / 2;
    lastPrice = price;

    // 初始化網格狀態
    grids = [];
    const gridGap = (config.gridTop - config.gridBottom) / config.gridCount;
    for (let i = 0; i <= config.gridCount; i++) {
        const level = config.gridBottom + i * gridGap;
        grids.push({
            price: level,
            type: level > (config.gridTop + config.gridBottom) / 2 ? 'sell' : 'buy',
            activeTimer: 0 // 用於控制碰撞後的閃爍動畫
        });
    }

    const priceToY = (p) => {
        const range = config.viewTop - config.viewBottom;
        return canvas.height * (1 - (p - config.viewBottom) / range);
    };

    function draw() {
        ctx.fillStyle = '#131722';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // 更新價格與漲跌判定
        lastPrice = price;
        counter += 0.02;
        price += Math.sin(counter) * (100 * config.volatility) + (Math.random() - 0.5) * 50;
        const isRising = price >= lastPrice;

        // 繪製網格
        grids.forEach(grid => {
            const y = priceToY(grid.price);
            const isBuy = grid.type === 'buy';
            const baseColor = isBuy ? COLOR_BUY : COLOR_SELL;

            // 碰撞偵測 (刷到線條)
            if (Math.abs(price - grid.price) < (60 * config.volatility)) {
                grid.activeTimer = 15; // 亮起持續 15 幀
            }

            ctx.beginPath();
            if (grid.activeTimer > 0) {
                // 刷到後的變色與加粗效果
                ctx.setLineDash([]);
                ctx.lineWidth = 3;
                ctx.strokeStyle = '#ffffff'; // 刷到時閃爍白色或強色
                grid.activeTimer--;
            } else {
                ctx.setLineDash([5, 5]);
                ctx.lineWidth = 1;
                ctx.strokeStyle = baseColor + '66'; // 預設帶透明度
            }

            ctx.moveTo(0, y);
            ctx.lineTo(canvas.width, y);
            ctx.stroke();
        });

        // 繪製動態變色的價格線
        const priceY = priceToY(price);
        ctx.setLineDash([]);
        ctx.strokeStyle = isRising ? COLOR_BUY : COLOR_SELL;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(0, priceY);
        ctx.lineTo(canvas.width, priceY);
        ctx.stroke();

        // 價格標籤
        ctx.fillStyle = isRising ? COLOR_BUY : COLOR_SELL;
        ctx.fillRect(canvas.width - 95, priceY - 12, 95, 24);
        ctx.fillStyle = 'white';
        ctx.font = 'bold 12px Arial';
        ctx.fillText(`$${price.toFixed(0)}`, canvas.width - 85, priceY + 5);

        animationId = requestAnimationFrame(draw);
    }
    draw();
}

export function destroy() {
    if (animationId) cancelAnimationFrame(animationId);
}
