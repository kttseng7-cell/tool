/**
 * js/main.js
 * 核心控制邏輯
 */
import { recordCanvas } from './recorder.js';

const TOOL_CONFIG = [
    { id: 'grid-basic', name: '基礎網格交易', file: 'grid-trading.js' },
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
    // 移除其他按鈕的啟動狀態
    document.querySelectorAll('.menu-item').forEach(b => b.classList.remove('active'));
    element.classList.add('active');

    // 停止當前正在執行的動畫
    if (currentModule && currentModule.destroy) {
        currentModule.destroy();
    }

    try {
        const modulePath = `./modules/${tool.file}`;
        const module = await import(modulePath);

        // 更新 UI 資訊
        toolTitle.innerText = module.metadata.title;
        toolInfo.innerText = module.metadata.description;

        // 初始化新工具動畫
        module.init(canvas);
        currentModule = module;
    } catch (err) {
        console.error("載入工具失敗:", err);
    }
}

// GIF 錄製按鈕監聽
exportBtn.onclick = async () => {
    if (!currentModule) return alert("請先選擇工具！");
    exportBtn.disabled = true;
    exportBtn.innerText = "錄製中 (3s)...";
    await recordCanvas(canvas, 3);
    exportBtn.disabled = false;
    exportBtn.innerText = "生成 GIF 動圖";
};

// 初始啟動
initMenu();
