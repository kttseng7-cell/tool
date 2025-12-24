// js/modules/grid-trading.js

export const metadata = {
    title: "網格交易原理",
    description: "網格交易是在特定的價格區間內，透過自動買低賣高來獲取利潤。畫面中紅色為賣單，綠色為買單。"
};

let animationId;

export function init(canvas) {
    const ctx = canvas.getContext('2d');
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // 繪製 TradingView 風格的網格線
        ctx.strokeStyle = '#2a2e39';
        for(let i=0; i<canvas.height; i+=50) {
            ctx.beginPath();
            ctx.moveTo(0, i); ctx.lineTo(canvas.width, i);
            ctx.stroke();
        }

        // 動態模擬：繪製網格交易的價格線 (這部分你可以根據影片邏輯寫)
        ctx.strokeStyle = '#00ff00'; // 買單線範例
        ctx.strokeRect(50, 100, canvas.width - 100, 2);
        
        animationId = requestAnimationFrame(draw);
    }
    draw();
}

export function destroy() {
    cancelAnimationFrame(animationId);
}