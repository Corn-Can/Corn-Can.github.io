/* ----------------- 動畫鏡像工具 (Rotation & Distance) ----------------- */

// 處理單行字串的動畫鏡像邏輯
function mirrorAnimationLine(line, mirrorR, mirrorD) {
    // 註解保護：如果該行是註解，直接原樣返回
    if (line.trim().startsWith('//')) {
        return line;
    }

    let processedLine = line;

    // 1. 處理「旋轉 (r)」動畫
    if (mirrorR) {
        // 匹配格式例如: (r50), (r-30:0.6), (r~-5), (r~10:2)
        // 捕捉群組: $1=相對符號(~) $2=數值(整數或小數) $3=冒號與後續時間參數
        const rRegex = /\(r(~?)(-?\d+(?:\.\d+)?)(:[^)]+)?\)/gi;
        processedLine = processedLine.replace(rRegex, (match, tilde, numStr, rest) => {
            let num = parseFloat(numStr);
            if (num !== 0) num = -num; // 數值正負反轉 (排除 0 變成 -0 的狀況)
            return `(r${tilde}${num}${rest || ''})`;
        });
    }

    // 2. 處理「鏡距 (d)」動畫
    if (mirrorD) {
        // 匹配格式例如: (d0.1), (d-0.05:0.6), (d~-0.1), (d~0.2:2)
        const dRegex = /\(d(~?)(-?\d+(?:\.\d+)?)(:[^)]+)?\)/gi;
        processedLine = processedLine.replace(dRegex, (match, tilde, numStr, rest) => {
            let num = parseFloat(numStr);
            if (num !== 0) num = -num; // 數值正負反轉
            return `(d${tilde}${num}${rest || ''})`;
        });
    }

    return processedLine;
}

// 綁定「翻轉」按鈕事件
document.getElementById('animationMirrorBtn').addEventListener('click', () => {
    const mirrorR = document.getElementById('mirrorR').checked;
    const mirrorD = document.getElementById('mirrorD').checked;
    const input = document.getElementById('animationMirrorInput').value;

    // 防呆：檢查是否至少勾選了一項
    if (!mirrorR && !mirrorD) {
        alert('請至少勾選一項要鏡像的動畫屬性 (旋轉 或 鏡距)！');
        return;
    }

    if (!input.trim()) {
        alert('請貼入譜面內容！');
        return;
    }

    // 將輸入內容按行拆分，逐行處理
    const lines = input.split(/\r?\n/);
    const resultLines = lines.map(line => mirrorAnimationLine(line, mirrorR, mirrorD));

    // 將結果組合並顯示
    document.getElementById('animationMirrorResult').value = resultLines.join('\n');
});

// 綁定「複製」按鈕事件
document.getElementById('animationMirrorCopy').addEventListener('click', () => {
    const txt = document.getElementById('animationMirrorResult').value;
    if (!txt) {
        alert('結果為空，請先執行翻轉！');
        return;
    }
    navigator.clipboard.writeText(txt).then(
        () => alert('✅ 已成功複製鏡像結果'),
        () => alert('❌ 複製失敗，請手動選取複製')
    );
});