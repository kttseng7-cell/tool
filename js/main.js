import { recordCanvas } from './recorder.js';

const TOOL_CONFIG = [
    { id: 'grid', name: '網格交易 (Grid)', file: 'grid-trading.js' },
];

let currentModule = null;
let activeTool = null;
const canvas = document.getElementById('main-canvas');

// 取得當前面板輸入的參數
function getParams() {
    return {
        gridTop: parseFloat(document.getElementById('grid-top').value),
        gridBottom: parseFloat(document.getElementById('grid-bottom').value),
        moveSpeed: parseFloat(document.getElementById('move-speed').value),
        recordSec: parseInt(document.getElementById('record-sec').value)
    };
}

async function startTool(tool) {
    if (currentModule?.destroy) currentModule.destroy();
    activeTool = tool;

    try {
        // 使用動態 import 載入對應模組
        const module = await import(`./modules/${tool.file}?v=${Date.now()}`);
        document.getElementById('tool-title').innerText = module.metadata.title;
        document.getElementById('tool-info').innerText = module.metadata.description;
        
        // 初始化動畫並傳入參數
        module.init(canvas, getParams());
        currentModule = module;
    } catch (e) { console.error("載入失敗:", e); }
}

// 套用設置按鈕
document.getElementById('apply-settings').onclick = () => {
    if (activeTool) startTool(activeTool);
};

// GIF 錄製
document.getElementById('export-gif').onclick = async () => {
    if (!currentModule) return;
    const btn = document.getElementById('export-gif');
    const { recordSec } = getParams();
    btn.disabled = true;
    btn.innerText = `錄製中 (${recordSec}s)...`;
    await recordCanvas(canvas, recordSec);
    btn.innerText = "生成 GIF 動圖";
    btn.disabled = false;
};

// 初始化選單
const menu = document.getElementById('menu');
TOOL_CONFIG.forEach(tool => {
    const btn = document.createElement('button');
    btn.className = 'menu-item';
    btn.innerText = tool.name;
    btn.onclick = () => {
        document.querySelectorAll('.menu-item').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        startTool(tool);
    };
    menu.appendChild(btn);
});

// 自動載入第一個
if(TOOL_CONFIG.length > 0) setTimeout(() => menu.firstChild.click(), 500);
