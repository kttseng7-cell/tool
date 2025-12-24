// js/main.js
import { recordCanvas } from './recorder.js';

const TOOL_CONFIG = [
    { id: 'grid', name: '基礎網格交易', file: 'grid-trading.js' },
];

let currentModule = null;
let currentTool = null;
const canvas = document.getElementById('main-canvas');
const exportBtn = document.getElementById('export-gif');

// 取得 UI 參數
function getParams() {
    return {
        gridTop: parseFloat(document.getElementById('grid-top').value),
        gridBottom: parseFloat(document.getElementById('grid-bottom').value),
        priceMax: parseFloat(document.getElementById('price-max').value),
        priceMin: parseFloat(document.getElementById('price-min').value),
        duration: parseInt(document.getElementById('record-sec').value)
    };
}

async function loadTool(tool) {
    if (currentModule?.destroy) currentModule.destroy();
    currentTool = tool;

    try {
        const module = await import(`./modules/${tool.file}`);
        document.getElementById('tool-title').innerText = module.metadata.title;
        document.getElementById('tool-info').innerText = module.metadata.description;
        
        // 傳入參數初始化
        module.init(canvas, getParams());
        currentModule = module;
    } catch (err) { console.error(err); }
}

// 監聽套用按鈕
document.getElementById('apply-settings').onclick = () => {
    if (currentTool) loadTool(currentTool);
};

// 錄製功能使用自定義秒數
exportBtn.onclick = async () => {
    if (!currentModule) return;
    const params = getParams();
    exportBtn.disabled = true;
    exportBtn.innerText = `錄製中 (${params.duration}s)...`;
    await recordCanvas(canvas, params.duration);
    exportBtn.innerText = "生成 GIF 動圖";
    exportBtn.disabled = false;
};

// 初始化選單與預載入
const menu = document.getElementById('menu');
TOOL_CONFIG.forEach(tool => {
    const btn = document.createElement('button');
    btn.className = 'menu-item';
    btn.innerText = tool.name;
    btn.onclick = () => {
        document.querySelectorAll('.menu-item').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        loadTool(tool);
    };
    menu.appendChild(btn);
});
