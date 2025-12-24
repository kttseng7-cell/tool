# Crypto Strategy Visualizer 📈

這是一個基於 TradingView 風格的虛擬貨幣工具視覺化平台。

### 🚀 目前已開發工具
- [x] **網格交易 (Grid Trading)**: 動態展示買賣區間與參數設置。
- [ ] **DCA 策略**: 視覺化平均成本法。

### 🛠 開發者指南：如何新增工具？
1. 在 `js/modules/` 下新增一個 `.js` 檔案。
2. 複製 `example-module.js` 的結構（包含 `init` 與 `destroy`）。
3. 在 `js/main.js` 的 `TOOL_CONFIG` 中加入新工具資訊。

### 📸 功能
- 支援動態 Canvas 繪圖。
- **一鍵導出 GIF**: 直接生成 3 秒的策略演示動圖。
