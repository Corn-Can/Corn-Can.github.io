/* ----------------- 譜面翻轉工具 ----------------- */
function flipToken(token, mode, angle) {
    // 1. 基本清理與註解檢查
    let processingStr = token.trim();
    if (processingStr === '' || processingStr.startsWith('//')) return token;

    // 2. 精確分離前綴的 {N}
    let nPrefix = "";
    // 使用正則表達式尋找開頭的 {數字}
    const nMatch = processingStr.match(/^(\{\d+\})/);
    if (nMatch) {
        nPrefix = nMatch[1]; // 提取出的前綴，例如 "{32}"
        // 重要：將前綴從要處理的字串中「徹底移除」
        processingStr = processingStr.substring(nPrefix.length);
    }

    // 3. 處理音符部分 (此時 processingStr 裡面已經沒有 {N} 了)
    // 支援複合音符，例如 l4/l5
    const parts = processingStr.split('/');

    const flippedParts = parts.map(p => {
        let pTrimmed = p.trim();
        if (pTrimmed === '') return p;

        // 拆分括號部分 (如 [1:4] 或 (gimmick))
        const bracketMatch = pTrimmed.match(/^(.*?)(\[.*\]|\(.*\))?$/);
        if (!bracketMatch) return p;

        let core = bracketMatch[1];             // 核心部分 (如 l4)
        const bracket = bracketMatch[2] || '';  // 括號部分

        // 檢查核心是否為有效音符 (c, l, cl, r + 數字 + 後綴)
        // 這個正則表達式確保只匹配純淨的音符格式
        const re = /^((?:cl|[clr])?)(\d{1,2})([a-z]{0,2})?$/i;
        const m = core.match(re);
        if (!m) return p; // 如果無法匹配音符格式，保留原樣

        let [_, pre, numStr, suf] = m;
        let num = parseInt(numStr);
        suf = suf || '';
        let step = 0;

        // --- 旋轉邏輯計算 (保持不變) ---
        if (mode === '8') {
            if (suf.toLowerCase() === 'cs') {
                step = Math.round(angle / 45) * 2;
                num = ((num - 1 + step + 16) % 16) + 1;
            } else {
                step = Math.round(angle / 45);
                if (num === 0) return p; // 0 軌不處理
                num = ((num - 1 + step + 8) % 8) + 1;
            }
        } else if (mode === '16') {
            if (!suf.toLowerCase().includes('cs') || num === 0) return p;
            step = Math.round(angle / 22.5);
            num = ((num - 1 + step + 16) % 16) + 1;
        }

        return `${pre}${num}${suf}${bracket}`;
    });

    // 4. 重新組合：乾淨的 {N} 前綴 + 翻轉後的音符部分
    return nPrefix + flippedParts.join('/');
}

function flipLine(line, mode, angle) {
    // 依據逗號分割，並保留逗號作為 Token，確保逗號不丟失
    const tokens = line.split(/(,)/);
    // 遍歷每個 Token，如果是逗號就原樣返回，否則進行翻轉
    return tokens.map(t => (t === ',' ? t : flipToken(t, mode, angle))).join('');
}

document.getElementById('flipBtn').addEventListener('click', () => {
    // 加入預設值 0，防止輸入框為空時出錯
    const angle = parseFloat(document.getElementById('flipAngle').value || 0);
    const mode = document.getElementById('flipMode').value;
    const input = document.getElementById('flipInput').value;
    
    const lines = input.split(/\r?\n/);
    
    const result = lines.map(l => {
        // 行開頭註解保護
        if (l.trim().startsWith('//')) {
            return l;
        }
        return flipLine(l, mode, angle);
    }).join('\n');

    document.getElementById('flipResult').value = result;
});

document.getElementById('flipCopy').addEventListener('click', () => {
    const txt = document.getElementById('flipResult').value;
    if (!txt) {
        alert('結果為空');
        return;
    }
    navigator.clipboard.writeText(txt).then(
        () => alert('✅ 已複製翻轉結果'),
        () => alert('複製失敗')
    );
});
// 這樣翻轉功能保持完整