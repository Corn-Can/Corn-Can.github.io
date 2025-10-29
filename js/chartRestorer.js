/* ----------------- 採音還原工具 (v7 - 支援自訂軌道) ----------------- */

// 檢查元素是否存在，若不存在則不執行
const restoreBtn = document.getElementById('restoreBtn');
if (restoreBtn) {

    const restoreInput = document.getElementById('restoreInput');
    const restoreOutput = document.getElementById('restoreOutput');
    const restoreCopyBtn = document.getElementById('restoreCopyBtn');
    
    // ★ 新增：獲取軌道輸入框
    const restoreTrackInput = document.getElementById('restoreTrackInput');

    /**
     * 核心處理函式：處理單一個 Note Token
     * ★ 變更：現在接收 targetTrack 參數
     */
    function processNoteToken(token, targetTrack) {
        if (!token) return null;

        const trimmedToken = token.trim();
        if (trimmedToken === '') return ''; // 保留空格/空 cell

        // --- 規則 2 & 3: 移除 ---
        if (trimmedToken.startsWith('r')) return null; // r prefix
        if (trimmedToken.match(/^\(g[se]\d+\)$/)) return null; // gs, ge
        if (trimmedToken.match(/^\(s\d+\?\d+\)$/)) return null; // s?

        // --- 規則 1, 4, 5, 6: 轉換 ---
        const match = trimmedToken.match(/^(c|l|cl)?(\d+as|\d+bs|\d+cs|\d+s|0s|\d+)(\[.*\])?$/);
        
        if (match) {
            const prefix = match[1] || '';     // 'c', 'l', 'cl', 或 ''
            const holdSuffix = match[3] || ''; // '[1:8]' 或 ''
            
            // ★ 變更：使用傳入的 targetTrack，而不是 '1'
            return prefix + targetTrack + holdSuffix; 
        }

        // --- 其他保留 ---
        return token;
    }

    /**
     * 處理一個「儲存格」 (可能包含 /)
     * ★ 變更：現在接收 targetTrack 參數
     */
    function processCell(cell, targetTrack) {
        if (cell === undefined || cell === null) return '';
        
        const tokens = cell.split('/');
        const processedTokens = tokens
            .map(token => processNoteToken(token, targetTrack)) // ★ 變更：傳遞 targetTrack
            .filter(t => t !== null);
            
        return processedTokens.join('/');
    }

    /**
     * 主函式 (v7)
     */
    function doRestore() {
        const input = restoreInput.value;
        const lines = input.split(/\r?\n/);
        const outputLines = [];

        // ★ 新增：在迴圈開始前，獲取目標軌道的值
        let targetTrack = restoreTrackInput.value.trim();
        // 驗證：如果為空或不是數字，就預設為 "1"
        if (targetTrack === '' || !targetTrack.match(/^\d+$/)) {
            targetTrack = '1';
        }

        for (const line of lines) {
            
            const parts = line.split(/(\{\d+\})/g);
            let accumulatedCells = []; // 用於暫存 {N} 標記之間的譜面

            for (const part of parts) {
                const trimmedPart = part.trim();
                if (trimmedPart === '') continue; // 忽略空白部分

                // 情況 1：這部分是 {N} 標記
                if (trimmedPart.match(/^\{(\d+)\}$/)) {
                    if (accumulatedCells.length > 0) {
                        // ★ 變更：傳遞 targetTrack
                        outputLines.push(accumulatedCells.map(cell => processCell(cell, targetTrack)).join(','));
                    }
                    accumulatedCells = []; 
                    outputLines.push(trimmedPart);
                } 
                // 情況 2：這部分是譜面
                else {
                    const cellsFromChunk = part.split(',');
                    accumulatedCells.push(...cellsFromChunk);
                }
            }
            
            // 處理最後剩餘的譜面
            if (accumulatedCells.length > 0) {
                 // ★ 變更：傳遞 targetTrack
                 outputLines.push(accumulatedCells.map(cell => processCell(cell, targetTrack)).join(','));
            }
        }
        
        restoreOutput.value = outputLines.join('\n');
    }

    restoreBtn.addEventListener('click', doRestore);
    
    restoreCopyBtn.addEventListener('click', () => {
        if (!restoreOutput.value) {
            alert('結果為空');
            return;
        }
        navigator.clipboard.writeText(restoreOutput.value).then(
            () => alert('✅ 已複製還原結果'),
            () => alert('複製失敗')
        );
    });

} else {
    console.warn("ChartRestorer elements not found. Skipping init.");
}