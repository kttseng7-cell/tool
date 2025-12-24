/**
 * js/main.js
 * 核心控制邏輯
 */

import { recordCanvas } from './recorder.js';

// --- 1. 配置區域：每當你新增工具檔案，只需在此處加一行 ---
const TOOL_CONFIG = [
    { id: 'grid-basic', name: '基礎網格交易', file: 'grid-trading.js' },
    // 範例：{ id: 'dca', name: '定投 DCA', file: 'dca.js' },
];

// --- 2. 狀態管理 ---
let currentModule = null;
const canvas = document.getElementById('main-canvas');
const toolTitle = document.getElementById('tool-title');
const toolInfo = document.getElementById('tool-info');
const exportBtn = document.getElementById('export-gif');

// --- 3. 初始化選單 ---
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

// --- 4. 動態載入工具 ---
async function loadTool(tool, element) {
    try {
        // 更新 UI 狀態
        document.querySelectorAll('.menu-item').forEach(b => b.classList.remove('active'));
        element.classList.add('active');

        // 卸載舊模組 (停止動畫)
        if (currentModule && currentModule.destroy) {
            currentModule.destroy();
        }

        // 動態 import 檔案 (GitHub Pages 路徑處理)
        const modulePath = `./modules/${tool.file}`;
        const module = await import(modulePath);

        // 更新資訊
        toolTitle.innerText = module.metadata.title;
        toolInfo.innerText = module.metadata.description;

        // 初始化新模組
        module.init(canvas);
        currentModule = module;

    } catch (err) {
        console.error("無法載入工具模組:", err);
        alert("載入工具失敗，請檢查 js/modules/ 下是否有該檔案。");
    }
}

// --- 5. GIF 錄製監聽 ---
exportBtn.addEventListener('click', async () => {
    if (!currentModule) return alert("請先選擇一個工具！");

    try {
        exportBtn.disabled = true;
        const originalText = exportBtn.innerText;
        exportBtn.innerText = "錄製中 (3s)...";

        // 呼叫 recorder.js 邏輯
        await recordCanvas(canvas, 3);

        exportBtn.innerText = originalText;
        exportBtn.disabled = false;
    } catch (err) {
        console.error("GIF 生成出錯:", err);
        exportBtn.disabled = false;
    }
});

// 啟動
initMenu();

// 自動載入第一個工具
if (TOOL_CONFIG.length > 0) {
    setTimeout(() => {
        const firstBtn = document.querySelector('.menu-item');
        if(firstBtn) firstBtn.click();
    }, 500);
}
