/**
 * 網格交易模組 - 狀態轉換版
 * 買單(Buy) = 綠色
 * 賣單(Sell) = 紅色
 * 觸碰買單變賣單，觸碰賣單變買單
 */

export const metadata = {
    title: "網格交易策略 - 動態狀態轉換",
    description: "綠線為買單，紅線為賣單。當價格穿過綠線時執行買入並掛出紅線賣單；穿過紅線時執行賣出並掛回綠線買單。"
};

let animationId;
let price = 0;
let lastPrice = 0;
let counter = 0;
let gridState = []; // 存儲網格的當前狀態

const COLOR_BUY = '#00c076';  // 買單綠色
const COLOR_SELL = '#ff5252'; // 賣單紅色

export function init(canvas, config) {
    if (animationId) cancelAnimationFrame(animationId);
    
    const ctx = canvas.getContext('2d');
    const resize = () => {
        canvas.width = canvas.parentElement.clientWidth;
        canvas.height = canvas.parentElement.clientHeight;
    };
    resize();

    // 初始價格設定在中間
    price = (config.gridTop + config.gridBottom) / 2;
    lastPrice = price;

    // 初始化網格狀態：當前價格以上的為賣單(紅)，以下的為買單(綠)
    gridState = [];
    const gridGap = (config.gridTop - config.gridBottom) / config.gridCount;
    for (let i = 0; i <= config.gridCount; i++) {
        const level = config.gridBottom + i * gridGap;
        gridState.push({
            price: level,
            type: level > price ? 'sell' : 'buy', // 初始邏輯
            hitTimer: 0 // 碰撞特效計時
        });
    }

    const priceToY = (p) => {
        const range = config.viewTop - config.viewBottom;
        return canvas.height * (1 - (p - config.viewBottom) / range);
    };

    function draw() {
        ctx.fillStyle = '#131722';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // 更新價格
        lastPrice = price;
        counter += 0.02;
        price += Math.sin(counter) * (120 * config.volatility) + (Math.random() - 0.5) * 80;
        
        // 漲跌判定 (用於價格線變色)
        const isRising = price >= lastPrice;

        // 繪製與更新網格
        gridState.forEach(grid => {
            const y = priceToY(grid.price);
            
            // 碰撞判定：價格是否穿越網格線
            const crossedUp = lastPrice < grid.price && price >= grid.price;
            const crossedDown = lastPrice > grid.price && price <= grid.price;

            if (crossedUp || crossedDown) {
                grid.hitTimer = 20; // 亮起特效
                // 狀態切換邏輯
                if (grid.type === 'buy') {
                    grid.type = 'sell'; // 買單被碰到變賣單
                } else {
                    grid.type = 'buy';  // 賣單被碰到變買單
                }
            }

            // 繪製格線
            ctx.beginPath();
            if (grid.hitTimer > 0) {
                ctx.setLineDash([]);
                ctx.lineWidth = 3;
                ctx.strokeStyle = '#ffffff'; // 碰撞時閃爍白色
                grid.hitTimer--;
            } else {
                ctx.setLineDash([5, 5]);
                ctx.lineWidth = 1;
                ctx.strokeStyle = (grid.type === 'buy' ? COLOR_BUY : COLOR_SELL) + '88';
            }

            ctx.moveTo(0, y);
            ctx.lineTo(canvas.width, y);
            ctx.stroke();
        });

        // 繪製價格線
        const priceY = priceToY(price);
        ctx.setLineDash([]);
        ctx.strokeStyle = isRising ? COLOR_BUY : COLOR_SELL; // 漲綠跌紅 (配合買綠賣紅邏輯)
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
