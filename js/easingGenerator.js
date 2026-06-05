/* ----------------- 特效緩動與抖動生成器 (視覺預覽 & 自動排版版) ----------------- */

const FX_EASINGS = {
    linear: (t, p = 1) => t,
    easeIn: (t, p = 2) => Math.pow(t, p),
    easeOut: (t, p = 2) => 1 - Math.pow(1 - t, p),
    easeInOut: (t, p = 2) => t < 0.5 ? 0.5 * Math.pow(2 * t, p) : 1 - 0.5 * Math.pow(2 * (1 - t), p)
};

// 繪製特效曲線的函數
function drawEJCurve(values, bpmSplit) {
    const canvas = document.getElementById('ejCurveCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const w = canvas.width, h = canvas.height;
    
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = "#04111a"; 
    ctx.fillRect(0, 0, w, h);

    if (values.length === 0) return;

    // 動態計算最大最小值，讓曲線自動適應畫布高度
    let minVal = Math.min(...values);
    let maxVal = Math.max(...values);
    if (minVal === maxVal) { maxVal += 1; minVal -= 1; } // 避免除以零
    const range = maxVal - minVal;

    // 畫網格線 (根據 bpmSplit)
    if (bpmSplit && bpmSplit > 0) {
        ctx.strokeStyle = "rgba(255,255,255,0.08)";
        ctx.lineWidth = 1;
        const groups = Math.ceil(values.length / bpmSplit);
        for (let g = 0; g <= groups; g++) {
            const x = (g * bpmSplit) / (values.length) * w;
            ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke();
        }
    }

    // 畫曲線與點
    ctx.beginPath();
    ctx.strokeStyle = "#e63946"; 
    ctx.lineWidth = 2;

    for (let i = 0; i < values.length; i++) {
        const x = i / (values.length - 1 || 1) * w;
        // 將數值映射到畫布高度 (上下預留 15px 邊距)
        const normalizedY = (values[i] - minVal) / range;
        const y = h - 15 - (normalizedY * (h - 30));

        if (i === 0) ctx.moveTo(x, y); 
        else ctx.lineTo(x, y);

        // 畫小紅點
        ctx.fillStyle = "#ff9b9b";
        ctx.beginPath();
        ctx.arc(x, y, 3, 0, Math.PI * 2);
        ctx.fill();
    }
    ctx.stroke();
}

function updateEasingJitter() {
    const type = document.getElementById('ejType').value;
    
    // ★ 抓取群組 ID 並建立後綴 (如果有填寫的話就加上 ?ID)
    const groupID = document.getElementById('ejGroupID').value.trim();
    const gSuffix = groupID ? `?${groupID}` : '';
    
    const bpmSplit = Math.max(1, parseInt(document.getElementById('ejBpmSplit').value) || 16);
    const steps = Math.max(2, parseInt(document.getElementById('ejSteps').value) || 32);
    const start = parseFloat(document.getElementById('ejStart').value) || 0;
    const end = parseFloat(document.getElementById('ejEnd').value) || 0;
    
    const curve = document.getElementById('ejCurve').value;
    const power = parseFloat(document.getElementById('ejPower').value) || 2;
    const jitterMode = document.getElementById('ejJitterMode').value;
    const jitterProb = parseFloat(document.getElementById('ejJitterProb').value) || 25;
    const jitterAmt = parseFloat(document.getElementById('ejJitterAmt').value) || 2;

    let results = [];
    let plotValues = [];
    let spikeDirection = 1; 

    for (let i = 0; i < steps; i++) {
        let t = steps === 1 ? 1 : i / (steps - 1);
        let easedT = FX_EASINGS[curve](t, power);
        let baseValue = start + (end - start) * easedT;
        let finalValue = baseValue;
        let outputStr = "";

        // 抽搐模式 (Spike)：忽略曲線，強制在起始與結束值之間切換
        if (jitterMode === 'spike') {
            finalValue = spikeDirection === 1 ? start : end;
            // 如果是 r 或 d，自動加上波浪號 (相對座標) 與時間參數 :1
            let tilde = (type === 'r' || type === 'd') ? '~' : '';
            let timeParam = (type === 'r' || type === 'd') ? ':1' : ''; 
            
            // ★ 組合字串，例如 (s5?99) 或 (r~5?99:1)
            outputStr = `(${type}${tilde}${finalValue}${gSuffix}${timeParam})`; 
            spikeDirection *= -1;
        } 
        else {
            // 其他模式
            if (jitterMode !== 'none') {
                let isGlitchTick = (Math.random() * 100) < jitterProb;
                if (jitterMode === 'noise') {
                    finalValue += (Math.random() - 0.5) * 2 * jitterAmt;
                } else if (jitterMode === 'stutter' && isGlitchTick) {
                    finalValue = 0; 
                }
            }
            finalValue = +(finalValue).toFixed(2);
            
            // ★ 組合字串，例如 (s5.50?99)
            outputStr = `(${type}${finalValue}${gSuffix})`;
        }

        results.push(outputStr);
        plotValues.push(finalValue);
    }

    // 更新圖表預覽
    drawEJCurve(plotValues, bpmSplit);

    // 自動切分排版邏輯
    let formattedLines = [`{${bpmSplit}}`]; 
    for (let i = 0; i < results.length; i += bpmSplit) {
        const slice = results.slice(i, i + bpmSplit);
        formattedLines.push(slice.join(',') + ','); 
    }

    document.getElementById('ejOutput').value = formattedLines.join('\n');
}

// ★ 將 ejGroupID 也加入即時響應事件的陣列中
const ejInputs = ['ejType', 'ejGroupID', 'ejBpmSplit', 'ejSteps', 'ejStart', 'ejEnd', 'ejCurve', 'ejPower', 'ejJitterMode', 'ejJitterProb', 'ejJitterAmt'];
ejInputs.forEach(id => {
    const el = document.getElementById(id);
    if (el) {
        el.addEventListener('input', updateEasingJitter);
        el.addEventListener('change', updateEasingJitter);
    }
});


// 綁定生成按鈕 (可以再強制刷新一次，尤其在亂數模式下)
const ejGenerateBtn = document.getElementById('ejGenerateBtn');
if (ejGenerateBtn) {
    ejGenerateBtn.addEventListener('click', updateEasingJitter);
}

// 綁定複製按鈕
const ejCopyBtn = document.getElementById('ejCopyBtn');
if (ejCopyBtn) {
    ejCopyBtn.addEventListener('click', () => {
        const txt = document.getElementById('ejOutput').value;
        if (!txt) return alert('結果為空！');
        navigator.clipboard.writeText(txt).then(() => alert('✅ 已複製帶有排版的特效陣列'));
    });
}

// 初始執行一次以繪製預設畫面
setTimeout(updateEasingJitter, 100);