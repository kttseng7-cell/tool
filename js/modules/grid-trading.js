/**
 * js/modules/grid-trading.js
 * 核心功能：動態演示網格交易
 */

export const metadata = {
    title: "網格交易策略 - 動態演示",
    description: "綠線為買單，成交後變紅線掛賣；紅線為賣單，成交後變綠線掛買。實現震盪行情高拋低吸。"
};

let animationId;
let price;
let counter = 0;
let grids = [];

/**
 * 初始化工具
 * @param {HTMLCanvasElement} canvas 
 * @param {Object} params 外部傳入的參數 (包含視窗上下限、網格上下限、速度、波動度等)
 */
export function init(canvas, params) {
    const ctx = canvas.getContext('2d');
    
    // 1. 設定畫布尺寸為容器大小
    canvas.width = canvas.parentElement.clientWidth;
    canvas.height = canvas.parentElement.clientHeight;

    // 2. 座標轉換函式：將「價格數值」轉為「畫布 Y 座標像素」
    const mapY = (val) => {
        const range = params.viewTop - params.viewBottom;
        const offset = val - params.viewBottom;
        const ratio = offset / range;
        return canvas.height * (1 - ratio); // Canvas 座標系統上方為 0
    };

    // 3. 初始化價格與網格狀態
    price = (params.gridTop + params.gridBottom) / 2;
    counter = 0;
    grids = [];

    // 初始化網格線 (等差分布)
    const count = 6; // 固定網格數量，亦可改為由 params 傳入
    const step = (params.gridTop - params.gridBottom) / count;
    for (let i = 0; i <= count; i++) {
        const priceVal = params.gridBottom + i * step;
        grids.push({
            priceVal: priceVal,
            type: priceVal > price ? 'sell' : 'buy', // 價格上方掛賣，下方掛買
            active: 0 // 用於成交動畫的計時器
        });
    }

    function draw() {
        // A. 清空背景 (TradingView 深藍色)
        ctx.fillStyle = '#131722';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // B. 計算移動速度與主趨勢
        // (2 * Math.PI) 代表一個完整週期，除以 (秒數 * 60幀) 得到每幀增量
        const speedFactor = (2 * Math.PI) / (params.moveSpeed * 60);
        counter += speedFactor;

        // 計算趨勢中點與震盪範圍
        const trendRange = (params.priceMax - params.priceMin) / 2;
        const trendMid = (params.priceMax + params.priceMin) / 2;
        
        // C. 加入波動度 (Volatility) 隨機噪音
        const noise = (Math.random() - 0.5) * params.volatility;
        price = trendMid + Math.sin(counter) * trendRange + noise;

        // D. 繪製與成交邏輯
        grids.forEach(grid => {
            const y = mapY(grid.priceVal);
            
            // 成交偵測：價格穿過網格線 (加上波動容差)
            if (Math.abs(price - grid.priceVal) < (params.volatility + 50) && grid.active === 0) {
                // 核心邏輯：成交翻轉 (買入成交變賣單，賣出成交變買單)
                grid.type = (grid.type === 'buy') ? 'sell' : 'buy';
                grid.active = 25; // 觸發發光動畫，持續 25 幀
            }

            // 繪製線條 (只在視窗範圍內繪製)
            if (y >= 0 && y <= canvas.height) {
                ctx.beginPath();
                ctx.setLineDash(grid.active > 0 ? [] : [4, 4]); // 平時虛線，成交時實線
                ctx.strokeStyle = grid.type === 'buy' ? '#00c076' : '#ff5252';
                ctx.lineWidth = grid.active > 0 ? 3 : 1;
                ctx.globalAlpha = grid.active > 0 ? 1 : 0.3; // 平時透明度較低
                
                ctx.moveTo(0, y);
                ctx.lineTo(canvas.width, y);
                ctx.stroke();
            }

            // 動畫計時器遞減
            if (grid.active > 0) grid.active--;
        });

        // E. 繪製目前價格線
        const currentY = mapY(price);
        ctx.globalAlpha = 1;
        ctx.setLineDash([]);
        ctx.strokeStyle = '#2962ff';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(0, currentY);
        ctx.lineTo(canvas.width, currentY);
        ctx.stroke();

        // F. 繪製價格標籤 (右側深藍色塊)
        ctx.fillStyle = '#2962ff';
        ctx.fillRect(canvas.width - 100, currentY - 12, 100, 24);
        ctx.fillStyle = 'white';
        ctx.font = 'bold 12px Arial';
        ctx.fillText(`${price.toFixed(0)}`, canvas.width - 90, currentY + 5);

        animationId = requestAnimationFrame(draw);
    }

    draw();
}

/**
 * 卸載工具，停止動畫循環
 */
export function destroy() {
    if (animationId) {
        cancelAnimationFrame(animationId);
    }
}
