import { recordCanvas } from './recorder.js';

const TOOL_CONFIG = [
    { id: 'grid', name: '網格交易 (Grid)', file: 'grid-trading.js' },
];

let currentModule = null;
const canvas = document.getElementById('main-canvas');
const toolTitle = document.getElementById('tool-title');
const toolInfo = document.getElementById('tool-info');

// 讀取當前面板設定
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

async function loadTool(toolConfig, element) {
    document.querySelectorAll('.menu-item').forEach(btn => btn.classList.remove('active'));
    element.classList.add('active');

    if (currentModule?.destroy) currentModule.destroy();

    const module = await import(`./modules/${toolConfig.file}`);
    toolTitle.innerText = module.metadata.title;
    toolInfo.innerText = module.metadata.description;

    // 初始化時將設定傳入
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

// 套用按鈕點擊
document.getElementById('apply-settings').onclick = () => {
    if (currentModule) {
        currentModule.init(canvas, getSettings());
    }
};

// GIF 錄製
document.getElementById('export-gif').onclick = async () => {
    if (!currentModule) return;
    const settings = getSettings();
    const btn = document.getElementById('export-gif');
    btn.disabled = true;
    btn.innerText = `錄製中 (${settings.recordSec}s)...`;
    
    await recordCanvas(canvas, settings.recordSec);
    
    btn.disabled = false;
    btn.innerText = "生成 GIF 動圖";
};

// 預設載入第一個
if (menu.firstChild) menu.firstChild.click();
