import { recordCanvas } from './recorder.js';

const TOOL_CONFIG = [
    { id: 'grid', name: '基礎網格交易', file: 'grid-trading.js' },
];

let currentModule = null;
const canvas = document.getElementById('main-canvas');

function getSettings() {
    return {
        viewTop: parseFloat(document.getElementById('view-top').value),
        viewBottom: parseFloat(document.getElementById('view-bottom').value),
        gridTop: parseFloat(document.getElementById('grid-top').value),
        gridBottom: parseFloat(document.getElementById('grid-bottom').value),
        gridCount: parseInt(document.getElementById('grid-count').value),
        volatility: parseFloat(document.getElementById('volatility').value),
        recordSec: parseInt(document.getElementById('record-sec').value)
    };
}

async function loadTool(tool, element) {
    document.querySelectorAll('.menu-item').forEach(b => b.classList.remove('active'));
    element.classList.add('active');

    if (currentModule?.destroy) currentModule.destroy();

    const module = await import(`./modules/${tool.file}`);
    document.getElementById('tool-title').innerText = module.metadata.title;
    document.getElementById('tool-info').innerText = module.metadata.description;

    module.init(canvas, getSettings());
    currentModule = module;
}

// 初始化選單
const menu = document.getElementById('menu');
TOOL_CONFIG.forEach(tool => {
    const btn = document.createElement('button');
    btn.className = 'menu-item';
    btn.innerText = tool.name;
    btn.onclick = () => loadTool(tool, btn);
    menu.appendChild(btn);
});

document.getElementById('apply-settings').onclick = () => {
    if (currentModule) currentModule.init(canvas, getSettings());
};

document.getElementById('export-gif').onclick = async () => {
    if (!currentModule) return;
    const btn = document.getElementById('export-gif');
    const sec = getSettings().recordSec;
    btn.disabled = true;
    btn.innerText = `錄製中 (${sec}s)...`;
    await recordCanvas(canvas, sec);
    btn.disabled = false;
    btn.innerText = "生成 GIF 動圖";
};

if (menu.firstChild) menu.firstChild.click();
