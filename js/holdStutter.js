/* ----------------- 長音切分工具 (Stutter) ----------------- */

function generateStutter(baseNote, pieces, newSuffix) {
    // 移除原有的括號內容 (例如 [1:2] 或 (gs16))，保留乾淨的音符核心
    let coreNote = baseNote.replace(/\[.*?\]/g, '').replace(/\(.*?\)/g, ''); 
    if (newSuffix) {
        coreNote += newSuffix;
    }
    
    let result = [];
    for (let i = 0; i < pieces; i++) {
        result.push(coreNote);
    }
    
    // 用逗號串接並在結尾補上逗號
    return result.join(',') + ',';
}

// 綁定「切分」按鈕
const spGenerateBtn = document.getElementById('spGenerateBtn');
if (spGenerateBtn) {
    spGenerateBtn.addEventListener('click', () => {
        const inputNote = document.getElementById('spInputNote').value.trim();
        const pieces = parseInt(document.getElementById('spPieces').value) || 8;
        const suffix = document.getElementById('spSuffix').value.trim();

        if (!inputNote) {
            alert("請輸入要切分的音符！");
            return;
        }
        if (pieces < 1) {
            alert("切分份數至少要是 1！");
            return;
        }

        const outputStr = generateStutter(inputNote, pieces, suffix);
        document.getElementById('spOutput').value = outputStr;
    });
}

// 綁定「複製」按鈕
const spCopyBtn = document.getElementById('spCopyBtn');
if (spCopyBtn) {
    spCopyBtn.addEventListener('click', () => {
        const txt = document.getElementById('spOutput').value;
        if (!txt) return alert('結果為空，請先切分！');
        navigator.clipboard.writeText(txt).then(() => alert('✅ 已複製切分結果'));
    });
}