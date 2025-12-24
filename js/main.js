// js/main.js
const modules = {
    'grid-trading': './modules/grid-trading.js',
    // 之後每新增一個工具，就在這裡加一行
};

let currentModule = null;

async function loadModule(moduleName) {
    const path = modules[moduleName];
    try {
        const module = await import(path);
        // 清除舊的畫布與狀態
        currentModule?.destroy?.();
        
        // 初始化新模組
        currentModule = module;
        document.getElementById('tool-title').innerText = module.metadata.title;
        document.getElementById('tool-info').innerText = module.metadata.description;
        
        const canvas = document.getElementById('main-canvas');
        module.init(canvas);
        
    } catch (err) {
        console.error("載入模組失敗:", err);
    }
}

// 動態生成選單
const menu = document.getElementById('menu');
Object.keys(modules).forEach(key => {
    const btn = document.createElement('button');
    btn.innerText = key.replace('-', ' ').toUpperCase();
    btn.onclick = () => loadModule(key);
    menu.appendChild(btn);
});