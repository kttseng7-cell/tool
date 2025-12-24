export const metadata = {
    title: "網格交易策略 - 動態演示",
    description: "價格觸碰綠線執行買入，觸碰紅線執行賣出。此圖演示了『等差網格』在震盪行情下的運作方式。"
};

let animationId;
let price;
let counter = 0;
let grids = [];

export function init(canvas) {
    const ctx = canvas.getContext('2d');
    
    const resize = () => {
        canvas.width = canvas.parentElement.clientWidth;
        canvas.height = canvas.parentElement.clientHeight;
        setupGrids(canvas);
    };
    window.addEventListener('resize', resize);
    resize();

    function setupGrids(cvs) {
        grids = [];
        const top = cvs.height * 0.25;
        const bottom = cvs.height * 0.75;
        const count = 6;
        const spacing = (bottom - top) / count;

        for (let i = 0; i <= count; i++) {
            const y = top + i * spacing;
            grids.push({
                y: y,
                type: y < cvs.height / 2 ? 'sell' : 'buy',
                lastTriggered: 0
            });
        }
        price = cvs.height / 2;
    }

    function draw() {
        ctx.fillStyle = '#131722';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // 價格波動邏輯
        counter += 0.02;
        price += Math.sin(counter) * 3 + (Math.random() - 0.5) * 5;

        grids.forEach(grid => {
            // 偵測碰撞
            if (Math.abs(price - grid.y) < 3) {
                grid.lastTriggered = 20; 
            }

            ctx.beginPath();
            ctx.setLineDash(grid.lastTriggered > 0 ? [] : [5, 5]);
            ctx.strokeStyle = grid.type === 'sell' ? 
                `rgba(255, 82, 82, ${grid.lastTriggered > 0 ? 1 : 0.4})` : 
                `rgba(0, 192, 118, ${grid.lastTriggered > 0 ? 1 : 0.4})`;
            ctx.lineWidth = grid.lastTriggered > 0 ? 3 : 1;
            ctx.moveTo(0, grid.y);
            ctx.lineTo(canvas.width, grid.y);
            ctx.stroke();

            if (grid.lastTriggered > 0) grid.lastTriggered--;
        });

        // 繪製目前的價格線與標籤
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
        ctx.fillText(`BTC ${price.toFixed(2)}`, canvas.width - 85, price + 5);

        animationId = requestAnimationFrame(draw);
    }
    draw();
}

export function destroy() {
    if (animationId) cancelAnimationFrame(animationId);
}
