import { recordCanvas } from './recorder.js';

// --- 註冊區：未來新增工具只需在此加一行 ---
const TOOL_CONFIG = [
    { id: 'grid', name: '網格交易 (Grid)', file: 'grid-trading.js' },
];

let currentModule = null;
const canvas = document.getElementById('main-canvas');
const toolTitle = document.getElementById('tool-title');
const toolInfo = document.getElementById('tool-info');
const exportBtn = document.getElementById('export-gif');

function initMenu() {
    const menu = document.getElementById('menu');
    TOOL_CONFIG.forEach(tool => {
        const btn = document.createElement('button');
        btn.className = 'menu-item';
        btn.innerHTML = `<span>${tool.name}</span>`;
        btn.onclick = () => loadTool(tool, btn);
        menu.appendChild(btn);
    });
}

async function loadTool(tool, element) {
    document.querySelectorAll('.menu-item').forEach(b => b.classList.remove('active'));
    element.classList.add('active');

    if (currentModule && currentModule.destroy) {
        currentModule.destroy();
    }

    try {
        const modulePath = `./modules/${tool.file}`;
        const module = await import(modulePath);

        toolTitle.innerText = module.metadata.title;
        toolInfo.innerText = module.metadata.description;

        module.init(canvas);
        currentModule = module;
    } catch (err) {
        console.error("無法載入工具:", err);
    }
}

exportBtn.addEventListener('click', async () => {
    if (!currentModule) return alert("請先選擇一個工具！");
    exportBtn.disabled = true;
    exportBtn.innerText = "錄製中 (3s)...";
    
    await recordCanvas(canvas, 3);
    
    exportBtn.innerText = "生成 GIF 動圖";
    exportBtn.disabled = false;
});

initMenu();
