import { recordCanvas } from './recorder.js';

const TOOL_CONFIG = [{ id: 'grid', name: '網格交易 (Grid)', file: 'grid-trading.js' }];
let currentModule = null;
let activeTool = null;
const canvas = document.getElementById('main-canvas');

function getParams() {
    return {
        viewTop: parseFloat(document.getElementById('view-top').value),
        viewBottom: parseFloat(document.getElementById('view-bottom').value),
        gridTop: parseFloat(document.getElementById('grid-top').value),
        gridBottom: parseFloat(document.getElementById('grid-bottom').value),
        moveSpeed: parseFloat(document.getElementById('move-speed').value),
        volatility: parseFloat(document.getElementById('volatility').value),
        priceMax: parseFloat(document.getElementById('price-max').value),
        priceMin: parseFloat(document.getElementById('price-min').value),
        recordSec: parseInt(document.getElementById('record-sec').value)
    };
}

async function startTool(tool) {
    if (currentModule?.destroy) currentModule.destroy();
    activeTool = tool;
    try {
        const module = await import(`./modules/${tool.file}?v=${Date.now()}`);
        document.getElementById('tool-title').innerText = module.metadata.title;
        document.getElementById('tool-info').innerText = module.metadata.description;
        module.init(canvas, getParams());
        currentModule = module;
    } catch (e) { console.error(e); }
}

document.getElementById('apply-settings').onclick = () => {
    if (activeTool) startTool(activeTool);
};

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

// 自動啟動
setTimeout(() => { if(menu.firstChild) menu.firstChild.click(); }, 500);
